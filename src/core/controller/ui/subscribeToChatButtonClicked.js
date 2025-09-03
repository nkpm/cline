import { Empty } from "@shared/proto/cline/common"
import { getRequestRegistry } from "../grpc-handler"

// Keep track of active chatButtonClicked subscriptions by controller ID
const activeChatButtonClickedSubscriptions = new Map()
/**
 * Subscribe to chatButtonClicked events
 * @param controller The controller instance
 * @param request The empty request
 * @param responseStream The streaming response handler
 * @param requestId The ID of the request (passed by the gRPC handler)
 */
export async function subscribeToChatButtonClicked(controller, _request, responseStream, requestId) {
	const controllerId = controller.id
	console.log(`[DEBUG] set up chatButtonClicked subscription for controller ${controllerId}`)
	// Add this subscription to the active subscriptions with the controller ID
	activeChatButtonClickedSubscriptions.set(controllerId, responseStream)
	// Register cleanup when the connection is closed
	const cleanup = () => {
		activeChatButtonClickedSubscriptions.delete(controllerId)
	}
	// Register the cleanup function with the request registry if we have a requestId
	if (requestId) {
		getRequestRegistry().registerRequest(requestId, cleanup, { type: "chatButtonClicked_subscription" }, responseStream)
	}
}
/**
 * Send a chatButtonClicked event to a specific controller's subscription
 * @param controllerId The ID of the controller to send the event to
 */
export async function sendChatButtonClickedEvent(controllerId) {
	// Get the subscription for this specific controller
	const responseStream = activeChatButtonClickedSubscriptions.get(controllerId)
	if (!responseStream) {
		console.log(`[DEBUG] No active subscription for controller ${controllerId}`)
		return
	}
	try {
		const event = Empty.create({})
		await responseStream(event, false)
	} catch (error) {
		console.error(`Error sending chatButtonClicked event to controller ${controllerId}:`, error)
		// Remove the subscription if there was an error
		activeChatButtonClickedSubscriptions.delete(controllerId)
	}
}
//# sourceMappingURL=subscribeToChatButtonClicked.js.map
