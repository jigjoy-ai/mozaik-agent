import {
	Condition,
	ConditionContract,
	InputResolver,
	InputResolverContract,
	PolicyDefinition,
	applyPolicy,
} from "@jigjoy/mozaik-rule-engine"
import { initAgentModule, resolveAgentModule } from "../../src"
import type { Agent, CreateAgentParams, LoopRecord } from "../../src"
import type { AdvanceLoopInput } from "../../src/agent/application/use-cases/advance-loop"
import type { CreateLoopInput } from "../../src/agent/application/use-cases/create-loop"
import type { EndLoopInput } from "../../src/agent/application/use-cases/end-loop"
import type { SetBreakpointInput } from "../../src/agent/application/use-cases/set-breakpoint"

// Each step is its own policy, because applyPolicy runs one command.
// create-agent, then create-loop, then set-breakpoint, then advance-loop or end-loop.
// A smaller priority wins, so needs-approval (1) beats tool-call-requested (10).

type BreakpointState = {
	name: string
	instruction: string
	goal: string
	toolName: string
	toolArguments: string
	approved: boolean
	agentId?: string
	loopId?: string
}

const SENSITIVE_TOOLS = new Set(["shell"])

function requireLoopId(state: BreakpointState): string {
	if (!state.loopId) {
		throw new Error("Loop is not created")
	}
	return state.loopId
}

@Condition({ name: "agent-requested" })
class AgentRequested extends ConditionContract<BreakpointState> {
	isSatisfiedBy(state: BreakpointState): boolean {
		return state.name.length > 0 && state.agentId === undefined
	}
}

@Condition({ name: "loop-requested" })
class LoopRequested extends ConditionContract<BreakpointState> {
	isSatisfiedBy(state: BreakpointState): boolean {
		return state.agentId !== undefined && state.goal.length > 0 && state.loopId === undefined
	}
}

@Condition({ name: "tool-call-requested" })
class ToolCallRequested extends ConditionContract<BreakpointState> {
	isSatisfiedBy(state: BreakpointState): boolean {
		return state.toolName.length > 0 && state.loopId !== undefined
	}
}

@Condition({ name: "needs-approval" })
class NeedsApproval extends ConditionContract<BreakpointState> {
	isSatisfiedBy(state: BreakpointState): boolean {
		return SENSITIVE_TOOLS.has(state.toolName) && !state.approved
	}
}

@InputResolver({ name: "create-agent-input" })
class CreateAgentInputResolver implements InputResolverContract<BreakpointState, CreateAgentParams> {
	async resolve(state: BreakpointState): Promise<CreateAgentParams> {
		return { name: state.name, instruction: state.instruction, tools: [] }
	}
}

@InputResolver({ name: "create-loop-input" })
class CreateLoopInputResolver implements InputResolverContract<BreakpointState, CreateLoopInput> {
	async resolve(state: BreakpointState): Promise<CreateLoopInput> {
		if (!state.agentId) {
			throw new Error("Agent is not created")
		}
		return { agentId: state.agentId, goal: state.goal }
	}
}

@InputResolver({ name: "set-breakpoint-input" })
class SetBreakpointInputResolver implements InputResolverContract<BreakpointState, SetBreakpointInput> {
	async resolve(state: BreakpointState): Promise<SetBreakpointInput> {
		return {
			loopId: requireLoopId(state),
			instruction: {
				type: "tool_call",
				parameters: { toolName: state.toolName, toolArguments: state.toolArguments },
			},
		}
	}
}

@InputResolver({ name: "advance-loop-input" })
class AdvanceLoopInputResolver implements InputResolverContract<BreakpointState, AdvanceLoopInput> {
	async resolve(state: BreakpointState): Promise<AdvanceLoopInput> {
		return { loopId: requireLoopId(state) }
	}
}

@InputResolver({ name: "end-loop-input" })
class EndLoopInputResolver implements InputResolverContract<BreakpointState, EndLoopInput> {
	async resolve(state: BreakpointState): Promise<EndLoopInput> {
		return {
			loopId: requireLoopId(state),
			message: `Declined ${state.toolName}: approval required.`,
		}
	}
}

const createAgentPolicy: PolicyDefinition = {
	rules: [
		{
			condition: "agent-requested",
			inputResolver: "create-agent-input",
			command: "create-agent",
		},
	],
}

const createLoopPolicy: PolicyDefinition = {
	rules: [
		{
			condition: "loop-requested",
			inputResolver: "create-loop-input",
			command: "create-loop",
		},
	],
}

const placeBreakpointPolicy: PolicyDefinition = {
	rules: [
		{
			condition: "tool-call-requested",
			inputResolver: "set-breakpoint-input",
			command: "set-breakpoint",
		},
	],
}

const breakpointPolicy: PolicyDefinition = {
	rules: [
		{
			condition: "tool-call-requested",
			inputResolver: "advance-loop-input",
			command: "advance-loop",
			priority: 10,
		},
		{
			condition: "needs-approval",
			inputResolver: "end-loop-input",
			command: "end-loop",
			priority: 1,
		},
	],
}

async function main() {
	initAgentModule()
	const { registerTool, getLoop } = resolveAgentModule()

	registerTool("shell", {
		invoke: ({ command }) => `(pretend output of: ${command})`,
	})

	const session: BreakpointState = {
		name: "assistant",
		instruction: "You are a coding assistant.",
		goal: "",
		toolName: "",
		toolArguments: "",
		approved: false,
	}

	const agent = (await applyPolicy(createAgentPolicy, session)) as Agent
	session.agentId = agent.id

	const decide = async (input: { toolName: string; command: string; approved: boolean }): Promise<void> => {
		const state: BreakpointState = {
			...session,
			goal: input.command,
			toolName: input.toolName,
			toolArguments: JSON.stringify({ command: input.command }),
			approved: input.approved,
		}

		const loop = (await applyPolicy(createLoopPolicy, state)) as LoopRecord
		state.loopId = loop.id

		await applyPolicy(placeBreakpointPolicy, state)
		await applyPolicy(breakpointPolicy, state)

		const record = await getLoop(loop.id)
		const completed = record.completedInstructions[record.completedInstructions.length - 1]
		console.log({
			approved: state.approved,
			loopState: record.state,
			message: record.message,
			toolResult: completed?.type === "tool_call" ? completed.result?.result : undefined,
		})
	}

	await decide({ toolName: "shell", command: "npm install", approved: false })
	await decide({ toolName: "shell", command: "npm test", approved: true })
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
