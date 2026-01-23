"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { verificarCredenciais } from "@/lib/auth-client"

export default function AdminPage() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    setErro("")
    setCarregando(true)
    
    const resultado = verificarCredenciais(usuario, senha)
    
    if (resultado.valido) {
      localStorage.setItem("projeclick-admin-auth", "true")
      
      if (resultado.primeiroAcesso) {
        router.push("/admin/alterar-senha")
      } else {
        router.push("/admin/dashboard")
      }
    } else {
      setErro("Usuário ou senha inválidos")
    }
    setCarregando(false)
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/10" />
      
      <Card className="w-full max-w-md bg-gray-900/80 border-gray-800 relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ProjeClick Play
          </CardTitle>
          <p className="text-gray-400 text-sm">Painel Administrativo</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-gray-300">Usuário</Label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Digite seu usuário"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-gray-300">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Digite sua senha"
              />
            </div>
            {erro && <p className="text-red-400 text-sm">{erro}</p>}
            <Button 
              type="submit" 
              disabled={carregando}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {carregando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-gray-400 hover:text-purple-400 transition-colors text-sm inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao site
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
