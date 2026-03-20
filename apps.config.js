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
    // Use the venv python directly
    cmd: `${home}/repos/csp_options_app/.venv/bin/python`,
    args: ['dashboard_server.py'],
    port: 5000,
    url: 'http://localhost:5000',
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
    port: 5173,
    url: 'http://localhost:5173',
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
    port: 3000,
    url: 'http://localhost:3000',
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
    port: 3000,
    // Note: same port as job-ops — only run one at a time, or change one's port
    url: 'http://localhost:3000',
  },
];
