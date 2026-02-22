#!/bin/bash
# Koli One - One-command development environment setup
# Usage: ./dev.sh [install|start|clean|emulate|test]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."
  
  # Node.js
  if ! command -v node &> /dev/null; then
    log_error "Node.js not installed. Install from https://nodejs.org/"
    exit 1
  fi
  log_success "Node.js $(node --version)"
  
  # npm
  if ! command -v npm &> /dev/null; then
    log_error "npm not installed. Install Node.js with npm."
    exit 1
  fi
  log_success "npm $(npm --version)"
  
  # Git
  if ! command -v git &> /dev/null; then
    log_warn "Git not installed. Some features may not work."
  else
    log_success "Git $(git --version | cut -d' ' -f3)"
  fi
  
  # Java (for Firebase Emulator)
  if ! command -v java &> /dev/null; then
    log_warn "Java not installed. Firebase Emulator will not work. Install from https://adoptopenjdk.net/"
  else
    log_success "Java $(java -version 2>&1 | head -1)"
  fi
}

# Install dependencies
install_deps() {
  log_info "Installing dependencies..."
  npm install
  log_success "Dependencies installed"
  
  # Install Firebase CLI globally if not present
  if ! command -v firebase &> /dev/null; then
    log_info "Installing Firebase CLI..."
    npm install -g firebase-tools
    log_success "Firebase CLI installed globally"
  fi
}

# Setup environment
setup_env() {
  log_info "Setting up environment..."
  
  if [ ! -f ".env.local" ]; then
    log_warn ".env.local not found. Creating template..."
    cat > .env.local << 'EOF'
# Firebase Project
VITE_FIREBASE_PROJECT_ID=koli-one-dev
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=koli-one-dev.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://koli-one-dev.firebaseio.com
VITE_FIREBASE_STORAGE_BUCKET=koli-one-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Algolia
VITE_ALGOLIA_APP_ID=your-algolia-app-id
VITE_ALGOLIA_PUBLIC_KEY=your-algolia-public-key

# Emulator Settings
FIREBASE_EMULATOR_HOST=127.0.0.1:9099
EOF
    log_warn "Please update .env.local with your credentials"
  fi
  
  log_success "Environment configured"
}

# Start development servers
start_dev() {
  log_info "Starting development servers..."
  
  # Start web dev server in background
  log_info "Starting web dev server (http://localhost:3000)..."
  npm run dev > logs/web-dev.log 2>&1 &
  
  # Start Firebase emulators
  log_info "Starting Firebase emulators..."
  firebase emulators:start --project=koli-one-dev > logs/firebase-emulator.log 2>&1 &
  
  log_success "Development servers started"
  log_info "Web: http://localhost:3000"
  log_info "Firebase Emulator UI: http://localhost:4000"
  log_info "Logs: logs/*.log"
}

# Run tests
run_tests() {
  log_info "Running tests..."
  npm run test -- --run
  log_success "Tests passed"
}

# Run type checking
type_check() {
  log_info "Running TypeScript type check..."
  npm run type-check
  log_success "No type errors"
}

# Start emulators only
start_emulators() {
  log_info "Starting Firebase emulators..."
  firebase emulators:start --project=koli-one-dev
}

# Clean up
clean() {
  log_info "Cleaning up..."
  rm -rf node_modules
  rm -rf dist
  rm -rf build
  rm -rf .next
  log_success "Cleanup complete"
}

# Main command dispatcher
case "${1:-install}" in
  install)
    check_prerequisites
    install_deps
    setup_env
    type_check
    log_success "Setup complete! Run './dev.sh start' to begin development"
    ;;
  start)
    log_info "Starting Koli One development environment..."
    if [ ! -d "node_modules" ]; then
      log_warn "Dependencies not installed. Running install first..."
      install_deps
    fi
    setup_env
    start_dev
    log_info "Development environment running. Press Ctrl+C to stop."
    wait
    ;;
  test)
    run_tests
    ;;
  type-check)
    type_check
    ;;
  emulate)
    start_emulators
    ;;
  clean)
    clean
    ;;
  help)
    cat << EOF
Koli One Development Script

Usage: ./dev.sh [COMMAND]

Commands:
  install       Install dependencies and setup environment (default)
  start         Start development servers (web, emulators)
  test          Run test suite
  type-check    Run TypeScript type checking
  emulate       Start Firebase emulators only
  clean         Remove node_modules and build artifacts
  help          Show this help message

Examples:
  ./dev.sh                    # Full setup
  ./dev.sh install            # Install dependencies
  ./dev.sh start              # Start dev servers
  ./dev.sh test               # Run tests
  ./dev.sh type-check         # Check TypeScript types
  ./dev.sh clean && ./dev.sh  # Fresh install

Environment:
  FIREBASE_EMULATOR_HOST: 127.0.0.1:9099
  NODE_ENV: development

Ports:
  3000        Web dev server (Vite)
  4000        Firebase Emulator UI
  9099        Firebase Emulator API

Logs:
  logs/web-dev.log           Web dev server log
  logs/firebase-emulator.log Firebase emulator log
EOF
    ;;
  *)
    log_error "Unknown command: $1"
    $0 help
    exit 1
    ;;
esac
