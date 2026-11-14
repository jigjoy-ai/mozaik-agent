import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export const gemini38FlashSpecification: ModelSpecification = {
	name: "gemini-3.8-flash",
	provider: "google",
	supportsReasoningEffort: true,
	supportedReasoningEfforts: ["high", "medium", "low"],
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
	contextWindowSize: 1_048_576,
	maxOutputTokens: 65_536,
	supportsFunctionCalling: true,
	supportsStructuredOutput: true,
}
