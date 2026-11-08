import { ToolCallRequest, ToolCallResult } from "@agent/domain/inference/context"
import { InferenceRequest } from "@agent/domain/inference/inference-request"
import { InferenceResult } from "@agent/domain/inference/inference-result"

export type CompletedOperation =
	| {
			type: "inference"
			operationId: string
			requestedAt: Date
			completedAt: Date
			request: InferenceRequest
			result: InferenceResult
	  }
	| {
			type: "tool-call"
			operationId: string
			requestedAt: Date
			completedAt: Date
			request: ToolCallRequest
			result: ToolCallResult
	  }

export type PendingInference = {
	id: string
	type: "inference"
	requestedAt: Date
	request: InferenceRequest
}

export type PendingToolCall = {
	id: string
	type: "tool-call"
	requestedAt: Date
	request: ToolCallRequest
}

export type PendingOperation = PendingInference | PendingToolCall
