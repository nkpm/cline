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

import { doubaoDefaultModelId, doubaoModels } from "@shared/api"
import OpenAI from "openai"
import { withRetry } from "../retry"
import { convertToOpenAiMessages } from "../transform/openai-format"
export class DoubaoHandler {
	options
	client
	constructor(options) {
		this.options = options
	}
	ensureClient() {
		if (!this.client) {
			if (!this.options.doubaoApiKey) {
				throw new Error("Doubao API key is required")
			}
			try {
				this.client = new OpenAI({
					baseURL: "https://ark.cn-beijing.volces.com/api/v3/",
					apiKey: this.options.doubaoApiKey,
				})
			} catch (error) {
				throw new Error(`Error creating Doubao client: ${error.message}`)
			}
		}
		return this.client
	}
	getModel() {
		const modelId = this.options.apiModelId
		if (modelId && modelId in doubaoModels) {
			const id = modelId
			return { id, info: doubaoModels[id] }
		}
		return {
			id: doubaoDefaultModelId,
			info: doubaoModels[doubaoDefaultModelId],
		}
	}
	async *createMessage(systemPrompt, messages) {
		const client = this.ensureClient()
		const model = this.getModel()
		const openAiMessages = [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messages)]
		const stream = await client.chat.completions.create({
			model: model.id,
			max_completion_tokens: model.info.maxTokens,
			messages: openAiMessages,
			stream: true,
			stream_options: { include_usage: true },
			temperature: 0,
		})
		for await (const chunk of stream) {
			const delta = chunk.choices[0]?.delta
			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}
			if (chunk.usage) {
				yield {
					type: "usage",
					inputTokens: chunk.usage.prompt_tokens || 0,
					outputTokens: chunk.usage.completion_tokens || 0,
					// @ts-expect-error-next-line
					cacheReadTokens: chunk.usage.prompt_cache_hit_tokens || 0,
					// @ts-expect-error-next-line
					cacheWriteTokens: chunk.usage.prompt_cache_miss_tokens || 0,
				}
			}
		}
	}
}
__decorate([withRetry()], DoubaoHandler.prototype, "createMessage", null)
//# sourceMappingURL=doubao.js.map
