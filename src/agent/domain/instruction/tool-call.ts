import { Instruction } from "./instruction"

export type ToolCallParams = {
	readonly toolName: string
	readonly toolArguments: string
}

export type ToolCallPointer = {
	readonly type: "tool_call"
	readonly requestId: string
	readonly parameters: ToolCallParams
}

export type ToolCallResult = {
	readonly type: "tool_call_output"
	result: string
}

export abstract class ToolCallInstruction extends Instruction {
	abstract run(input: ToolCallParams): Promise<ToolCallResult>
}
