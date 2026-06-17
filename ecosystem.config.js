module.exports = {
  apps: [
    {
      // ── KoolTech AI Voice Worker ─────────────────────────────────────────────
      // This process runs the LiveKit agent worker that handles voice calls.
      // It must be running for voice sessions to connect to an AI agent.
      //
      // Start:   npx pm2 start ecosystem.config.js
      // Logs:    npx pm2 logs kooltech-voice-agent
      // Monitor: npx pm2 monit
      // Restart: npx pm2 restart kooltech-voice-agent
      // Stop:    npx pm2 stop kooltech-voice-agent
      name: "kooltech-voice-agent",
      script: "src/agent-python/agent.py",
      args: "dev",
      cwd: process.cwd(),
      interpreter: "src/agent-python/venv/Scripts/python.exe",

      // Process management
      instances: 1,           // One worker is enough; LiveKit handles concurrency
      autorestart: true,      // Restart on crash
      watch: false,           // Do NOT watch files in production
      max_memory_restart: "512M",

      // Restart policy — exponential backoff
      restart_delay: 5000,    // 5 seconds between restarts
      max_restarts: 10,       // Stop after 10 consecutive crashes
      min_uptime: "30s",      // Must be up 30s to count as stable

      // Environment
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },

      // Logging
      out_file: "./logs/voice-agent-out.log",
      error_file: "./logs/voice-agent-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // Graceful shutdown — allow 10s for active calls to complete
      kill_timeout: 10000,
      listen_timeout: 15000,
    },

    {
      // ── KoolTech Next.js App ─────────────────────────────────────────────────
      // Production Next.js server. Run `npm run build` first.
      name: "kooltech-web",
      script: "./node_modules/next/dist/bin/next",
      args: "start",
      cwd: process.cwd(),
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      out_file: "./logs/web-out.log",
      error_file: "./logs/web-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      kill_timeout: 5000,
    },
  ],
};
