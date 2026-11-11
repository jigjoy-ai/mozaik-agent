import { ToolCallInstruction } from "@agent/domain/loop/tool-call-instruction"
import { ToolCallResult } from "@agent/domain/loop/tool-call-result"
import { ToolRegistry } from "@agent/domain/loop/tool-registry"
import { Tool } from "@agent/domain/inference/tool"
import { ToolCallProcessor } from "@agent/domain/loop/instruction"

export class ToolCallProcessorImpl implements ToolCallProcessor {
	constructor(private readonly toolRegistry: ToolRegistry) {}

	async run(input: ToolCallInstruction): Promise<ToolCallResult> {
		const tool = this.toolRegistry.getTool(input.toolName)
		if (!tool) {
			throw new Error(`Tool not found: ${input.toolName}`)
		}
		const output = await this.call(input, tool)

		return output
	}

	private async call(input: ToolCallInstruction, tool: Tool): Promise<ToolCallResult> {
		try {
			const result = await tool.invoke(JSON.parse(input.toolArguments))
			const resultText = typeof result === "string" ? result : JSON.stringify(result)
			return {
				type: "tool_call_output",
				result: resultText,
			}
		} catch (error) {
			return {
				type: "tool_call_output",
				result: `Error calling tool: ${error}`,
			}
		}
	}
}
