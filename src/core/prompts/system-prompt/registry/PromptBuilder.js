import { getModelFamily } from "../"
import { ClineToolSet } from "../registry/ClineToolSet"
import { STANDARD_PLACEHOLDERS } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"

// Pre-defined mapping of standard placeholders to avoid runtime object creation
const STANDARD_PLACEHOLDER_KEYS = Object.values(STANDARD_PLACEHOLDERS)
export class PromptBuilder {
	variant
	context
	components
	templateEngine
	constructor(variant, context, components) {
		this.variant = variant
		this.context = context
		this.components = components
		this.templateEngine = new TemplateEngine()
	}
	async build() {
		const componentSections = await this.buildComponents()
		const placeholderValues = this.preparePlaceholders(componentSections)
		const prompt = this.templateEngine.resolve(this.variant.baseTemplate, placeholderValues)
		return this.postProcess(prompt)
	}
	async buildComponents() {
		const sections = {}
		const { componentOrder } = this.variant
		// Process components sequentially to maintain order
		for (const componentId of componentOrder) {
			const componentFn = this.components[componentId]
			if (!componentFn) {
				console.warn(`Warning: Component '${componentId}' not found`)
				continue
			}
			try {
				const result = await componentFn(this.variant, this.context)
				if (result?.trim()) {
					sections[componentId] = result
				}
			} catch (error) {
				console.warn(`Warning: Failed to build component '${componentId}':`, error)
			}
		}
		return sections
	}
	preparePlaceholders(componentSections) {
		// Create base placeholders object with optimal capacity
		const placeholders = {}
		// Add variant placeholders
		Object.assign(placeholders, this.variant.placeholders)
		// Add standard system placeholders
		placeholders[STANDARD_PLACEHOLDERS.CWD] = this.context.cwd || process.cwd()
		placeholders[STANDARD_PLACEHOLDERS.SUPPORTS_BROWSER] = this.context.supportsBrowserUse || false
		placeholders[STANDARD_PLACEHOLDERS.MODEL_FAMILY] = getModelFamily(this.context.providerInfo)
		placeholders[STANDARD_PLACEHOLDERS.CURRENT_DATE] = new Date().toISOString().split("T")[0]
		// Add all component sections
		Object.assign(placeholders, componentSections)
		// Map component sections to standard placeholders in a single loop
		for (const key of STANDARD_PLACEHOLDER_KEYS) {
			if (!placeholders[key]) {
				placeholders[key] = componentSections[key] || ""
			}
		}
		// Add runtime placeholders with highest priority
		const runtimePlaceholders = this.context.runtimePlaceholders
		if (runtimePlaceholders) {
			Object.assign(placeholders, runtimePlaceholders)
		}
		return placeholders
	}
	postProcess(prompt) {
		if (!prompt) {
			return ""
		}
		// Combine multiple regex operations for better performance
		return prompt
			.replace(/\n\s*\n\s*\n/g, "\n\n") // Remove multiple consecutive empty lines
			.trim() // Remove leading/trailing whitespace
			.replace(/====+\s*$/, "") // Remove trailing ==== after trim
			.replace(/\n====+\s*\n+\s*====+\n/g, "\n====\n") // Remove empty sections between separators
			.replace(/====\n([^\n])/g, "====\n\n$1") // Ensure proper section separation
			.replace(/([^\n])\n====/g, "$1\n\n====")
	}
	getBuildMetadata() {
		return {
			variantId: this.variant.id,
			version: this.variant.version,
			componentsUsed: [...this.variant.componentOrder],
			placeholdersResolved: this.templateEngine.extractPlaceholders(this.variant.baseTemplate),
		}
	}
	static async getToolsPrompts(variant, context) {
		let resolvedTools = []
		// If the variant explicitly lists tools, resolve each by id with fallback to GENERIC
		if (variant?.tools?.length) {
			const requestedIds = [...variant.tools]
			resolvedTools = ClineToolSet.getToolsForVariantWithFallback(variant.family, requestedIds)
			// Preserve requested order
			resolvedTools = requestedIds.map((id) => resolvedTools.find((t) => t.config.id === id)).filter((t) => Boolean(t))
		} else {
			// Otherwise, use all tools registered for the variant, or generic if none
			resolvedTools = ClineToolSet.getTools(variant.family)
			// Sort by id for stable ordering
			resolvedTools = resolvedTools.sort((a, b) => a.config.id.localeCompare(b.config.id))
		}
		// Filter by context requirements
		const enabledTools = resolvedTools.filter(
			(tool) => !tool.config.contextRequirements || tool.config.contextRequirements(context),
		)
		const ids = enabledTools.map((tool) => tool.config.id)
		return Promise.all(enabledTools.map((tool) => PromptBuilder.tool(tool.config, ids)))
	}
	static tool(config, registry) {
		// Skip tools without parameters or description - those are placeholder tools
		if (!config.parameters?.length && !config.description?.length) {
			return ""
		}
		const title = `## ${config.id}`
		const description = [`Description: ${config.description}`]
		if (!config.parameters?.length) {
			return [title, description.join("\n")].join("\n")
		}
		// Clone parameters to avoid mutating original
		const params = [...config.parameters]
		// Filter parameters based on dependencies FIRST, before collecting descriptions
		const filteredParams = params.filter((p) => {
			if (!p.dependencies?.length) {
				return true
			}
			return p.dependencies.every((d) => registry.includes(d))
		})
		// Collect additional descriptions only from filtered parameters
		const additionalDesc = filteredParams.map((p) => p.description).filter((desc) => Boolean(desc))
		if (additionalDesc.length) {
			description.push(...additionalDesc)
		}
		// Build prompt sections efficiently
		const sections = [
			title,
			description.join("\n"),
			PromptBuilder.buildParametersSection(filteredParams),
			PromptBuilder.buildUsageSection(config.id, filteredParams),
		]
		return sections.filter(Boolean).join("\n")
	}
	static buildParametersSection(params) {
		if (!params.length) {
			return ""
		}
		const paramList = params.map((p) => {
			const requiredText = p.required ? "required" : "optional"
			return `- ${p.name}: (${requiredText}) ${p.instruction}`
		})
		return ["Parameters:", ...paramList].join("\n")
	}
	static buildUsageSection(toolId, params) {
		const usageSection = ["Usage:"]
		const usageTag = `<${toolId}>`
		const usageEndTag = `</${toolId}>`
		usageSection.push(usageTag)
		// Add parameter usage tags
		for (const param of params) {
			const usage = param.usage || ""
			usageSection.push(`<${param.name}>${usage}</${param.name}>`)
		}
		usageSection.push(usageEndTag)
		return usageSection.join("\n")
	}
}
//# sourceMappingURL=PromptBuilder.js.map
