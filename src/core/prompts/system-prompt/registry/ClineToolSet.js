import { ModelFamily } from "@/shared/prompts"
export class ClineToolSet {
	id
	config
	// A list of tools mapped by model group
	static variants = new Map()
	constructor(id, config) {
		this.id = id
		this.config = config
		this._register()
	}
	static register(config) {
		return new ClineToolSet(config.id, config)
	}
	_register() {
		const existingTools = ClineToolSet.variants.get(this.config.variant) || new Set()
		if (!Array.from(existingTools).some((t) => t.config.id === this.config.id)) {
			existingTools.add(this)
			ClineToolSet.variants.set(this.config.variant, existingTools)
		}
	}
	static getTools(variant) {
		const toolsSet = ClineToolSet.variants.get(variant) || new Set()
		const defaultSet = ClineToolSet.variants.get(ModelFamily.GENERIC) || new Set()
		return toolsSet ? Array.from(toolsSet) : Array.from(defaultSet)
	}
	static getRegisteredModelIds() {
		return Array.from(ClineToolSet.variants.keys())
	}
	static getToolByName(toolName, variant) {
		const tools = ClineToolSet.getTools(variant)
		return tools.find((tool) => tool.config.id === toolName)
	}
	// Return a tool by name with fallback to GENERIC and then any other variant where it exists
	static getToolByNameWithFallback(toolName, variant) {
		// Try exact variant first
		const exact = ClineToolSet.getToolByName(toolName, variant)
		if (exact) {
			return exact
		}
		// Fallback to GENERIC
		const generic = ClineToolSet.getToolByName(toolName, ModelFamily.GENERIC)
		if (generic) {
			return generic
		}
		// Final fallback: search across all registered variants
		for (const [, tools] of ClineToolSet.variants) {
			const found = Array.from(tools).find((t) => t.config.id === toolName)
			if (found) {
				return found
			}
		}
		return undefined
	}
	// Build a list of tools for a variant using requested ids, falling back to GENERIC when missing
	static getToolsForVariantWithFallback(variant, requestedIds) {
		const resolved = []
		for (const id of requestedIds) {
			const tool = ClineToolSet.getToolByNameWithFallback(id, variant)
			if (tool) {
				// Avoid duplicates by id
				if (!resolved.some((t) => t.config.id === tool.config.id)) {
					resolved.push(tool)
				}
			}
		}
		return resolved
	}
}
//# sourceMappingURL=ClineToolSet.js.map
