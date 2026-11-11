import type { InferenceInstruction } from "@agent/domain/loop/inference-instruction"
import type { ModelSpecification } from "@agent/domain/inference/generative-model"

export interface RequestValidationRule {
	readonly name: string
	isValid(instruction: InferenceInstruction, model: ModelSpecification): boolean
}
