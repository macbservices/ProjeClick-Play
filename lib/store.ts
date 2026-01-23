export interface OfertaItem {
  id: string
  titulo: string
  valor: string
  descricao: string
  destaque: boolean
}

export interface SiteConfig {
  // Geral
  nomeSite: string
  slogan: string
  whatsapp: string
  logoUrl: string
  faviconUrl: string

  // Cores
  corPrimaria: string
  corSecundaria: string
  corAcento: string
  corFundo: string
  corTexto: string
  corTextoSecundario: string

  // Hero
  heroTitulo: string
  heroSubtitulo: string
  heroDescricao: string
  heroBotaoTexto: string
  heroBotaoLink: string
  heroImagemFundo: string
  heroEfeito: "particles" | "gradient" | "none"

  // Vagas
  vagasTotal: number
  vagasRestantes: number

  // Ofertas (dinamico)
  ofertas: OfertaItem[]
  
  // Legacy ofertas (para compatibilidade)
  ofertaMes1Titulo?: string
  ofertaMes1Valor?: string
  ofertaMes1Descricao?: string
  ofertaMes2Titulo?: string
  ofertaMes2Valor?: string
  ofertaMes2Descricao?: string
  ofertaMes3Titulo?: string
  ofertaMes3Valor?: string
  ofertaMes3Descricao?: string

  // Hardware/Box
  boxTitulo: string
  boxSubtitulo: string
  boxDescricao: string
  boxImagemUrl: string
  boxEspecificacoes: {
    qualidade: string
    wifi: string
    resolucao: string
    armazenamento: string
  }
  boxRecursos: {
    titulo: string
    descricao: string
  }[]

  // Seguranca
  segurancaTitulo: string
  segurancaSubtitulo: string
  segurancaItens: {
    titulo: string
    descricao: string
  }[]

  // Rodape
  rodapeTexto: string
  rodapeCopyright: string
}

const defaultConfig: SiteConfig = {
  // Geral
  nomeSite: "ProjeClick Play",
  slogan: "A Evolucao do Seu Entretenimento",
  whatsapp: "5511999999999",
  logoUrl: "",
  faviconUrl: "",

  // Cores
  corPrimaria: "#8B5CF6",
  corSecundaria: "#3B82F6",
  corAcento: "#F59E0B",
  corFundo: "#000000",
  corTexto: "#FFFFFF",
  corTextoSecundario: "#9CA3AF",

  // Hero
  heroTitulo: "ProjeClick Play",
  heroSubtitulo: "A Evolucao do Seu Entretenimento",
  heroDescricao: "Hardware de elite em regime de comodato com performance de servidor proprio. Estabilidade maxima, sem intermediarios.",
  heroBotaoTexto: "Garantir Vaga via Video-Chamada",
  heroBotaoLink: "https://wa.me/5511999999999",
  heroImagemFundo: "/images/tvbox-bg.jpg",
  heroEfeito: "particles",

  // Vagas
  vagasTotal: 15,
  vagasRestantes: 7,

  // Ofertas (dinamico)
  ofertas: [
    { id: "1", titulo: "Mes 1", valor: "R$ 100", descricao: "Ativacao + Caucao", destaque: false },
    { id: "2", titulo: "Mes 2", valor: "R$ 0", descricao: "Bonus Reembolsavel", destaque: true },
    { id: "3", titulo: "Mes 3+", valor: "R$ 50", descricao: "Valor mensal fixo", destaque: false },
  ],

  // Hardware/Box
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

  // Seguranca
  segurancaTitulo: "Seguranca Premium",
  segurancaSubtitulo: "em Primeiro Lugar",
  segurancaItens: [
    { titulo: "Servidor Proprio", descricao: "Infraestrutura dedicada para maxima estabilidade" },
    { titulo: "Sem Intermediarios", descricao: "Conexao direta, sem dependencia de terceiros" },
    { titulo: "Suporte 24/7", descricao: "Assistencia tecnica disponivel a qualquer momento" },
    { titulo: "Garantia Total", descricao: "Cobertura completa do equipamento em comodato" },
  ],

  // Rodape
  rodapeTexto: "A Evolucao do Seu Entretenimento",
  rodapeCopyright: "© 2026 ProjeClick Play. Todos os direitos reservados.",
}

// Funcao para migrar config legacy para novo formato
function migrateConfig(config: Partial<SiteConfig>): SiteConfig {
  const result = { ...defaultConfig, ...config }
  
  // Se nao tem ofertas mas tem campos legacy, migrar
  if (!result.ofertas || result.ofertas.length === 0) {
    if (config.ofertaMes1Titulo || config.ofertaMes2Titulo || config.ofertaMes3Titulo) {
      result.ofertas = [
        { 
          id: "1", 
          titulo: config.ofertaMes1Titulo || "Mes 1", 
          valor: config.ofertaMes1Valor || "R$ 100", 
          descricao: config.ofertaMes1Descricao || "Ativacao + Caucao", 
          destaque: false 
        },
        { 
          id: "2", 
          titulo: config.ofertaMes2Titulo || "Mes 2", 
          valor: config.ofertaMes2Valor || "R$ 0", 
          descricao: config.ofertaMes2Descricao || "Bonus Reembolsavel", 
          destaque: true 
        },
        { 
          id: "3", 
          titulo: config.ofertaMes3Titulo || "Mes 3+", 
          valor: config.ofertaMes3Valor || "R$ 50", 
          descricao: config.ofertaMes3Descricao || "Valor mensal fixo", 
          destaque: false 
        },
      ]
    }
  }
  
  return result
}

// Funcao para carregar config do SERVIDOR (VPS)
// Sempre busca da API para garantir dados atualizados em qualquer VPS
export async function fetchConfig(): Promise<SiteConfig> {
  try {
    const response = await fetch("/api/config", {
      cache: "no-store", // Sempre busca dados frescos do servidor
    })
    if (response.ok) {
      const data = await response.json()
      return migrateConfig(data)
    }
  } catch (error) {
    console.error("Erro ao carregar config do servidor:", error)
  }
  return defaultConfig
}

// Funcao para salvar config no SERVIDOR (VPS)
// Salva no arquivo do servidor via API
export async function saveConfig(config: Partial<SiteConfig>): Promise<boolean> {
  const fullConfig = { ...defaultConfig, ...config }
  
  try {
    const response = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullConfig),
    })
    const data = await response.json()
    
    if (!data.success) {
      console.error("Erro ao salvar config:", data.error)
      return false
    }
    
    return true
  } catch (error) {
    console.error("Erro ao salvar config no servidor:", error)
    return false
  }
}

// Funcao sincrona para uso inicial (retorna default, depois atualiza via fetchConfig)
export function getConfig(): SiteConfig {
  return defaultConfig
}

// Reset config no servidor
export async function resetConfig(): Promise<boolean> {
  return saveConfig(defaultConfig)
}

export { defaultConfig }
