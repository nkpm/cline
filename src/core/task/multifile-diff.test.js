import { MessageStateHandler } from "@core/task/message-state"
import { showChangedFilesDiff } from "@core/task/multifile-diff"
import { expect } from "chai"
import { afterEach, beforeEach, describe, it } from "mocha"
import sinon from "sinon"
import { HostProvider } from "@/hosts/host-provider"
import CheckpointTracker from "@/integrations/checkpoints/CheckpointTracker"
import { ShowMessageType } from "@/shared/proto/index.host"
import { setVscodeHostProviderMock } from "@/test/host-provider-test-utils"

describe("multifile-diff", () => {
	let sandbox
	let messageStateHandlerStub
	let checkpointTrackerStub
	beforeEach(() => {
		sandbox = sinon.createSandbox()
		// Create a mock hostBridge client with the necessary methods
		const mockHostBridgeClient = {
			windowClient: {
				showMessage: sandbox.stub(),
			},
			diffClient: {
				openMultiFileDiff: sandbox.stub(),
			},
		}
		// Initialize HostProvider with the mock
		setVscodeHostProviderMock({
			hostBridgeClient: mockHostBridgeClient,
		})
		// Create stubs for dependencies
		messageStateHandlerStub = sandbox.createStubInstance(MessageStateHandler)
		checkpointTrackerStub = sandbox.createStubInstance(CheckpointTracker)
	})
	afterEach(() => {
		sandbox.restore()
	})
	describe("showChangedFilesDiff", () => {
		const mockMessageTs = 1234567890
		const mockHash = "abc123def456"
		const mockMessages = [
			{
				ts: mockMessageTs,
				type: "say",
				lastCheckpointHash: mockHash,
				say: "text",
				text: "Test message",
			},
		]
		beforeEach(() => {
			messageStateHandlerStub.getClineMessages.returns(mockMessages)
		})
		it("should successfully show diff for changes since last task completion", async () => {
			// Arrange
			const mockChangedFiles = [
				{
					relativePath: "src/file1.ts",
					absolutePath: "/project/src/file1.ts",
					before: "const a = 1;",
					after: "const a = 2;",
				},
				{
					relativePath: "src/file2.ts",
					absolutePath: "/project/src/file2.ts",
					before: "function test() {}",
					after: "function test() { return true; }",
				},
			]
			// Mock finding last completion message
			const messagesWithCompletion = [
				{
					ts: 1234567000,
					type: "say",
					say: "completion_result",
					lastCheckpointHash: "previous123",
				},
				...mockMessages,
			]
			messageStateHandlerStub.getClineMessages.returns(messagesWithCompletion)
			checkpointTrackerStub.getDiffSet.resolves(mockChangedFiles)
			// Act
			await showChangedFilesDiff(messageStateHandlerStub, checkpointTrackerStub, mockMessageTs, true)
			// Assert
			expect(checkpointTrackerStub.getDiffSet.calledWith("previous123", mockHash)).to.be.true
			expect(
				HostProvider.diff.openMultiFileDiff.calledWith({
					title: "New changes",
					diffs: [
						{
							filePath: "/project/src/file1.ts",
							leftContent: "const a = 1;",
							rightContent: "const a = 2;",
						},
						{
							filePath: "/project/src/file2.ts",
							leftContent: "function test() {}",
							rightContent: "function test() { return true; }",
						},
					],
				}),
			).to.be.true
		})
		it("should successfully show diff for changes since snapshot", async () => {
			// Arrange
			const mockChangedFiles = [
				{
					relativePath: "README.md",
					absolutePath: "/project/README.md",
					before: "# Project",
					after: "# My Project\n\nDescription added.",
				},
			]
			checkpointTrackerStub.getDiffSet.resolves(mockChangedFiles)
			// Act
			await showChangedFilesDiff(messageStateHandlerStub, checkpointTrackerStub, mockMessageTs, false)
			// Assert
			expect(checkpointTrackerStub.getDiffSet.calledWith(mockHash)).to.be.true
			expect(
				HostProvider.diff.openMultiFileDiff.calledWith({
					title: "Changes since snapshot",
					diffs: [
						{
							filePath: "/project/README.md",
							leftContent: "# Project",
							rightContent: "# My Project\n\nDescription added.",
						},
					],
				}),
			).to.be.true
		})
		it("should handle message not found error", async () => {
			// Arrange
			messageStateHandlerStub.getClineMessages.returns([])
			// Act
			await showChangedFilesDiff(messageStateHandlerStub, checkpointTrackerStub, mockMessageTs, false)
			// Assert
			expect(checkpointTrackerStub.getDiffSet.called).to.be.false
			expect(HostProvider.diff.openMultiFileDiff.called).to.be.false
		})
		it("should handle missing checkpoint hash", async () => {
			// Arrange
			const messagesWithoutHash = [
				{
					ts: mockMessageTs,
					type: "say",
					say: "text",
					text: "Test message",
					// lastCheckpointHash is missing
				},
			]
			messageStateHandlerStub.getClineMessages.returns(messagesWithoutHash)
			// Act
			await showChangedFilesDiff(messageStateHandlerStub, checkpointTrackerStub, mockMessageTs, false)
			// Assert
			expect(checkpointTrackerStub.getDiffSet.called).to.be.false
			expect(HostProvider.diff.openMultiFileDiff.called).to.be.false
		})
		it("should show information message when no changes found", async () => {
			// Arrange
			checkpointTrackerStub.getDiffSet.resolves([])
			// Act
			await showChangedFilesDiff(messageStateHandlerStub, checkpointTrackerStub, mockMessageTs, false)
			// Assert
			expect(
				HostProvider.window.showMessage.calledWith({
					type: ShowMessageType.INFORMATION,
					message: "No changes found",
				}),
			).to.be.true
			expect(HostProvider.diff.openMultiFileDiff.called).to.be.false
		})
		it("should handle getDiffSet errors gracefully", async () => {
			// Arrange
			const errorMessage = "Git operation failed"
			checkpointTrackerStub.getDiffSet.rejects(new Error(errorMessage))
			// Act
			await showChangedFilesDiff(messageStateHandlerStub, checkpointTrackerStub, mockMessageTs, false)
			// Assert
			expect(
				HostProvider.window.showMessage.calledWith({
					type: ShowMessageType.ERROR,
					message: "Failed to retrieve diff set: " + errorMessage,
				}),
			).to.be.true
			expect(HostProvider.diff.openMultiFileDiff.called).to.be.false
		})
		it("should use first checkpoint when no last completion found", async () => {
			// Arrange
			const messagesWithFirstCheckpoint = [
				{
					ts: 1234567000,
					type: "say",
					say: "checkpoint_created",
					lastCheckpointHash: "first123",
				},
				...mockMessages,
			]
			messageStateHandlerStub.getClineMessages.returns(messagesWithFirstCheckpoint)
			checkpointTrackerStub.getDiffSet.resolves([
				{
					relativePath: "test.js",
					absolutePath: "/project/test.js",
					before: "",
					after: "console.log('test');",
				},
			])
			// Act
			await showChangedFilesDiff(messageStateHandlerStub, checkpointTrackerStub, mockMessageTs, true)
			// Assert
			expect(checkpointTrackerStub.getDiffSet.calledWith("first123", mockHash)).to.be.true
		})
		it("should show error when no previous checkpoint hash found for new changes", async () => {
			// Arrange
			// No completion_result or checkpoint_created messages
			messageStateHandlerStub.getClineMessages.returns(mockMessages)
			// Act
			await showChangedFilesDiff(messageStateHandlerStub, checkpointTrackerStub, mockMessageTs, true)
			// Assert
			expect(
				HostProvider.window.showMessage.calledWith({
					type: ShowMessageType.ERROR,
					message: "Unexpected error: No checkpoint hash found",
				}),
			).to.be.true
			expect(checkpointTrackerStub.getDiffSet.called).to.be.false
		})
		it("should handle large number of changed files", async () => {
			// Arrange
			const mockChangedFiles = Array.from({ length: 100 }, (_, i) => ({
				relativePath: `src/file${i}.ts`,
				absolutePath: `/project/src/file${i}.ts`,
				before: `// File ${i}`,
				after: `// Modified file ${i}`,
			}))
			checkpointTrackerStub.getDiffSet.resolves(mockChangedFiles)
			// Act
			await showChangedFilesDiff(messageStateHandlerStub, checkpointTrackerStub, mockMessageTs, false)
			// Assert
			expect(HostProvider.diff.openMultiFileDiff.calledOnce).to.be.true
			const call = HostProvider.diff.openMultiFileDiff.getCall(0)
			expect(call.args[0].diffs).to.have.lengthOf(100)
		})
	})
})
//# sourceMappingURL=multifile-diff.test.js.map
