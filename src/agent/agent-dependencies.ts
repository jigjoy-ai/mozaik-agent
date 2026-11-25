import { Inference } from "./application/instructions/inference"
import { ToolCall } from "./application/instructions/tool-call"
import { InferenceInstructionValidator } from "./domain/inference/request-validation/inference-request-validator"
import { InstructionRegistry } from "./domain/instruction/instruction-registry"
import { ToolRegistry } from "./domain/tool-registry"
import { RuntimeMemoryFactory } from "./infrastructure/memory/runtime-memory-factory"
import { supportedModels } from "./infrastructure/providers/supported-models"
import { InMemoryAgentRepository } from "./infrastructure/repositories/in-memory-agent-repository"
import { InMemoryLoopRepository } from "./infrastructure/repositories/in-memory-loop-repository"
import { AgentModuleConfig } from "./types"

export function createAgentDependencies(config: AgentModuleConfig = {}) {
	const agentRepository = config.agentRepository ?? new InMemoryAgentRepository()
	const loopRepository = config.loopRepository ?? new InMemoryLoopRepository()
	const memoryFactory = config.memoryFactory ?? new RuntimeMemoryFactory()
	const models = config.inferenceRunnerConfig?.supportedModels ?? supportedModels

	const toolRegistry = new ToolRegistry()
	const instructionRegistry = new InstructionRegistry()

	instructionRegistry.register("inference", new Inference(models, new InferenceInstructionValidator()))
	instructionRegistry.register("tool_call", new ToolCall(toolRegistry))

	return { agentRepository, loopRepository, memoryFactory, toolRegistry, instructionRegistry }
}

export type AgentDependencies = ReturnType<typeof createAgentDependencies>
