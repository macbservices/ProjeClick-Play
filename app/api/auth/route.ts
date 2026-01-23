import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const AUTH_FILE = path.join(process.cwd(), "data", "auth.json")
const DATA_DIR = path.join(process.cwd(), "data")

const defaultAuth = {
  usuario: "admin",
  senha: "admin123",
  primeiroAcesso: true,
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadAuth() {
  ensureDataDir()
  
  if (fs.existsSync(AUTH_FILE)) {
    try {
      const data = fs.readFileSync(AUTH_FILE, "utf-8")
      return JSON.parse(data)
    } catch {
      return defaultAuth
    }
  }
  return defaultAuth
}

function saveAuth(auth: typeof defaultAuth) {
  ensureDataDir()
  fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2), "utf-8")
}

// POST - Login ou alterar senha
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, usuario, senha, novaSenha } = body
    const auth = loadAuth()

    if (action === "login") {
      if (usuario === auth.usuario && senha === auth.senha) {
        return NextResponse.json({ 
          success: true, 
          primeiroAcesso: auth.primeiroAcesso 
        })
      }
      return NextResponse.json({ success: false, message: "Usuario ou senha invalidos" })
    }

    if (action === "alterar-senha") {
      if (novaSenha && novaSenha.length >= 6) {
        auth.senha = novaSenha
        auth.primeiroAcesso = false
        saveAuth(auth)
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ success: false, message: "Senha deve ter pelo menos 6 caracteres" })
    }

    return NextResponse.json({ success: false, message: "Acao invalida" })
  } catch (error) {
    console.error("Erro na autenticacao:", error)
    return NextResponse.json({ success: false, error: "Erro no servidor" }, { status: 500 })
  }
}
