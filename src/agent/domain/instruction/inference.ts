import { StructuredOutputFormat } from "@agent/domain/inference/request-validation/structured-output"
import type { Context, ModelOutputItem } from "@agent/domain/inference/context"
import type { ToolDefinition } from "@agent/domain/inference/tool"
import { TokenUsage } from "../inference/token-usage"
import { Instruction } from "./instruction"

export type InferenceParams = {
	model: string
	maxOutputTokens?: number
	reasoningEffort?: string
	tools?: ToolDefinition[]
	streaming?: boolean
	structuredOutput?: StructuredOutputFormat
	context: Context
}

export type InferenceResult = {
	readonly type: "inference_output"
	items: ModelOutputItem[]
	tokenUsage?: TokenUsage | undefined
	rawResponse: any
}

export abstract class InferenceInstruction extends Instruction {
	abstract run(input: InferenceParams): Promise<InferenceResult>
}
