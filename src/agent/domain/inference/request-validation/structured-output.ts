import type { InferenceInstruction } from "@agent/domain/loop/inference-instruction"
import type { ModelSpecification } from "@agent/domain/inference/generative-model"
import type { RequestValidationRule } from "@agent/domain/inference/request-validation/rule"

export type StructuredOutputFormat = {
	name?: string
	schema: Record<string, any>
	strict?: boolean
}

export class StructuredOutputValidation implements RequestValidationRule {
	readonly name = "structured-output"

	isValid(instruction: InferenceInstruction, model: ModelSpecification): boolean {
		if (instruction.structuredOutput === undefined) {
			return true
		}

		return model.supportsStructuredOutput
	}
}
