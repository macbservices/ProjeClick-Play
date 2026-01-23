# ProjeClick Play

Sistema de landing page para aluguel/comodato de aparelhos de streaming com painel administrativo completo.

## Recursos

- Landing page totalmente personalizavel
- Painel admin para editar cores, textos, imagens, logo, favicon
- Sistema de autenticacao com troca obrigatoria de senha no primeiro acesso
- Contador de vagas do projeto piloto
- Secoes: Hero, Ofertas, Hardware (TV Box), Seguranca, Rodape
- Efeitos visuais (particulas ou gradiente)
- Auto-restart apos reinicio da VPS (PM2)

## Instalacao Rapida (Um Comando)

Acesse sua VPS Ubuntu como root e execute:

```bash
curl -fsSL https://raw.githubusercontent.com/macbservices/projeclick-play/main/scripts/install-remote.sh | bash
```

## Instalacao Manual

### 1. Requisitos

- Ubuntu 20.04+ ou Debian 10+
- Acesso root ou sudo
- Minimo 1GB RAM

### 2. Clonar o repositorio

```bash
cd /var/www
git clone https://github.com/macbservices/projeclick-play.git
cd projeclick-play
```

### 3. Executar o instalador

```bash
chmod +x scripts/install.sh
sudo ./scripts/install.sh
```

### 4. Acessar

- **Site:** http://SEU_IP (ou http://seu-dominio.com)
- **Admin:** http://SEU_IP/admin (ou http://seu-dominio.com/admin)
  - Usuario: `admin`
  - Senha: `admin123` (sera solicitado trocar no primeiro acesso)

> O Nginx ja esta configurado como proxy reverso, entao voce acessa diretamente pelo IP ou dominio, sem precisar da porta 3000.

## Comandos Uteis

```bash
# Ver status da aplicacao
pm2 status

# Ver logs em tempo real
pm2 logs projeclick-play

# Reiniciar aplicacao
pm2 restart projeclick-play

# Parar aplicacao
pm2 stop projeclick-play

# Atualizar projeto (apos git pull)
cd /var/www/projeclick-play
git pull
pnpm install
pnpm build
pm2 restart projeclick-play
```

## Atualizacao

Para atualizar o projeto apos modificacoes no GitHub:

```bash
cd /var/www/projeclick-play
chmod +x scripts/update.sh
./scripts/update.sh
```

## Estrutura do Projeto

```
projeclick-play/
├── app/
│   ├── admin/           # Painel administrativo
│   │   ├── page.tsx     # Login
│   │   ├── dashboard/   # Dashboard de configuracoes
│   │   └── alterar-senha/
│   └── page.tsx         # Landing page
├── components/
│   └── landing/         # Componentes da landing page
├── lib/
│   ├── store.ts         # Configuracoes do site
│   └── auth-client.ts   # Autenticacao client-side
├── public/
│   └── images/          # Imagens do site
├── scripts/
│   ├── install.sh       # Instalador local
│   ├── install-remote.sh # Instalador remoto (um comando)
│   ├── update.sh        # Script de atualizacao
│   └── uninstall.sh     # Desinstalador
└── ecosystem.config.js  # Configuracao PM2
```

## Repositorio

O projeto ja esta configurado para o repositorio:
- https://github.com/macbservices/projeclick-play

Para instalar em qualquer VPS Ubuntu, basta executar:

```bash
curl -fsSL https://raw.githubusercontent.com/macbservices/projeclick-play/main/scripts/install-remote.sh | bash
```

## Configurar Dominio

### Opcao 1: Cloudflare Tunnel (Recomendado)

O Cloudflare Tunnel permite acessar seu site sem expor o IP do servidor diretamente, com HTTPS automatico e protecao DDoS.

**Primeira instalacao (requer autorizacao no navegador):**

```bash
cd /var/www/projeclick-play
chmod +x scripts/setup-cloudflare.sh
sudo ./scripts/setup-cloudflare.sh
```

O script vai perguntar:
- **Nome do tunel:** identificador unico (ex: projeclick-play, meu-site)
- **Dominio:** seu dominio configurado no Cloudflare (ex: meusite.com.br)

Depois ele vai:
1. Instalar o cloudflared
2. Abrir um link para autorizacao no navegador (copie e cole no navegador logado no Cloudflare)
3. Criar o tunel
4. Configurar o DNS automaticamente
5. Iniciar como servico (auto-start apos reboot)

**Alterar dominio depois:**

```bash
sudo ./scripts/change-domain.sh
```

Ou com variavel de ambiente:

```bash
NEW_DOMAIN=novo-dominio.com.br sudo -E ./scripts/change-domain.sh
```

**Comandos uteis do Cloudflare Tunnel:**

```bash
# Ver status
systemctl status cloudflared

# Ver logs
journalctl -u cloudflared -f

# Reiniciar
systemctl restart cloudflared

# Parar
systemctl stop cloudflared
```

### Opcao 2: Dominio Direto (sem Cloudflare)

O Nginx ja esta configurado como proxy reverso. Para usar um dominio direto:

1. Aponte seu dominio para o IP da VPS (registro A no DNS)
2. Aguarde a propagacao do DNS (pode levar ate 24h)
3. Acesse pelo dominio: http://seu-dominio.com

Para HTTPS com certificado SSL gratuito, use o Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

## Licenca

MIT License
