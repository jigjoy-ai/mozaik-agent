import { describe, expect, test } from "@rstest/core"
import {
	AnthropicMessagesMapper,
	DEFAULT_MAX_OUTPUT_TOKENS,
} from "@agent/infrastructure/providers/anthropic/anthropic-messages-mapper"
import type { InferenceParams } from "@agent/domain/instruction/inference"

const mapper = new AnthropicMessagesMapper()

const params = (overrides: Partial<InferenceParams> = {}): InferenceParams => ({
	model: "claude-sonnet-5-5",
	context: { items: [{ type: "user_message", text: "Hello" }] },
	...overrides,
})

describe("AnthropicMessagesMapper.toRequest", () => {
	test("sends the requested output limit as max_tokens", () => {
		const request = mapper.toRequest(params({ maxOutputTokens: 256 }))

		expect(request.max_tokens).toBe(256)
	})

	test("falls back to a default, because Anthropic rejects a request without max_tokens", () => {
		const request = mapper.toRequest(params())

		expect(request.max_tokens).toBeGreaterThan(0)
		expect(request.max_tokens).toBe(DEFAULT_MAX_OUTPUT_TOKENS)
	})
})
