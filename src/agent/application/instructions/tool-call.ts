import { ToolCallParams } from "@agent/domain/instruction/tool-call"
import { ToolCallInstruction, ToolCallResult } from "@agent/domain/instruction/tool-call"
import { ToolRegistry } from "@agent/domain/tool-registry"
import { Tool } from "@agent/domain/inference/tool"

export class ToolCall implements ToolCallInstruction {
	constructor(private readonly toolRegistry: ToolRegistry) {}

	async run(input: ToolCallParams): Promise<ToolCallResult> {
		const tool = this.toolRegistry.getTool(input.toolName)
		if (!tool) {
			throw new Error(`Tool not found: ${input.toolName}`)
		}
		const output = await this.call(input, tool)

		return output
	}

	private async call(input: ToolCallParams, tool: Tool): Promise<ToolCallResult> {
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
