import { Command, CommandContract } from "@jigjoy/mozaik-rule-engine"
import { AdvanceLoopInput } from "./application/use-cases/advance-loop"
import { AgentUseCases } from "./agent-use-cases"
import { CreateAgentParams } from "./types"
import { CreateLoopInput } from "./application/use-cases/create-loop"
import { SetBreakpointInput } from "./application/use-cases/set-breakpoint"
import { EndLoopInput } from "./application/use-cases/end-loop"

const registerAgentCommands = (useCases: AgentUseCases) => {
	@Command({ name: "create-agent" })
	class CreateAgentCommand implements CommandContract<CreateAgentParams> {
		invoke(input: CreateAgentParams): unknown {
			return useCases.createAgent.execute(input)
		}
	}

	@Command({ name: "advance-loop" })
	class AdvanceLoopCommand implements CommandContract<AdvanceLoopInput> {
		invoke(input: AdvanceLoopInput): unknown {
			return useCases.advanceLoop.execute(input)
		}
	}

	@Command({ name: "create-loop" })
	class CreateLoopCommand implements CommandContract<CreateLoopInput> {
		invoke(input: CreateLoopInput): unknown {
			return useCases.createLoop.execute(input)
		}
	}

	@Command({ name: "set-breakpoint" })
	class SetBreakpointCommand implements CommandContract<SetBreakpointInput> {
		invoke(input: SetBreakpointInput): unknown {
			return useCases.setBreakpoint.execute(input)
		}
	}

	@Command({ name: "end-loop" })
	class EndLoopCommand implements CommandContract<EndLoopInput> {
		invoke(input: EndLoopInput): unknown {
			return useCases.endLoop.execute(input)
		}
	}

	@Command({ name: "get-loop" })
	class GetLoopCommand implements CommandContract<string> {
		invoke(id: string): unknown {
			return useCases.getLoop.execute(id)
		}
	}
}

export { registerAgentCommands }
