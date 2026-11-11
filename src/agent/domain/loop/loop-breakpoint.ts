import { InferenceParams } from "../instruction/inference"
import { ToolCallParams } from "../instruction/tool-call"

export type InferenceBreakpoint = {
	readonly type: "inference"
	readonly parameters: InferenceParams
}

export type ToolCallBreakpoint = {
	readonly type: "tool_call"
	readonly parameters: ToolCallParams
}

export type LoopBreakpoint = InferenceBreakpoint | ToolCallBreakpoint
