import { AdvanceLoopUseCase } from "./application/use-cases/advance-loop"
import { CreateAgentUseCase } from "./application/use-cases/create-agent"
import { CreateLoopUseCase } from "./application/use-cases/create-loop"
import { EndLoopUseCase } from "./application/use-cases/end-loop"
import { GetLoopUseCase } from "./application/use-cases/get-loop"
import { PauseLoopUseCase } from "./application/use-cases/pause-loop"
import { SetBreakpointUseCase } from "./application/use-cases/set-breakpoint"
import type { AgentDependencies } from "./agent-dependencies"

export function createAgentUseCases(deps: AgentDependencies) {
	return {
		createAgent: new CreateAgentUseCase(deps.agentRepository, deps.memoryFactory),
		createLoop: new CreateLoopUseCase(deps.agentRepository, deps.loopRepository),
		advanceLoop: new AdvanceLoopUseCase(deps.loopRepository, deps.instructionRegistry),
		setBreakpoint: new SetBreakpointUseCase(deps.loopRepository),
		getLoop: new GetLoopUseCase(deps.loopRepository),
		pauseLoop: new PauseLoopUseCase(deps.loopRepository),
		endLoop: new EndLoopUseCase(deps.loopRepository),
	}
}

export type AgentUseCases = ReturnType<typeof createAgentUseCases>
