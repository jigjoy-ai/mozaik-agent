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
import { AdvanceLoopInput, AdvanceLoopUseCase } from "@agent/application/use-cases/advance-loop"
import { SetBreakpointInput, SetBreakpointUseCase } from "@agent/application/use-cases/set-breakpoint"
import { CreateLoopInput, CreateLoopUseCase } from "@agent/application/use-cases/create-loop"
import { EndLoopInput, EndLoopUseCase } from "@agent/application/use-cases/end-loop"
import { GetLoopUseCase } from "@agent/application/use-cases/get-loop"

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

	const advanceLoop = async (input: AdvanceLoopInput) => {
		const advanceLoopUseCase = new AdvanceLoopUseCase(loopRepository, instructionRegistry)
		return advanceLoopUseCase.execute(input)
	}

	const setBreakpoint = async (input: SetBreakpointInput) => {
		const setBreakpointUseCase = new SetBreakpointUseCase(loopRepository)
		return setBreakpointUseCase.execute(input)
	}

	const createLoop = async (input: CreateLoopInput) => {
		const createLoopUseCase = new CreateLoopUseCase(agentRepository, loopRepository)
		return createLoopUseCase.execute(input)
	}

	const getLoop = async (id: string) => {
		const getLoopUseCase = new GetLoopUseCase(loopRepository)
		return getLoopUseCase.execute(id)
	}

	const endLoop = async (input: EndLoopInput) => {
		const endLoopUseCase = new EndLoopUseCase(loopRepository)
		return endLoopUseCase.execute(input)
	}

	module = {
		advanceLoop,
		setBreakpoint,
		createLoop,
		getLoop,
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
