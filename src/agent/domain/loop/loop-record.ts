import { LoopStateId } from "@agent/domain/loop/loop"
import { InstructionPointer } from "@agent/domain/instruction/instruction"

export interface LoopRecord {
	id: string
	agentId: string
	subject: string
	createdAt: Date
	state: LoopStateId
	instructionPointer?: InstructionPointer
}
