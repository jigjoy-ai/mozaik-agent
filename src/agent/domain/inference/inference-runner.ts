import { SemanticEvent } from "@util/semantic-event"
import type { InferenceRequest } from "@agent/domain/loop/inference-request"
import { InferenceResult } from "@agent/domain/loop/inference-result"

export interface InferenceRunner {
	run(request: InferenceRequest): Promise<InferenceResult>
	stream(request: InferenceRequest): AsyncGenerator<SemanticEvent>
}
