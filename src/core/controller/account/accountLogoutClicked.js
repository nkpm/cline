import { Empty } from "@shared/proto/cline/common"
import { AuthService } from "@/services/auth/AuthService"
/**
 * Handles the account logout action
 * @param controller The controller instance
 * @param _request The empty request object
 * @returns Empty response
 */
export async function accountLogoutClicked(controller, _request) {
	await controller.handleSignOut()
	await AuthService.getInstance().handleDeauth()
	return Empty.create({})
}
//# sourceMappingURL=accountLogoutClicked.js.map
