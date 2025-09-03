import { URI } from "vscode-uri"
import { WebviewProvider } from "@/core/webview"
export class ExternalWebviewProvider extends WebviewProvider {
	// This hostname cannot be changed without updating the external webview handler.
	RESOURCE_HOSTNAME = "internal.resources"
	constructor(context, providerType) {
		super(context, providerType)
	}
	getWebviewUri(uri) {
		if (uri.scheme !== "file") {
			return uri
		}
		return URI.from({ scheme: "https", authority: this.RESOURCE_HOSTNAME, path: uri.fsPath })
	}
	getCspSource() {
		return `'self' https://${this.RESOURCE_HOSTNAME}`
	}
	isVisible() {
		return true
	}
	isActive() {
		return true
	}
}
//# sourceMappingURL=ExternalWebviewProvider.js.map
