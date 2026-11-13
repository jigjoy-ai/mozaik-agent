import { LoopRepository } from "@agent/domain/loop/loop-repository"

export type EndLoopInput = {
	loopId: string
	message: string
}

export class EndLoopUseCase {
	constructor(private readonly loopRepository: LoopRepository) {}

	async execute(input: EndLoopInput): Promise<void> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}
		loop.end(input.message)
		await this.loopRepository.save(loop)
	}
}
