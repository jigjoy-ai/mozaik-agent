import { InstructionRecord } from "@agent/domain/loop/loop-breakpoint"
import { LoopRepository } from "@agent/domain/loop/loop-repository"

export type SetBreakpointInput = {
	loopId: string
	instruction: InstructionRecord
}

export class SetBreakpointUseCase {
	constructor(private readonly loopRepository: LoopRepository) {}

	async execute(input: SetBreakpointInput): Promise<void> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		loop.setBreakpoint(input.instruction)
		await this.loopRepository.save(loop)
	}
}
