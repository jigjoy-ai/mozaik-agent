import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export const claudeSonnet46Specification: ModelSpecification = {
	name: "claude-sonnet-4-6",
	provider: "anthropic",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["max", "high", "medium", "low"],
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
	contextWindowSize: 200_000,
	maxOutputTokens: 64_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
