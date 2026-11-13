import { InstructionRecord } from "@agent/domain/loop/loop-breakpoint"
import { LoopRepository } from "@agent/domain/loop/loop-repository"

export class SetBreakpointUseCase {
	constructor(private readonly loopRepository: LoopRepository) {}

	async execute(loopId: string, instruction: InstructionRecord): Promise<void> {
		const loop = await this.loopRepository.findById(loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		loop.setBreakpoint(instruction)
		await this.loopRepository.save(loop)
	}
}
