import { describe, expect, test } from "@rstest/core"
import { AnthropicMessagesMapper } from "@agent/infrastructure/providers/anthropic/anthropic-messages-mapper"
import { clockTool, params } from "./fixtures/conversation"

const mapper = new AnthropicMessagesMapper()

describe("AnthropicMessagesMapper.toRequest", () => {
	test("joins system messages into one system string and keeps them out of messages", () => {
		const request = mapper.toRequest(params({ maxOutputTokens: 100 }))

		expect(request.system).toBe("Be brief.")
		expect(request.messages.some((message: any) => message.role === "system")).toBe(false)
	})

	test("maps a tool call and its result to tool_use and tool_result blocks", () => {
		const request = mapper.toRequest(params({ maxOutputTokens: 100 }))

		expect(request.messages).toEqual([
			{ role: "user", content: [{ type: "text", text: "What time is it?" }] },
			{ role: "assistant", content: [{ type: "tool_use", id: "call-1", name: "clock", input: { zone: "UTC" } }] },
			{ role: "user", content: [{ type: "tool_result", tool_use_id: "call-1", content: "noon" }] },
			{ role: "assistant", content: [{ type: "text", text: "It is noon." }] },
		])
	})

	test("maps tools to name, description and input_schema", () => {
		const request = mapper.toRequest(params({ maxOutputTokens: 100, tools: [clockTool] }))

		expect(request.tools).toEqual([
			{ name: "clock", description: "Tell the time.", input_schema: clockTool.parameters },
		])
	})

	test("sends no tools field when there are no tools", () => {
		expect(mapper.toRequest(params({ maxOutputTokens: 100 })).tools).toBeUndefined()
	})

	test("turns reasoning effort into adaptive thinking and an effort setting", () => {
		const request = mapper.toRequest(params({ maxOutputTokens: 100, reasoningEffort: "high" }))

		expect(request.thinking).toEqual({ type: "adaptive" })
		expect(request.output_config.effort).toBe("high")
	})
})

describe("AnthropicMessagesMapper.toResponse", () => {
	const response: any = {
		content: [
			{ type: "thinking", thinking: "Let me check.", signature: "sig" },
			{ type: "text", text: "Checking the clock." },
			{ type: "tool_use", id: "call-2", name: "clock", input: { zone: "UTC" } },
		],
		usage: { input_tokens: 10, output_tokens: 5, cache_creation_input_tokens: 3, cache_read_input_tokens: 7 },
	}

	test("maps thinking, text and tool_use blocks to output items, in order", () => {
		expect(mapper.toResponse(response).items).toEqual([
			{
				type: "reasoning",
				content: { type: "input_text", text: "Let me check." },
				encryptedContent: "sig",
				summary: [],
			},
			{ type: "model_message", text: "Checking the clock." },
			{ type: "tool_call", requestId: "call-2", toolName: "clock", toolArguments: '{"zone":"UTC"}' },
		])
	})

	// Pins the current behavior: input_tokens leaves out the cached tokens, and cached_tokens adds
	// cache writes and cache reads together (see issue #4).
	test("reports usage the way the Anthropic mapper counts it today", () => {
		const usage = mapper.toResponse(response).tokenUsage!

		expect(usage.inputTokens).toBe(10)
		expect(usage.outputTokens).toBe(5)
		expect(usage.totalTokens).toBe(15)
		expect(usage.inputTokenDetails.cached_tokens).toBe(10)
	})

	test("reports no usage when the response has none", () => {
		expect(mapper.toResponse({ content: [] } as any).tokenUsage).toBeUndefined()
	})
})
