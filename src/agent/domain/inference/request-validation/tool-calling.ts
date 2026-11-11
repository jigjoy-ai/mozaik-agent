import type { RequestValidationRule } from "@agent/domain/inference/request-validation/rule"
import type { ModelSpecification } from "@agent/domain/inference/generative-model"
import { InferenceParams } from "@agent/domain/instruction/inference"

export class ToolUseRequestingValidation implements RequestValidationRule {
	readonly name = "tool-calling"

	isValid(params: InferenceParams, model: ModelSpecification): boolean {
		if (params.tools === undefined) {
			return true
		}

		return model.supportsFunctionCalling
	}
}
