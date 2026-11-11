import { InferenceParams, InferenceResult } from "@agent/domain/instruction/inference"
import { GenerativeModel } from "@agent/domain/inference/generative-model"
import { InferenceInstructionValidator } from "@agent/domain/inference/request-validation/inference-request-validator"
import { InferenceInstruction } from "@agent/domain/instruction/inference"
import { SemanticEvent } from "@util/semantic-event"

export class Inference implements InferenceInstruction {
	constructor(
		private readonly supportedModels: GenerativeModel[],
		private readonly requestValidator: InferenceInstructionValidator,
	) {}

	async run(input: InferenceParams): Promise<InferenceResult> {
		const generativeModel = this.supportedModels.find((model) => model.specification.name === input.model)
		if (!generativeModel) {
			throw new Error(`Unsupported model: ${input.model}`)
		}

		this.requestValidator.validate(input, generativeModel.specification)

		return await generativeModel.endpoint.infer(input)
	}

	async *stream(input: InferenceParams): AsyncGenerator<SemanticEvent> {
		const generativeModel = this.supportedModels.find((model) => model.specification.name === input.model)
		if (!generativeModel) {
			throw new Error(`Unsupported model: ${input.model}`)
		}

		this.requestValidator.validate(input, generativeModel.specification)

		yield* generativeModel.endpoint.stream(input)
	}
}
