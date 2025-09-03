import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"

// HACK: Placeholder to act as tool dependency
const generic = {
	variant: ModelFamily.GENERIC,
	id: ClineDefaultTool.TODO,
	name: "focus_chain",
	description: "",
	contextRequirements: (context) => context.focusChainSettings?.enabled === true,
}
const nextGen = { ...generic, variant: ModelFamily.NEXT_GEN }
const gpt = { ...generic, variant: ModelFamily.GPT }
const gemini = { ...generic, variant: ModelFamily.GEMINI }
export const focus_chain_variants = [generic, nextGen, gpt, gemini]
//# sourceMappingURL=focus_chain.js.map
