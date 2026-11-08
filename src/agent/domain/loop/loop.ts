import { Agent } from "@agent/index"
import type { Context, ToolCallRequest, ToolCallResult } from "@agent/domain/inference/context"
import { CompletedOperation, PendingOperation } from "@agent/domain/loop/operation"
import { InferenceResult } from "../inference/inference-result"
import { InferenceRequest } from "../inference/inference-request"

export type LoopStateId = "idle" | "awaiting_result" | "completed" | "stopped" | "paused"

export type AgentLoop = {
	agent: Agent
	loop: Loop
}

export class Loop {
	id: string
	goal: string
	assignee: string
	state: LoopStateId
	context: Context
	pendingOperation: PendingOperation | undefined
	completedOperations: CompletedOperation[]

	constructor(
		id: string,
		goal: string,
		assignee: string,
		context: Context,
		state: LoopStateId,
		pendingOperation: PendingOperation | undefined,
		completedOperations: CompletedOperation[],
	) {
		this.id = id
		this.goal = goal
		this.assignee = assignee
		this.context = context
		this.state = state
		this.pendingOperation = pendingOperation
		this.completedOperations = completedOperations
	}

	issueOperation(operation: PendingOperation): void {
		if (this.pendingOperation) {
			throw new Error("An operation is already pending")
		}

		this.pendingOperation = operation
	}

	getPendingOperation(): PendingOperation | undefined {
		return this.pendingOperation
	}

	acceptInferenceResult(result: InferenceResult): void {
		if (this.pendingOperation?.type !== "inference") {
			throw new Error("Pending operation is not an inference")
		}

		this.pendingOperation = undefined
		this.completedOperations.push({
			type: "inference",
			operationId: this.pendingOperation!.id,
			requestedAt: this.pendingOperation!.requestedAt,
			completedAt: new Date(),
			request: this.pendingOperation!.request as InferenceRequest,
			result: result,
		})
	}

	acceptToolCallResult(result: ToolCallResult): void {
		if (this.pendingOperation?.type !== "tool-call") {
			throw new Error("Pending operation is not a tool call")
		}

		this.pendingOperation = undefined
		this.completedOperations.push({
			type: "tool-call",
			operationId: this.pendingOperation!.id,
			requestedAt: this.pendingOperation!.requestedAt,
			completedAt: new Date(),
			request: this.pendingOperation!.request as ToolCallRequest,
			result: result,
		})
	}

	handoff(recipientId: string): void {
		this.assignee = recipientId
	}

	pause(): void {
		this.state = "paused"
	}

	stop(): void {
		this.state = "stopped"
	}

	end(): void {
		this.state = "completed"
	}
}
