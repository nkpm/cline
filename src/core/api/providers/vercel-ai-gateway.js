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

import { vercelAiGatewayDefaultModelId, vercelAiGatewayDefaultModelInfo } from "@shared/api"
import OpenAI from "openai"
import { withRetry } from "../retry"
import { createVercelAIGatewayStream } from "../transform/vercel-ai-gateway-stream"
export class VercelAIGatewayHandler {
	options
	client
	constructor(options) {
		this.options = options
	}
	ensureClient() {
		if (!this.client) {
			if (!this.options.vercelAiGatewayApiKey) {
				throw new Error("Vercel AI Gateway API key is required")
			}
			try {
				this.client = new OpenAI({
					baseURL: "https://ai-gateway.vercel.sh/v1",
					apiKey: this.options.vercelAiGatewayApiKey,
					defaultHeaders: {
						"http-referer": "https://cline.bot",
						"x-title": "Cline",
					},
				})
			} catch (error) {
				throw new Error(`Error creating Vercel AI Gateway client: ${error.message}`)
			}
		}
		return this.client
	}
	async *createMessage(systemPrompt, messages) {
		const client = this.ensureClient()
		const modelId = this.getModel().id
		const modelInfo = this.getModel().info
		try {
			const stream = await createVercelAIGatewayStream(client, systemPrompt, messages, { id: modelId, info: modelInfo })
			let didOutputUsage = false
			for await (const chunk of stream) {
				const delta = chunk.choices[0]?.delta
				if (delta?.content) {
					yield {
						type: "text",
						text: delta.content,
					}
				}
				if (!didOutputUsage && chunk.usage) {
					const inputTokens = chunk.usage.prompt_tokens || 0
					const outputTokens =
						(chunk.usage.completion_tokens || 0) + (chunk.usage.completion_tokens_details?.reasoning_tokens || 0)
					const cacheReadTokens = chunk.usage.prompt_tokens_details?.cached_tokens || 0
					// @ts-expect-error - Vercel AI Gateway extends OpenAI types
					const cacheWriteTokens = chunk.usage.cache_creation_input_tokens || 0
					yield {
						type: "usage",
						inputTokens: inputTokens,
						outputTokens: outputTokens,
						cacheWriteTokens: cacheWriteTokens,
						cacheReadTokens: cacheReadTokens,
						// @ts-expect-error - Vercel AI Gateway extends OpenAI types
						totalCost: chunk.usage.cost || 0,
					}
					didOutputUsage = true
				}
			}
			if (!didOutputUsage) {
				console.warn("Vercel AI Gateway did not provide usage information in stream")
			}
		} catch (error) {
			console.error("Vercel AI Gateway error details:", error)
			console.error("Error stack:", error.stack)
			throw new Error(`Vercel AI Gateway error: ${error.message}`)
		}
	}
	getModel() {
		const modelId = this.options.vercelAiGatewayModelId
		const modelInfo = this.options.vercelAiGatewayModelInfo
		if (modelId && modelInfo) {
			return { id: modelId, info: modelInfo }
		}
		return { id: vercelAiGatewayDefaultModelId, info: vercelAiGatewayDefaultModelInfo }
	}
}
__decorate([withRetry()], VercelAIGatewayHandler.prototype, "createMessage", null)
//# sourceMappingURL=vercel-ai-gateway.js.map
