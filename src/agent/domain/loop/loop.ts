import type { Context } from "@agent/domain/inference/context"
import { Instruction, InstructionResult } from "@agent/domain/instruction/instruction"
import { LoopBreakpoint } from "@agent/domain/loop/loop-breakpoint"

export type LoopStateId = "idle" | "awaiting_result" | "completed" | "stopped" | "paused"

export class Loop {
	id: string
	goal: string
	assignee: string
	state: LoopStateId
	context: Context
	breakpoint: LoopBreakpoint | undefined
	completedInstructions: Instruction[]

	constructor(
		id: string,
		goal: string,
		assignee: string,
		context: Context,
		state: LoopStateId,
		breakpoint: LoopBreakpoint | undefined,
		completedInstructions: Instruction[],
	) {
		this.id = id
		this.goal = goal
		this.assignee = assignee
		this.context = context
		this.state = state
		this.breakpoint = breakpoint
		this.completedInstructions = completedInstructions
	}

	setBreakpoint(breakpoint: LoopBreakpoint): void {
		if (this.breakpoint) {
			throw new Error("An breakpoint is already set")
		}

		this.breakpoint = breakpoint
	}

	getBreakpoint(): LoopBreakpoint | undefined {
		return this.breakpoint
	}

	resolveBreakpoint(result: InstructionResult): void {
		if (!this.breakpoint) {
			throw new Error("No pending instruction to resolve")
		}

		if (this.breakpoint.type === "inference" && !(result.type === "inference_output")) {
			throw new Error("Inference output required")
		} else if (this.breakpoint.type === "tool_call" && !(result.type === "tool_call_output")) {
			throw new Error("Tool call output required")
		}

		//this.completedInstructions.push(this.instructionPointer)
		this.breakpoint = undefined
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
