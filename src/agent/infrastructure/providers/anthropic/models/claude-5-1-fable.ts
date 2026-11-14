import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export const claudeFable51Specification: ModelSpecification = {
	name: "claude-fable-5-1",
	provider: "anthropic",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["max", "xhigh", "high", "medium", "low"],
	supportedContextItemTypes: [
		"user_message",
		"system_message",
		"developer_message",
		"reasoning",
		"tool_call",
		"tool_call_result",
		"model_message",
	],
	supportsStreaming: true,
	contextWindowSize: 1_000_000,
	maxOutputTokens: 128_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
