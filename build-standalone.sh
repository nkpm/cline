#!/bin/bash
# Build script for Cline standalone version

# Exit on error
set -e

# Print commands being executed
set -x

# Set NVM directory and source it
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Get the project directory (handle spaces in path)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create a temporary directory in /private/tmp which is a symlink to /tmp but handles paths better
TEMP_DIR="/private/tmp/cline-build-$(date +%s)"
mkdir -p "$TEMP_DIR"

# Function to clean up temporary directory
cleanup() {
    echo "Cleaning up temporary directory..."
    rm -rf "$TEMP_DIR"
}

# Register cleanup function to run on script exit
trap cleanup EXIT

echo "Copying project to temporary directory: $TEMP_DIR"
# Use tar to preserve symlinks and handle spaces in paths
(cd "$PROJECT_DIR" && tar cf - --exclude='node_modules' --exclude='.git' .) | (cd "$TEMP_DIR" && tar xf -)
cd "$TEMP_DIR"

# Use Node.js 20
nvm use 20

# Install dependencies in the temporary directory
echo "Installing project dependencies in temporary directory..."
npm install

# Install esbuild if not already installed
if ! command -v esbuild &> /dev/null; then
    echo "Installing esbuild..."
    npm install -g esbuild
fi

# Install protobuf compiler if not installed
if ! command -v protoc &> /dev/null; then
    echo "Installing protobuf compiler..."
    brew install protobuf
fi

# Install buf if not installed
if ! command -v buf &> /dev/null; then
    echo "Installing buf..."
    brew install bufbuild/buf/buf
fi

# Install required global packages if not installed
if ! command -v esbuild &> /dev/null; then
    echo "Installing esbuild..."
    npm install -g esbuild
fi

# Generate protocol buffer files using the project's build script
echo "Generating protocol buffer files..."
node scripts/build-proto.mjs

# The build-proto.mjs script handles all the protobuf compilation
# and puts the output in the correct locations

# Build the standalone version
echo "Building standalone version..."

# Run the build commands directly instead of using npm scripts
# First, run the build-proto script again to ensure everything is up to date
node scripts/build-proto.mjs

# Then run the esbuild command directly with the standalone flag
echo "Running esbuild..."
node esbuild.mjs --standalone

# Run the package-standalone script
if [ -f "scripts/package-standalone.mjs" ]; then
    echo "Running package-standalone script..."
    node scripts/package-standalone.mjs
fi

# Create necessary output directories
mkdir -p "$PROJECT_DIR/dist-standalone"
mkdir -p "$PROJECT_DIR/standalone/runtime-files"

# Copy built files to the project directory
if [ -d "dist-standalone" ]; then
    cp -r dist-standalone/* "$PROJECT_DIR/dist-standalone/"
fi

if [ -d "standalone/runtime-files" ]; then
    cp -r standalone/runtime-files/* "$PROJECT_DIR/standalone/runtime-files/"
fi

# Also copy the generated proto files back to the original project
cp -r "$TEMP_DIR/src/shared/proto/"* "$PROJECT_DIR/src/shared/proto/"

# Create package.json for standalone version in the project directory
mkdir -p "$PROJECT_DIR/standalone/runtime-files/extension/"
cat > "$PROJECT_DIR/standalone/runtime-files/extension/package.json" << 'EOL'
{
  "name": "cline-standalone",
  "version": "0.0.1",
  "description": "Cline Standalone Version",
  "main": "cline-core.js",
  "author": "",
  "publisher": "",
  "license": "MIT"
}
EOL

# Install tsx globally if not already installed
if ! command -v tsx &> /dev/null; then
    echo "Installing tsx globally..."
    npm install -g tsx
fi

echo "Build completed successfully!"
echo "To run Cline standalone:"
echo "cd standalone/runtime-files && node cline-core.js"
