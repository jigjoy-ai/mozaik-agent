import type { InferenceEndpointMapper } from "@agent/domain/inference/inference-endpoint-mapper"
import type { InferenceInput } from "@agent/domain/loop/inference-request"
import type { InferenceOutput } from "@agent/domain/loop/inference-result"
import { SemanticEvent } from "@util/semantic-event"

export interface InferenceEndpoint {
	endpointMapper: InferenceEndpointMapper
	infer(inputParams: InferenceInput): Promise<InferenceOutput>
	stream(inputParams: InferenceInput): AsyncIterable<SemanticEvent>
}
