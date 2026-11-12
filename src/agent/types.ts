import { MemoryFactory } from "@agent/domain/memory"
import { GenerativeModel } from "@agent/domain/inference/generative-model"
import { AgentRepository } from "@agent/domain/agent-repository"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { ToolDefinition } from "@agent/domain/inference/tool"
import { InstructionRegistry } from "@agent/domain/instruction/instruction-registry"

type InferenceRunnerConfig = {
	supportedModels?: GenerativeModel[]
	instructionRegistry?: InstructionRegistry
}

type AgentModuleConfig = {
	agentRepository?: AgentRepository
	agentLoopRepository?: LoopRepository
	inferenceRunnerConfig?: InferenceRunnerConfig
	memoryFactory?: MemoryFactory
}

type AgentModule = {
	agentRepository: AgentRepository
	agentLoopRepository: LoopRepository
	instructionRegistry: InstructionRegistry
	memoryFactory: MemoryFactory
}

type CreateAgentParams = {
	name: string
	instruction: string
	tools: ToolDefinition[]
}

export type { InferenceRunnerConfig, AgentModuleConfig, AgentModule, CreateAgentParams }
