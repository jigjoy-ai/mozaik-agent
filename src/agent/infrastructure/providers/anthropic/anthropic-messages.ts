import { SemanticEvent } from "@util/semantic-event"
import type { InferenceInstruction } from "@agent/domain/loop/inference-instruction"
import type { InferenceResult } from "@agent/domain/loop/inference-result"
import { AnthropicMessagesMapper } from "@agent/infrastructure/providers/anthropic/anthropic-messages-mapper"
import Anthropic from "@anthropic-ai/sdk"
import { Endpoint } from "@agent/domain/inference/endpoint"

export interface AnthropicConnectionConfig {
	baseURL?: string
	apiKey?: string
	/** OAuth token for Claude Max / enterprise SSO (sent as `Authorization: Bearer`). */
	authToken?: string
}

/**
 * Native Anthropic adapter on the `@anthropic-ai/sdk` (`messages.create`).
 * Maps domain context to Anthropic's `messages`/`content` blocks shape,
 * system prompt, tools, adaptive thinking, and structured output config.
 */
export class AnthropicMessages implements Endpoint {
	mapper: AnthropicMessagesMapper
	private _client?: Anthropic
	private readonly clientConfig: AnthropicConnectionConfig

	constructor(mapper = new AnthropicMessagesMapper(), config: AnthropicConnectionConfig = {}) {
		this.mapper = mapper
		this.clientConfig = config
	}

	private get client(): Anthropic {
		return (this._client ??= new Anthropic({
			baseURL: this.clientConfig.baseURL,
			apiKey: this.clientConfig.apiKey,
			authToken: this.clientConfig.authToken,
		}))
	}

	async infer(input: InferenceInstruction): Promise<InferenceResult> {
		const request = this.mapper.toRequest(input)
		const response = await this.client.messages.create(request)

		return this.mapper.toResponse(response)
	}

	async *stream(instruction: InferenceInstruction): AsyncIterable<SemanticEvent> {
		const request = this.mapper.toRequest(instruction)
		const stream = this.client.messages.stream(request)

		for await (const event of stream) {
			yield event as unknown as SemanticEvent
		}

		const output = this.mapper.toResponse(await stream.finalMessage())

		yield {
			type: "inference.output",
			producerId: request.model,
			occurredAt: new Date(),
			payload: output,
		}
	}
}
