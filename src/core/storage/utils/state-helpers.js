import { DEFAULT_AUTO_APPROVAL_SETTINGS } from "@/shared/AutoApprovalSettings"
import { DEFAULT_BROWSER_SETTINGS } from "@/shared/BrowserSettings"
import { DEFAULT_FOCUS_CHAIN_SETTINGS } from "@/shared/FocusChainSettings"
import { DEFAULT_MCP_DISPLAY_MODE } from "@/shared/McpDisplayMode"
export async function readSecretsFromDisk(context) {
	const [
		apiKey,
		openRouterApiKey,
		clineAccountId,
		awsAccessKey,
		awsSecretKey,
		awsSessionToken,
		awsBedrockApiKey,
		openAiApiKey,
		geminiApiKey,
		openAiNativeApiKey,
		deepSeekApiKey,
		requestyApiKey,
		togetherApiKey,
		qwenApiKey,
		doubaoApiKey,
		mistralApiKey,
		fireworksApiKey,
		liteLlmApiKey,
		asksageApiKey,
		xaiApiKey,
		sambanovaApiKey,
		cerebrasApiKey,
		groqApiKey,
		moonshotApiKey,
		nebiusApiKey,
		huggingFaceApiKey,
		sapAiCoreClientId,
		sapAiCoreClientSecret,
		huaweiCloudMaasApiKey,
		basetenApiKey,
		zaiApiKey,
		ollamaApiKey,
		vercelAiGatewayApiKey,
		difyApiKey,
		authNonce,
	] = await Promise.all([
		context.secrets.get("apiKey"),
		context.secrets.get("openRouterApiKey"),
		context.secrets.get("clineAccountId"),
		context.secrets.get("awsAccessKey"),
		context.secrets.get("awsSecretKey"),
		context.secrets.get("awsSessionToken"),
		context.secrets.get("awsBedrockApiKey"),
		context.secrets.get("openAiApiKey"),
		context.secrets.get("geminiApiKey"),
		context.secrets.get("openAiNativeApiKey"),
		context.secrets.get("deepSeekApiKey"),
		context.secrets.get("requestyApiKey"),
		context.secrets.get("togetherApiKey"),
		context.secrets.get("qwenApiKey"),
		context.secrets.get("doubaoApiKey"),
		context.secrets.get("mistralApiKey"),
		context.secrets.get("fireworksApiKey"),
		context.secrets.get("liteLlmApiKey"),
		context.secrets.get("asksageApiKey"),
		context.secrets.get("xaiApiKey"),
		context.secrets.get("sambanovaApiKey"),
		context.secrets.get("cerebrasApiKey"),
		context.secrets.get("groqApiKey"),
		context.secrets.get("moonshotApiKey"),
		context.secrets.get("nebiusApiKey"),
		context.secrets.get("huggingFaceApiKey"),
		context.secrets.get("sapAiCoreClientId"),
		context.secrets.get("sapAiCoreClientSecret"),
		context.secrets.get("huaweiCloudMaasApiKey"),
		context.secrets.get("basetenApiKey"),
		context.secrets.get("zaiApiKey"),
		context.secrets.get("ollamaApiKey"),
		context.secrets.get("vercelAiGatewayApiKey"),
		context.secrets.get("difyApiKey"),
		context.secrets.get("authNonce"),
	])
	return {
		authNonce,
		apiKey,
		openRouterApiKey,
		clineAccountId,
		huggingFaceApiKey,
		huaweiCloudMaasApiKey,
		basetenApiKey,
		zaiApiKey,
		ollamaApiKey,
		vercelAiGatewayApiKey,
		difyApiKey,
		sapAiCoreClientId,
		sapAiCoreClientSecret,
		xaiApiKey,
		sambanovaApiKey,
		cerebrasApiKey,
		groqApiKey,
		moonshotApiKey,
		nebiusApiKey,
		asksageApiKey,
		fireworksApiKey,
		liteLlmApiKey,
		doubaoApiKey,
		mistralApiKey,
		openAiNativeApiKey,
		deepSeekApiKey,
		requestyApiKey,
		togetherApiKey,
		qwenApiKey,
		geminiApiKey,
		openAiApiKey,
		awsBedrockApiKey,
		awsAccessKey,
		awsSecretKey,
		awsSessionToken,
	}
}
export async function readWorkspaceStateFromDisk(context) {
	const localClineRulesToggles = context.workspaceState.get("localClineRulesToggles")
	const localWindsurfRulesToggles = context.workspaceState.get("localWindsurfRulesToggles")
	const localCursorRulesToggles = context.workspaceState.get("localCursorRulesToggles")
	const localWorkflowToggles = context.workspaceState.get("workflowToggles")
	return {
		localClineRulesToggles: localClineRulesToggles || {},
		localWindsurfRulesToggles: localWindsurfRulesToggles || {},
		localCursorRulesToggles: localCursorRulesToggles || {},
		workflowToggles: localWorkflowToggles || {},
	}
}
export async function readGlobalStateFromDisk(context) {
	// Get all global state values
	const strictPlanModeEnabled = context.globalState.get("strictPlanModeEnabled")
	const useAutoCondense = context.globalState.get("useAutoCondense")
	const isNewUser = context.globalState.get("isNewUser")
	const welcomeViewCompleted = context.globalState.get("welcomeViewCompleted")
	const awsRegion = context.globalState.get("awsRegion")
	const awsUseCrossRegionInference = context.globalState.get("awsUseCrossRegionInference")
	const awsBedrockUsePromptCache = context.globalState.get("awsBedrockUsePromptCache")
	const awsBedrockEndpoint = context.globalState.get("awsBedrockEndpoint")
	const awsProfile = context.globalState.get("awsProfile")
	const awsUseProfile = context.globalState.get("awsUseProfile")
	const awsAuthentication = context.globalState.get("awsAuthentication")
	const vertexProjectId = context.globalState.get("vertexProjectId")
	const vertexRegion = context.globalState.get("vertexRegion")
	const openAiBaseUrl = context.globalState.get("openAiBaseUrl")
	const requestyBaseUrl = context.globalState.get("requestyBaseUrl")
	const openAiHeaders = context.globalState.get("openAiHeaders")
	const ollamaBaseUrl = context.globalState.get("ollamaBaseUrl")
	const ollamaApiOptionsCtxNum = context.globalState.get("ollamaApiOptionsCtxNum")
	const lmStudioBaseUrl = context.globalState.get("lmStudioBaseUrl")
	const lmStudioMaxTokens = context.globalState.get("lmStudioMaxTokens")
	const anthropicBaseUrl = context.globalState.get("anthropicBaseUrl")
	const geminiBaseUrl = context.globalState.get("geminiBaseUrl")
	const azureApiVersion = context.globalState.get("azureApiVersion")
	const openRouterProviderSorting = context.globalState.get("openRouterProviderSorting")
	const lastShownAnnouncementId = context.globalState.get("lastShownAnnouncementId")
	const taskHistory = context.globalState.get("taskHistory")
	const autoApprovalSettings = context.globalState.get("autoApprovalSettings")
	const browserSettings = context.globalState.get("browserSettings")
	const liteLlmBaseUrl = context.globalState.get("liteLlmBaseUrl")
	const liteLlmUsePromptCache = context.globalState.get("liteLlmUsePromptCache")
	const fireworksModelMaxCompletionTokens = context.globalState.get("fireworksModelMaxCompletionTokens")
	const fireworksModelMaxTokens = context.globalState.get("fireworksModelMaxTokens")
	const userInfo = context.globalState.get("userInfo")
	const qwenApiLine = context.globalState.get("qwenApiLine")
	const moonshotApiLine = context.globalState.get("moonshotApiLine")
	const zaiApiLine = context.globalState.get("zaiApiLine")
	const telemetrySetting = context.globalState.get("telemetrySetting")
	const asksageApiUrl = context.globalState.get("asksageApiUrl")
	const planActSeparateModelsSettingRaw = context.globalState.get("planActSeparateModelsSetting")
	const favoritedModelIds = context.globalState.get("favoritedModelIds")
	const globalClineRulesToggles = context.globalState.get("globalClineRulesToggles")
	const requestTimeoutMs = context.globalState.get("requestTimeoutMs")
	const shellIntegrationTimeout = context.globalState.get("shellIntegrationTimeout")
	const enableCheckpointsSettingRaw = context.globalState.get("enableCheckpointsSetting")
	const mcpMarketplaceEnabledRaw = context.globalState.get("mcpMarketplaceEnabled")
	const mcpDisplayMode = context.globalState.get("mcpDisplayMode")
	const mcpResponsesCollapsedRaw = context.globalState.get("mcpResponsesCollapsed")
	const globalWorkflowToggles = context.globalState.get("globalWorkflowToggles")
	const terminalReuseEnabled = context.globalState.get("terminalReuseEnabled")
	const terminalOutputLineLimit = context.globalState.get("terminalOutputLineLimit")
	const defaultTerminalProfile = context.globalState.get("defaultTerminalProfile")
	const sapAiCoreBaseUrl = context.globalState.get("sapAiCoreBaseUrl")
	const sapAiCoreTokenUrl = context.globalState.get("sapAiCoreTokenUrl")
	const sapAiResourceGroup = context.globalState.get("sapAiResourceGroup")
	const claudeCodePath = context.globalState.get("claudeCodePath")
	const difyBaseUrl = context.globalState.get("difyBaseUrl")
	const openaiReasoningEffort = context.globalState.get("openaiReasoningEffort")
	const preferredLanguage = context.globalState.get("preferredLanguage")
	const focusChainSettings = context.globalState.get("focusChainSettings")
	const focusChainFeatureFlagEnabled = context.globalState.get("focusChainFeatureFlagEnabled")
	const mcpMarketplaceCatalog = context.globalState.get("mcpMarketplaceCatalog")
	const qwenCodeOauthPath = context.globalState.get("qwenCodeOauthPath")
	const customPrompt = context.globalState.get("customPrompt")
	// Get mode-related configurations
	const mode = context.globalState.get("mode")
	// Plan mode configurations
	const planModeApiProvider = context.globalState.get("planModeApiProvider")
	const planModeApiModelId = context.globalState.get("planModeApiModelId")
	const planModeThinkingBudgetTokens = context.globalState.get("planModeThinkingBudgetTokens")
	const planModeReasoningEffort = context.globalState.get("planModeReasoningEffort")
	const planModeVsCodeLmModelSelector = context.globalState.get("planModeVsCodeLmModelSelector")
	const planModeAwsBedrockCustomSelected = context.globalState.get("planModeAwsBedrockCustomSelected")
	const planModeAwsBedrockCustomModelBaseId = context.globalState.get("planModeAwsBedrockCustomModelBaseId")
	const planModeOpenRouterModelId = context.globalState.get("planModeOpenRouterModelId")
	const planModeOpenRouterModelInfo = context.globalState.get("planModeOpenRouterModelInfo")
	const planModeOpenAiModelId = context.globalState.get("planModeOpenAiModelId")
	const planModeOpenAiModelInfo = context.globalState.get("planModeOpenAiModelInfo")
	const planModeOllamaModelId = context.globalState.get("planModeOllamaModelId")
	const planModeLmStudioModelId = context.globalState.get("planModeLmStudioModelId")
	const planModeLiteLlmModelId = context.globalState.get("planModeLiteLlmModelId")
	const planModeLiteLlmModelInfo = context.globalState.get("planModeLiteLlmModelInfo")
	const planModeRequestyModelId = context.globalState.get("planModeRequestyModelId")
	const planModeRequestyModelInfo = context.globalState.get("planModeRequestyModelInfo")
	const planModeTogetherModelId = context.globalState.get("planModeTogetherModelId")
	const planModeFireworksModelId = context.globalState.get("planModeFireworksModelId")
	const planModeSapAiCoreModelId = context.globalState.get("planModeSapAiCoreModelId")
	const planModeGroqModelId = context.globalState.get("planModeGroqModelId")
	const planModeGroqModelInfo = context.globalState.get("planModeGroqModelInfo")
	const planModeHuggingFaceModelId = context.globalState.get("planModeHuggingFaceModelId")
	const planModeHuggingFaceModelInfo = context.globalState.get("planModeHuggingFaceModelInfo")
	const planModeHuaweiCloudMaasModelId = context.globalState.get("planModeHuaweiCloudMaasModelId")
	const planModeHuaweiCloudMaasModelInfo = context.globalState.get("planModeHuaweiCloudMaasModelInfo")
	const planModeBasetenModelId = context.globalState.get("planModeBasetenModelId")
	const planModeBasetenModelInfo = context.globalState.get("planModeBasetenModelInfo")
	const planModeVercelAiGatewayModelId = context.globalState.get("planModeVercelAiGatewayModelId")
	const planModeVercelAiGatewayModelInfo = context.globalState.get("planModeVercelAiGatewayModelInfo")
	// Act mode configurations
	const actModeApiProvider = context.globalState.get("actModeApiProvider")
	const actModeApiModelId = context.globalState.get("actModeApiModelId")
	const actModeThinkingBudgetTokens = context.globalState.get("actModeThinkingBudgetTokens")
	const actModeReasoningEffort = context.globalState.get("actModeReasoningEffort")
	const actModeVsCodeLmModelSelector = context.globalState.get("actModeVsCodeLmModelSelector")
	const actModeAwsBedrockCustomSelected = context.globalState.get("actModeAwsBedrockCustomSelected")
	const actModeAwsBedrockCustomModelBaseId = context.globalState.get("actModeAwsBedrockCustomModelBaseId")
	const actModeOpenRouterModelId = context.globalState.get("actModeOpenRouterModelId")
	const actModeOpenRouterModelInfo = context.globalState.get("actModeOpenRouterModelInfo")
	const actModeOpenAiModelId = context.globalState.get("actModeOpenAiModelId")
	const actModeOpenAiModelInfo = context.globalState.get("actModeOpenAiModelInfo")
	const actModeOllamaModelId = context.globalState.get("actModeOllamaModelId")
	const actModeLmStudioModelId = context.globalState.get("actModeLmStudioModelId")
	const actModeLiteLlmModelId = context.globalState.get("actModeLiteLlmModelId")
	const actModeLiteLlmModelInfo = context.globalState.get("actModeLiteLlmModelInfo")
	const actModeRequestyModelId = context.globalState.get("actModeRequestyModelId")
	const actModeRequestyModelInfo = context.globalState.get("actModeRequestyModelInfo")
	const actModeTogetherModelId = context.globalState.get("actModeTogetherModelId")
	const actModeFireworksModelId = context.globalState.get("actModeFireworksModelId")
	const actModeSapAiCoreModelId = context.globalState.get("actModeSapAiCoreModelId")
	const actModeGroqModelId = context.globalState.get("actModeGroqModelId")
	const actModeGroqModelInfo = context.globalState.get("actModeGroqModelInfo")
	const actModeHuggingFaceModelId = context.globalState.get("actModeHuggingFaceModelId")
	const actModeHuggingFaceModelInfo = context.globalState.get("actModeHuggingFaceModelInfo")
	const actModeHuaweiCloudMaasModelId = context.globalState.get("actModeHuaweiCloudMaasModelId")
	const actModeHuaweiCloudMaasModelInfo = context.globalState.get("actModeHuaweiCloudMaasModelInfo")
	const actModeBasetenModelId = context.globalState.get("actModeBasetenModelId")
	const actModeBasetenModelInfo = context.globalState.get("actModeBasetenModelInfo")
	const actModeVercelAiGatewayModelId = context.globalState.get("actModeVercelAiGatewayModelId")
	const actModeVercelAiGatewayModelInfo = context.globalState.get("actModeVercelAiGatewayModelInfo")
	const sapAiCoreUseOrchestrationMode = context.globalState.get("sapAiCoreUseOrchestrationMode")
	let apiProvider
	if (planModeApiProvider) {
		apiProvider = planModeApiProvider
	} else {
		// New users should default to openrouter, since they've opted to use an API key instead of signing in
		apiProvider = "openrouter"
	}
	const mcpResponsesCollapsed = mcpResponsesCollapsedRaw ?? false
	// Plan/Act separate models setting is a boolean indicating whether the user wants to use different models for plan and act. Existing users expect this to be enabled, while we want new users to opt in to this being disabled by default.
	// On win11 state sometimes initializes as empty string instead of undefined
	let planActSeparateModelsSetting
	if (planActSeparateModelsSettingRaw === true || planActSeparateModelsSettingRaw === false) {
		planActSeparateModelsSetting = planActSeparateModelsSettingRaw
	} else {
		// default to true for existing users
		if (planModeApiProvider) {
			planActSeparateModelsSetting = true
		} else {
			// default to false for new users
			planActSeparateModelsSetting = false
		}
	}
	return {
		// api configuration fields
		claudeCodePath,
		awsRegion,
		awsUseCrossRegionInference,
		awsBedrockUsePromptCache,
		awsBedrockEndpoint,
		awsProfile,
		awsUseProfile,
		awsAuthentication,
		vertexProjectId,
		vertexRegion,
		openAiBaseUrl,
		requestyBaseUrl,
		openAiHeaders: openAiHeaders || {},
		ollamaBaseUrl,
		ollamaApiOptionsCtxNum,
		lmStudioBaseUrl,
		lmStudioMaxTokens,
		anthropicBaseUrl,
		geminiBaseUrl,
		qwenApiLine,
		moonshotApiLine,
		zaiApiLine,
		azureApiVersion,
		openRouterProviderSorting,
		liteLlmBaseUrl,
		liteLlmUsePromptCache,
		fireworksModelMaxCompletionTokens,
		fireworksModelMaxTokens,
		asksageApiUrl,
		favoritedModelIds,
		requestTimeoutMs,
		sapAiCoreBaseUrl,
		sapAiCoreTokenUrl,
		sapAiResourceGroup,
		difyBaseUrl,
		sapAiCoreUseOrchestrationMode,
		// Plan mode configurations
		planModeApiProvider: planModeApiProvider || apiProvider,
		planModeApiModelId,
		planModeThinkingBudgetTokens,
		planModeReasoningEffort,
		planModeVsCodeLmModelSelector,
		planModeAwsBedrockCustomSelected,
		planModeAwsBedrockCustomModelBaseId,
		planModeOpenRouterModelId,
		planModeOpenRouterModelInfo,
		planModeOpenAiModelId,
		planModeOpenAiModelInfo,
		planModeOllamaModelId,
		planModeLmStudioModelId,
		planModeLiteLlmModelId,
		planModeLiteLlmModelInfo,
		planModeRequestyModelId,
		planModeRequestyModelInfo,
		planModeTogetherModelId,
		planModeFireworksModelId,
		planModeSapAiCoreModelId,
		planModeGroqModelId,
		planModeGroqModelInfo,
		planModeHuggingFaceModelId,
		planModeHuggingFaceModelInfo,
		planModeHuaweiCloudMaasModelId,
		planModeHuaweiCloudMaasModelInfo,
		planModeBasetenModelId,
		planModeBasetenModelInfo,
		planModeVercelAiGatewayModelId,
		planModeVercelAiGatewayModelInfo,
		// Act mode configurations
		actModeApiProvider: actModeApiProvider || apiProvider,
		actModeApiModelId,
		actModeThinkingBudgetTokens,
		actModeReasoningEffort,
		actModeVsCodeLmModelSelector,
		actModeAwsBedrockCustomSelected,
		actModeAwsBedrockCustomModelBaseId,
		actModeOpenRouterModelId,
		actModeOpenRouterModelInfo,
		actModeOpenAiModelId,
		actModeOpenAiModelInfo,
		actModeOllamaModelId,
		actModeLmStudioModelId,
		actModeLiteLlmModelId,
		actModeLiteLlmModelInfo,
		actModeRequestyModelId,
		actModeRequestyModelInfo,
		actModeTogetherModelId,
		actModeFireworksModelId,
		actModeSapAiCoreModelId,
		actModeGroqModelId,
		actModeGroqModelInfo,
		actModeHuggingFaceModelId,
		actModeHuggingFaceModelInfo,
		actModeHuaweiCloudMaasModelId,
		actModeHuaweiCloudMaasModelInfo,
		actModeBasetenModelId,
		actModeBasetenModelInfo,
		actModeVercelAiGatewayModelId,
		actModeVercelAiGatewayModelInfo,
		// Other global fields
		focusChainSettings: focusChainSettings || DEFAULT_FOCUS_CHAIN_SETTINGS,
		focusChainFeatureFlagEnabled: focusChainFeatureFlagEnabled ?? false,
		strictPlanModeEnabled: strictPlanModeEnabled ?? true,
		useAutoCondense: useAutoCondense ?? false,
		isNewUser: isNewUser ?? true,
		welcomeViewCompleted,
		lastShownAnnouncementId,
		taskHistory: taskHistory || [],
		autoApprovalSettings: autoApprovalSettings || DEFAULT_AUTO_APPROVAL_SETTINGS, // default value can be 0 or empty string
		globalClineRulesToggles: globalClineRulesToggles || {},
		browserSettings: { ...DEFAULT_BROWSER_SETTINGS, ...browserSettings }, // this will ensure that older versions of browserSettings (e.g. before remoteBrowserEnabled was added) are merged with the default values (false for remoteBrowserEnabled)
		preferredLanguage: preferredLanguage || "English",
		openaiReasoningEffort: openaiReasoningEffort || "medium",
		mode: mode || "act",
		userInfo,
		mcpMarketplaceEnabled: mcpMarketplaceEnabledRaw ?? true,
		mcpDisplayMode: mcpDisplayMode ?? DEFAULT_MCP_DISPLAY_MODE,
		mcpResponsesCollapsed: mcpResponsesCollapsed,
		telemetrySetting: telemetrySetting || "unset",
		planActSeparateModelsSetting,
		enableCheckpointsSetting: enableCheckpointsSettingRaw ?? true,
		shellIntegrationTimeout: shellIntegrationTimeout || 4000,
		terminalReuseEnabled: terminalReuseEnabled ?? true,
		terminalOutputLineLimit: terminalOutputLineLimit ?? 500,
		defaultTerminalProfile: defaultTerminalProfile ?? "default",
		globalWorkflowToggles: globalWorkflowToggles || {},
		mcpMarketplaceCatalog,
		qwenCodeOauthPath,
		customPrompt,
	}
}
export async function resetWorkspaceState(controller) {
	const context = controller.context
	await Promise.all(context.workspaceState.keys().map((key) => controller.context.workspaceState.update(key, undefined)))
	await controller.stateManager.reInitialize()
}
export async function resetGlobalState(controller) {
	// TODO: Reset all workspace states?
	const context = controller.context
	await Promise.all(context.globalState.keys().map((key) => context.globalState.update(key, undefined)))
	const secretKeys = [
		"apiKey",
		"openRouterApiKey",
		"awsAccessKey",
		"awsSecretKey",
		"awsSessionToken",
		"awsBedrockApiKey",
		"openAiApiKey",
		"ollamaApiKey",
		"geminiApiKey",
		"openAiNativeApiKey",
		"deepSeekApiKey",
		"requestyApiKey",
		"togetherApiKey",
		"qwenApiKey",
		"doubaoApiKey",
		"mistralApiKey",
		"clineAccountId",
		"liteLlmApiKey",
		"fireworksApiKey",
		"asksageApiKey",
		"xaiApiKey",
		"sambanovaApiKey",
		"cerebrasApiKey",
		"groqApiKey",
		"basetenApiKey",
		"moonshotApiKey",
		"nebiusApiKey",
		"huggingFaceApiKey",
		"huaweiCloudMaasApiKey",
		"vercelAiGatewayApiKey",
		"zaiApiKey",
		"difyApiKey",
	]
	await Promise.all(secretKeys.map((key) => context.secrets.delete(key)))
	await controller.stateManager.reInitialize()
}
//# sourceMappingURL=state-helpers.js.map
