import { InferenceInstruction, ToolCallInstruction, ToolCallResult } from "@agent/domain/loop/inference-input"
import { InferenceResult } from "@agent/domain/loop/inference-output"

export type InstructionResult = InferenceResult | ToolCallResult

export type Instruction = InferenceInstruction | ToolCallInstruction

export interface Processor {
	run(instruction: Instruction): Promise<InstructionResult>
}

export interface InferenceProcessor extends Processor {
	run(instruction: InferenceInstruction): Promise<InferenceResult>
}

export interface ToolCallProcessor extends Processor {
	run(instruction: ToolCallInstruction): Promise<ToolCallResult>
}
