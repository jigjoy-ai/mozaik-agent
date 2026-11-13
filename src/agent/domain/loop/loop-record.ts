import { LoopStateId } from "@agent/domain/loop/loop"
import { InstructionRecord } from "@agent/domain/loop/loop-breakpoint"

export interface LoopRecord {
	id: string
	agentId: string
	subject: string
	createdAt: Date
	state: LoopStateId
	pendingInstruction?: InstructionRecord
	completedInstructions: InstructionRecord[]
}
