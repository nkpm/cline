import { String } from "@shared/proto/cline/common"
import { WebviewProvider } from "@/core/webview"
/**
 * Returns the HTML content of the webview.
 *
 * This is only used by the standalone service. The Vscode extension gets the HTML directly from the webview when it
 * resolved through `resolveWebviewView()`.
 */
export async function getWebviewHtml(_controller, _) {
	const webviewProvider = WebviewProvider.getLastActiveInstance()
	if (!webviewProvider) {
		throw new Error("No active webview")
	}
	return Promise.resolve(String.create({ value: webviewProvider.getHtmlContent() }))
}
//# sourceMappingURL=getWebviewHtml.js.map
