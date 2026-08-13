module.exports = {
  apps: [
    {
      name: 'foodcalorie-api',
      script: 'src/server.js',
      cwd: __dirname,
      interpreter: '/opt/node-v24/bin/node',
      node_args: '--max-old-space-size=256',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
