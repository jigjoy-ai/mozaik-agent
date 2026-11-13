import type { Context } from "@agent/domain/inference/context"
import { InstructionRecord } from "@agent/domain/loop/loop-breakpoint"

export type LoopStateId = "idle" | "awaiting_result" | "completed" | "stopped" | "paused"

export class Loop {
	id: string
	goal: string
	assignee: string
	state: LoopStateId
	context: Context
	pendingInstruction: InstructionRecord | undefined
	completedInstructions: InstructionRecord[]

	constructor(
		id: string,
		goal: string,
		assignee: string,
		context: Context,
		state: LoopStateId,
		pendingInstruction: InstructionRecord | undefined,
		completedInstructions: InstructionRecord[],
	) {
		this.id = id
		this.goal = goal
		this.assignee = assignee
		this.context = context
		this.state = state
		this.pendingInstruction = pendingInstruction
		this.completedInstructions = completedInstructions
	}

	setBreakpoint(instruction: InstructionRecord): void {
		if (this.pendingInstruction) {
			throw new Error("An instruction is already pending")
		}

		this.pendingInstruction = instruction
	}

	getBreakpoint(): InstructionRecord | undefined {
		return this.pendingInstruction
	}

	resolveBreakpoint(instruction: InstructionRecord): void {
		if (!this.pendingInstruction) {
			throw new Error("No instruction to resolve")
		}

		if (this.pendingInstruction.instructionType !== instruction.instructionType) {
			throw new Error("Instruction type mismatch")
		}

		if (!instruction.result) {
			throw new Error("Instruction result is required")
		}

		this.completedInstructions.push(this.pendingInstruction)
		this.pendingInstruction = undefined
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
