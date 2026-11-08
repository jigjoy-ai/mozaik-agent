import { Agent } from "@agent/domain/agent"
import { AgentRepository } from "@agent/domain/agent-repository"

export class InMemoryAgentRepository implements AgentRepository {
	private readonly agents: Agent[] = []

	exists(id: string): Promise<boolean> {
		return Promise.resolve(this.agents.some((agent) => agent.id === id))
	}
	findById(id: string): Promise<Agent | undefined> {
		return Promise.resolve(this.agents.find((agent) => agent.id === id))
	}
	findAll(): Promise<Agent[]> {
		return Promise.resolve(this.agents)
	}

	async save(agent: Agent): Promise<void> {
		this.agents.push(agent)
	}
}
