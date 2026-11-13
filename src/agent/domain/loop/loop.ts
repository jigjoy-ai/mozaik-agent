import { InstructionRecord } from "@agent/domain/loop/loop-breakpoint"
import { UuidGenerator } from "@util/uuid-generator"
import { LoopRecord } from "./loop-record"

export type LoopStateId = "idle" | "awaiting_result" | "completed" | "stopped" | "paused"

export class Loop {
	id: string
	goal: string
	assignee: string
	state: LoopStateId
	message: string | undefined
	pendingInstruction: InstructionRecord | undefined
	completedInstructions: InstructionRecord[]

	private constructor(
		id: string,
		goal: string,
		assignee: string,
		state: LoopStateId,
		message: string | undefined,
		pendingInstruction: InstructionRecord | undefined,
		completedInstructions: InstructionRecord[],
	) {
		this.id = id
		this.goal = goal
		this.assignee = assignee
		this.state = state
		this.message = message
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

		if (this.pendingInstruction.type !== instruction.type) {
			throw new Error("Instruction type mismatch")
		}

		if (!instruction.result) {
			throw new Error("Instruction result is required")
		}

		this.completedInstructions.push(this.pendingInstruction)
		this.pendingInstruction = undefined
	}

	getLatestInstruction(): InstructionRecord | undefined {
		return this.pendingInstruction || this.completedInstructions[this.completedInstructions.length - 1]
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

	end(message: string): void {
		this.message = message
		this.state = "completed"
	}

	static create(goal: string, assignee: string): Loop {
		const id = UuidGenerator.generate()
		return new Loop(id, goal, assignee, "idle", undefined, undefined, [])
	}

	static rehydrate(record: LoopRecord): Loop {
		return new Loop(
			record.id,
			record.goal,
			record.assignee,
			record.state,
			record.message,
			record.pendingInstruction,
			record.completedInstructions,
		)
	}
}
