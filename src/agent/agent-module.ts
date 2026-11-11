import { InMemoryAgentRepository } from "@agent/infrastructure/repositories/in-memory-agent-repository"
import { InMemoryLoopRepository } from "@agent/infrastructure/repositories/in-memory-loop-repository"
import { RuntimeMemoryFactory } from "@agent/infrastructure/memory/runtime-memory-factory"
import { AgentModule, AgentModuleConfig } from "@agent/types"
import { supportedModels } from "@agent/infrastructure/providers/supported-models"
import { InferenceInstructionValidator } from "@agent/domain/inference/request-validation/inference-request-validator"
import { InferenceProcessorImpl } from "@agent/application/processors/inference-processor"
import { ToolCallProcessorImpl } from "@agent/application/processors/tool-call-processor"
import { ToolRegistry } from "@agent/domain/loop/tool-registry"

let module: AgentModule | undefined

function initAgentModule(config: AgentModuleConfig = {}) {
	if (module) {
		throw new Error("Agent module already initialized")
	}

	const agentRepository = config.agentRepository ?? new InMemoryAgentRepository()
	const agentLoopRepository = config.agentLoopRepository ?? new InMemoryLoopRepository()

	const models = config.inferenceRunnerConfig?.supportedModels ?? supportedModels

	const inferenceProcessor = new InferenceProcessorImpl(models, new InferenceInstructionValidator())
	const toolCallProcessor = new ToolCallProcessorImpl(new ToolRegistry())

	const loopRepository = new InMemoryLoopRepository()

	const memoryFactory = config.memoryFactory ?? new RuntimeMemoryFactory()

	module = {
		agentRepository,
		agentLoopRepository,
		// inferenceRunner,
		memoryFactory,
	}
}

function resolveAgentModule(): AgentModule {
	if (!module) {
		throw new Error("Agent module is not initialized")
	}

	return module
}

export { initAgentModule }
