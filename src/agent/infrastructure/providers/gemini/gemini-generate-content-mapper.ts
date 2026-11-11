import type { InferenceParams, InferenceResult } from "@agent/domain/instruction/inference"
import { InputTokenDetails, OutputTokenDetails, TokenUsage } from "@agent/domain/inference/token-usage"
import type { ModelOutputItem, ToolCallItem, ToolCallResultItem } from "@agent/domain/inference/context"

export class GeminiGenerateContentMapper {
	toRequest(params: InferenceParams) {
		const { contents, systemInstruction } = this.mapContextItems(params)
		const config: any = {}

		if (systemInstruction) {
			config.systemInstruction = systemInstruction
		}

		if (params.tools && params.tools.length > 0) {
			config.tools = [
				{
					functionDeclarations: params.tools.map((tool) => ({
						name: tool.name,
						description: tool.description,
						parametersJsonSchema: tool.parameters,
					})),
				},
			]
		}

		if (params.structuredOutput) {
			config.responseMimeType = "application/json"
			config.responseSchema = params.structuredOutput.schema
		}

		if (params.reasoningEffort) {
			config.thinkingConfig = {
				thinkingLevel: params.reasoningEffort,
				includeThoughts: true,
			}
		}

		const request: any = {
			model: params.model,
			contents,
			config,
		}

		if (params.streaming) {
			request.stream = params.streaming
		}

		return request
	}

	mapContextItems(params: InferenceParams): { contents: any[]; systemInstruction?: string } {
		const context = params.context
		const contents: any[] = []
		const system: string[] = []
		const callNames = new Map<string, string>()

		for (const item of params.context.items) {
			if (item.type === "developer_message" || item.type === "system_message") {
				system.push(item.text)
				continue
			}

			if (item.type === "user_message") {
				this.addPart(contents, "user", { text: item.text })
				continue
			}

			if (item.type === "model_message") {
				this.addPart(contents, "model", { text: item.text })
				continue
			}

			if (item.type === "tool_call") {
				const toolCallRequest = item as ToolCallItem
				callNames.set(toolCallRequest.requestId, toolCallRequest.toolName)
				let args: any
				try {
					args = JSON.parse(toolCallRequest.toolArguments)
				} catch {
					args = {}
				}
				this.addPart(contents, "model", {
					functionCall: { id: toolCallRequest.requestId, name: toolCallRequest.toolName, args },
				})
				continue
			}

			if (item.type === "tool_call_result") {
				const toolUseResult = item as ToolCallResultItem
				this.addPart(contents, "user", {
					functionResponse: {
						id: toolUseResult.requestId,
						name: callNames.get(toolUseResult.requestId) ?? "",
						response: this.parseResponse(toolUseResult.result.text),
					},
				})
			}
		}

		return {
			contents,
			systemInstruction: system.length > 0 ? system.join("\n\n") : undefined,
		}
	}

	private addPart(contents: any[], role: "user" | "model", part: any): void {
		const last = contents[contents.length - 1]
		if (last?.role === role) {
			last.parts.push(part)
			return
		}

		contents.push({ role, parts: [part] })
	}

	private parseResponse(output: string): any {
		try {
			const parsed = JSON.parse(output)
			return parsed && typeof parsed === "object" ? parsed : { output }
		} catch {
			return { output }
		}
	}

	extractTokenUsage(response: any): TokenUsage | undefined {
		const usage = response.usageMetadata
		if (!usage) {
			return undefined
		}
		return new TokenUsage(
			usage.promptTokenCount ?? 0,
			usage.candidatesTokenCount ?? 0,
			usage.totalTokenCount ?? 0,
			new InputTokenDetails(usage.cachedContentTokenCount ?? 0),
			new OutputTokenDetails(usage.thoughtsTokenCount ?? 0),
		)
	}

	toResponse(response: any): InferenceResult {
		const items: ModelOutputItem[] = []
		const parts = response.candidates?.[0]?.content?.parts ?? []

		for (const part of parts) {
			if (part.thought && part.text) {
				items.push({
					type: "reasoning",
					content: { type: "input_text", text: part.text },
					encryptedContent: undefined,
					summary: [],
				})
				continue
			}
			if (part.text) {
				items.push({
					type: "model_message",
					text: part.text,
				})
				continue
			}
			if (part.functionCall) {
				items.push({
					type: "tool_call",
					requestId: part.functionCall.id ?? "",
					toolName: part.functionCall.name,
					toolArguments: JSON.stringify(part.functionCall.args ?? {}),
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
