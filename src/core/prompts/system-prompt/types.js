/**
 * Enhanced type definitions for better type safety and developer experience
 */
import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { SystemPromptSection } from "./templates/placeholders"
// Type guards
export function isValidModelFamily(family) {
	return Object.values(ModelFamily).includes(family)
}
export function isValidSystemPromptSection(section) {
	return Object.values(SystemPromptSection).includes(section)
}
export function isValidClineDefaultTool(tool) {
	return Object.values(ClineDefaultTool).includes(tool)
}
//# sourceMappingURL=types.js.map
