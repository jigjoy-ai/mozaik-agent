import { InferenceInstruction } from "@agent/domain/loop/inference-instruction"
import { ToolCallInstruction } from "@agent/domain/loop/tool-call-instruction"
import { ToolCallResult } from "@agent/domain/loop/tool-call-result"
import { InferenceResult } from "@agent/domain/loop/inference-result"

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
