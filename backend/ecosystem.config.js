// PM2 Ecosystem Config — DECA Configurator API
module.exports = {
  apps: [{
    name: 'deca-api',
    script: 'server.js',
    cwd: '/opt/deca/configurator-api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
    },
    error_file: '/var/log/deca-api-error.log',
    out_file: '/var/log/deca-api-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
};
