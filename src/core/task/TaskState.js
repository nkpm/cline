export class TaskState {
	// Streaming flags
	isStreaming = false
	isWaitingForFirstChunk = false
	didCompleteReadingStream = false
	// Content processing
	currentStreamingContentIndex = 0
	assistantMessageContent = []
	userMessageContent = []
	userMessageContentReady = false
	// Presentation locks
	presentAssistantMessageLocked = false
	presentAssistantMessageHasPendingUpdates = false
	// Ask/Response handling
	askResponse
	askResponseText
	askResponseImages
	askResponseFiles
	lastMessageTs
	// Plan mode specific state
	isAwaitingPlanResponse = false
	didRespondToPlanAskBySwitchingMode = false
	// Context and history
	conversationHistoryDeletedRange
	// Tool execution flags
	didRejectTool = false
	didAlreadyUseTool = false
	didEditFile = false
	// Consecutive request tracking
	consecutiveAutoApprovedRequestsCount = 0
	// Error tracking
	consecutiveMistakeCount = 0
	didAutomaticallyRetryFailedApiRequest = false
	checkpointTrackerErrorMessage
	// Task Initialization
	isInitialized = false
	// Focus Chain / Todo List Management
	apiRequestCount = 0
	apiRequestsSinceLastTodoUpdate = 0
	currentFocusChainChecklist = null
	todoListWasUpdatedByUser = false
	// Task Abort / Cancellation
	abort = false
	didFinishAbortingStream = false
	abandoned = false
	// Auto-context summarization
	currentlySummarizing = false
	lastAutoCompactTriggerIndex
}
//# sourceMappingURL=TaskState.js.map
