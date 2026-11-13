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

		const pendingInstruction = loop.getBreakpoint()
		if (!pendingInstruction) {
			throw new Error("No pending instruction found")
		}

		const instruction = this.instructionRegistry.getInstruction(pendingInstruction.type)
		if (!instruction) {
			throw new Error("Instruction not found")
		}

		const result = await instruction.run(pendingInstruction.parameters)

		pendingInstruction.result = result

		loop.resolveBreakpoint(pendingInstruction)

		await this.loopRepository.save(loop)
	}
}
