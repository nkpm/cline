import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"
import chalk from "chalk"
import * as path from "path"

// Define the path to the proto file
const PROTO_PATH = path.join(__dirname, "../../proto/cline/ui.proto")

// Verify the proto file exists
console.log("Looking for proto file at:", PROTO_PATH)

// Load the proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true,
	includeDirs: [path.join(__dirname, "../../proto")],
})

// Load the package definition
const cline = grpc.loadPackageDefinition(packageDefinition).cline as any

// Create a gRPC client
const client = new cline.UiService(
	"localhost:26040", // Cline gRPC server address
	grpc.credentials.createInsecure(),
)

// Simple function to print messages with timestamp and type
function printMessage(message: any) {
	const timestamp = new Date().toLocaleTimeString()

	try {
		if (message.type === "SAY" && message.text) {
			console.log(chalk.blue(`[${timestamp}] SAY:`), message.text)
		} else if (message.type === "ASK") {
			console.log(chalk.yellow(`[${timestamp}] ASK:`), message.text || "User input requested")
		} else if (message.say_tool) {
			const tool = message.say_tool
			console.log(chalk.cyan(`[${timestamp}] TOOL:`), `${tool.tool} - ${tool.path || ""}`)
			if (tool.diff) {
				console.log(chalk.gray(`[${timestamp}]`), "Diff:", tool.diff)
			}
		} else if (message.api_req_info) {
			const req = message.api_req_info
			console.log(chalk.magenta(`[${timestamp}] API:`), `${req.request} (${req.tokens_in} in, ${req.tokens_out} out)`)
		} else {
			console.log(chalk.gray(`[${timestamp}] Unknown message type:`), JSON.stringify(message, null, 2))
		}
	} catch (error) {
		console.error(chalk.red(`[${timestamp}] Error processing message:`), error)
	}
}

// Main function to subscribe to messages
function subscribeToMessages() {
	console.log(chalk.cyan("Connecting to Cline gRPC server..."))

	try {
		// Create a streaming call to subscribe to partial messages
		const call = client.subscribeToPartialMessage({})

		// Handle incoming messages
		call.on("data", (message: any) => {
			if (!message) return

			try {
				printMessage(message)
			} catch (error) {
				console.error(chalk.red("Error processing message:"), error)
			}
		})

		// Handle stream end
		call.on("end", () => {
			console.log(chalk.yellow("Server ended the connection"))
			// Try to reconnect after a delay
			setTimeout(subscribeToMessages, 5000)
		})

		// Handle errors
		call.on("error", (err: any) => {
			console.error(chalk.red("Error in message stream:"), err)
			// Try to reconnect after a delay
			setTimeout(subscribeToMessages, 5000)
		})

		// Handle process termination
		process.on("SIGINT", () => {
			console.log(chalk.yellow("\nDisconnecting from server..."))
			call.cancel()
			process.exit(0)
		})
	} catch (error) {
		console.error(chalk.red("Failed to create subscription:"), error)
		setTimeout(subscribeToMessages, 5000)
	}
}

console.log(chalk.green("Cline Test Client starting..."))
console.log(chalk.cyan("Make sure the Cline gRPC server is running on localhost:50051"))

// Start the subscription
subscribeToMessages()

console.log(chalk.green("Client is running. Press Ctrl+C to exit."))
