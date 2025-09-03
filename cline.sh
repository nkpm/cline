#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLINE_DIR="$SCRIPT_DIR"
HOSTBRIDGE_PORT=26041
CLINE_PORT=26040
NODE_VERSION="20.19.4"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
  lsof -i ":$1" >/dev/null 2>&1
}

# Function to kill process on a port
kill_process_on_port() {
  local port=$1
  local pid
  if command_exists lsof; then
    pid=$(lsof -ti ":$port" || true)
    if [ -n "$pid" ]; then
      echo -e "${YELLOW}Stopping process on port $port...${NC}"
      kill -9 $pid 2>/dev/null || true
    fi
  fi
}

# Function to setup environment
setup_environment() {
  echo -e "${GREEN}🚀 Setting up Cline environment...${NC}"

  # Source NVM if it exists
  export NVM_DIR="$HOME/.nvm"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
    echo -e "✓ Found NVM"
  else
    echo -e "${RED}❌ NVM not found. Please install NVM first.${NC}"
    echo "  https://github.com/nvm-sh/nvm#installing-and-updating"
    exit 1
  fi

  # Ensure Node.js version is correct
  if ! command_exists node || [ "$(node -v)" != "v$NODE_VERSION" ]; then
    echo -e "Installing Node.js v$NODE_VERSION..."
    nvm install $NODE_VERSION
  fi
  nvm use $NODE_VERSION

  # Set Cline workspace
  export CLINE_WORKSPACE="${CLINE_WORKSPACE:-$HOME/cline-workspace}"
  mkdir -p "$CLINE_WORKSPACE"
  echo -e "✓ Workspace: $CLINE_WORKSPACE"

  # Set OpenRouter API key
  if [ -z "$OPENROUTER_API_KEY" ]; then
    # Try to load from environment or keychain
    if [ -f "$HOME/.clinerc" ]; then
      source "$HOME/.clinerc"
    fi
    
    # If still not set, prompt the user
    if [ -z "$OPENROUTER_API_KEY" ]; then
      echo -e "${YELLOW}OpenRouter API key is required${NC}"
      echo "Get one at ${YELLOW}https://openrouter.ai/keys${NC}"
      echo -n "Enter your OpenRouter API key: "
      read -r OPENROUTER_API_KEY
      
      # Save to .clinerc for future use
      echo "export OPENROUTER_API_KEY='$OPENROUTER_API_KEY'" > "$HOME/.clinerc"
      chmod 600 "$HOME/.clinerc"
      echo -e "✓ API key saved to ~/.clinerc"
    fi
  fi
  
  # Export key to environment and create .env file for Cline
  export OPENROUTER_API_KEY
  echo "OPENROUTER_API_KEY=$OPENROUTER_API_KEY" > "$CLINE_DIR/.env"
  chmod 600 "$CLINE_DIR/.env"
  echo -e "✓ OpenRouter API key configured"

  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo -e "Installing dependencies..."
    npm install
  fi

  # Build if needed
  if [ ! -f "standalone/runtime-files/cline-core.js" ]; then
    echo -e "Building Cline..."
    node esbuild.mjs --standalone --force
  fi
}

# Function to start HostBridge server
start_hostbridge() {
  if port_in_use $HOSTBRIDGE_PORT; then
    echo -e "${YELLOW}HostBridge server already running on port $HOSTBRIDGE_PORT${NC}"
  else
    echo -e "${GREEN}Starting HostBridge server on port $HOSTBRIDGE_PORT...${NC}"
    (cd "$CLINE_DIR" && 
     nvm use $NODE_VERSION > /dev/null && 
     npx tsx scripts/test-hostbridge-server.ts > hostbridge.log 2>&1 &)
    sleep 2
  fi
}

# Function to start Cline core
start_cline() {
  if port_in_use $CLINE_PORT; then
    echo -e "${YELLOW}Cline core already running on port $CLINE_PORT${NC}"
  else
    echo -e "${GREEN}Starting Cline core on port $CLINE_PORT...${NC}"
    (cd "$CLINE_DIR" && 
     nvm use $NODE_VERSION > /dev/null && 
     export OPENROUTER_API_KEY="$OPENROUTER_API_KEY" && 
     node standalone/runtime-files/cline-core.js > cline.log 2>&1 &)
    sleep 2
  fi
}

# Function to check if services are running
check_services() {
  echo -e "\n${GREEN}=== Cline Status ===${NC}"
  
  if port_in_use $HOSTBRIDGE_PORT; then
    echo -e "✅ HostBridge: Running on port $HOSTBRIDGE_PORT"
  else
    echo -e "❌ HostBridge: Not running"
  fi
  
  if port_in_use $CLINE_PORT; then
    echo -e "✅ Cline Core:  Running on port $CLINE_PORT"
    echo -e "   Access at:  http://localhost:$CLINE_PORT"
  else
    echo -e "❌ Cline Core:  Not running"
  fi
}

# Function to stop services
stop_services() {
  echo -e "${RED}🛑 Stopping Cline services...${NC}"
  
  # Stop Cline Core
  kill_process_on_port $CLINE_PORT "Cline Core"
  
  # Stop HostBridge
  kill_process_on_port $HOSTBRIDGE_PORT "HostBridge Server"
  
  echo -e "\n✅ Cline services have been stopped."
}

# Main function
main() {
  local command=${1:-start}
  
  case $command in
    start)
      setup_environment
      start_hostbridge
      start_cline
      check_services
      echo -e "\n${GREEN}✅ Cline is running!${NC}"
      echo -e "\nTo stop Cline, run: ${YELLOW}./cline.sh stop${NC}"
      echo -e "View logs: ${YELLOW}tail -f cline.log${NC} or ${YELLOW}tail -f hostbridge.log${NC}"
      ;;
    stop)
      stop_services
      ;;
    status)
      check_services
      ;;
    *)
      echo "Usage: $0 [command]"
      echo "  start   - Start Cline services (default)"
      echo "  stop    - Stop Cline services"
      echo "  status  - Check service status"
      exit 1
      ;;
  esac
}

# Run main function
main "$@"
