import { SemanticEvent } from "@util/semantic-event"
import { InferenceInstruction } from "../loop/inference-input"
import { InferenceResult } from "../loop/inference-output"

export interface Endpoint {
	infer(input: InferenceInstruction): Promise<InferenceResult>
	stream(input: InferenceInstruction): AsyncIterable<SemanticEvent>
}
