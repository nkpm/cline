import { formatResponse } from "@core/prompts/responses"
import { processFilesIntoText } from "@integrations/misc/extract-text"
import { showSystemNotification } from "@integrations/notifications"
export class NewTaskHandler {
	name = "new_task"
	constructor() {}
	getDescription(block) {
		return `[${block.name} for creating a new task]`
	}
	/**
	 * Handle partial block streaming for new_task
	 */
	async handlePartialBlock(block, uiHelpers) {
		const context = uiHelpers.removeClosingTag(block, "context", block.params.context)
		await uiHelpers.ask("new_task", context, true).catch(() => {})
	}
	async execute(config, block) {
		// For partial blocks, don't execute yet
		if (block.partial) {
			return ""
		}
		const context = block.params.context
		// Validate required parameters
		if (!context) {
			config.taskState.consecutiveMistakeCount++
			return "Missing required parameter: context"
		}
		config.taskState.consecutiveMistakeCount = 0
		// Show notification if auto-approval is enabled
		if (config.autoApprovalSettings.enabled && config.autoApprovalSettings.enableNotifications) {
			showSystemNotification({
				subtitle: "Cline wants to start a new task...",
				message: `Cline is suggesting to start a new task with: ${context}`,
			})
		}
		// Ask user for response
		const { text, images, files: newTaskFiles } = await config.callbacks.ask("new_task", context, false)
		// If the user provided a response, treat it as feedback
		if (text || (images && images.length > 0) || (newTaskFiles && newTaskFiles.length > 0)) {
			let fileContentString = ""
			if (newTaskFiles && newTaskFiles.length > 0) {
				fileContentString = await processFilesIntoText(newTaskFiles)
			}
			await config.callbacks.say("user_feedback", text ?? "", images, newTaskFiles)
			return formatResponse.toolResult(
				`The user provided feedback instead of creating a new task:\n<feedback>\n${text}\n</feedback>`,
				images,
				fileContentString,
			)
		} else {
			// If no response, the user clicked the "Create New Task" button
			return formatResponse.toolResult(`The user has created a new task with the provided context.`)
		}
	}
}
//# sourceMappingURL=NewTaskHandler.js.map
