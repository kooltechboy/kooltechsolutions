module.exports = {
  apps: [
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

    {
      // ── KoolTech Python Voice Agent ──────────────────────────────────────
      // LiveKit voice agent (Gemini Live native audio).
      // Restart automatically if it crashes.
      name: "kooltech-voice-agent",
      script: "src/agent-python/venv/Scripts/python.exe",
      args: "src/agent-python/agent.py start",
      cwd: process.cwd(),
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,
      watch: false,
      max_memory_restart: "512M",

      env_production: {
        NODE_ENV: "production",
      },

      out_file: "./logs/voice-agent-out.log",
      error_file: "./logs/voice-agent-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      kill_timeout: 5000,
    },
  ],
};
