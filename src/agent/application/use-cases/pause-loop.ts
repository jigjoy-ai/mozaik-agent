import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { Loop } from "@agent/domain/loop/loop"

export type PauseLoopInput = {
	loopId: string
	reason: string
}

export class PauseLoopUseCase {
	constructor(private readonly loopRepository: LoopRepository) {}

	async execute(input: PauseLoopInput): Promise<void> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}
		loop.pause()
		await this.loopRepository.save(loop)
	}
}
