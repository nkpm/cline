export function isClaude4ModelFamily(id) {
	const modelId = normalize(id)
	return (
		modelId.includes("sonnet-4") || modelId.includes("opus-4") || modelId.includes("4-sonnet") || modelId.includes("4-opus")
	)
}
export function isGemini2dot5ModelFamily(id) {
	const modelId = normalize(id)
	return modelId.includes("gemini-2.5")
}
export function isGrok4ModelFamily(id) {
	const modelId = normalize(id)
	return modelId.includes("grok-4")
}
export function isGPT5ModelFamily(id) {
	const modelId = normalize(id)
	return modelId.includes("gpt-5") || modelId.includes("gpt5")
}
export function isNextGenModelFamily(id) {
	const modelId = normalize(id)
	return (
		isClaude4ModelFamily(modelId) ||
		isGemini2dot5ModelFamily(modelId) ||
		isGrok4ModelFamily(modelId) ||
		isGPT5ModelFamily(modelId)
	)
}
export function isLocalModel(providerInfo) {
	const localProviders = ["lmstudio", "ollama"]
	return localProviders.includes(normalize(providerInfo.providerId))
}
function normalize(text) {
	return text.trim().toLowerCase()
}
//# sourceMappingURL=utils.js.map
