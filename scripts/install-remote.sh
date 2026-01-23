#!/bin/bash

# =====================================================
# ProjeClick Play - Instalador Remoto (Um Comando)
# =====================================================
# Execute com:
# curl -fsSL https://raw.githubusercontent.com/macbservices/projeclick-play/main/scripts/install-remote.sh | bash
# =====================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuracoes
REPO_URL="https://github.com/macbservices/projeclick-play.git"
INSTALL_DIR="/var/www/projeclick-play"
PORT=3000

clear
echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║     ____            _       ____ _ _      _      ____  _      ║"
echo "║    |  _ \ _ __ ___ (_) ___ / ___| (_) ___| | __ |  _ \| | ___ ║"
echo "║    | |_) | '__/ _ \| |/ _ \ |   | | |/ __| |/ / | |_) | |/ _ \║"
echo "║    |  __/| | | (_) | |  __/ |___| | | (__|   <  |  __/| | (_) ║"
echo "║    |_|   |_|  \___// |\___|\____|_|_|\___|_|\_\ |_|   |_|\___/║"
echo "║                  |__/                                         ║"
echo "║                                                               ║"
echo "║              Instalador Automatico para VPS                   ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Verificar root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Este script precisa ser executado como root${NC}"
    echo -e "${YELLOW}Execute: sudo bash ou su -${NC}"
    exit 1
fi

# Funcao para verificar comandos
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Passo 1: Atualizar sistema
echo -e "${BLUE}[1/8]${NC} Atualizando sistema..."
apt-get update -qq
apt-get upgrade -y -qq
echo -e "${GREEN}OK${NC}"

# Passo 2: Instalar dependencias basicas
echo -e "${BLUE}[2/8]${NC} Instalando dependencias basicas..."
apt-get install -y -qq curl git build-essential
echo -e "${GREEN}OK${NC}"

# Passo 3: Instalar Node.js 20
echo -e "${BLUE}[3/9]${NC} Verificando Node.js..."
NEED_NODE_INSTALL=false

# Sempre remover pacotes antigos do Node.js primeiro para evitar conflitos
echo -e "${YELLOW}Removendo pacotes antigos do Node.js (se existirem)...${NC}"
dpkg --remove --force-remove-reinstreq nodejs 2>/dev/null || true
apt-get remove -y --purge --allow-remove-essential nodejs nodejs-doc libnode-dev libnode72 npm 2>/dev/null || true
apt-get autoremove -y 2>/dev/null || true
# Limpar arquivos residuais que causam conflito
rm -rf /usr/local/lib/node_modules 2>/dev/null || true
rm -rf /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx 2>/dev/null || true
rm -rf /usr/bin/node /usr/bin/npm /usr/bin/npx 2>/dev/null || true
rm -rf /usr/include/node 2>/dev/null || true
rm -f /etc/apt/sources.list.d/nodesource.list 2>/dev/null || true
rm -f /etc/apt/keyrings/nodesource.gpg 2>/dev/null || true
# Corrigir pacotes quebrados
dpkg --configure -a 2>/dev/null || true
apt-get -f install -y 2>/dev/null || true
apt-get update -qq
hash -r

echo -e "${YELLOW}Instalando Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
hash -r
echo -e "${GREEN}OK${NC} - Node $(node -v)"

# Passo 4: Instalar pnpm
echo -e "${BLUE}[4/9]${NC} Instalando pnpm..."
if ! command_exists pnpm; then
    npm install -g pnpm >/dev/null 2>&1
fi
echo -e "${GREEN}OK${NC}"

# Passo 5: Instalar PM2
echo -e "${BLUE}[5/9]${NC} Instalando PM2..."
if ! command_exists pm2; then
    npm install -g pm2 >/dev/null 2>&1
fi
echo -e "${GREEN}OK${NC}"

# Passo 6: Instalar Nginx
echo -e "${BLUE}[6/9]${NC} Instalando Nginx..."
apt-get install -y -qq nginx
echo -e "${GREEN}OK${NC}"

# Passo 7: Clonar repositorio
echo -e "${BLUE}[7/9]${NC} Baixando ProjeClick Play..."
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Diretorio ja existe. Atualizando...${NC}"
    cd "$INSTALL_DIR"
    # Salvar arquivos de dados locais
    if [ -d "data" ]; then
        cp -r data /tmp/projeclick-data-backup 2>/dev/null || true
    fi
    # Forcar reset para o branch remoto (resolve conflitos de branches divergentes)
    git fetch origin main
    git reset --hard origin/main
    # Restaurar dados locais
    if [ -d "/tmp/projeclick-data-backup" ]; then
        cp -r /tmp/projeclick-data-backup/* data/ 2>/dev/null || true
        rm -rf /tmp/projeclick-data-backup
    fi
else
    mkdir -p /var/www
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi
echo -e "${GREEN}OK${NC}"

# Passo 8: Instalar dependencias e fazer build
echo -e "${BLUE}[8/9]${NC} Instalando dependencias do projeto..."
cd "$INSTALL_DIR"
pnpm install --silent
mkdir -p data
echo -e "${GREEN}OK${NC}"

echo -e "${BLUE}[8/9]${NC} Fazendo build (pode demorar alguns minutos)..."
pnpm build
echo -e "${GREEN}OK${NC}"

# Passo 9: Configurar Nginx como proxy reverso
echo -e "${BLUE}[9/9]${NC} Configurando Nginx..."
cat > /etc/nginx/sites-available/projeclick-play <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
ln -sf /etc/nginx/sites-available/projeclick-play /etc/nginx/sites-enabled/
nginx -t >/dev/null 2>&1
systemctl restart nginx
systemctl enable nginx
echo -e "${GREEN}OK${NC}"

# Passo 10: Configurar PM2
echo -e "${BLUE}[9/9]${NC} Configurando PM2 e auto-start..."
pm2 delete projeclick-play 2>/dev/null || true
pm2 start npm --name "projeclick-play" -- start
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1
pm2 save
echo -e "${GREEN}OK${NC}"

# Obter IP
IP=$(hostname -I | awk '{print $1}')

# Finalizado
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║          INSTALACAO CONCLUIDA COM SUCESSO!                    ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Acesse seu site:${NC}"
echo -e "   ${YELLOW}http://${IP}${NC}"
echo ""
echo -e "${BLUE}Painel Admin:${NC}"
echo -e "   ${YELLOW}http://${IP}/admin${NC}"
echo -e "   Usuario: ${YELLOW}admin${NC}"
echo -e "   Senha: ${YELLOW}admin123${NC} (sera solicitado trocar no primeiro acesso)"
echo ""
echo -e "${BLUE}Se voce apontou um dominio para este IP:${NC}"
echo -e "   ${YELLOW}http://seu-dominio.com${NC}"
echo -e "   ${YELLOW}http://seu-dominio.com/admin${NC}"
echo ""
echo -e "${BLUE}Comandos uteis:${NC}"
echo "   pm2 status              - Ver status"
echo "   pm2 logs projeclick-play - Ver logs"
echo "   pm2 restart projeclick-play - Reiniciar"
echo ""
echo -e "${PURPLE}O site reiniciara automaticamente se a VPS for reiniciada!${NC}"
echo ""
echo -e "${BLUE}Para configurar Cloudflare Tunnel (HTTPS + protecao):${NC}"
echo "   cd /var/www/projeclick-play"
echo "   chmod +x scripts/setup-cloudflare.sh"
echo "   sudo ./scripts/setup-cloudflare.sh"
echo ""
