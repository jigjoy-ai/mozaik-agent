import { AgentModule, AgentModuleConfig } from "@agent/types"
import { createAgentDependencies } from "./agent-dependencies"
import { createAgentUseCases } from "./agent-use-cases"
import { registerAgentCommands } from "./agent-commands"

let module: AgentModule | undefined

function initAgentModule(config: AgentModuleConfig = {}) {
	if (module) {
		throw new Error("Agent module already initialized")
	}

	const dependencies = createAgentDependencies(config)
	const useCases = createAgentUseCases(dependencies)
	registerAgentCommands(useCases)

	module = {
		createAgent: (input) => useCases.createAgent.execute(input),
		registerTool: (name, tool) => {
			dependencies.toolRegistry.registerTool(name, tool)
		},
		advanceLoop: (input) => useCases.advanceLoop.execute(input),
		setBreakpoint: (input) => useCases.setBreakpoint.execute(input),
		createLoop: (input) => useCases.createLoop.execute(input),
		getLoop: (id) => useCases.getLoop.execute(id),
		pauseLoop: (input) => useCases.pauseLoop.execute(input),
		endLoop: (input) => useCases.endLoop.execute(input),
	}
}

function resolveAgentModule(): AgentModule {
	if (!module) {
		throw new Error("Agent module is not initialized")
	}

	return module
}

export { initAgentModule, resolveAgentModule }
