import { InferenceResult } from "@agent/domain/loop/inference-result"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { InferenceRunner } from "@agent/domain/inference/inference-runner"
import { InferenceInstruction } from "@agent/domain/loop/inference-request"

export class Inference {
	id: string = "inference"

	constructor(
		private readonly loopRepository: LoopRepository,
		private readonly inferenceRunner: InferenceRunner,
	) {}

	async invoke(input: { loopId: string; instruction: InferenceInstruction }): Promise<InferenceResult> {
		let loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const inferenceResult: InferenceResult = await this.inferenceRunner.run(input.instruction)

		loop.resolveBreakpoint(inferenceResult)

		return inferenceResult
	}
}
