import { describe, expect, test } from "@rstest/core"
import { OpenAIChatCompletionsMapper } from "@agent/infrastructure/providers/openai/openai-chat-completions-mapper"
import { clockTool, params } from "./fixtures/conversation"

const mapper = new OpenAIChatCompletionsMapper()

describe("OpenAIChatCompletionsMapper.toRequest", () => {
	test("maps the conversation to chat messages, with the tool call on its own assistant message", () => {
		expect(mapper.toRequest(params()).messages).toEqual([
			{ role: "system", content: "Be brief." },
			{ role: "user", content: "What time is it?" },
			{
				role: "assistant",
				content: null,
				tool_calls: [
					{ id: "call-1", type: "function", function: { name: "clock", arguments: '{"zone":"UTC"}' } },
				],
			},
			{ role: "tool", tool_call_id: "call-1", content: "noon" },
			{ role: "assistant", content: "It is noon." },
		])
	})

	test("adds tool calls to the assistant message right before them", () => {
		const request = mapper.toRequest(
			params({
				context: {
					items: [
						{ type: "model_message", text: "Checking." },
						{ type: "tool_call", requestId: "a", toolName: "clock", toolArguments: "{}" },
						{ type: "tool_call", requestId: "b", toolName: "clock", toolArguments: "{}" },
					],
				},
			}),
		)

		expect(request.messages).toHaveLength(1)
		expect(request.messages[0].tool_calls.map((call: any) => call.id)).toEqual(["a", "b"])
	})

	test("maps tools to function tools", () => {
		expect(mapper.toRequest(params({ tools: [clockTool] })).tools).toEqual([
			{
				type: "function",
				function: { name: "clock", description: "Tell the time.", parameters: clockTool.parameters },
			},
		])
	})
})

describe("OpenAIChatCompletionsMapper.toResponse", () => {
	const response: any = {
		choices: [
			{
				message: {
					reasoning_content: "Thinking.",
					content: "Checking.",
					tool_calls: [{ id: "call-2", function: { name: "clock", arguments: '{"zone":"UTC"}' } }],
				},
			},
		],
		usage: {
			prompt_tokens: 100,
			completion_tokens: 20,
			total_tokens: 120,
			prompt_tokens_details: { cached_tokens: 64 },
			completion_tokens_details: { reasoning_tokens: 8 },
		},
	}

	test("maps reasoning, content and tool calls to items, in order", () => {
		expect(mapper.toResponse(response).items).toEqual([
			{
				type: "reasoning",
				content: { type: "input_text", text: "Thinking." },
				encryptedContent: undefined,
				summary: [],
			},
			{ type: "model_message", text: "Checking." },
			{ type: "tool_call", requestId: "call-2", toolName: "clock", toolArguments: '{"zone":"UTC"}' },
		])
	})

	test("reports usage, with cached and reasoning tokens", () => {
		const usage = mapper.toResponse(response).tokenUsage!

		expect(usage.inputTokens).toBe(100)
		expect(usage.outputTokens).toBe(20)
		expect(usage.totalTokens).toBe(120)
		expect(usage.inputTokenDetails.cached_tokens).toBe(64)
		expect(usage.outputTokenDetails.reasoning_tokens).toBe(8)
	})

	test("returns no items when the response has no message", () => {
		expect(mapper.toResponse({ choices: [] }).items).toEqual([])
	})
})
