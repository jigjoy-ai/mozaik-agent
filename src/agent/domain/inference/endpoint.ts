import { SemanticEvent } from "@util/semantic-event"
import { InferenceInstruction } from "../loop/inference-instruction"
import { InferenceResult } from "../loop/inference-result"

export interface Endpoint {
	infer(input: InferenceInstruction): Promise<InferenceResult>
	stream(input: InferenceInstruction): AsyncIterable<SemanticEvent>
}
