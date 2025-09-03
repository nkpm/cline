import { loadMcpDocumentation } from "@core/prompts/loadMcpDocumentation"
export class LoadMcpDocumentationHandler {
	name = "load_mcp_documentation"
	constructor() {}
	getDescription(block) {
		return `[${block.name}]`
	}
	async handlePartialBlock(_block, uiHelpers) {
		// Show loading message for partial blocks (though this tool probably won't have partials)
		await uiHelpers.say("load_mcp_documentation", "", undefined, undefined, true)
	}
	async execute(config, block) {
		// For partial blocks, don't execute yet (though this tool shouldn't have partial blocks)
		if (block.partial) {
			return ""
		}
		// Show loading message at start of execution (self-managed now)
		await config.callbacks.say("load_mcp_documentation", "", undefined, undefined, false)
		config.taskState.consecutiveMistakeCount = 0
		try {
			// Load MCP documentation
			const documentation = await loadMcpDocumentation(config.services.mcpHub)
			return documentation
		} catch (error) {
			return `Error loading MCP documentation: ${error?.message}`
		}
	}
}
//# sourceMappingURL=LoadMcpDocumentationHandler.js.map
