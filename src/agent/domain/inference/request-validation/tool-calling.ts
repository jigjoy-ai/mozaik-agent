import type { RequestValidationRule } from "@agent/domain/inference/request-validation/rule"
import type { ModelSpecification } from "@agent/domain/inference/generative-model"
import { InferenceInstruction } from "@agent/domain/loop/inference-input"

export class ToolUseRequestingValidation implements RequestValidationRule {
	readonly name = "tool-calling"

	isValid(instruction: InferenceInstruction, model: ModelSpecification): boolean {
		if (instruction.tools === undefined) {
			return true
		}

		return model.supportsFunctionCalling
	}
}
