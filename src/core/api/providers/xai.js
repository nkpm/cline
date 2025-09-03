var __decorate =
	(this && this.__decorate) ||
	((decorators, target, key, desc) => {
		var c = arguments.length,
			r = c < 3 ? target : desc === null ? (desc = Object.getOwnPropertyDescriptor(target, key)) : desc,
			d
		if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
			r = Reflect.decorate(decorators, target, key, desc)
		else
			for (var i = decorators.length - 1; i >= 0; i--)
				if ((d = decorators[i])) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
		return c > 3 && r && Object.defineProperty(target, key, r), r
	})

import { xaiDefaultModelId, xaiModels } from "@shared/api"
import { shouldSkipReasoningForModel } from "@utils/model-utils"
import OpenAI from "openai"
import { withRetry } from "../retry"
import { convertToOpenAiMessages } from "../transform/openai-format"
export class XAIHandler {
	options
	client
	constructor(options) {
		this.options = options
	}
	ensureClient() {
		if (!this.client) {
			if (!this.options.xaiApiKey) {
				throw new Error("xAI API key is required")
			}
			try {
				this.client = new OpenAI({
					baseURL: "https://api.x.ai/v1",
					apiKey: this.options.xaiApiKey,
				})
			} catch (error) {
				throw new Error(`Error creating xAI client: ${error.message}`)
			}
		}
		return this.client
	}
	async *createMessage(systemPrompt, messages) {
		const client = this.ensureClient()
		const modelId = this.getModel().id
		// ensure reasoning effort is either "low" or "high" for grok-3-mini
		let reasoningEffort
		if (modelId.includes("3-mini")) {
			let reasoningEffort = this.options.reasoningEffort
			if (reasoningEffort && !["low", "high"].includes(reasoningEffort)) {
				reasoningEffort = undefined
			}
		}
		const stream = await client.chat.completions.create({
			model: modelId,
			max_completion_tokens: this.getModel().info.maxTokens,
			temperature: 0,
			messages: [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messages)],
			stream: true,
			stream_options: { include_usage: true },
			reasoning_effort: reasoningEffort,
		})
		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta
			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}
			if (delta && "reasoning_content" in delta && delta.reasoning_content) {
				// Skip reasoning content for Grok 4 models since it only displays "thinking" without providing useful information
				if (!shouldSkipReasoningForModel(modelId)) {
					yield {
						type: "reasoning",
						// @ts-expect-error-next-line
						reasoning: delta.reasoning_content,
					}
				}
			}
			if (chunk.usage) {
				yield {
					type: "usage",
					inputTokens: chunk.usage.prompt_tokens || 0,
					outputTokens: chunk.usage.completion_tokens || 0,
					// @ts-expect-error-next-line
					cacheReadTokens: chunk.usage.prompt_tokens_details?.cached_tokens || 0,
					// @ts-expect-error-next-line
					cacheWriteTokens: chunk.usage.prompt_cache_miss_tokens || 0,
				}
			}
		}
	}
	getModel() {
		const modelId = this.options.apiModelId
		if (modelId && modelId in xaiModels) {
			const id = modelId
			return { id, info: xaiModels[id] }
		}
		return {
			id: xaiDefaultModelId,
			info: xaiModels[xaiDefaultModelId],
		}
	}
}
__decorate([withRetry()], XAIHandler.prototype, "createMessage", null)
//# sourceMappingURL=xai.js.map
