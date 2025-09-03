import { String } from "@shared/proto/cline/common"
import * as vscode from "vscode"
export async function getMachineId(_) {
	const id = vscode.env.machineId || ""
	return String.create({ value: id })
}
//# sourceMappingURL=getMachineId.js.map
