#!/bin/bash

# =====================================================
# ProjeClick Play - Script de Instalação para VPS
# =====================================================
# Este script instala e configura o ProjeClick Play
# com auto-restart automático após reinício da VPS
# =====================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║                                               ║"
echo "║          ProjeClick Play Installer            ║"
echo "║                                               ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Executando sem privilégios de root. Algumas operações podem falhar.${NC}"
    echo -e "${YELLOW}   Para instalar com todas as funcionalidades, execute: sudo ./install.sh${NC}"
    echo ""
fi

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Detectar o gerenciador de pacotes
detect_package_manager() {
    if command_exists apt-get; then
        PKG_MANAGER="apt-get"
        PKG_UPDATE="apt-get update"
        PKG_INSTALL="apt-get install -y"
    elif command_exists dnf; then
        PKG_MANAGER="dnf"
        PKG_UPDATE="dnf check-update || true"
        PKG_INSTALL="dnf install -y"
    elif command_exists yum; then
        PKG_MANAGER="yum"
        PKG_UPDATE="yum check-update || true"
        PKG_INSTALL="yum install -y"
    else
        echo -e "${RED}❌ Gerenciador de pacotes não suportado${NC}"
        exit 1
    fi
}

# Instalar Node.js se nao existir ou se versao for antiga
install_nodejs() {
    NEED_INSTALL=false
    
    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            echo -e "${YELLOW}Node.js versao $(node -v) detectada. Versao 18+ necessaria.${NC}"
            echo -e "${YELLOW}Removendo TODOS os pacotes antigos do Node.js...${NC}"
            # Remover TODOS os pacotes relacionados ao Node.js antigo
            sudo apt-get remove -y --purge nodejs nodejs-doc libnode-dev libnode72 npm 2>/dev/null || true
            sudo apt-get autoremove -y 2>/dev/null || true
            # Limpar arquivos residuais
            sudo rm -rf /usr/local/lib/node_modules 2>/dev/null || true
            sudo rm -rf /usr/local/bin/node /usr/local/bin/npm /usr/local/bin/npx 2>/dev/null || true
            sudo rm -rf /usr/bin/node /usr/bin/npm /usr/bin/npx 2>/dev/null || true
            sudo rm -rf /usr/include/node 2>/dev/null || true
            sudo rm -f /etc/apt/sources.list.d/nodesource.list 2>/dev/null || true
            sudo rm -f /etc/apt/keyrings/nodesource.gpg 2>/dev/null || true
            sudo apt-get update -qq
            hash -r
            NEED_INSTALL=true
        else
            echo -e "${GREEN}Node.js $(node -v) OK${NC}"
        fi
    else
        NEED_INSTALL=true
    fi
    
    if [ "$NEED_INSTALL" = true ]; then
        echo -e "${YELLOW}Instalando Node.js 20...${NC}"
        if [ "$PKG_MANAGER" = "apt-get" ]; then
            # Instalar Node.js 20 via NodeSource
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        else
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo $PKG_INSTALL nodejs
        fi
        hash -r
        echo -e "${GREEN}Node.js $(node -v) instalado com sucesso${NC}"
    fi
}

# Instalar pnpm se não existir
install_pnpm() {
    if command_exists pnpm; then
        echo -e "${GREEN}✅ pnpm já instalado${NC}"
    else
        echo -e "${YELLOW}📦 Instalando pnpm...${NC}"
        npm install -g pnpm
        echo -e "${GREEN}✅ pnpm instalado com sucesso${NC}"
    fi
}

# Instalar PM2 globalmente
install_pm2() {
    if command_exists pm2; then
        echo -e "${GREEN}✅ PM2 já instalado${NC}"
    else
        echo -e "${YELLOW}📦 Instalando PM2...${NC}"
        npm install -g pm2
        echo -e "${GREEN}✅ PM2 instalado com sucesso${NC}"
    fi
}

# Instalar e configurar Nginx
install_nginx() {
    if command_exists nginx; then
        echo -e "${GREEN}✅ Nginx já instalado${NC}"
    else
        echo -e "${YELLOW}📦 Instalando Nginx...${NC}"
        sudo $PKG_INSTALL nginx
        echo -e "${GREEN}✅ Nginx instalado com sucesso${NC}"
    fi
    
    # Configurar Nginx como proxy reverso
    echo -e "${YELLOW}⚙️  Configurando Nginx...${NC}"
    
    sudo tee /etc/nginx/sites-available/projeclick-play > /dev/null <<EOF
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

    # Remover configuração default e ativar a nova
    sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    sudo ln -sf /etc/nginx/sites-available/projeclick-play /etc/nginx/sites-enabled/
    
    # Testar configuração
    sudo nginx -t
    
    # Reiniciar Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    echo -e "${GREEN}✅ Nginx configurado como proxy reverso${NC}"
}

# Instalar dependências do projeto
install_dependencies() {
    echo -e "${YELLOW}📦 Instalando dependências do projeto...${NC}"
    pnpm install
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
}

# Criar pasta de dados
create_data_folder() {
    echo -e "${YELLOW}📁 Criando pasta de dados...${NC}"
    mkdir -p data
    chmod 755 data
    echo -e "${GREEN}✅ Pasta de dados criada${NC}"
}

# Build do projeto
build_project() {
    echo -e "${YELLOW}🔨 Fazendo build do projeto...${NC}"
    pnpm build
    echo -e "${GREEN}✅ Build concluído${NC}"
}

# Configurar PM2 para auto-start
setup_pm2() {
    echo -e "${YELLOW}⚙️  Configurando PM2...${NC}"
    
    # Parar instância anterior se existir
    pm2 delete projeclick-play 2>/dev/null || true
    
    # Iniciar aplicação com PM2
    pm2 start npm --name "projeclick-play" -- start
    
    # Salvar configuração do PM2
    pm2 save
    
    # Configurar PM2 para iniciar no boot
    echo -e "${YELLOW}⚙️  Configurando auto-start no boot...${NC}"
    pm2 startup 2>/dev/null || sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
    pm2 save
    
    echo -e "${GREEN}✅ PM2 configurado para auto-start${NC}"
}

# Exibir status
show_status() {
    SERVER_IP=$(hostname -I | awk '{print $1}')
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                               ║${NC}"
    echo -e "${GREEN}║    ProjeClick Play instalado com sucesso!     ║${NC}"
    echo -e "${GREEN}║                                               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Status da aplicacao:${NC}"
    pm2 status
    echo ""
    echo -e "${BLUE}Acesse o site:${NC} http://$SERVER_IP"
    echo -e "${BLUE}Painel Admin:${NC} http://$SERVER_IP/admin"
    echo -e "${BLUE}Login padrao:${NC} admin / admin123"
    echo ""
    echo -e "${YELLOW}Comandos uteis:${NC}"
    echo "   Ver logs: pm2 logs projeclick-play"
    echo "   Reiniciar: pm2 restart projeclick-play"
    echo "   Parar: pm2 stop projeclick-play"
    echo "   Status: pm2 status"
    echo ""
    echo -e "${YELLOW}Se voce apontou um dominio para este IP, acesse:${NC}"
    echo "   http://seu-dominio.com"
    echo "   http://seu-dominio.com/admin"
    echo ""
    echo -e "${YELLOW}Para configurar Cloudflare Tunnel (HTTPS + protecao DDoS):${NC}"
    echo "   chmod +x scripts/setup-cloudflare.sh"
    echo "   sudo ./scripts/setup-cloudflare.sh"
    echo ""
}

# Executar instalação
main() {
    detect_package_manager
    
    echo -e "${YELLOW}Atualizando sistema...${NC}"
    sudo $PKG_UPDATE || true
    
    install_nodejs
    install_pnpm
    install_pm2
    install_nginx
    install_dependencies
    create_data_folder
    build_project
    setup_pm2
    show_status
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na pasta raiz do projeto${NC}"
    echo -e "${YELLOW}   cd /caminho/para/projeclick-play && ./scripts/install.sh${NC}"
    exit 1
fi

main
