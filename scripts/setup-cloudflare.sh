#!/bin/bash

#===============================================================================
#  ProjeClick Play - Configuracao do Cloudflare Tunnel
#===============================================================================
#  Este script configura um tunel Cloudflare para acessar o site
#  sem expor o IP do servidor diretamente.
#===============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variaveis
LOCAL_PORT="${LOCAL_PORT:-3000}"
INSTALL_DIR="/var/www/projeclick-play"
CLOUDFLARED_DIR="/root/.cloudflared"

# Verificar se esta rodando como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Este script precisa ser executado como root (sudo)${NC}"
    exit 1
fi

# Banner
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                               ║${NC}"
echo -e "${PURPLE}║        ProjeClick Play - Cloudflare Tunnel Setup              ║${NC}"
echo -e "${PURPLE}║                                                               ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Funcao para perguntar dados
ask_tunnel_info() {
    echo -e "${CYAN}Por favor, informe os dados para configurar o tunel:${NC}"
    echo ""
    
    # Nome do tunel
    echo -e "${YELLOW}1. Nome do Tunel${NC}"
    echo -e "   (Identificador unico para este tunel no Cloudflare)"
    echo -e "   Exemplo: projeclick-play, meu-site, servidor-1"
    echo ""
    read -p "   Digite o nome do tunel: " TUNNEL_NAME
    
    if [ -z "$TUNNEL_NAME" ]; then
        echo -e "${RED}Nome do tunel nao pode ser vazio!${NC}"
        exit 1
    fi
    
    echo ""
    
    # Dominio
    echo -e "${YELLOW}2. Dominio${NC}"
    echo -e "   (O dominio que voce configurou no Cloudflare)"
    echo -e "   Exemplo: meusite.com.br, play.meudominio.com"
    echo ""
    read -p "   Digite o dominio: " DOMAIN
    
    if [ -z "$DOMAIN" ]; then
        echo -e "${RED}Dominio nao pode ser vazio!${NC}"
        exit 1
    fi
    
    echo ""
    
    # Confirmar
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Confirme as informacoes:${NC}"
    echo -e "   Nome do Tunel: ${YELLOW}$TUNNEL_NAME${NC}"
    echo -e "   Dominio:       ${YELLOW}$DOMAIN${NC}"
    echo -e "   Porta Local:   ${YELLOW}$LOCAL_PORT${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    read -p "As informacoes estao corretas? (s/n): " CONFIRM
    
    if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
        echo -e "${YELLOW}Configuracao cancelada. Execute novamente.${NC}"
        exit 0
    fi
}

# Instalar cloudflared
install_cloudflared() {
    echo ""
    echo -e "${BLUE}[1/6]${NC} Verificando cloudflared..."
    
    if command -v cloudflared &> /dev/null; then
        echo -e "${GREEN}cloudflared ja esta instalado${NC}"
    else
        echo -e "${YELLOW}Instalando cloudflared...${NC}"
        
        # Detectar arquitetura
        ARCH=$(uname -m)
        if [ "$ARCH" = "x86_64" ]; then
            CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
        elif [ "$ARCH" = "aarch64" ]; then
            CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb"
        else
            echo -e "${RED}Arquitetura nao suportada: $ARCH${NC}"
            exit 1
        fi
        
        curl -L --output /tmp/cloudflared.deb "$CLOUDFLARED_URL"
        dpkg -i /tmp/cloudflared.deb
        rm /tmp/cloudflared.deb
        
        echo -e "${GREEN}cloudflared instalado com sucesso${NC}"
    fi
}

# Autenticar no Cloudflare
authenticate_cloudflare() {
    echo ""
    echo -e "${BLUE}[2/6]${NC} Autenticando no Cloudflare..."
    
    if [ -f "$CLOUDFLARED_DIR/cert.pem" ]; then
        echo -e "${GREEN}Certificado ja existe${NC}"
        read -p "Deseja usar o certificado existente? (s/n): " USE_EXISTING
        
        if [ "$USE_EXISTING" = "s" ] || [ "$USE_EXISTING" = "S" ]; then
            echo -e "${GREEN}Usando certificado existente${NC}"
            return
        else
            rm -f "$CLOUDFLARED_DIR/cert.pem"
        fi
    fi
    
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  ATENCAO: Uma URL sera exibida abaixo.${NC}"
    echo -e "${YELLOW}  Copie e cole no navegador para autorizar o tunel.${NC}"
    echo -e "${YELLOW}  Voce precisa estar logado na sua conta Cloudflare.${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    read -p "Pressione ENTER para continuar..."
    echo ""
    
    cloudflared tunnel login
    
    if [ ! -f "$CLOUDFLARED_DIR/cert.pem" ]; then
        echo -e "${RED}Falha na autenticacao. Certificado nao encontrado.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Autenticacao concluida com sucesso${NC}"
}

# Criar tunel
create_tunnel() {
    echo ""
    echo -e "${BLUE}[3/6]${NC} Criando tunel '$TUNNEL_NAME'..."
    
    # Verificar se tunel ja existe
    EXISTING_TUNNEL=$(cloudflared tunnel list | grep -w "$TUNNEL_NAME" || true)
    
    if [ -n "$EXISTING_TUNNEL" ]; then
        echo -e "${YELLOW}Tunel '$TUNNEL_NAME' ja existe${NC}"
        TUNNEL_ID=$(echo "$EXISTING_TUNNEL" | awk '{print $1}')
        echo -e "${GREEN}Usando tunel existente: $TUNNEL_ID${NC}"
    else
        # Criar novo tunel
        cloudflared tunnel create "$TUNNEL_NAME"
        TUNNEL_ID=$(cloudflared tunnel list | grep -w "$TUNNEL_NAME" | awk '{print $1}')
        echo -e "${GREEN}Tunel criado: $TUNNEL_ID${NC}"
    fi
    
    if [ -z "$TUNNEL_ID" ]; then
        echo -e "${RED}Falha ao obter ID do tunel${NC}"
        exit 1
    fi
}

# Configurar DNS
configure_dns() {
    echo ""
    echo -e "${BLUE}[4/6]${NC} Configurando DNS para '$DOMAIN'..."
    
    # Verificar se rota ja existe
    EXISTING_ROUTE=$(cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN" 2>&1 || true)
    
    if echo "$EXISTING_ROUTE" | grep -q "already exists"; then
        echo -e "${YELLOW}Rota DNS ja existe para $DOMAIN${NC}"
    else
        echo -e "${GREEN}Rota DNS configurada para $DOMAIN${NC}"
    fi
}

# Criar arquivo de configuracao
create_config() {
    echo ""
    echo -e "${BLUE}[5/6]${NC} Criando arquivo de configuracao..."
    
    mkdir -p "$CLOUDFLARED_DIR"
    
    cat > "$CLOUDFLARED_DIR/config.yml" << EOF
tunnel: $TUNNEL_ID
credentials-file: $CLOUDFLARED_DIR/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:$LOCAL_PORT
  - service: http_status:404
EOF

    echo -e "${GREEN}Arquivo de configuracao criado${NC}"
}

# Configurar servico systemd
setup_service() {
    echo ""
    echo -e "${BLUE}[6/6]${NC} Configurando servico systemd..."
    
    # Parar servico existente se houver
    systemctl stop cloudflared 2>/dev/null || true
    
    # Criar servico
    cat > /etc/systemd/system/cloudflared.service << EOF
[Unit]
Description=Cloudflare Tunnel - ProjeClick Play
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/cloudflared tunnel --config $CLOUDFLARED_DIR/config.yml run
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    # Recarregar e iniciar servico
    systemctl daemon-reload
    systemctl enable cloudflared
    systemctl start cloudflared
    
    sleep 3
    
    if systemctl is-active --quiet cloudflared; then
        echo -e "${GREEN}Servico cloudflared iniciado com sucesso${NC}"
    else
        echo -e "${RED}Falha ao iniciar servico cloudflared${NC}"
        echo -e "${YELLOW}Verifique os logs: journalctl -u cloudflared -f${NC}"
    fi
}

# Salvar configuracoes
save_config() {
    # Salvar configuracoes para uso futuro
    cat > "$INSTALL_DIR/cloudflare-config.txt" << EOF
TUNNEL_NAME=$TUNNEL_NAME
TUNNEL_ID=$TUNNEL_ID
DOMAIN=$DOMAIN
LOCAL_PORT=$LOCAL_PORT
EOF
    echo -e "${GREEN}Configuracoes salvas em $INSTALL_DIR/cloudflare-config.txt${NC}"
}

# Exibir resultado
show_result() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}║     Cloudflare Tunnel configurado com sucesso!                ║${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Informacoes do Tunel:${NC}"
    echo -e "   Nome:     ${YELLOW}$TUNNEL_NAME${NC}"
    echo -e "   ID:       ${YELLOW}$TUNNEL_ID${NC}"
    echo -e "   Dominio:  ${YELLOW}$DOMAIN${NC}"
    echo ""
    echo -e "${BLUE}Acesse seu site:${NC}"
    echo -e "   ${CYAN}https://$DOMAIN${NC}"
    echo -e "   ${CYAN}https://$DOMAIN/admin${NC}"
    echo ""
    echo -e "${BLUE}Comandos uteis:${NC}"
    echo "   Ver status:    systemctl status cloudflared"
    echo "   Ver logs:      journalctl -u cloudflared -f"
    echo "   Reiniciar:     systemctl restart cloudflared"
    echo "   Parar:         systemctl stop cloudflared"
    echo ""
    echo -e "${PURPLE}O tunel reiniciara automaticamente se a VPS for reiniciada!${NC}"
    echo ""
}

# Main
main() {
    ask_tunnel_info
    install_cloudflared
    authenticate_cloudflare
    create_tunnel
    configure_dns
    create_config
    setup_service
    save_config
    show_result
}

main
