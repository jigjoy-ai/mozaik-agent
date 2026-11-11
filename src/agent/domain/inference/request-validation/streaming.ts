import type { ModelSpecification } from "@agent/domain/inference/generative-model"
import type { RequestValidationRule } from "@agent/domain/inference/request-validation/rule"
import type { InferenceParams } from "@agent/domain/instruction/inference"

export class StreamingValidation implements RequestValidationRule {
	readonly name = "streaming"

	isValid(params: InferenceParams, model: ModelSpecification): boolean {
		if (!params.streaming) {
			return true
		}

		return model.supportsStreaming
	}
}
