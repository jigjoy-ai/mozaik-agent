import { InferenceInput, ToolCallInput, ToolCallOutput } from "@agent/domain/loop/inference-request"
import { InferenceOutput } from "@agent/domain/loop/inference-result"

export interface Instruction<TInput, TOutput> {
	readonly id: string
	readonly type: string
	requestedAt: Date
	completedAt?: Date
	readonly input: TInput
	output?: TOutput
}

export interface InferenceInstruction extends Instruction<InferenceInput, InferenceOutput> {
	type: "inference"
}

export interface ToolCallInstruction extends Instruction<ToolCallInput, ToolCallOutput> {
	type: "tool-call"
}

export type InstructionOutput = InferenceOutput | ToolCallOutput

export type LoopInstruction = InferenceInstruction | ToolCallInstruction

export interface InstructionExecutor<T extends Instruction<unknown, unknown>, TOutput> {
	execute(instruction: T): Promise<TOutput>
}

export interface InferenceInstructionExecutor extends InstructionExecutor<InferenceInstruction, InferenceOutput> {
	execute(instruction: InferenceInstruction): Promise<InferenceOutput>
}

export interface ToolCallInstructionExecutor extends InstructionExecutor<ToolCallInstruction, ToolCallOutput> {
	execute(instruction: ToolCallInstruction): Promise<ToolCallOutput>
}
