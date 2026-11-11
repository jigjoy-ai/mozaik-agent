import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"

export type AdvanceLoopInput = {
	loopId: string
}

export class AdvanceLoopUseCase {
	constructor(private readonly loopRepository: LoopRepository) {}

	async execute(input: AdvanceLoopInput): Promise<void> {
		const loop: Loop | undefined = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const breakpoint = loop.getBreakpoint()
		if (!breakpoint) {
			throw new Error("No breakpoint found")
		}

		await this.loopRepository.save(loop)
	}
}
