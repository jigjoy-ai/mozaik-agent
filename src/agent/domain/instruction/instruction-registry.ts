import { Instruction } from "./instruction"

export class InstructionRegistry {
	private readonly instructions: Map<string, Instruction> = new Map()

	register(type: string, instruction: Instruction): void {
		this.instructions.set(type, instruction)
	}

	getInstruction(type: string): Instruction {
		const instruction = this.instructions.get(type)
		if (!instruction) {
			throw new Error(`Instruction type ${type} not found`)
		}
		return instruction
	}
}
