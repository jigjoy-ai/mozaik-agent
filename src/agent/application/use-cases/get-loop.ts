import { LoopRecord } from "@agent/domain/loop/loop-record"
import { LoopRepository } from "@agent/domain/loop/loop-repository"

export class GetLoopUseCase {
	constructor(private readonly loopRepository: LoopRepository) {}

	async execute(id: string): Promise<LoopRecord> {
		const loop = await this.loopRepository.findById(id)
		if (!loop) {
			throw new Error("Loop not found")
		}
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
