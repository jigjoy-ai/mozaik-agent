import { describe, expect, test } from "@rstest/core"
import { GeminiGenerateContentMapper } from "@agent/infrastructure/providers/gemini/gemini-generate-content-mapper"
import { clockTool, params } from "./fixtures/conversation"

const mapper = new GeminiGenerateContentMapper()

describe("GeminiGenerateContentMapper.toRequest", () => {
	test("puts system messages in the system instruction, not in contents", () => {
		const request = mapper.toRequest(params())

		expect(request.config.systemInstruction).toBe("Be brief.")
		expect(JSON.stringify(request.contents)).not.toContain("Be brief.")
	})

	test("maps a tool call and its result to functionCall and functionResponse parts", () => {
		expect(mapper.toRequest(params()).contents).toEqual([
			{ role: "user", parts: [{ text: "What time is it?" }] },
			{ role: "model", parts: [{ functionCall: { id: "call-1", name: "clock", args: { zone: "UTC" } } }] },
			// A result that is not JSON is wrapped as { output }. The name comes from the matching call.
			{
				role: "user",
				parts: [{ functionResponse: { id: "call-1", name: "clock", response: { output: "noon" } } }],
			},
			{ role: "model", parts: [{ text: "It is noon." }] },
		])
	})

	test("passes a JSON object result through as the response", () => {
		const request = mapper.toRequest(
			params({
				context: {
					items: [
						{ type: "tool_call", requestId: "a", toolName: "clock", toolArguments: "{}" },
						{
							type: "tool_call_result",
							requestId: "a",
							result: { type: "input_text", text: '{"time":"noon"}' },
						},
					],
				},
			}),
		)

		expect(request.contents[1].parts[0].functionResponse.response).toEqual({ time: "noon" })
	})

	test("maps tools to function declarations", () => {
		expect(mapper.toRequest(params({ tools: [clockTool] })).config.tools).toEqual([
			{
				functionDeclarations: [
					{ name: "clock", description: "Tell the time.", parametersJsonSchema: clockTool.parameters },
				],
			},
		])
	})
})

describe("GeminiGenerateContentMapper.toResponse", () => {
	const response: any = {
		candidates: [
			{
				content: {
					parts: [
						{ thought: true, text: "Thinking." },
						{ text: "Checking." },
						{ functionCall: { id: "call-2", name: "clock", args: { zone: "UTC" } } },
					],
				},
			},
		],
		usageMetadata: {
			promptTokenCount: 100,
			candidatesTokenCount: 20,
			totalTokenCount: 128,
			cachedContentTokenCount: 64,
			thoughtsTokenCount: 8,
		},
	}

	test("maps thought, text and functionCall parts to items, in order", () => {
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

	test("reports usage, with cached and thought tokens", () => {
		const usage = mapper.toResponse(response).tokenUsage!

		expect(usage.inputTokens).toBe(100)
		expect(usage.outputTokens).toBe(20)
		expect(usage.totalTokens).toBe(128)
		expect(usage.inputTokenDetails.cached_tokens).toBe(64)
		expect(usage.outputTokenDetails.reasoning_tokens).toBe(8)
	})

	test("uses an empty request id when the function call has none", () => {
		const items = mapper.toResponse({
			candidates: [{ content: { parts: [{ functionCall: { name: "clock" } }] } }],
		}).items

		expect(items[0]).toMatchObject({ type: "tool_call", requestId: "", toolArguments: "{}" })
	})
})
