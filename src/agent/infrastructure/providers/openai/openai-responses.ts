import { SemanticEvent } from "@util/semantic-event"
import { InferenceInstruction, InferenceParams } from "@agent/domain/instruction/inference"
import { InferenceResult } from "@agent/domain/instruction/inference"
import { OpenAIResponsesMapper } from "@agent/infrastructure/providers/openai/openai-responses-mapper"
import OpenAI from "openai"
import { Endpoint } from "@agent/domain/inference/endpoint"

/**
 * Optional connection config. When omitted, the `openai` SDK reads
 * `OPENAI_API_KEY` and `OPENAI_BASE_URL` from the environment.
 */
export interface OpenAIResponsesConfig {
	baseURL?: string
	apiKey?: string
}

export class OpenAIResponses implements Endpoint {
	mapper: OpenAIResponsesMapper
	private _client?: OpenAI
	private readonly clientConfig: OpenAIResponsesConfig

	constructor(mapper = new OpenAIResponsesMapper(), config: OpenAIResponsesConfig = {}) {
		this.mapper = mapper
		this.clientConfig = config
	}

	private get client(): OpenAI {
		// Passing `undefined` for baseURL/apiKey lets the SDK fall back
		// to OPENAI_BASE_URL / OPENAI_API_KEY from the environment.
		return (this._client ??= new OpenAI({
			baseURL: this.clientConfig.baseURL,
			apiKey: this.clientConfig.apiKey,
		}))
	}

	async infer(params: InferenceParams): Promise<InferenceResult> {
		const request = this.mapper.toRequest(params)
		const response = await this.client.responses.create(request)

		return this.mapper.toResponse(response)
	}

	async *stream(params: InferenceParams): AsyncIterable<SemanticEvent> {
		const request = this.mapper.toRequest(params)
		const stream: any = await this.client.responses.create({ ...request, stream: true })

		// Only the terminal `response.completed` event carries the assembled
		// response; the deltas before it cannot be mapped to an InferenceResult.
		let completedResponse: any = undefined
		for await (const event of stream) {
			if (event.type === "response.completed") {
				completedResponse = event.response
			}

			yield event
		}

		if (!completedResponse) {
			throw new Error("Stream ended without a completed response")
		}

		const output = this.mapper.toResponse(completedResponse)

		yield {
			type: "inference.output",
			payload: output,
			occurredAt: new Date(),
			producerId: params.model,
		}
	}
}
