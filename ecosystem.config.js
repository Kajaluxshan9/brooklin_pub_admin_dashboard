module.exports = {
  apps: [
    {
      name: 'brooklin-pub-admin',
      script: 'serve',
      args: '-s dist -l 3002',
      env: {
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 3002,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html',
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
};
