import { describe, expect, test } from "@rstest/core"
import { OpenAIResponsesMapper } from "@agent/infrastructure/providers/openai/openai-responses-mapper"
import { clockTool, params } from "./fixtures/conversation"

const mapper = new OpenAIResponsesMapper()

describe("OpenAIResponsesMapper.toRequest", () => {
	test("maps the conversation to Responses API input items", () => {
		expect(mapper.toRequest(params()).input).toEqual([
			{ type: "message", role: "system", content: [{ type: "input_text", text: "Be brief." }] },
			{ type: "message", role: "user", content: [{ type: "input_text", text: "What time is it?" }] },
			{ type: "function_call", call_id: "call-1", name: "clock", arguments: '{"zone":"UTC"}' },
			{ type: "function_call_output", call_id: "call-1", output: [{ type: "input_text", text: "noon" }] },
			{ type: "message", role: "assistant", content: [{ type: "output_text", text: "It is noon." }] },
		])
	})

	test("maps a developer message to the developer role", () => {
		const request = mapper.toRequest(
			params({ context: { items: [{ type: "developer_message", text: "Follow the policy." }] } }),
		)

		expect(request.input[0].role).toBe("developer")
	})

	test("maps tools to function tools", () => {
		expect(mapper.toRequest(params({ tools: [clockTool] })).tools).toEqual([
			{ type: "function", name: "clock", description: "Tell the time.", parameters: clockTool.parameters },
		])
	})

	test("passes reasoning effort and structured output through", () => {
		const request = mapper.toRequest(
			params({ reasoningEffort: "low", structuredOutput: { schema: { type: "object" } } as any }),
		)

		expect(request.reasoning).toEqual({ effort: "low" })
		expect(request.text.format).toEqual({
			type: "json_schema",
			name: "response",
			schema: { type: "object" },
			strict: true,
		})
	})
})

describe("OpenAIResponsesMapper.toResponse", () => {
	const response: any = {
		output: [
			{ type: "reasoning", encrypted_content: "enc", summary: [{ text: "Thinking." }] },
			{ type: "message", role: "assistant", content: [{ type: "output_text", text: "Checking." }] },
			{ type: "function_call", call_id: "call-2", name: "clock", arguments: '{"zone":"UTC"}' },
		],
		usage: {
			input_tokens: 100,
			output_tokens: 20,
			total_tokens: 120,
			input_tokens_details: { cached_tokens: 64 },
			output_tokens_details: { reasoning_tokens: 8 },
		},
	}

	test("maps reasoning, message and function_call output to items, in order", () => {
		expect(mapper.toResponse(response).items).toEqual([
			{
				type: "reasoning",
				content: undefined,
				encryptedContent: "enc",
				summary: [{ type: "summary_text", text: "Thinking." }],
			},
			{ type: "model_message", text: "Checking." },
			{ type: "tool_call", requestId: "call-2", toolName: "clock", toolArguments: '{"zone":"UTC"}' },
		])
	})

	// Pins the current behavior: here input_tokens already includes the cached part.
	test("reports usage, with cached and reasoning tokens", () => {
		const usage = mapper.toResponse(response).tokenUsage!

		expect(usage.inputTokens).toBe(100)
		expect(usage.outputTokens).toBe(20)
		expect(usage.totalTokens).toBe(120)
		expect(usage.inputTokenDetails.cached_tokens).toBe(64)
		expect(usage.outputTokenDetails.reasoning_tokens).toBe(8)
	})

	test("treats missing token details as zero", () => {
		const usage = mapper.toResponse({
			output: [],
			usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
		}).tokenUsage!

		expect(usage.inputTokenDetails.cached_tokens).toBe(0)
		expect(usage.outputTokenDetails.reasoning_tokens).toBe(0)
	})
})
