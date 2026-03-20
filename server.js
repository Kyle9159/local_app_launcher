// server.js — App Launcher Process Manager
'use strict';

const express = require('express');
const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const os = require('os');

const APPS = require('./apps.config.js');
const PORT = 4321;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Process state ────────────────────────────────────────────────────────────

const state = {}; // id → { process, logs: string[], sseClients: Set }

for (const a of APPS) {
  state[a.id] = { process: null, logs: [], sseClients: new Set() };
}

function pushLog(id, line) {
  const s = state[id];
  s.logs.push(line);
  if (s.logs.length > 600) s.logs.splice(0, s.logs.length - 500);
  for (const res of s.sseClients) {
    res.write(`data: ${JSON.stringify({ line })}\n\n`);
  }
}

function isRunning(id) {
  const s = state[id];
  return s.process !== null && s.process.exitCode === null;
}

// ─── Port check ───────────────────────────────────────────────────────────────

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(true)); // port in use → running
    server.once('listening', () => {
      server.close(() => resolve(false)); // port free → not running
    });
    server.listen(port, '127.0.0.1');
  });
}

// ─── API ──────────────────────────────────────────────────────────────────────

app.get('/api/apps', async (req, res) => {
  const results = await Promise.all(
    APPS.map(async (a) => {
      const portBusy = a.port ? await checkPort(a.port) : null;
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        color: a.color,
        port: a.port,
        url: a.url,
        running: isRunning(a.id),
        portBusy,
      };
    })
  );
  res.json(results);
});

app.post('/api/apps/:id/start', (req, res) => {
  const a = APPS.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Unknown app' });

  const s = state[a.id];
  if (isRunning(a.id)) return res.json({ ok: true, already: true });

  const env = {
    ...process.env,
    ...(a.env || {}),
    PATH: a.env?.VIRTUAL_ENV
      ? `${a.env.VIRTUAL_ENV}/bin:${process.env.PATH}`
      : process.env.PATH,
  };

  pushLog(a.id, `▶ Starting ${a.name}…`);

  const child = spawn(a.cmd, a.args, {
    cwd: a.dir,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: a.shell === true,
  });

  s.process = child;

  child.stdout.on('data', (d) => {
    for (const line of d.toString().split('\n')) {
      if (line.trim()) pushLog(a.id, line);
    }
  });

  child.stderr.on('data', (d) => {
    for (const line of d.toString().split('\n')) {
      if (line.trim()) pushLog(a.id, `[err] ${line}`);
    }
  });

  child.on('close', (code) => {
    pushLog(a.id, `■ Process exited (code ${code})`);
    s.process = null;
  });

  child.on('error', (err) => {
    pushLog(a.id, `✖ Spawn error: ${err.message}`);
    s.process = null;
  });

  res.json({ ok: true, pid: child.pid });
});

app.post('/api/apps/:id/stop', (req, res) => {
  const a = APPS.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Unknown app' });

  const s = state[a.id];
  if (!isRunning(a.id)) return res.json({ ok: true, already: true });

  pushLog(a.id, `■ Stopping ${a.name}…`);

  // Send SIGTERM first, then SIGKILL after 3s
  const child = s.process;
  child.kill('SIGTERM');
  const killTimer = setTimeout(() => {
    if (s.process === child) {
      pushLog(a.id, '■ Force-killing…');
      child.kill('SIGKILL');
    }
  }, 3000);
  child.on('close', () => clearTimeout(killTimer));

  res.json({ ok: true });
});

app.get('/api/apps/:id/logs', (req, res) => {
  const s = state[req.params.id];
  if (!s) return res.status(404).json({ error: 'Unknown app' });
  res.json({ lines: s.logs });
});

// SSE: live log stream
app.get('/api/apps/:id/logs/stream', (req, res) => {
  const s = state[req.params.id];
  if (!s) return res.status(404).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send buffered logs immediately
  for (const line of s.logs) {
    res.write(`data: ${JSON.stringify({ line })}\n\n`);
  }

  s.sseClients.add(res);
  req.on('close', () => s.sseClients.delete(res));
});

// ─── Launcher stop-all on shutdown ────────────────────────────────────────────

function stopAll() {
  for (const id of Object.keys(state)) {
    const s = state[id];
    if (s.process && s.process.exitCode === null) {
      s.process.kill('SIGTERM');
    }
  }
}

process.on('SIGINT', () => { stopAll(); process.exit(0); });
process.on('SIGTERM', () => { stopAll(); process.exit(0); });

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 App Launcher running at http://localhost:${PORT}\n`);
});
