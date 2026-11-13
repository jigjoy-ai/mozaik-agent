import { InstructionRegistry } from "@agent/domain/instruction/instruction-registry"
import { InstructionRecord } from "@agent/domain/loop/loop-breakpoint"
import { LoopRepository } from "@agent/domain/loop/loop-repository"

export class SetBreakpointUseCase {
	constructor(
		private readonly loopRepository: LoopRepository,
		private readonly instructionRegistry: InstructionRegistry,
	) {}

	async execute(loopId: string, pendingInstruction: InstructionRecord): Promise<void> {
		const loop = await this.loopRepository.findById(loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		loop.setBreakpoint(pendingInstruction)
		await this.loopRepository.save(loop)
	}
}
