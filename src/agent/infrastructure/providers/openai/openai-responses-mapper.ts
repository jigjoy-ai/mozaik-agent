import type { InferenceInstruction } from "@agent/domain/loop/inference-input"
import type { InferenceResult } from "@agent/domain/loop/inference-output"
import type { ModelOutputItem, ReasoningItem, ToolCallItem, ToolCallResultItem } from "@agent/domain/inference/context"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@agent/domain/inference/token-usage"
import type OpenAI from "openai"

export class OpenAIResponsesMapper {
	toRequest(instruction: InferenceInstruction): any {
		const request: any = {
			model: instruction.model,
			input: this.mapContextItems(instruction),
		}

		if (instruction.tools && instruction.tools.length > 0) {
			request.tools = instruction.tools.map((tool) => ({
				type: "function",
				name: tool.name,
				description: tool.description,
				parameters: tool.parameters,
			}))
		}

		if (instruction.reasoningEffort) {
			request.reasoning = {
				effort: instruction.reasoningEffort,
			}
		}

		if (instruction.structuredOutput) {
			const format = instruction.structuredOutput
			request.text = {
				format: {
					type: "json_schema",
					name: format.name ?? "response",
					schema: format.schema,
					strict: format.strict ?? true,
				},
			}
		}

		if (instruction.streaming) {
			request.stream = instruction.streaming
		}

		return request
	}

	mapContextItems(instruction: InferenceInstruction): any[] {
		const input: any[] = []

		for (const item of instruction.context.items) {
			if (item.type === "developer_message" || item.type === "system_message" || item.type === "user_message") {
				const role =
					item.type === "developer_message" ? "developer" : item.type === "system_message" ? "system" : "user"
				input.push({
					type: "message",
					role,
					content: [{ type: "input_text", text: item.text }],
				})
				continue
			}

			if (item.type === "model_message") {
				input.push({
					type: "message",
					role: "assistant",
					content: [{ type: "output_text", text: item.text }],
				})
				continue
			}

			if (item.type === "tool_call") {
				const toolCallRequest = item as ToolCallItem
				input.push({
					type: "function_call",
					call_id: toolCallRequest.requestId,
					name: toolCallRequest.toolName,
					arguments: toolCallRequest.toolArguments,
				})
				continue
			}

			if (item.type === "tool_call_result") {
				const toolCallResult = item as ToolCallResultItem
				input.push({
					type: "function_call_output",
					call_id: toolCallResult.requestId,
					output: [{ type: "input_text", text: toolCallResult.result.text }],
				})
				continue
			}

			if (item.type === "reasoning") {
				const reasoning = item as ReasoningItem
				const reasoningInput: Record<string, unknown> = {
					type: "reasoning",
					summary: reasoning.summary.map((summary) => ({ type: "summary_text", text: summary.text })),
				}
				if (reasoning.encryptedContent !== undefined) {
					reasoningInput.encrypted_content = reasoning.encryptedContent
				}
				input.push(reasoningInput)
			}
		}

		return input
	}

	extractTokenUsage(response: OpenAI.Responses.Response): TokenUsage | undefined {
		if (!response.usage) {
			return undefined
		}
		return new TokenUsage(
			response.usage.input_tokens,
			response.usage.output_tokens,
			response.usage.total_tokens,
			new InputTokenDetails(response.usage.input_tokens_details?.cached_tokens ?? 0),
			new OutputTokenDetails(response.usage.output_tokens_details?.reasoning_tokens ?? 0),
		)
	}

	toResponse(response: any): InferenceResult {
		const items: ModelOutputItem[] = []

		for (const item of response.output ?? []) {
			if (item.type === "message" && item.role === "assistant") {
				const firstContent = item.content?.[0]
				if (firstContent) {
					items.push({
						type: "model_message",
						text: firstContent.text,
					})
				}
				continue
			}
			if (item.type === "function_call") {
				const toolCallRequest: ToolCallItem = {
					type: "tool_call",
					requestId: item.call_id,
					toolName: item.name,
					toolArguments: item.arguments,
				}
				items.push(toolCallRequest)
				continue
			}
			if (item.type === "reasoning") {
				items.push({
					type: "reasoning",
					content: undefined,
					encryptedContent: item.encrypted_content,
					summary: (item.summary ?? []).map((summary: { text: string }) => ({
						type: "summary_text" as const,
						text: summary.text,
					})),
				})
			}
		}

		return {
			type: "inference_output",
			items,
			tokenUsage: this.extractTokenUsage(response),
			rawResponse: response,
		}
	}
}
