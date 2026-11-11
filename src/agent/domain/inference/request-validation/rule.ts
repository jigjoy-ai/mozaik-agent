import type { InferenceParams } from "@agent/domain/instruction/inference"
import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export interface RequestValidationRule {
	readonly name: string
	isValid(params: InferenceParams, model: ModelSpecification): boolean
}
