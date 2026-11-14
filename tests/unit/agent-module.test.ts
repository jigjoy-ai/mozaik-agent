import { describe, expect, test } from "@rstest/core"
import { initAgentModule, resolveAgentModule } from "@agent/agent-module"
import { AnthropicMessagesMapper } from "@agent/infrastructure/providers/anthropic/anthropic-messages-mapper"
import { supportedModels } from "@agent/infrastructure/providers/supported-models"
import { InferenceInstructionValidator } from "@agent/domain/inference/request-validation/inference-request-validator"
import type { GenerativeModel } from "@agent/domain/inference/generative-model"
import type { InferenceParams, InferenceResult } from "@agent/domain/instruction/inference"
import type { ContextItem } from "@agent/domain/inference/context"

// A model that asks for the clock once, then answers with what the clock said.
const scripted: GenerativeModel = {
	specification: {
		name: "scripted",
		provider: "test",
		supportsReasoningEffort: false,
		supportedReasoningEfforts: [],
		supportsStreaming: false,
		contextWindowSize: 1000,
		supportedContextItemTypes: [
			"developer_message",
			"user_message",
			"model_message",
			"tool_call",
			"tool_call_result",
		],
		maxOutputTokens: 1000,
		supportsFunctionCalling: true,
		supportsStructuredOutput: false,
	},
	endpoint: {
		async infer(params: InferenceParams): Promise<InferenceResult> {
			const told = params.context.items.find((item) => item.type === "tool_call_result")
			return {
				type: "inference_output",
				rawResponse: undefined,
				items: told
					? [{ type: "model_message", text: `It is ${told.result.text}.` }]
					: [{ type: "tool_call", requestId: "call-1", toolName: "clock", toolArguments: "{}" }],
			}
		},
		async *stream() {},
	},
}

const conversation: ContextItem[] = [
	{ type: "user_message", text: "What time is it?" },
	{ type: "tool_call", requestId: "call-1", toolName: "clock", toolArguments: "{}" },
	{ type: "tool_call_result", requestId: "call-1", result: { type: "input_text", text: "noon" } },
]

describe("agent module", () => {
	test("a loop stops at each breakpoint and advances through inference and a tool call", async () => {
		initAgentModule({ inferenceRunnerConfig: { supportedModels: [scripted] } })
		const { createAgent, registerTool, createLoop, setBreakpoint, advanceLoop, getLoop, endLoop } =
			resolveAgentModule()

		registerTool("clock", { invoke: () => "noon" })
		const agent = await createAgent({ name: "timekeeper", instruction: "Tell the time.", tools: [] })
		const loop = await createLoop({ agentId: agent.id, goal: "What time is it?" })
		const context: ContextItem[] = [{ type: "user_message", text: "What time is it?" }]

		await setBreakpoint({
			loopId: loop.id,
			instruction: { type: "inference", parameters: { model: "scripted", context: { items: context } } },
		})
		expect((await getLoop(loop.id)).pendingInstruction?.type).toBe("inference")
		await advanceLoop({ loopId: loop.id })

		await setBreakpoint({
			loopId: loop.id,
			instruction: { type: "tool_call", parameters: { toolName: "clock", toolArguments: "{}" } },
		})
		await advanceLoop({ loopId: loop.id })

		await setBreakpoint({
			loopId: loop.id,
			instruction: { type: "inference", parameters: { model: "scripted", context: { items: conversation } } },
		})
		await advanceLoop({ loopId: loop.id })
		await endLoop({ loopId: loop.id, message: "It is noon." })

		const finished = await getLoop(loop.id)
		expect(finished.state).toBe("completed")
		expect(finished.pendingInstruction).toBeUndefined()
		expect(finished.completedInstructions.map((instruction) => instruction.type)).toEqual([
			"inference",
			"tool_call",
			"inference",
		])
		expect(finished.completedInstructions[1].result).toEqual({ type: "tool_call_output", result: "noon" })
		expect(finished.completedInstructions[2].result).toMatchObject({
			items: [{ type: "model_message", text: "It is noon." }],
		})
	})

	test("every supported model takes a context with a tool call and its result", () => {
		const validator = new InferenceInstructionValidator()

		for (const model of supportedModels) {
			expect(() =>
				validator.validate(
					{ model: model.specification.name, context: { items: conversation } },
					model.specification,
				),
			).not.toThrow()
		}
	})

	test("tool calls go to Anthropic as tool_use blocks, and come back as tool calls", () => {
		const mapper = new AnthropicMessagesMapper()

		const { messages } = mapper.mapContextItems({ model: "claude-sonnet-5-5", context: { items: conversation } })
		expect(messages[1].content[0]).toEqual({ type: "tool_use", id: "call-1", name: "clock", input: {} })
		expect(messages[2].content[0]).toEqual({ type: "tool_result", tool_use_id: "call-1", content: "noon" })

		const response = { content: [{ type: "tool_use", id: "call-2", name: "clock", input: { zone: "UTC" } }] }
		expect(mapper.toResponse(response as any).items).toEqual([
			{ type: "tool_call", requestId: "call-2", toolName: "clock", toolArguments: '{"zone":"UTC"}' },
		])
	})
})
