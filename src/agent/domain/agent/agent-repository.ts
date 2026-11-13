import { Agent } from "@agent/domain/agent/agent"

export interface AgentRepository {
	save(agent: Agent): Promise<void>
	exists(id: string): Promise<boolean>
	findById(id: string): Promise<Agent | undefined>
	findAll(): Promise<Agent[]>
}
