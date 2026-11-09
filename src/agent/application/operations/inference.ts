import { InferenceResult } from "@agent/domain/inference/inference-result"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { InferenceRunner } from "@agent/domain/inference/inference-runner"
import { InferenceRequest } from "@agent/domain/inference/inference-request"

export class Inference {
	id: string = "inference"

	constructor(
		private readonly loopRepository: LoopRepository,
		private readonly inferenceRunner: InferenceRunner,
	) {}

	async invoke(input: { loopId: string; request: InferenceRequest }): Promise<InferenceResult> {
		let loop = await this.loopRepository.findById(input.loopId)
		if (!loop) {
			throw new Error("Loop not found")
		}

		const inferenceResult: InferenceResult = await this.inferenceRunner.run(input.request)

		loop.acceptInferenceResult(inferenceResult)

		return inferenceResult
	}
}
