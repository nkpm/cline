import { HostProvider } from "@/hosts/host-provider"
import { openExternal } from "@/utils/env"
/**
 * Initiates OpenRouter auth
 */
export async function openrouterAuthClicked(_, __) {
	const callbackUri = await HostProvider.get().getCallbackUri()
	const authUri = `https://openrouter.ai/auth?callback_url=${callbackUri}/openrouter`
	await openExternal(authUri)
	return {}
}
//# sourceMappingURL=openrouterAuthClicked.js.map
