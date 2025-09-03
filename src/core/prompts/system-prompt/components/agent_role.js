import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"

const AGENT_ROLE = [
	"You are Cline,",
	"a highly skilled software engineer",
	"with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.",
]
export async function getAgentRoleSection(variant, _context) {
	const template = variant.componentOverrides?.[SystemPromptSection.AGENT_ROLE]?.template || AGENT_ROLE.join(" ")
	return new TemplateEngine().resolve(template, {})
}
//# sourceMappingURL=agent_role.js.map
