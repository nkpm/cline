import { McpServers } from "@shared/proto/cline/mcp"
import { convertMcpServersToProtoMcpServers } from "@/shared/proto-conversions/mcp/mcp-server-conversion"
/**
 * RPC handler for getting the latest MCP servers
 * @param controller The controller instance
 * @param _request Empty request
 * @returns McpServers response with list of all MCP servers
 */
export async function getLatestMcpServers(controller, _request) {
	try {
		// Get sorted servers from mcpHub using the RPC variant
		const mcpServers = (await controller.mcpHub?.getLatestMcpServersRPC()) || []
		// Convert to proto format
		const protoServers = convertMcpServersToProtoMcpServers(mcpServers)
		return McpServers.create({ mcpServers: protoServers })
	} catch (error) {
		console.error("Error fetching latest MCP servers:", error)
		throw error
	}
}
//# sourceMappingURL=getLatestMcpServers.js.map
