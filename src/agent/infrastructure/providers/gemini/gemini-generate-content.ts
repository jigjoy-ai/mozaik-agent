import { SemanticEvent } from "@util/semantic-event"
import { GoogleGenAI } from "@google/genai"
import type { InferenceInstruction } from "@agent/domain/loop/inference-instruction"
import type { InferenceResult } from "@agent/domain/loop/inference-result"
import { GeminiGenerateContentMapper } from "@agent/infrastructure/providers/gemini/gemini-generate-content-mapper"
import { Endpoint } from "@agent/domain/inference/endpoint"

export interface GeminiConnectionConfig {
	baseURL?: string
	apiKey?: string
}

/**
 * Native Gemini adapter on the `@google/genai` SDK (`generateContent` /
 * `generateContentStream`). Unlike an OpenAI-compat shim this maps our
 * domain context to Gemini's native `contents`/`parts` shape, system
 * instruction, `functionDeclarations`, and `thinkingConfig`, and reads
 * thought parts + native usage metadata back out. Another `ModelRuntime`
 * — no runner or port changes.
 */
export class GeminiGenerateContent implements Endpoint {
	mapper: GeminiGenerateContentMapper
	private _client?: GoogleGenAI
	private readonly clientConfig: GeminiConnectionConfig

	constructor(mapper = new GeminiGenerateContentMapper(), config: GeminiConnectionConfig = {}) {
		this.mapper = mapper
		this.clientConfig = config
	}

	private get client(): GoogleGenAI {
		return (this._client ??= new GoogleGenAI({
			apiKey: this.clientConfig.apiKey ?? process.env.GEMINI_API_KEY,
			...(this.clientConfig.baseURL ? { httpOptions: { baseUrl: this.clientConfig.baseURL } } : {}),
		}))
	}

	async infer(input: InferenceInstruction): Promise<InferenceResult> {
		const request = this.mapper.toRequest(input)
		const response = await this.client.models.generateContent(request)

		return this.mapper.toResponse(response)
	}

	async *stream(instruction: InferenceInstruction): AsyncIterable<SemanticEvent> {
		const request = this.mapper.toRequest(instruction)
		const stream: any = await this.client.models.generateContentStream(request)

		let lastEvent: SemanticEvent | undefined = undefined
		for await (const chunk of stream) {
			lastEvent = chunk
			yield chunk
		}

		if (!lastEvent) {
			throw new Error("Last event not found")
		}

		const output = this.mapper.toResponse(lastEvent)

		yield {
			type: "inference.output",
			producerId: request.model,
			occurredAt: new Date(),
			payload: output,
		}
	}
}
