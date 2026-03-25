#!/usr/bin/env bash
# start.sh — Start the App Launcher and open it in a standalone window
# Usage: ./start.sh

set -euo pipefail

LAUNCHER_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=4321
URL="http://localhost:${PORT}"

resolve_node_bin() {
  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi

  export NVM_DIR="$HOME/.nvm"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh" >/dev/null 2>&1 || true
  fi

  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi

  local latest_node
  latest_node="$(ls -d "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null | tail -1 || true)"
  if [ -n "$latest_node" ] && [ -x "$latest_node" ]; then
    printf '%s\n' "$latest_node"
    return 0
  fi

  return 1
}

# Kill any existing instance so config changes always take effect
if lsof -ti:${PORT} > /dev/null 2>&1; then
  echo "🔄 Restarting App Launcher…"
  lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true
  sleep 0.5
else
  echo "🚀 Starting App Launcher…"
fi

cd "$LAUNCHER_DIR"
NODE_BIN="$(resolve_node_bin || true)"
if [ -z "$NODE_BIN" ]; then
  echo "✖ Could not find Node.js. Install Node or configure ~/.nvm before launching App Launcher."
  exit 1
fi

nohup "$NODE_BIN" server.js >> /tmp/app-launcher.log 2>&1 &
echo "   PID $! — log at /tmp/app-launcher.log"
# Wait for it to boot
ready=false
for i in {1..15}; do
  sleep 0.5
  if lsof -ti:${PORT} > /dev/null 2>&1; then
    echo "   Ready."
    ready=true
    break
  fi
done

if [ "$ready" != true ]; then
  echo "✖ App Launcher did not start. Check /tmp/app-launcher.log"
  exit 1
fi

# Open in Chrome app-mode (feels like a native desktop window)
echo "🌐 Opening dashboard…"
if command -v "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" &> /dev/null; then
  open -na "Google Chrome" --args --app="${URL}" --window-size=1100,740
elif command -v "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" &> /dev/null; then
  open -na "Brave Browser" --args --app="${URL}" --window-size=1100,740
else
  # Fall back to Safari / default browser
  open "${URL}"
fi
