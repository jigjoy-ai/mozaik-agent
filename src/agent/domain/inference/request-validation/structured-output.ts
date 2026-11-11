import type { InferenceParams } from "@agent/domain/instruction/inference"
import type { ModelSpecification } from "@agent/domain/inference/generative-model"
import type { RequestValidationRule } from "@agent/domain/inference/request-validation/rule"

export type StructuredOutputFormat = {
	name?: string
	schema: Record<string, any>
	strict?: boolean
}

export class StructuredOutputValidation implements RequestValidationRule {
	readonly name = "structured-output"

	isValid(params: InferenceParams, model: ModelSpecification): boolean {
		if (params.structuredOutput === undefined) {
			return true
		}

		return model.supportsStructuredOutput
	}
}
