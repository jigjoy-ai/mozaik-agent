import type { Context } from "@agent/domain/inference/context"
import { Instruction, InstructionPointer, InstructionResult } from "@agent/domain/instruction/instruction"

export type LoopStateId = "idle" | "awaiting_result" | "completed" | "stopped" | "paused"

export class Loop {
	id: string
	goal: string
	assignee: string
	state: LoopStateId
	context: Context
	pointer: InstructionPointer | undefined
	completedInstructions: Instruction[]

	constructor(
		id: string,
		goal: string,
		assignee: string,
		context: Context,
		state: LoopStateId,
		pointer: InstructionPointer | undefined,
		completedInstructions: Instruction[],
	) {
		this.id = id
		this.goal = goal
		this.assignee = assignee
		this.context = context
		this.state = state
		this.pointer = pointer
		this.completedInstructions = completedInstructions
	}

	setBreakpoint(pointer: InstructionPointer): void {
		if (this.pointer) {
			throw new Error("An instruction pointer is already set")
		}

		this.pointer = pointer
	}

	getBreakpoint(): InstructionPointer | undefined {
		return this.pointer
	}

	resolveBreakpoint(result: InstructionResult): void {
		if (!this.pointer) {
			throw new Error("No pending instruction to resolve")
		}

		if (this.pointer.type === "inference" && !(result.type === "inference_output")) {
			throw new Error("Inference output required")
		} else if (this.pointer.type === "tool_call" && !(result.type === "tool_call_output")) {
			throw new Error("Tool call output required")
		}

		//this.completedInstructions.push(this.instructionPointer)
		this.pointer = undefined
	}

	handoff(recipientId: string): void {
		this.assignee = recipientId
	}

	pause(): void {
		this.state = "paused"
	}

	stop(): void {
		this.state = "stopped"
	}

	end(): void {
		this.state = "completed"
	}
}
