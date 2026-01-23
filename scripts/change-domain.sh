#!/bin/bash

#===============================================================================
#  ProjeClick Play - Alterar Dominio do Cloudflare Tunnel
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
INSTALL_DIR="/var/www/projeclick-play"
CLOUDFLARED_DIR="/root/.cloudflared"
CONFIG_FILE="$INSTALL_DIR/cloudflare-config.txt"

# Verificar se esta rodando como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Este script precisa ser executado como root (sudo)${NC}"
    exit 1
fi

# Banner
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                               ║${NC}"
echo -e "${PURPLE}║        ProjeClick Play - Alterar Dominio                      ║${NC}"
echo -e "${PURPLE}║                                                               ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Carregar configuracoes existentes
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Arquivo de configuracao nao encontrado!${NC}"
    echo -e "${YELLOW}Execute primeiro o setup-cloudflare.sh${NC}"
    exit 1
fi

source "$CONFIG_FILE"

echo -e "${BLUE}Configuracao atual:${NC}"
echo -e "   Tunel:   ${YELLOW}$TUNNEL_NAME${NC}"
echo -e "   Dominio: ${YELLOW}$DOMAIN${NC}"
echo ""

# Perguntar novo dominio
if [ -z "$NEW_DOMAIN" ]; then
    echo -e "${CYAN}Digite o novo dominio:${NC}"
    read -p "   Novo dominio: " NEW_DOMAIN
fi

if [ -z "$NEW_DOMAIN" ]; then
    echo -e "${RED}Dominio nao pode ser vazio!${NC}"
    exit 1
fi

if [ "$NEW_DOMAIN" = "$DOMAIN" ]; then
    echo -e "${YELLOW}O novo dominio e igual ao atual. Nada a fazer.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Alterando de ${YELLOW}$DOMAIN${BLUE} para ${YELLOW}$NEW_DOMAIN${NC}"
echo ""

# Confirmar
read -p "Confirma a alteracao? (s/n): " CONFIRM
if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo -e "${YELLOW}Operacao cancelada.${NC}"
    exit 0
fi

echo ""

# Passo 1: Remover rota DNS antiga
echo -e "${BLUE}[1/4]${NC} Removendo rota DNS antiga..."
cloudflared tunnel route dns --remove "$TUNNEL_ID" "$DOMAIN" 2>/dev/null || true
echo -e "${GREEN}OK${NC}"

# Passo 2: Adicionar nova rota DNS
echo -e "${BLUE}[2/4]${NC} Configurando nova rota DNS..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$NEW_DOMAIN"
echo -e "${GREEN}OK${NC}"

# Passo 3: Atualizar arquivo de configuracao
echo -e "${BLUE}[3/4]${NC} Atualizando configuracao..."

cat > "$CLOUDFLARED_DIR/config.yml" << EOF
tunnel: $TUNNEL_ID
credentials-file: $CLOUDFLARED_DIR/$TUNNEL_ID.json

ingress:
  - hostname: $NEW_DOMAIN
    service: http://localhost:$LOCAL_PORT
  - service: http_status:404
EOF

# Atualizar arquivo de config
cat > "$CONFIG_FILE" << EOF
TUNNEL_NAME=$TUNNEL_NAME
TUNNEL_ID=$TUNNEL_ID
DOMAIN=$NEW_DOMAIN
LOCAL_PORT=$LOCAL_PORT
EOF

echo -e "${GREEN}OK${NC}"

# Passo 4: Reiniciar servico
echo -e "${BLUE}[4/4]${NC} Reiniciando servico..."
systemctl restart cloudflared
sleep 3

if systemctl is-active --quiet cloudflared; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}Falha ao reiniciar servico${NC}"
    echo -e "${YELLOW}Verifique: journalctl -u cloudflared -f${NC}"
fi

# Resultado
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║          Dominio alterado com sucesso!                        ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Novo dominio:${NC} ${CYAN}https://$NEW_DOMAIN${NC}"
echo -e "${BLUE}Admin:${NC}        ${CYAN}https://$NEW_DOMAIN/admin${NC}"
echo ""
