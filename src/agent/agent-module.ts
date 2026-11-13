import { InMemoryAgentRepository } from "@agent/infrastructure/repositories/in-memory-agent-repository"
import { InMemoryLoopRepository } from "@agent/infrastructure/repositories/in-memory-loop-repository"
import { RuntimeMemoryFactory } from "@agent/infrastructure/memory/runtime-memory-factory"
import { AgentModule, AgentModuleConfig } from "@agent/types"
import { supportedModels } from "@agent/infrastructure/providers/supported-models"
import { InferenceInstructionValidator } from "@agent/domain/inference/request-validation/inference-request-validator"
import { Inference } from "@agent/application/instructions/inference"
import { ToolCall } from "@agent/application/instructions/tool-call"
import { ToolRegistry } from "@agent/domain/tool-registry"
import { InstructionRegistry } from "@agent/domain/instruction/instruction-registry"
import { AdvanceLoopUseCase } from "@agent/application/use-cases/advance-loop"
import { SetBreakpointUseCase } from "@agent/application/use-cases/set-breakpoint"
import { StartLoopUseCase } from "@agent/application/use-cases/start-loop"
import { EndLoopUseCase } from "@agent/application/use-cases/end-loop"

let module: AgentModule | undefined

function initAgentModule(config: AgentModuleConfig = {}) {
	if (module) {
		throw new Error("Agent module already initialized")
	}

	const agentRepository = config.agentRepository ?? new InMemoryAgentRepository()
	const loopRepository = config.loopRepository ?? new InMemoryLoopRepository()

	const models = config.inferenceRunnerConfig?.supportedModels ?? supportedModels

	const inferenceInstruction = new Inference(models, new InferenceInstructionValidator())
	const toolCallInstruction = new ToolCall(new ToolRegistry())

	const instructionRegistry = new InstructionRegistry()
	instructionRegistry.register("inference", inferenceInstruction)
	instructionRegistry.register("tool_call", toolCallInstruction)

	const memoryFactory = config.memoryFactory ?? new RuntimeMemoryFactory()

	const advanceLoop = new AdvanceLoopUseCase(loopRepository, instructionRegistry)
	const setBreakpoint = new SetBreakpointUseCase(loopRepository)
	const startLoop = new StartLoopUseCase(loopRepository)
	const endLoop = new EndLoopUseCase(loopRepository)

	module = {
		agentRepository,
		loopRepository,
		instructionRegistry,
		memoryFactory,
		advanceLoop,
		setBreakpoint,
		startLoop,
		endLoop,
	}
}

function resolveAgentModule(): AgentModule {
	if (!module) {
		throw new Error("Agent module is not initialized")
	}

	return module
}

export { initAgentModule, resolveAgentModule }
