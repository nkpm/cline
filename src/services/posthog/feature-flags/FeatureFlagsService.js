/**
 * FeatureFlagsService provides feature flag functionality that works independently
 * of telemetry settings. Feature flags are always available to ensure proper
 * functionality of the extension regardless of user's telemetry preferences.
 */
export class FeatureFlagsService {
	getFeatureFlag
	getFeatureFlagPayload
	constructor(getFeatureFlag, getFeatureFlagPayload) {
		this.getFeatureFlag = getFeatureFlag
		this.getFeatureFlagPayload = getFeatureFlagPayload
	}
	/**
	 * Check if a feature flag is enabled
	 * This method works regardless of telemetry settings to ensure feature flags
	 * can control extension behavior independently of user privacy preferences.
	 *
	 * @param flagName The feature flag key
	 * @returns Boolean indicating if the feature is enabled
	 */
	async isFeatureFlagEnabled(flagName) {
		try {
			const flagEnabled = await this.getFeatureFlag(flagName)
			return flagEnabled === true
		} catch (error) {
			console.error(`Error checking if feature flag ${flagName} is enabled:`, error)
			return false
		}
	}
	/**
	 * Wrapper: safely get boolean flag with default fallback
	 */
	async getBooleanFlagEnabled(flagName, defaultValue = false) {
		try {
			return await this.isFeatureFlagEnabled(flagName)
		} catch (error) {
			console.error(`Error getting boolean flag ${flagName}:`, error)
			return defaultValue
		}
	}
	/**
	 * Convenience: focus chain checklist remote gate
	 */
	async getFocusChainEnabled() {
		return this.getBooleanFlagEnabled("focus_chain_checklist", true)
	}
	/**
	 * Get the feature flag payload for advanced use cases
	 * @param flagName The feature flag key
	 * @returns The feature flag payload or null if not found
	 */
	async getPayload(flagName) {
		try {
			return await this.getFeatureFlagPayload(flagName)
		} catch (error) {
			console.error(`Error retrieving feature flag payload for ${flagName}:`, error)
			return null
		}
	}
}
//# sourceMappingURL=FeatureFlagsService.js.map
