"use client"

import type { FormEvent } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Shield } from "lucide-react"
import { alterarSenha, getAuthData } from "@/lib/auth-client"

export default function AlterarSenhaPage() {
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem("projeclick-admin-auth")
    if (!auth) {
      router.push("/admin")
    }
  }, [router])

  const handleAlterarSenha = (e: FormEvent) => {
    e.preventDefault()
    setErro("")

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem")
      return
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres")
      return
    }

    const authData = getAuthData()
    if (novaSenha === authData.senha) {
      setErro("A nova senha deve ser diferente da senha atual")
      return
    }

    setCarregando(true)
    
    alterarSenha(novaSenha)
    router.push("/admin/dashboard")
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/10" />

      <Card className="w-full max-w-md bg-gray-900/80 border-gray-800 relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Alterar Senha
          </CardTitle>
          <CardDescription className="text-gray-400">
            Por seguranca, altere sua senha no primeiro acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAlterarSenha} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="novaSenha" className="text-gray-300">
                Nova Senha
              </Label>
              <Input
                id="novaSenha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Digite a nova senha"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-gray-300">
                Confirmar Nova Senha
              </Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Confirme a nova senha"
                required
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
                  Alterando...
                </>
              ) : (
                "Alterar Senha e Continuar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
