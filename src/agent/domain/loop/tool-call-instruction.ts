export type ToolCallInstruction = {
	readonly type: "tool-call"
	toolName: string
	toolArguments: string
}
