import { MemoryFactory } from "@agent/domain/memory"
import { GenerativeModel } from "@agent/domain/inference/generative-model"
import { AgentRepository } from "@agent/domain/agent-repository"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { ToolDefinition } from "@agent/domain/inference/tool"
import { InstructionRegistry } from "@agent/domain/instruction/instruction-registry"
import { AdvanceLoopUseCase } from "@agent/application/use-cases/advance-loop"
import { SetBreakpointUseCase } from "@agent/application/use-cases/set-breakpoint"
import { StartLoopUseCase } from "@agent/application/use-cases/start-loop"
import { EndLoopUseCase } from "@agent/application/use-cases/end-loop"

type InferenceRunnerConfig = {
	supportedModels?: GenerativeModel[]
	instructionRegistry?: InstructionRegistry
}

type AgentModuleConfig = {
	agentRepository?: AgentRepository
	loopRepository?: LoopRepository
	inferenceRunnerConfig?: InferenceRunnerConfig
	memoryFactory?: MemoryFactory
}

type AgentModule = {
	agentRepository: AgentRepository
	loopRepository: LoopRepository
	instructionRegistry: InstructionRegistry
	memoryFactory: MemoryFactory
	advanceLoop: AdvanceLoopUseCase
	setBreakpoint: SetBreakpointUseCase
	startLoop: StartLoopUseCase
	endLoop: EndLoopUseCase
}

type CreateAgentParams = {
	name: string
	instruction: string
	tools: ToolDefinition[]
}

export type { InferenceRunnerConfig, AgentModuleConfig, AgentModule, CreateAgentParams }
