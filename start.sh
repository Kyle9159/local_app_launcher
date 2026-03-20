#!/usr/bin/env bash
# start.sh — Start the App Launcher and open it in a standalone window
# Usage: ./start.sh

set -euo pipefail

LAUNCHER_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=4321
URL="http://localhost:${PORT}"

# Kill any existing instance so config changes always take effect
if lsof -ti:${PORT} > /dev/null 2>&1; then
  echo "🔄 Restarting App Launcher…"
  lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true
  sleep 0.5
else
  echo "🚀 Starting App Launcher…"
fi

cd "$LAUNCHER_DIR"
# Use the node from nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh" --no-use 2>/dev/null || true
nohup node server.js >> /tmp/app-launcher.log 2>&1 &
echo "   PID $! — log at /tmp/app-launcher.log"
# Wait for it to boot
for i in {1..15}; do
  sleep 0.5
  if lsof -ti:${PORT} > /dev/null 2>&1; then
    echo "   Ready."
    break
  fi
done

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
