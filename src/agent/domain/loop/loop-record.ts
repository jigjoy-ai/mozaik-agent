import { LoopStateId } from "@agent/domain/loop/loop"
import { InstructionRecord } from "@agent/domain/loop/loop-breakpoint"

export type LoopRecord = {
	id: string
	assignee: string
	goal: string
	state: LoopStateId
	message?: string
	pendingInstruction?: InstructionRecord
	completedInstructions: InstructionRecord[]
}
