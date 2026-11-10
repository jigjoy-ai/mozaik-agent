import type { InferenceRequest } from "@agent/domain/loop/inference-request"
import type { InferenceResult } from "@agent/domain/loop/inference-result"

export interface InferenceEndpointMapper {
	toRequest(inferenceRequest: InferenceRequest): any
	toResponse(response: any): InferenceResult
}
