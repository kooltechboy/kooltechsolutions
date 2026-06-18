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
  ],
};
