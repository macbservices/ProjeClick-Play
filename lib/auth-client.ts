const STORAGE_KEY = "projeclick-auth"

interface AuthData {
  usuario: string
  senha: string
  primeiroAcesso: boolean
}

const DEFAULT_AUTH: AuthData = {
  usuario: "admin",
  senha: "admin123",
  primeiroAcesso: true,
}

export function getAuthData(): AuthData {
  if (typeof window === "undefined") return DEFAULT_AUTH
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_AUTH))
    return DEFAULT_AUTH
  }
  return JSON.parse(stored)
}

export function saveAuthData(data: AuthData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function verificarCredenciais(usuario: string, senha: string): { valido: boolean; primeiroAcesso: boolean } {
  const auth = getAuthData()
  if (auth.usuario === usuario && auth.senha === senha) {
    return { valido: true, primeiroAcesso: auth.primeiroAcesso }
  }
  return { valido: false, primeiroAcesso: false }
}

export function alterarSenha(novaSenha: string): boolean {
  const auth = getAuthData()
  auth.senha = novaSenha
  auth.primeiroAcesso = false
  saveAuthData(auth)
  return true
}

export function isAutenticado(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("projeclick-admin-auth") === "true"
}

export function logout(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("projeclick-admin-auth")
}
