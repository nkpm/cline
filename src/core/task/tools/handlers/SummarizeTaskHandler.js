import { continuationPrompt } from "@core/prompts/contextManagement"
import { formatResponse } from "@core/prompts/responses"
import { ensureTaskDirectoryExists } from "@core/storage/disk"
import { telemetryService } from "@services/posthog/PostHogClientProvider"
export class SummarizeTaskHandler {
	name = "summarize_task"
	constructor() {}
	getDescription(block) {
		return `[${block.name}]`
	}
	async execute(config, block) {
		// For partial blocks, don't execute yet
		if (block.partial) {
			return ""
		}
		try {
			const context = block.params.context
			// Validate required parameters
			if (!context) {
				config.taskState.consecutiveMistakeCount++
				return "Missing required parameter: context"
			}
			config.taskState.consecutiveMistakeCount = 0
			// Show completed summary in tool UI
			const completeMessage = JSON.stringify({
				tool: "summarizeTask",
				content: context,
			})
			await config.callbacks.say("tool", completeMessage, undefined, undefined, false)
			// Use the continuationPrompt to format the tool result
			const toolResult = formatResponse.toolResult(continuationPrompt(context))
			// Handle context management
			const apiConversationHistory = config.messageState.getApiConversationHistory()
			const keepStrategy = "none"
			// clear the context history at this point in time. note that this will not include the assistant message
			// for summarizing, which we will need to delete later
			config.taskState.conversationHistoryDeletedRange = config.services.contextManager.getNextTruncationRange(
				apiConversationHistory,
				config.taskState.conversationHistoryDeletedRange,
				keepStrategy,
			)
			await config.messageState.saveClineMessagesAndUpdateHistory()
			await config.services.contextManager.triggerApplyStandardContextTruncationNoticeChange(
				Date.now(),
				await ensureTaskDirectoryExists(config.context, config.taskId),
				apiConversationHistory,
			)
			// Set summarizing state
			config.taskState.currentlySummarizing = true
			// Capture telemetry after main business logic is complete
			const telemetryData = config.services.contextManager.getContextTelemetryData(
				config.messageState.getClineMessages(),
				config.api,
				config.taskState.lastAutoCompactTriggerIndex,
			)
			if (telemetryData) {
				telemetryService.captureSummarizeTask(
					config.ulid,
					config.api.getModel().id,
					telemetryData.tokensUsed,
					telemetryData.maxContextWindow,
				)
			}
			return toolResult
		} catch (error) {
			return `Error summarizing context window: ${error.message}`
		}
	}
	async handlePartialBlock(block, uiHelpers) {
		const context = block.params.context || ""
		// Show streaming summary generation in tool UI
		const partialMessage = JSON.stringify({
			tool: "summarizeTask",
			content: uiHelpers.removeClosingTag(block, "context", context),
		})
		await uiHelpers.say("tool", partialMessage, undefined, undefined, block.partial)
	}
}
//# sourceMappingURL=SummarizeTaskHandler.js.map
