import { describe, expect, test } from "@rstest/core"
import { initAgentModule, resolveAgentModule } from "@agent/agent-module"
import { Loop } from "@agent/domain/loop/loop"
import type { LoopRecord } from "@agent/domain/loop/loop-record"
import type { LoopRepository } from "@agent/domain/loop/loop-repository"
import type { GenerativeModel } from "@agent/domain/inference/generative-model"

// Keeps a loop the way a database does: as a record, with no object left from the step before.
class RecordKeepingLoopRepository implements LoopRepository {
	readonly records = new Map<string, string>()

	async save(loop: Loop): Promise<void> {
		this.records.set(loop.id, JSON.stringify(loop))
	}

	async findById(id: string): Promise<Loop | undefined> {
		const record = this.records.get(id)
		return record ? Loop.rehydrate(JSON.parse(record) as LoopRecord) : undefined
	}
}

const echo: GenerativeModel = {
	specification: {
		name: "echo",
		provider: "test",
		supportsReasoningEffort: false,
		supportedReasoningEfforts: [],
		supportsStreaming: false,
		contextWindowSize: 1000,
		supportedContextItemTypes: ["user_message", "model_message"],
		maxOutputTokens: 1000,
		supportsFunctionCalling: false,
		supportsStructuredOutput: false,
	},
	endpoint: {
		async infer() {
			return { type: "inference_output", rawResponse: undefined, items: [{ type: "model_message", text: "Done." }] }
		},
		async *stream() {},
	},
}

describe("loop repository", () => {
	test("a loop continues from its saved record alone", async () => {
		const loops = new RecordKeepingLoopRepository()
		initAgentModule({ loopRepository: loops, inferenceRunnerConfig: { supportedModels: [echo] } })
		const { createAgent, createLoop, setBreakpoint, advanceLoop, getLoop, endLoop } = resolveAgentModule()

		const agent = await createAgent({ name: "worker", instruction: "Do the work.", tools: [] })
		const loop = await createLoop({ agentId: agent.id, goal: "Finish it." })
		await setBreakpoint({
			loopId: loop.id,
			instruction: {
				type: "inference",
				parameters: { model: "echo", context: { items: [{ type: "user_message", text: "Finish it." }] } },
			},
		})

		const waiting = JSON.parse(loops.records.get(loop.id)!) as LoopRecord
		expect(waiting.pendingInstruction?.type).toBe("inference")
		expect(waiting.completedInstructions).toEqual([])

		await advanceLoop({ loopId: loop.id })
		await endLoop({ loopId: loop.id, message: "Done." })

		const finished = await getLoop(loop.id)
		expect(finished.state).toBe("completed")
		expect(finished.message).toBe("Done.")
		expect(finished.pendingInstruction).toBeUndefined()
		expect(finished.completedInstructions[0].result).toMatchObject({
			items: [{ type: "model_message", text: "Done." }],
		})
	})
})
