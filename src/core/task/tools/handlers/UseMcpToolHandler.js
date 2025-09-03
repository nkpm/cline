import { formatResponse } from "@core/prompts/responses"
import { telemetryService } from "@services/posthog/PostHogClientProvider"
import { showNotificationForApprovalIfAutoApprovalEnabled } from "../../utils"
export class UseMcpToolHandler {
	name = "use_mcp_tool"
	constructor() {}
	getDescription(block) {
		return `[${block.name} for '${block.params.server_name}']`
	}
	async handlePartialBlock(block, uiHelpers) {
		const server_name = block.params.server_name
		const tool_name = block.params.tool_name
		const mcp_arguments = block.params.arguments
		const partialMessage = JSON.stringify({
			type: "use_mcp_tool",
			serverName: uiHelpers.removeClosingTag(block, "server_name", server_name),
			toolName: uiHelpers.removeClosingTag(block, "tool_name", tool_name),
			arguments: uiHelpers.removeClosingTag(block, "arguments", mcp_arguments),
		})
		// Check if tool should be auto-approved using MCP-specific logic
		const config = uiHelpers.getConfig()
		const shouldAutoApprove = this.shouldAutoApproveMcpTool(config, server_name || "", tool_name || "")
		if (shouldAutoApprove) {
			await uiHelpers.removeLastPartialMessageIfExistsWithType("ask", "use_mcp_server")
			await uiHelpers.say("use_mcp_server", partialMessage, undefined, undefined, block.partial)
		} else {
			await uiHelpers.removeLastPartialMessageIfExistsWithType("say", "use_mcp_server")
			await uiHelpers.ask("use_mcp_server", partialMessage, block.partial).catch(() => {})
		}
	}
	async execute(config, block) {
		// For partial blocks, return empty string to let coordinator handle UI
		if (block.partial) {
			return ""
		}
		const server_name = block.params.server_name
		const tool_name = block.params.tool_name
		const mcp_arguments = block.params.arguments
		// Validate required parameters
		if (!server_name) {
			config.taskState.consecutiveMistakeCount++
			return "Missing required parameter: server_name"
		}
		if (!tool_name) {
			config.taskState.consecutiveMistakeCount++
			return "Missing required parameter: tool_name"
		}
		// Parse and validate arguments if provided
		let parsedArguments
		if (mcp_arguments) {
			try {
				parsedArguments = JSON.parse(mcp_arguments)
			} catch (_error) {
				config.taskState.consecutiveMistakeCount++
				return `Error: Invalid JSON arguments for ${tool_name} on ${server_name}`
			}
		}
		config.taskState.consecutiveMistakeCount = 0
		// Handle approval flow
		const completeMessage = JSON.stringify({
			type: "use_mcp_tool",
			serverName: server_name,
			toolName: tool_name,
			uri: undefined,
			arguments: mcp_arguments,
		})
		const shouldAutoApprove = this.shouldAutoApproveMcpTool(config, server_name, tool_name)
		if (shouldAutoApprove) {
			// Auto-approval flow
			await config.callbacks.removeLastPartialMessageIfExistsWithType("ask", "use_mcp_server")
			await config.callbacks.say("use_mcp_server", completeMessage, undefined, undefined, false)
			config.taskState.consecutiveAutoApprovedRequestsCount++
			// Capture telemetry
			telemetryService.captureToolUsage(config.ulid, block.name, config.api.getModel().id, true, true)
		} else {
			// Manual approval flow
			const notificationMessage = `Cline wants to use ${tool_name || "unknown tool"} on ${server_name || "unknown server"}`
			// Show notification
			showNotificationForApprovalIfAutoApprovalEnabled(
				notificationMessage,
				config.autoApprovalSettings.enabled,
				config.autoApprovalSettings.enableNotifications,
			)
			await config.callbacks.removeLastPartialMessageIfExistsWithType("say", "use_mcp_server")
			// Ask for approval
			const { response } = await config.callbacks.ask("use_mcp_server", completeMessage, false)
			if (response !== "yesButtonClicked") {
				// Handle rejection
				config.taskState.didRejectTool = true
				telemetryService.captureToolUsage(config.ulid, block.name, config.api.getModel().id, false, false)
				return "The user denied this operation."
			} else {
				telemetryService.captureToolUsage(config.ulid, block.name, config.api.getModel().id, false, true)
			}
		}
		// Show MCP request started message
		await config.callbacks.say("mcp_server_request_started")
		try {
			// Check for any pending notifications before the tool call
			const notificationsBefore = config.services.mcpHub.getPendingNotifications()
			for (const notification of notificationsBefore) {
				await config.callbacks.say("mcp_notification", `[${notification.serverName}] ${notification.message}`)
			}
			// Execute the MCP tool
			const toolResult = await config.services.mcpHub.callTool(server_name, tool_name, parsedArguments, config.ulid)
			// Check for any pending notifications after the tool call
			const notificationsAfter = config.services.mcpHub.getPendingNotifications()
			for (const notification of notificationsAfter) {
				await config.callbacks.say("mcp_notification", `[${notification.serverName}] ${notification.message}`)
			}
			// Process tool result
			const toolResultImages =
				toolResult?.content
					.filter((item) => item.type === "image")
					.map((item) => `data:${item.mimeType};base64,${item.data}`) || []
			let toolResultText =
				(toolResult?.isError ? "Error:\n" : "") +
					toolResult?.content
						.map((item) => {
							if (item.type === "text") {
								return item.text
							}
							if (item.type === "resource") {
								const { blob: _blob, ...rest } = item.resource
								return JSON.stringify(rest, null, 2)
							}
							return ""
						})
						.filter(Boolean)
						.join("\n\n") || "(No response)"
			// Display result to user
			const toolResultToDisplay = toolResultText + toolResultImages?.map((image) => `\n\n${image}`).join("")
			await config.callbacks.say("mcp_server_response", toolResultToDisplay)
			// Handle model image support
			const supportsImages = config.api.getModel().info.supportsImages ?? false
			if (toolResultImages.length > 0 && !supportsImages) {
				toolResultText += `\n\n[${toolResultImages.length} images were provided in the response, and while they are displayed to the user, you do not have the ability to view them.]`
			}
			// Return formatted result (only pass images if model supports them)
			return formatResponse.toolResult(toolResultText, supportsImages ? toolResultImages : undefined)
		} catch (error) {
			return `Error executing MCP tool: ${error?.message}`
		}
	}
	/**
	 * Determine if MCP tool should be auto-approved (moved from ToolApprovalManager)
	 */
	shouldAutoApproveMcpTool(config, server_name, tool_name) {
		// Check if this specific tool is auto-approved on the server
		const isToolAutoApproved = config.services.mcpHub.connections
			?.find((conn) => conn.server.name === server_name)
			?.server.tools?.find((tool) => tool.name === tool_name)?.autoApprove
		return config.autoApprovalSettings.enabled && (isToolAutoApproved ?? false)
	}
}
//# sourceMappingURL=UseMcpToolHandler.js.map
