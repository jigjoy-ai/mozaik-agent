import { SemanticEvent } from "@util/semantic-event"
import { InferenceParams, InferenceResult } from "../instruction/inference"

export interface Endpoint {
	infer(params: InferenceParams): Promise<InferenceResult>
	stream(params: InferenceParams): AsyncIterable<SemanticEvent>
}
