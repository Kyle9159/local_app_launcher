// apps.config.js — Edit this file to add/remove/configure your apps
// Restart the launcher after making changes.

const os = require('os');
const home = os.homedir();

module.exports = [
  {
    id: 'csp-options',
    name: 'CSP Options App',
    description: 'Options trading dashboard & scanner',
    icon: '📈',
    color: '#4ade80',
    dir: `${home}/repos/csp_options_app`,
    // Managed by LaunchAgent — server auto-starts on login, no cmd needed
    cmd: `${home}/repos/csp_options_app/.venv/bin/python3.14`,
    args: ['dashboard_server.py'],
    port: 5001,
    url: 'https://127.0.0.1:5001',
    env: {
      VIRTUAL_ENV: `${home}/repos/csp_options_app/.venv`,
    },
  },
  {
    id: 'study-planner',
    name: 'Study Planner',
    description: 'Study tracking, scheduling & planning',
    icon: '📚',
    color: '#60a5fa',
    dir: `${home}/repos/Study_Planner`,
    cmd: 'npm',
    args: ['run', 'dev'],
    port: 5175,
    url: 'http://localhost:5175',
  },
  {
    id: 'job-ops',
    name: 'Job Ops',
    description: 'Job application pipeline orchestrator',
    icon: '💼',
    color: '#f59e0b',
    dir: `${home}/repos/job-ops/orchestrator`,
    cmd: 'npm',
    args: ['run', 'dev'],
    // npm run dev runs concurrently: server on PORT (default 3001) + Vite client on 5173
    port: 5173,
    url: 'http://localhost:5173',
    env: { PORT: '3001' },
  },
  {
    id: 'ai-pulse',
    name: 'AI Pulse',
    description: 'AI news & sentiment dashboard',
    icon: '🤖',
    color: '#a78bfa',
    dir: `${home}/repos/ai_pulse/frontend`,
    cmd: 'npm',
    args: ['run', 'dev'],
    port: 3003,
    url: 'http://localhost:3003',
  },
  {
    id: 'supplement-explorer',
    name: 'Supplement Explorer',
    description: 'Supplement comparison & research',
    icon: '💊',
    color: '#f472b6',
    dir: `${home}/repos/supplement_explorer`,
    cmd: 'npm',
    args: ['run', 'dev'],
    // Next.js respects PORT env var — use 3004 to avoid conflicts
    port: 3004,
    url: 'http://localhost:3004',
    env: { PORT: '3004' },
  },
];
