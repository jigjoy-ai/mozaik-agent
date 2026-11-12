import { Loop } from "@agent/domain/loop/loop"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { InstructionRegistry } from "@agent/domain/instruction/instruction-registry"

export type AdvanceLoopInput = {
	loopId: string
}

export class AdvanceLoopUseCase {
	constructor(
		private readonly loopRepository: LoopRepository,
		private readonly instructionRegistry: InstructionRegistry,
	) {}

	async execute(input: AdvanceLoopInput): Promise<void> {
		const loop: Loop | undefined = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const breakpoint = loop.getBreakpoint()
		if (!breakpoint) {
			throw new Error("No breakpoint found")
		}

		const instruction = this.instructionRegistry.getInstruction(breakpoint.type)
		if (!instruction) {
			throw new Error("Instruction not found")
		}

		const result = await instruction.run(breakpoint.parameters)
		loop.resolveBreakpoint(result)

		await this.loopRepository.save(loop)
	}
}
