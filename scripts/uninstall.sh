#!/bin/bash

# =====================================================
# ProjeClick Play - Script de Desinstalação
# =====================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}"
echo "╔═══════════════════════════════════════════════╗"
echo "║      ProjeClick Play - Desinstalação          ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

read -p "Tem certeza que deseja remover o ProjeClick Play? (s/N): " confirm

if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo "Operação cancelada."
    exit 0
fi

echo -e "${YELLOW}🗑️  Parando e removendo do PM2...${NC}"
pm2 stop projeclick-play 2>/dev/null || true
pm2 delete projeclick-play 2>/dev/null || true
pm2 save

echo -e "${GREEN}✅ ProjeClick Play removido do PM2${NC}"
echo ""
echo "Para remover completamente, delete a pasta do projeto manualmente."
