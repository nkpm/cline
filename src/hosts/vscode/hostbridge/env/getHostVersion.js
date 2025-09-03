import * as vscode from "vscode"
export async function getHostVersion(_) {
	return { platform: "VSCode", version: vscode.version }
}
//# sourceMappingURL=getHostVersion.js.map
