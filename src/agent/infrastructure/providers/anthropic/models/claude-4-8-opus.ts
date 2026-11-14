import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export const claudeOpus48Specification: ModelSpecification = {
	name: "claude-opus-4-8",
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
	contextWindowSize: 200_000,
	maxOutputTokens: 32_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
