# App Launcher

A personal macOS dev app launcher — one-click start/stop for all your local apps with live logs.

Runs at **http://localhost:4321** and opens in a standalone Chrome window (no browser chrome/tabs).

---

## Quick Start

```bash
cd ~/repos/app-launcher
./start.sh
```

That's it. The dashboard opens in a clean desktop-like window.

---

## Auto-start on Login (optional)

Install the LaunchAgent so the server runs automatically every time you log in:

```bash
cp ~/repos/app-launcher/com.kylehansen.app-launcher.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.kylehansen.app-launcher.plist
```

After this, the server starts silently at login. Just run `./start.sh` to open the window,
or bookmark http://localhost:4321 in your browser.

To uninstall auto-start:

```bash
launchctl unload ~/Library/LaunchAgents/com.kylehansen.app-launcher.plist
rm ~/Library/LaunchAgents/com.kylehansen.app-launcher.plist
```

---

## Add or Change Apps

Edit **`apps.config.js`** — each entry has:

| Field | Description |
|---|---|
| `id` | Unique identifier (no spaces) |
| `name` | Display name |
| `description` | Short description |
| `icon` | Emoji icon |
| `color` | Accent color (hex) |
| `dir` | Working directory for the process |
| `cmd` | Command to run |
| `args` | Arguments array |
| `port` | Port the app runs on (used for status check) |
| `url` | URL to open when clicking "Open" |
| `env` | Extra env vars (optional) |

Restart the launcher after editing the config.

---

## Log file

```bash
tail -f /tmp/app-launcher.log
```

---

## Files

```
app-launcher/
├── server.js                          # Process manager (Express)
├── apps.config.js                     # ← Edit this to add/remove apps
├── start.sh                           # Launch script (opens browser window)
├── com.kylehansen.app-launcher.plist  # macOS LaunchAgent for auto-start
└── public/
    └── index.html                     # Dashboard UI
```
