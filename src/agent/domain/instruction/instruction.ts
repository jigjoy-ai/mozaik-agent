import { InferenceParams, InferencePointer, InferenceResult } from "@agent/domain/instruction/inference"
import { ToolCallParams, ToolCallPointer, ToolCallResult } from "@agent/domain/instruction/tool-call"

export type InstructionPointer = InferencePointer | ToolCallPointer
export type InstructionParams = InferenceParams | ToolCallParams
export type InstructionResult = InferenceResult | ToolCallResult

export abstract class Instruction {
	abstract run(params: InstructionParams): Promise<InstructionResult>
}
