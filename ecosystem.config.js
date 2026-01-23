/**
 * ProjeClick Play - PM2 Configuration
 * 
 * Este arquivo configura o PM2 para:
 * - Auto-restart quando a VPS reiniciar
 * - Monitoramento de memória
 * - Reinício automático em caso de crash
 * - Logs organizados
 */

module.exports = {
  apps: [
    {
      name: 'projeclick-play',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 'max', // Usa todos os CPUs disponíveis
      exec_mode: 'cluster', // Modo cluster para melhor performance
      
      // Auto-restart
      autorestart: true,
      watch: false, // Não assistir mudanças em produção
      max_memory_restart: '1G', // Reinicia se usar mais de 1GB
      
      // Variáveis de ambiente
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Configurações de restart
      restart_delay: 4000, // Esperar 4s antes de reiniciar
      max_restarts: 10, // Máximo de 10 restarts em 15 minutos
      min_uptime: '10s', // Considerar como startup se rodar por 10s
      
      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
    }
  ],
  
  // Deploy configuration (opcional)
  deploy: {
    production: {
      user: 'root',
      host: 'your-vps-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/projeclick-play.git',
      path: '/var/www/projeclick-play',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
