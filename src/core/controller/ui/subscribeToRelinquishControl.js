import { Empty } from "@shared/proto/cline/common"
import { getRequestRegistry } from "../grpc-handler"

// Keep track of active subscriptions
const activeRelinquishControlSubscriptions = new Set()
/**
 * Subscribe to relinquish control events
 * @param controller The controller instance
 * @param request The empty request
 * @param responseStream The streaming response handler
 * @param requestId The ID of the request (passed by the gRPC handler)
 */
export async function subscribeToRelinquishControl(_controller, _request, responseStream, requestId) {
	// Add this subscription to the active subscriptions
	activeRelinquishControlSubscriptions.add(responseStream)
	// Register cleanup when the connection is closed
	const cleanup = () => {
		activeRelinquishControlSubscriptions.delete(responseStream)
	}
	// Register the cleanup function with the request registry if we have a requestId
	if (requestId) {
		getRequestRegistry().registerRequest(requestId, cleanup, { type: "relinquish_control_subscription" }, responseStream)
	}
}
/**
 * Send a relinquish control event to all active subscribers
 */
export async function sendRelinquishControlEvent() {
	// Send the event to all active subscribers
	const promises = Array.from(activeRelinquishControlSubscriptions).map(async (responseStream) => {
		try {
			const event = Empty.create({})
			await responseStream(event, false)
		} catch (error) {
			console.error("Error sending relinquish control event:", error)
			// Remove the subscription if there was an error
			activeRelinquishControlSubscriptions.delete(responseStream)
		}
	})
	await Promise.all(promises)
}
//# sourceMappingURL=subscribeToRelinquishControl.js.map
