import { telemetryService } from "@services/posthog/PostHogClientProvider"
import { Empty } from "@shared/proto/cline/common"
import * as vscode from "vscode"
/**
 * Opens the Cline walkthrough in VSCode
 * @param controller The controller instance
 * @param request Empty request
 * @returns Empty response
 */
export async function openWalkthrough(_controller, _request) {
	try {
		await vscode.commands.executeCommand("workbench.action.openWalkthrough", "saoudrizwan.claude-dev#ClineWalkthrough")
		telemetryService.captureButtonClick("webview_openWalkthrough")
		return Empty.create({})
	} catch (error) {
		console.error(`Failed to open walkthrough: ${error}`)
		throw error
	}
}
//# sourceMappingURL=openWalkthrough.js.map
