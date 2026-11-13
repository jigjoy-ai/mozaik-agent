import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { AgentRepository } from "@agent/domain/agent/agent-repository"

export type StartLoopInput = {
	agentId: string
	goal: string
}

export class StartLoopUseCase {
	constructor(
		private readonly agentRepository: AgentRepository,
		private readonly loopRepository: LoopRepository,
	) {}

	async execute(input: StartLoopInput): Promise<Loop> {
		const agent = await this.agentRepository.findById(input.agentId)
		if (!agent) {
			throw new Error("Agent not found")
		}
		const loop = Loop.create(input.goal, input.agentId)
		await this.loopRepository.save(loop)
		return loop
	}
}
