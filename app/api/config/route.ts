import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const CONFIG_FILE = path.join(process.cwd(), "data", "site-config.json")
const DATA_DIR = path.join(process.cwd(), "data")

// Configuracao padrao
const defaultConfig = {
  nomeSite: "ProjeClick Play",
  slogan: "A Evolucao do Seu Entretenimento",
  whatsapp: "5511999999999",
  logoUrl: "",
  faviconUrl: "",
  corPrimaria: "#8B5CF6",
  corSecundaria: "#3B82F6",
  corAcento: "#F59E0B",
  corFundo: "#000000",
  corTexto: "#FFFFFF",
  corTextoSecundario: "#9CA3AF",
  heroTitulo: "ProjeClick Play",
  heroSubtitulo: "A Evolucao do Seu Entretenimento",
  heroDescricao: "Hardware de elite em regime de comodato com performance de servidor proprio. Estabilidade maxima, sem intermediarios.",
  heroBotaoTexto: "Garantir Vaga via Video-Chamada",
  heroBotaoLink: "https://wa.me/5511999999999",
  heroImagemFundo: "/images/tvbox-bg.jpg",
  heroEfeito: "particles",
  vagasTotal: 15,
  vagasRestantes: 7,
  ofertas: [
    { id: "1", titulo: "Mes 1", valor: "R$ 100", descricao: "Ativacao + Caucao", destaque: false },
    { id: "2", titulo: "Mes 2", valor: "R$ 0", descricao: "Bonus Reembolsavel", destaque: true },
    { id: "3", titulo: "Mes 3+", valor: "R$ 50", descricao: "Valor mensal fixo", destaque: false },
  ],
  boxTitulo: "ProjeClick Play Box",
  boxSubtitulo: "MXQ Pro 4K",
  boxDescricao: "O cliente nao compra o aparelho - ele recebe em regime de comodato. Tecnologia de ponta em um design compacto",
  boxImagemUrl: "/images/mxq-box.jpg",
  boxEspecificacoes: {
    qualidade: "4K",
    wifi: "5G Wi-Fi",
    resolucao: "Ultra HD",
    armazenamento: "64GB",
  },
  boxRecursos: [
    { titulo: "Hardware Premium", descricao: "Equipamento de alta performance" },
    { titulo: "Conexao Estavel", descricao: "Sinal direto sem intermediarios" },
    { titulo: "Seguranca Total", descricao: "Sistema anti-bloqueio integrado" },
    { titulo: "Alta Velocidade", descricao: "Streaming sem travamentos" },
  ],
  segurancaTitulo: "Seguranca Premium",
  segurancaSubtitulo: "em Primeiro Lugar",
  segurancaItens: [
    { titulo: "Servidor Proprio", descricao: "Infraestrutura dedicada para maxima estabilidade" },
    { titulo: "Sem Intermediarios", descricao: "Conexao direta, sem dependencia de terceiros" },
    { titulo: "Suporte 24/7", descricao: "Assistencia tecnica disponivel a qualquer momento" },
    { titulo: "Garantia Total", descricao: "Cobertura completa do equipamento em comodato" },
  ],
  rodapeTexto: "A Evolucao do Seu Entretenimento",
  rodapeCopyright: "© 2026 ProjeClick Play. Todos os direitos reservados.",
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadConfig() {
  ensureDataDir()
  
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8")
      return { ...defaultConfig, ...JSON.parse(data) }
    } catch {
      return defaultConfig
    }
  }
  return defaultConfig
}

function saveConfigToFile(config: Record<string, unknown>) {
  ensureDataDir()
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8")
}

// GET - Carregar configuracoes
export async function GET() {
  try {
    const config = loadConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Erro ao carregar config:", error)
    return NextResponse.json(defaultConfig)
  }
}

// POST - Salvar configuracoes
export async function POST(request: Request) {
  try {
    const newConfig = await request.json()
    const currentConfig = loadConfig()
    const updatedConfig = { ...currentConfig, ...newConfig }
    
    saveConfigToFile(updatedConfig)
    
    return NextResponse.json({ success: true, config: updatedConfig })
  } catch (error) {
    console.error("Erro ao salvar config:", error)
    return NextResponse.json({ success: false, error: "Erro ao salvar configuracoes" }, { status: 500 })
  }
}
