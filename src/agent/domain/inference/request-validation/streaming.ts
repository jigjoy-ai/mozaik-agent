import type { ModelSpecification } from "@agent/domain/inference/generative-model"
import type { RequestValidationRule } from "@agent/domain/inference/request-validation/rule"
import type { InferenceInstruction } from "@agent/domain/loop/inference-input"

export class StreamingValidation implements RequestValidationRule {
	readonly name = "streaming"

	isValid(instruction: InferenceInstruction, model: ModelSpecification): boolean {
		if (!instruction.streaming) {
			return true
		}

		return model.supportsStreaming
	}
}
