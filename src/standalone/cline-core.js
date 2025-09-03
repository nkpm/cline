import { ExternalDiffViewProvider } from "@hosts/external/ExternalDiffviewProvider"
import { ExternalWebviewProvider } from "@hosts/external/ExternalWebviewProvider"
import { ExternalHostBridgeClientManager } from "@hosts/external/host-bridge-client-manager"
import { WebviewProviderType } from "@shared/webview/types"
import { initialize, tearDown } from "@/common"
import { AuthHandler } from "@/hosts/external/AuthHandler"
import { HostProvider } from "@/hosts/host-provider"
import { startProtobusService, waitForHostBridgeReady } from "./protobus-service"
import { log } from "./utils"
import { extensionContext } from "./vscode-context"

async function main() {
	log("\n\n\nStarting cline-core service...\n\n\n")
	try {
		await waitForHostBridgeReady()
		log("HostBridge is serving; continuing startup")
	} catch (err) {
		log(`ERROR: HostBridge error: ${String(err)}`)
		process.exit(1)
	}
	setupHostProvider()
	// Set up global error handlers to prevent process crashes
	setupGlobalErrorHandlers()
	const webviewProvider = await initialize(extensionContext)
	AuthHandler.getInstance().setEnabled(true)
	startProtobusService(webviewProvider.controller)
}
function setupHostProvider() {
	const createWebview = (_) => {
		return new ExternalWebviewProvider(extensionContext, WebviewProviderType.SIDEBAR)
	}
	const createDiffView = () => {
		return new ExternalDiffViewProvider()
	}
	const getCallbackUri = () => {
		return AuthHandler.getInstance().getCallbackUri()
	}
	HostProvider.initialize(createWebview, createDiffView, new ExternalHostBridgeClientManager(), log, getCallbackUri)
}
/**
 * Sets up global error handlers to prevent the process from crashing
 * on unhandled exceptions and promise rejections
 */
function setupGlobalErrorHandlers() {
	// Handle unhandled exceptions
	process.on("uncaughtException", (error) => {
		log(`ERROR: Uncaught exception: ${error.message}`)
		log(`Stack trace: ${error.stack}`)
		// Log the error but don't exit the process
	})
	// Handle unhandled promise rejections
	process.on("unhandledRejection", (reason, _promise) => {
		log(`ERROR: Unhandled promise rejection: ${reason}`)
		if (reason instanceof Error) {
			log(`Stack trace: ${reason.stack}`)
		}
		// Log the error but don't exit the process
	})
	// Handle process warnings (optional, for debugging)
	process.on("warning", (warning) => {
		log(`Process Warning: ${warning.name}: ${warning.message}`)
	})
	// Graceful shutdown handlers
	process.on("SIGINT", () => {
		log("Received SIGINT, shutting down gracefully...")
		process.exit(0)
	})
	process.on("SIGTERM", () => {
		log("Received SIGTERM, shutting down gracefully...")
		tearDown()
		process.exit(0)
	})
}
main()
//# sourceMappingURL=cline-core.js.map
