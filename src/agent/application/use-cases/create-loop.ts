import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { AgentRepository } from "@agent/domain/agent/agent-repository"
import { LoopRecord } from "@agent/domain/loop/loop-record"

export type CreateLoopInput = {
	agentId: string
	goal: string
}

export class CreateLoopUseCase {
	constructor(
		private readonly agentRepository: AgentRepository,
		private readonly loopRepository: LoopRepository,
	) {}

	async execute(input: CreateLoopInput): Promise<LoopRecord> {
		const agent = await this.agentRepository.findById(input.agentId)
		if (!agent) {
			throw new Error("Agent not found")
		}
		const loop = Loop.create(input.goal, input.agentId)
		await this.loopRepository.save(loop)
		return {
			id: loop.id,
			assignee: loop.assignee,
			goal: loop.goal,
			state: loop.state,
			completedInstructions: loop.completedInstructions,
			pendingInstruction: loop.pendingInstruction,
			message: loop.message,
		}
	}
}
