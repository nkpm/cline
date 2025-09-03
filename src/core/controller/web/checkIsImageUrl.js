import { detectImageUrl } from "@integrations/misc/link-preview"
import { IsImageUrl } from "@shared/proto/cline/web"
/**
 * Checks if a URL is an image URL
 * @param controller The controller instance
 * @param request The request containing the URL to check
 * @returns A result indicating if the URL is an image and the URL that was checked
 */
export async function checkIsImageUrl(_, request) {
	try {
		const url = request.value || ""
		// Check if the URL is an image
		const isImage = await detectImageUrl(url)
		return IsImageUrl.create({
			isImage,
			url,
		})
	} catch (error) {
		console.error(`Error checking if URL is an image: ${request.value}`, error)
		return IsImageUrl.create({
			isImage: false,
			url: request.value || "",
		})
	}
}
//# sourceMappingURL=checkIsImageUrl.js.map
