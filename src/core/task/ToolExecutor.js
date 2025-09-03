import { formatResponse } from "../prompts/responses"
import { AutoApprove } from "./tools/autoApprove"
import { AccessMcpResourceHandler } from "./tools/handlers/AccessMcpResourceHandler"
import { AskFollowupQuestionToolHandler } from "./tools/handlers/AskFollowupQuestionToolHandler"
import { AttemptCompletionHandler } from "./tools/handlers/AttemptCompletionHandler"
import { BrowserToolHandler } from "./tools/handlers/BrowserToolHandler"
import { CondenseHandler } from "./tools/handlers/CondenseHandler"
import { ExecuteCommandToolHandler } from "./tools/handlers/ExecuteCommandToolHandler"
import { ListCodeDefinitionNamesToolHandler } from "./tools/handlers/ListCodeDefinitionNamesToolHandler"
import { ListFilesToolHandler } from "./tools/handlers/ListFilesToolHandler"
import { LoadMcpDocumentationHandler } from "./tools/handlers/LoadMcpDocumentationHandler"
import { NewTaskHandler } from "./tools/handlers/NewTaskHandler"
import { PlanModeRespondHandler } from "./tools/handlers/PlanModeRespondHandler"
import { ReadFileToolHandler } from "./tools/handlers/ReadFileToolHandler"
import { ReportBugHandler } from "./tools/handlers/ReportBugHandler"
import { SearchFilesToolHandler } from "./tools/handlers/SearchFilesToolHandler"
import { SummarizeTaskHandler } from "./tools/handlers/SummarizeTaskHandler"
import { UseMcpToolHandler } from "./tools/handlers/UseMcpToolHandler"
import { WebFetchToolHandler } from "./tools/handlers/WebFetchToolHandler"
import { WriteToFileToolHandler } from "./tools/handlers/WriteToFileToolHandler"
import { SharedToolHandler, ToolExecutorCoordinator } from "./tools/ToolExecutorCoordinator"
import { ToolValidator } from "./tools/ToolValidator"
import { validateTaskConfig } from "./tools/types/TaskConfig"
import { createUIHelpers } from "./tools/types/UIHelpers"
import { ToolDisplayUtils } from "./tools/utils/ToolDisplayUtils"
import { ToolResultUtils } from "./tools/utils/ToolResultUtils"
export class ToolExecutor {
	context
	taskState
	messageStateHandler
	api
	urlContentFetcher
	browserSession
	diffViewProvider
	mcpHub
	fileContextTracker
	clineIgnoreController
	contextManager
	stateManager
	autoApprovalSettings
	browserSettings
	focusChainSettings
	cwd
	taskId
	ulid
	mode
	strictPlanModeEnabled
	say
	ask
	saveCheckpoint
	sayAndCreateMissingParamError
	removeLastPartialMessageIfExistsWithType
	executeCommandTool
	doesLatestTaskCompletionHaveNewChanges
	updateFCListFromToolResponse
	autoApprover
	coordinator
	// Auto-approval methods using the AutoApprove class
	shouldAutoApproveTool(toolName) {
		return this.autoApprover.shouldAutoApproveTool(toolName)
	}
	async shouldAutoApproveToolWithPath(blockname, autoApproveActionpath) {
		return this.autoApprover.shouldAutoApproveToolWithPath(blockname, autoApproveActionpath)
	}
	constructor(
		// Core Services & Managers
		context,
		taskState,
		messageStateHandler,
		api,
		urlContentFetcher,
		browserSession,
		diffViewProvider,
		mcpHub,
		fileContextTracker,
		clineIgnoreController,
		contextManager,
		stateManager,
		// Configuration & Settings
		autoApprovalSettings,
		browserSettings,
		focusChainSettings,
		cwd,
		taskId,
		ulid,
		mode,
		strictPlanModeEnabled,
		// Callbacks to the Task (Entity)
		say,
		ask,
		saveCheckpoint,
		sayAndCreateMissingParamError,
		removeLastPartialMessageIfExistsWithType,
		executeCommandTool,
		doesLatestTaskCompletionHaveNewChanges,
		updateFCListFromToolResponse,
	) {
		this.context = context
		this.taskState = taskState
		this.messageStateHandler = messageStateHandler
		this.api = api
		this.urlContentFetcher = urlContentFetcher
		this.browserSession = browserSession
		this.diffViewProvider = diffViewProvider
		this.mcpHub = mcpHub
		this.fileContextTracker = fileContextTracker
		this.clineIgnoreController = clineIgnoreController
		this.contextManager = contextManager
		this.stateManager = stateManager
		this.autoApprovalSettings = autoApprovalSettings
		this.browserSettings = browserSettings
		this.focusChainSettings = focusChainSettings
		this.cwd = cwd
		this.taskId = taskId
		this.ulid = ulid
		this.mode = mode
		this.strictPlanModeEnabled = strictPlanModeEnabled
		this.say = say
		this.ask = ask
		this.saveCheckpoint = saveCheckpoint
		this.sayAndCreateMissingParamError = sayAndCreateMissingParamError
		this.removeLastPartialMessageIfExistsWithType = removeLastPartialMessageIfExistsWithType
		this.executeCommandTool = executeCommandTool
		this.doesLatestTaskCompletionHaveNewChanges = doesLatestTaskCompletionHaveNewChanges
		this.updateFCListFromToolResponse = updateFCListFromToolResponse
		this.autoApprover = new AutoApprove(autoApprovalSettings)
		// Initialize the coordinator and register all tool handlers
		this.coordinator = new ToolExecutorCoordinator()
		this.registerToolHandlers()
	}
	// Create a properly typed TaskConfig object for handlers
	asToolConfig() {
		const config = {
			taskId: this.taskId,
			ulid: this.ulid,
			context: this.context,
			mode: this.mode,
			strictPlanModeEnabled: this.strictPlanModeEnabled,
			cwd: this.cwd,
			taskState: this.taskState,
			messageState: this.messageStateHandler,
			api: this.api,
			autoApprovalSettings: this.autoApprovalSettings,
			autoApprover: this.autoApprover,
			browserSettings: this.browserSettings,
			focusChainSettings: this.focusChainSettings,
			services: {
				mcpHub: this.mcpHub,
				browserSession: this.browserSession,
				urlContentFetcher: this.urlContentFetcher,
				diffViewProvider: this.diffViewProvider,
				fileContextTracker: this.fileContextTracker,
				clineIgnoreController: this.clineIgnoreController,
				contextManager: this.contextManager,
				stateManager: this.stateManager,
			},
			callbacks: {
				say: this.say,
				ask: this.ask,
				saveCheckpoint: this.saveCheckpoint,
				postStateToWebview: async () => {},
				reinitExistingTaskFromId: async () => {},
				cancelTask: async () => {},
				updateTaskHistory: async (_) => [],
				executeCommandTool: this.executeCommandTool,
				doesLatestTaskCompletionHaveNewChanges: this.doesLatestTaskCompletionHaveNewChanges,
				updateFCListFromToolResponse: this.updateFCListFromToolResponse,
				sayAndCreateMissingParamError: this.sayAndCreateMissingParamError,
				removeLastPartialMessageIfExistsWithType: this.removeLastPartialMessageIfExistsWithType,
				shouldAutoApproveToolWithPath: this.shouldAutoApproveToolWithPath.bind(this),
			},
			coordinator: this.coordinator,
		}
		// Validate the config at runtime to catch any missing properties
		validateTaskConfig(config)
		return config
	}
	/**
	 * Register all tool handlers with the coordinator
	 */
	registerToolHandlers() {
		const validator = new ToolValidator(this.clineIgnoreController)
		// Register all tool handlers
		this.coordinator.register(new ListFilesToolHandler(validator))
		this.coordinator.register(new ReadFileToolHandler(validator))
		this.coordinator.register(new BrowserToolHandler())
		this.coordinator.register(new AskFollowupQuestionToolHandler())
		this.coordinator.register(new WebFetchToolHandler())
		// Register WriteToFileToolHandler for all three file tools with proper typing
		const writeHandler = new WriteToFileToolHandler(validator)
		this.coordinator.register(writeHandler) // registers as "write_to_file"
		this.coordinator.register(new SharedToolHandler("replace_in_file", writeHandler))
		this.coordinator.register(new SharedToolHandler("new_rule", writeHandler))
		this.coordinator.register(new ListCodeDefinitionNamesToolHandler(validator))
		this.coordinator.register(new SearchFilesToolHandler(validator))
		this.coordinator.register(new ExecuteCommandToolHandler(validator))
		this.coordinator.register(new UseMcpToolHandler())
		this.coordinator.register(new AccessMcpResourceHandler())
		this.coordinator.register(new LoadMcpDocumentationHandler())
		this.coordinator.register(new PlanModeRespondHandler())
		this.coordinator.register(new NewTaskHandler())
		this.coordinator.register(new AttemptCompletionHandler())
		this.coordinator.register(new CondenseHandler())
		this.coordinator.register(new SummarizeTaskHandler())
		this.coordinator.register(new ReportBugHandler())
	}
	/**
	 * Updates the auto approval settings
	 */
	updateAutoApprovalSettings(settings) {
		this.autoApprover.updateSettings(settings)
	}
	updateMode(mode) {
		this.mode = mode
	}
	updateStrictPlanModeEnabled(strictPlanModeEnabled) {
		this.strictPlanModeEnabled = strictPlanModeEnabled
	}
	/**
	 * Main entry point for tool execution - called by Task class
	 */
	async executeTool(block) {
		await this.execute(block)
	}
	/**
	 * Handles errors during tool execution
	 */
	async handleError(action, error, block) {
		const errorString = `Error ${action}: ${error.message}`
		await this.say("error", errorString)
		// Create error response for the tool
		const errorResponse = formatResponse.toolError(errorString)
		this.pushToolResult(errorResponse, block)
	}
	pushToolResult = (content, block) => {
		// Use the ToolResultUtils to properly format and push the tool result
		ToolResultUtils.pushToolResult(
			content,
			block,
			this.taskState.userMessageContent,
			(block) => ToolDisplayUtils.getToolDescription(block),
			this.api,
			() => {
				this.taskState.didAlreadyUseTool = true
			},
			this.coordinator,
		)
	}
	/**
	 * Tools that are restricted in plan mode and can only be used in act mode
	 */
	static PLAN_MODE_RESTRICTED_TOOLS = ["write_to_file", "replace_in_file", "new_rule"]
	/**
	 * Execute a tool through the coordinator if it's registered
	 */
	async execute(block) {
		if (!this.coordinator.has(block.name)) {
			return false // Tool not handled by coordinator
		}
		const config = this.asToolConfig()
		try {
			// Check if user rejected a previous tool
			if (this.taskState.didRejectTool) {
				const reason = block.partial
					? "Tool was interrupted and not executed due to user rejecting a previous tool."
					: "Skipping tool due to user rejecting a previous tool."
				this.createToolRejectionMessage(block, reason)
				return true
			}
			// Check if a tool has already been used in this message
			if (this.taskState.didAlreadyUseTool) {
				this.taskState.userMessageContent.push({
					type: "text",
					text: formatResponse.toolAlreadyUsed(block.name),
				})
				return true
			}
			// Logic for plan-mode tool call restrictions
			if (this.strictPlanModeEnabled && this.mode === "plan" && block.name && this.isPlanModeToolRestricted(block.name)) {
				const errorMessage = `Tool '${block.name}' is not available in PLAN MODE. This tool is restricted to ACT MODE for file modifications. Only use tools available for PLAN MODE when in that mode.`
				await this.say("error", errorMessage)
				this.pushToolResult(formatResponse.toolError(errorMessage), block)
				await this.saveCheckpoint()
				return true
			}
			// Close browser for non-browser tools
			if (block.name !== "browser_action") {
				await this.browserSession.closeBrowser()
			}
			// Handle partial blocks
			if (block.partial) {
				await this.handlePartialBlock(block, config)
				return true
			}
			// Handle complete blocks
			await this.handleCompleteBlock(block, config)
			return true
		} catch (error) {
			await this.handleError(`executing ${block.name}`, error, block)
			await this.saveCheckpoint()
			return true
		}
	}
	/**
	 * Check if a tool is restricted in plan mode
	 */
	isPlanModeToolRestricted(toolName) {
		return ToolExecutor.PLAN_MODE_RESTRICTED_TOOLS.includes(toolName)
	}
	/**
	 * Create a tool rejection message and add it to user message content
	 */
	createToolRejectionMessage(block, reason) {
		this.taskState.userMessageContent.push({
			type: "text",
			text: `${reason} ${ToolDisplayUtils.getToolDescription(block, this.coordinator)}`,
		})
	}
	/**
	 * Handle partial block streaming UI updates
	 */
	async handlePartialBlock(block, config) {
		// NOTE: We don't push tool results in partial blocks because this is only for UI streaming.
		// The ToolExecutor will handle pushToolResult() when the complete block is processed.
		// This maintains separation of concerns: partial = UI updates, complete = final state changes.
		const handler = this.coordinator.getHandler(block.name)
		// Check if handler supports partial blocks with proper typing
		if (handler && "handlePartialBlock" in handler) {
			const uiHelpers = createUIHelpers(config)
			const partialHandler = handler
			await partialHandler.handlePartialBlock(block, uiHelpers)
		}
	}
	/**
	 * Handle complete block execution
	 */
	async handleCompleteBlock(block, config) {
		// All tools are now fully self-managed and implement IPartialBlockHandler
		const result = await this.coordinator.execute(config, block)
		await this.saveCheckpoint()
		this.pushToolResult(result, block)
		// Handle focus chain updates
		if (!block.partial && this.focusChainSettings.enabled) {
			await this.updateFCListFromToolResponse(block.params.task_progress)
		}
	}
}
//# sourceMappingURL=ToolExecutor.js.map
