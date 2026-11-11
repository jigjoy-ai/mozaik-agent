import { StructuredOutputFormat } from "@agent/domain/inference/request-validation/structured-output"
import type { Context } from "@agent/domain/inference/context"
import type { ToolDefinition } from "@agent/domain/inference/tool"

export type InferenceInstruction = {
	readonly type: "inference"
	model: string
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: ToolDefinition[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: Context
}

export type ToolCallInstruction = {
	readonly type: "tool-call"
	toolName: string
	toolArguments: string
}

export type ToolCallResult = {
	readonly type: "tool_call_output"
	result: string
}
