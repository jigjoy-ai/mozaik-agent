import type { Context } from "@agent/domain/inference/context"
import { InstructionResult, Instruction } from "@agent/domain/loop/instruction"

export type LoopStateId = "idle" | "awaiting_result" | "completed" | "stopped" | "paused"

export class Loop {
	id: string
	goal: string
	assignee: string
	state: LoopStateId
	context: Context
	pendingInstruction: Instruction | undefined
	completedInstructions: Instruction[]

	constructor(
		id: string,
		goal: string,
		assignee: string,
		context: Context,
		state: LoopStateId,
		pendingInstruction: Instruction | undefined,
		completedInstructions: Instruction[],
	) {
		this.id = id
		this.goal = goal
		this.assignee = assignee
		this.context = context
		this.state = state
		this.pendingInstruction = pendingInstruction
		this.completedInstructions = completedInstructions
	}

	setBreakpoint(instruction: Instruction): void {
		if (this.pendingInstruction) {
			throw new Error("An instruction is already pending")
		}

		this.pendingInstruction = instruction
	}

	getBreakpoint(): Instruction | undefined {
		return this.pendingInstruction
	}

	resolveBreakpoint(result: InstructionResult): void {
		if (!this.pendingInstruction) {
			throw new Error("No pending instruction to resolve")
		}

		if (this.pendingInstruction.type === "inference" && !(result.type === "inference_output")) {
			throw new Error("Inference output required")
		} else if (this.pendingInstruction.type === "tool-call" && !(result.type === "tool_call_output")) {
			throw new Error("Tool call output required")
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
