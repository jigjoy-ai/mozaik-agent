import type { InferenceInstruction } from "@agent/domain/loop/inference-input"
import type { InferenceResult } from "@agent/domain/loop/inference-output"
import type { ModelOutputItem, ToolCallItem, ToolCallResultItem } from "@agent/domain/inference/context"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@agent/domain/inference/token-usage"

export class OpenAIChatCompletionsMapper {
	toRequest(instruction: InferenceInstruction) {
		const request: any = {
			model: instruction.model,
			messages: this.mapContextItems(instruction),
		}

		if (instruction.tools && instruction.tools.length > 0) {
			request.tools = instruction.tools.map((tool) => ({
				type: "function",
				function: {
					name: tool.name,
					description: tool.description,
					parameters: tool.parameters,
				},
			}))
		}

		if (instruction.reasoningEffort) {
			request.reasoning_effort = instruction.reasoningEffort
		}

		if (instruction.streaming) {
			request.stream = instruction.streaming
		}

		return request
	}

	mapContextItems(instruction: InferenceInstruction): any[] {
		const messages: any[] = []

		for (const item of instruction.context.items) {
			if (item.type === "developer_message" || item.type === "system_message") {
				messages.push({ role: "system", content: item.text })
				continue
			}

			if (item.type === "user_message") {
				messages.push({ role: "user", content: item.text })
				continue
			}

			if (item.type === "model_message") {
				messages.push({ role: "assistant", content: item.text })
				continue
			}

			if (item.type === "tool_call") {
				const toolCallRequest = item as ToolCallItem
				const toolCall = {
					id: toolCallRequest.requestId,
					type: "function",
					function: { name: toolCallRequest.toolName, arguments: toolCallRequest.toolArguments },
				}
				const last = messages[messages.length - 1]
				if (last?.role === "assistant") {
					last.tool_calls = last.tool_calls ?? []
					last.tool_calls.push(toolCall)
				} else {
					messages.push({ role: "assistant", content: null, tool_calls: [toolCall] })
				}
				continue
			}

			if (item.type === "tool_call_result") {
				const toolCallResult = item as ToolCallResultItem
				messages.push({
					role: "tool",
					tool_call_id: toolCallResult.requestId,
					content: toolCallResult.result.text,
				})
			}
		}

		return messages
	}

	extractTokenUsage(response: any): TokenUsage | undefined {
		if (!response.usage) {
			return undefined
		}
		return new TokenUsage(
			response.usage.prompt_tokens,
			response.usage.completion_tokens,
			response.usage.total_tokens,
			new InputTokenDetails(response.usage.prompt_tokens_details?.cached_tokens ?? 0),
			new OutputTokenDetails(response.usage.completion_tokens_details?.reasoning_tokens ?? 0),
		)
	}

	toResponse(response: any): InferenceResult {
		const items: ModelOutputItem[] = []
		const message = response.choices?.[0]?.message
		if (!message) {
			return {
				type: "inference_output",
				items: [],
				tokenUsage: this.extractTokenUsage(response),
				rawResponse: response,
			}
		}

		if (message.reasoning_content) {
			items.push({
				type: "reasoning",
				content: { type: "input_text", text: message.reasoning_content },
				encryptedContent: undefined,
				summary: [],
			})
		}

		if (message.content) {
			items.push({
				type: "model_message",
				text: message.content,
			})
		}

		for (const toolCall of message.tool_calls ?? []) {
			items.push({
				type: "tool_call",
				requestId: toolCall.id,
				toolName: toolCall.function.name,
				toolArguments: toolCall.function.arguments,
			})
		}

		return {
			type: "inference_output",
			items,
			tokenUsage: this.extractTokenUsage(response),
			rawResponse: response,
		}
	}
}
