import { ToolCallRequest, ToolCallResult } from "@agent/domain/inference/context"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { ToolCallRunner } from "@agent/domain/inference/tool-call-runner"
import { Tool } from "@agent/domain/inference/tool"

export class ToolCall {
	id: string = "toolcall"

	constructor(
		private readonly loopRepository: LoopRepository,
		private readonly toolCallRunner: ToolCallRunner,
	) {}

	async invoke(input: {
		loopId: string
		directiveId: string
		request: ToolCallRequest
		tool: Tool
	}): Promise<ToolCallResult> {
		const loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const result: ToolCallResult = await this.toolCallRunner.run(input.request, input.tool)

		loop.acceptResult({
			type: "tool-call",
			operationId: input.directiveId,
			requestedAt: new Date(),
			completedAt: new Date(),
			call: input.request,
			result: result,
		})

		return result
	}
}
