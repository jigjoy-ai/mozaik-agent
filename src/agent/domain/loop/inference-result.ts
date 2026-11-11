import { TokenUsage } from "@agent/domain/inference/token-usage"
import { ModelOutputItem } from "@agent/domain/inference/context"

export type InferenceResult = {
	readonly type: "inference_output"
	items: ModelOutputItem[]
	tokenUsage?: TokenUsage | undefined
	rawResponse: any
}
