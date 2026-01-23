#!/bin/bash

# =====================================================
# ProjeClick Play - Script de Atualização
# =====================================================
# Use este script para atualizar o projeto na VPS
# =====================================================

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║        ProjeClick Play - Atualização          ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto"
    exit 1
fi

echo -e "${YELLOW}📥 Baixando atualizacoes...${NC}"
# Salvar dados locais antes de atualizar
if [ -d "data" ]; then
    cp -r data /tmp/projeclick-data-backup 2>/dev/null || true
    echo -e "${YELLOW}   Backup dos dados locais criado${NC}"
fi

# Forcar reset para o branch remoto (resolve conflitos de branches divergentes)
git fetch origin main 2>/dev/null || echo "Git nao configurado, pulando fetch"
git reset --hard origin/main 2>/dev/null || echo "Nao foi possivel atualizar via git"

# Restaurar dados locais
if [ -d "/tmp/projeclick-data-backup" ]; then
    mkdir -p data
    cp -r /tmp/projeclick-data-backup/* data/ 2>/dev/null || true
    rm -rf /tmp/projeclick-data-backup
    echo -e "${GREEN}   Dados locais restaurados${NC}"
fi

echo -e "${YELLOW}📦 Atualizando dependências...${NC}"
pnpm install

echo -e "${YELLOW}🔨 Fazendo build...${NC}"
pnpm build

echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
pm2 reload projeclick-play || pm2 restart projeclick-play

echo -e "${GREEN}✅ Atualização concluída!${NC}"
pm2 status
