import { StructuredOutputFormat } from "@agent/domain/inference/request-validation/structured-output"
import type { Context } from "@agent/domain/inference/context"
import type { ToolDefinition } from "@agent/domain/inference/tool"
import { InferenceOutput } from "./inference-result"

export type InferenceInstruction = {
	type: "inference"
	requestedAt: Date
	completedAt: Date | undefined
	input: InferenceInput
	output?: InferenceOutput
}

export type InferenceInput = {
	model: string
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: ToolDefinition[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: Context
}

export type ToolCallInput = {
	toolName: string
	toolArguments: string
}

export type ToolCallOutput = {
	readonly type: "tool_call_output"
	result: string
}
