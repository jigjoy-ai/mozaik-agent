import type { RequestValidationRule } from "@agent/domain/inference/request-validation/rule"
import type { ModelSpecification } from "@agent/domain/inference/generative-model"
import { InferenceInstruction } from "@agent/domain/loop/inference-input"

export class ReasoningEffortValidation implements RequestValidationRule {
	readonly name = "reasoning-effort"

	isValid(instruction: InferenceInstruction, model: ModelSpecification): boolean {
		if (instruction.reasoningEffort === undefined) {
			return true
		}

		if (!model.supportsReasoningEffort) {
			return false
		}

		return model.supportedReasoningEfforts.includes(instruction.reasoningEffort)
	}
}
