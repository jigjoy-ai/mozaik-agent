import type { Context } from "@agent/domain/inference/context"
import { InferenceOutput } from "@agent/domain/loop/inference-result"
import { ToolCallOutput } from "@agent/domain/loop/inference-request"
import { InstructionOutput, LoopInstruction } from "@agent/domain/loop/instruction"

export type LoopStateId = "idle" | "awaiting_result" | "completed" | "stopped" | "paused"

export class Loop {
	id: string
	goal: string
	assignee: string
	state: LoopStateId
	context: Context
	pendingInstruction: LoopInstruction | undefined
	completedInstructions: LoopInstruction[]

	constructor(
		id: string,
		goal: string,
		assignee: string,
		context: Context,
		state: LoopStateId,
		pendingInstruction: LoopInstruction | undefined,
		completedInstructions: LoopInstruction[],
	) {
		this.id = id
		this.goal = goal
		this.assignee = assignee
		this.context = context
		this.state = state
		this.pendingInstruction = pendingInstruction
		this.completedInstructions = completedInstructions
	}

	setBreakpoint(instruction: LoopInstruction): void {
		if (this.pendingInstruction) {
			throw new Error("An instruction is already pending")
		}

		this.pendingInstruction = instruction
	}

	getBreakpoint(): LoopInstruction | undefined {
		return this.pendingInstruction
	}

	resolveBreakpoint(output: InstructionOutput): void {
		if (!this.pendingInstruction) {
			throw new Error("No pending instruction to resolve")
		}

		if (this.pendingInstruction.type === "inference" && !(output.type === "inference_output")) {
			throw new Error("Inference output required")
		} else if (this.pendingInstruction.type === "tool-call" && !(output.type === "tool_call_output")) {
			throw new Error("Tool call output required")
		}

		this.pendingInstruction.completedAt = new Date()
		this.pendingInstruction.output = output

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
