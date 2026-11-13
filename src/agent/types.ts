import { MemoryFactory } from "@agent/domain/agent/memory"
import { GenerativeModel } from "@agent/domain/inference/generative-model"
import { AgentRepository } from "@agent/domain/agent/agent-repository"
import { LoopRepository } from "@agent/domain/loop/loop-repository"
import { ToolDefinition } from "@agent/domain/inference/tool"
import { InstructionRegistry } from "@agent/domain/instruction/instruction-registry"
import { AdvanceLoopInput } from "@agent/application/use-cases/advance-loop"
import { SetBreakpointInput } from "@agent/application/use-cases/set-breakpoint"
import { StartLoopInput } from "@agent/application/use-cases/start-loop"
import { EndLoopInput } from "@agent/application/use-cases/end-loop"
import { LoopRecord } from "@agent/domain/loop/loop-record"

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
	advanceLoop: (input: AdvanceLoopInput) => Promise<void>
	setBreakpoint: (input: SetBreakpointInput) => Promise<void>
	startLoop: (input: StartLoopInput) => Promise<LoopRecord>
	endLoop: (input: EndLoopInput) => Promise<void>
}

type CreateAgentParams = {
	name: string
	instruction: string
	tools: ToolDefinition[]
}

export type { InferenceRunnerConfig, AgentModuleConfig, AgentModule, CreateAgentParams }
