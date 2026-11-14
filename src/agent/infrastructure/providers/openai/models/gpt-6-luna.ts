import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export const gpt6LunaSpecification: ModelSpecification = {
	name: "gpt-6-luna",
	provider: "openai",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["max", "xhigh", "high", "medium", "low", "none"],
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
	contextWindowSize: 1_050_000,
	maxOutputTokens: 128_000,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
