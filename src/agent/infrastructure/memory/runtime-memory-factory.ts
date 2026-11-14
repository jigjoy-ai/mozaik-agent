import { Memory, MemoryFactory } from "@agent/domain/agent/memory"
import { RuntimeMemory } from "@agent/infrastructure/memory/runtime-memory"
import { Context } from "@agent/domain/inference/context"

export class RuntimeMemoryFactory implements MemoryFactory {
	create(): Memory {
		const context: Context = {
			items: [],
		}
		return new RuntimeMemory(context)
	}
}
