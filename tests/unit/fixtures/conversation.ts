import type { ContextItem } from "@agent/domain/inference/context"
import type { InferenceParams } from "@agent/domain/instruction/inference"
import type { ToolDefinition } from "@agent/domain/inference/tool"

// One conversation with a system message, a tool call and its result, shared by the mapper tests.
export const conversation: ContextItem[] = [
	{ type: "system_message", text: "Be brief." },
	{ type: "user_message", text: "What time is it?" },
	{ type: "tool_call", requestId: "call-1", toolName: "clock", toolArguments: '{"zone":"UTC"}' },
	{ type: "tool_call_result", requestId: "call-1", result: { type: "input_text", text: "noon" } },
	{ type: "model_message", text: "It is noon." },
]

export const clockTool: ToolDefinition = {
	name: "clock",
	description: "Tell the time.",
	parameters: { type: "object", properties: { zone: { type: "string" } }, required: ["zone"] },
	strict: true,
}

export const params = (overrides: Partial<InferenceParams> = {}): InferenceParams => ({
	model: "test-model",
	context: { items: conversation },
	...overrides,
})
