import { ToolCallInstruction, ToolCallResult } from "@agent/domain/inference/context"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { ToolCallRunner } from "@agent/domain/loop/tool-call-runner"
import { Tool } from "@agent/domain/inference/tool"

export class ToolCall {
	id: string = "toolcall"

	constructor(
		private readonly loopRepository: LoopRepository,
		private readonly toolCallRunner: ToolCallRunner,
	) {}

	async invoke(input: { loopId: string; instruction: ToolCallInstruction; tool: Tool }): Promise<ToolCallResult> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const result: ToolCallResult = await this.toolCallRunner.run(input.instruction, input.tool)

		loop.resolveBreakpoint(result)

		return result
	}
}
