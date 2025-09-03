import * as vscode from "vscode"
export async function openClineSidebarPanel(_) {
	await vscode.commands.executeCommand("claude-dev.SidebarProvider.focus")
	return {}
}
//# sourceMappingURL=openClineSidebarPanel.js.map
