import { LoopTransition } from "@agent/domain/loop/transition"
import { LoopStateId } from "@agent/domain/loop/loop"
import { Instruction } from "@agent/domain/loop/instruction"

export interface LoopRecord {
	id: string
	agentId: string
	subject: string
	createdAt: Date
	state: LoopStateId
	transitionHistory: LoopTransition[]
	pendingInstruction?: Instruction
	completedInstructions: Instruction[]
}
