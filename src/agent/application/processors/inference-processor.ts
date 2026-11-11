import { InferenceResult } from "@agent/domain/loop/inference-output"
import { GenerativeModel } from "@agent/domain/inference/generative-model"
import { InferenceInstructionValidator } from "@agent/domain/inference/request-validation/inference-request-validator"
import { InferenceInstruction } from "@agent/domain/loop/inference-input"
import { SemanticEvent } from "@util/semantic-event"
import { InferenceProcessor } from "@agent/domain/loop/instruction"

export class InferenceProcessorImpl implements InferenceProcessor {
	constructor(
		private readonly supportedModels: GenerativeModel[],
		private readonly requestValidator: InferenceInstructionValidator,
	) {}

	async run(input: InferenceInstruction): Promise<InferenceResult> {
		const generativeModel = this.supportedModels.find((model) => model.specification.name === input.model)
		if (!generativeModel) {
			throw new Error(`Unsupported model: ${input.model}`)
		}

		this.requestValidator.validate(input, generativeModel.specification)

		return await generativeModel.endpoint.infer(input)
	}

	async *stream(input: InferenceInstruction): AsyncGenerator<SemanticEvent> {
		const generativeModel = this.supportedModels.find((model) => model.specification.name === input.model)
		if (!generativeModel) {
			throw new Error(`Unsupported model: ${input.model}`)
		}

		this.requestValidator.validate(input, generativeModel.specification)

		yield* generativeModel.endpoint.stream(input)
	}
}
