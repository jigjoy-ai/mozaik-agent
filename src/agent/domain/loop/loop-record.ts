import { LoopStateId } from "@agent/domain/loop/loop"
import { LoopBreakpoint } from "@agent/domain/loop/loop-breakpoint"

export interface LoopRecord {
	id: string
	agentId: string
	subject: string
	createdAt: Date
	state: LoopStateId
	breakpoint?: LoopBreakpoint
}
