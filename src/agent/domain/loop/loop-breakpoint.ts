import { InferenceParams, InferenceResult } from "../instruction/inference"
import { ToolCallParams, ToolCallResult } from "../instruction/tool-call"

export type InstructionType = "inference" | "tool_call"

export type InferenceRecord = {
	readonly type: "inference"
	readonly parameters: InferenceParams
	result?: InferenceResult
}

export type ToolCallRecord = {
	readonly type: "tool_call"
	readonly parameters: ToolCallParams
	result?: ToolCallResult
}

export type InstructionRecord = InferenceRecord | ToolCallRecord
