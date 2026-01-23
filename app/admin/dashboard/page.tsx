"use client"

import { useState, useEffect, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, Save, Upload, RefreshCw, Plus, Trash2, Star, GripVertical } from "lucide-react"
import { fetchConfig, saveConfig, type SiteConfig, defaultConfig, type OfertaItem } from "@/lib/store"
import { alterarSenha, getAuthData } from "@/lib/auth-client"

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [mensagemTipo, setMensagemTipo] = useState<"success" | "error">("success")
  
  // Seguranca
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [erroSenha, setErroSenha] = useState("")

  useEffect(() => {
    const auth = localStorage.getItem("projeclick-admin-auth")
    if (!auth) {
      router.push("/admin")
    } else {
      setIsAuthenticated(true)
      // Carrega a config do servidor
      fetchConfig().then(setConfig)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("projeclick-admin-auth")
    router.push("/admin")
  }

  const handleSave = async () => {
    if (!config) return
    setSalvando(true)
    setMensagem("")
    
    try {
      const success = await saveConfig(config)
      if (success) {
        setMensagemTipo("success")
        setMensagem("Configuracoes salvas com sucesso no servidor!")
      } else {
        setMensagemTipo("error")
        setMensagem("Erro ao salvar configuracoes. Verifique as permissoes do servidor.")
      }
    } catch (error) {
      setMensagemTipo("error")
      setMensagem("Erro de conexao com o servidor. Tente novamente.")
      console.error("Erro ao salvar:", error)
    }
    
    setTimeout(() => {
      setMensagem("")
      setSalvando(false)
    }, 3000)
  }

  const handleReset = async () => {
    if (confirm("Tem certeza que deseja resetar todas as configuracoes para o padrao?")) {
      setSalvando(true)
      try {
        const success = await saveConfig(defaultConfig)
        if (success) {
          setConfig(defaultConfig)
          setMensagemTipo("success")
          setMensagem("Configuracoes resetadas para o padrao!")
        } else {
          setMensagemTipo("error")
          setMensagem("Erro ao resetar configuracoes.")
        }
      } catch (error) {
        setMensagemTipo("error")
        setMensagem("Erro de conexao com o servidor.")
        console.error("Erro ao resetar:", error)
      }
      setTimeout(() => {
        setMensagem("")
        setSalvando(false)
      }, 3000)
    }
  }

  const handleAlterarSenha = () => {
    setErroSenha("")
    if (novaSenha.length < 6) {
      setErroSenha("A senha deve ter pelo menos 6 caracteres")
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErroSenha("As senhas nao coincidem")
      return
    }
    alterarSenha(novaSenha)
    setNovaSenha("")
    setConfirmarSenha("")
    setMensagem("Senha alterada com sucesso!")
    setTimeout(() => setMensagem(""), 2000)
  }

  const updateConfig = (key: keyof SiteConfig, value: string | number) => {
    if (!config) return
    setConfig({ ...config, [key]: value })
  }

  const updateNestedConfig = (parent: "boxEspecificacoes", key: string, value: string) => {
    if (!config) return
    setConfig({
      ...config,
      [parent]: { ...config[parent], [key]: value },
    })
  }

  const handleImageUpload = (key: keyof SiteConfig) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateConfig(key, reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Funcoes para gerenciar ofertas dinamicamente
  const addOferta = () => {
    if (!config) return
    const newId = Date.now().toString()
    const newOferta: OfertaItem = {
      id: newId,
      titulo: `Mes ${config.ofertas.length + 1}`,
      valor: "R$ 0",
      descricao: "Descricao do plano",
      destaque: false,
    }
    setConfig({
      ...config,
      ofertas: [...config.ofertas, newOferta],
    })
  }

  const removeOferta = (id: string) => {
    if (!config || config.ofertas.length <= 1) return
    setConfig({
      ...config,
      ofertas: config.ofertas.filter((o) => o.id !== id),
    })
  }

  const updateOferta = (id: string, field: keyof OfertaItem, value: string | boolean) => {
    if (!config) return
    setConfig({
      ...config,
      ofertas: config.ofertas.map((o) =>
        o.id === id ? { ...o, [field]: value } : o
      ),
    })
  }

  const toggleDestaque = (id: string) => {
    if (!config) return
    setConfig({
      ...config,
      ofertas: config.ofertas.map((o) =>
        o.id === id ? { ...o, destaque: !o.destaque } : o
      ),
    })
  }

  const moveOferta = (id: string, direction: "up" | "down") => {
    if (!config) return
    const index = config.ofertas.findIndex((o) => o.id === id)
    if (index === -1) return
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === config.ofertas.length - 1) return
    
    const newOfertas = [...config.ofertas]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    ;[newOfertas[index], newOfertas[swapIndex]] = [newOfertas[swapIndex], newOfertas[index]]
    
    setConfig({
      ...config,
      ofertas: newOfertas,
    })
  }

  if (!isAuthenticated || !config) {
    return null
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/10" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {config.nomeSite}
              </h1>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">Painel Admin</span>
            </div>
            <div className="flex items-center gap-4">
              {mensagem && (
                <span className={`text-sm px-3 py-1 rounded-full ${
                  mensagemTipo === "success" 
                    ? "text-green-400 bg-green-500/20" 
                    : "text-red-400 bg-red-500/20"
                }`}>
                  {mensagem}
                </span>
              )}
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="bg-gray-900 border border-gray-800 mb-6 flex-wrap h-auto">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="cores">Cores</TabsTrigger>
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="ofertas">Ofertas</TabsTrigger>
              <TabsTrigger value="hardware">Hardware</TabsTrigger>
              <TabsTrigger value="seguranca">Seguranca</TabsTrigger>
              <TabsTrigger value="rodape">Rodape</TabsTrigger>
            </TabsList>

            {/* ABA GERAL */}
            <TabsContent value="geral">
              <Card className="bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Configuracoes Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Nome do Site</Label>
                      <Input 
                        value={config.nomeSite}
                        onChange={(e) => updateConfig("nomeSite", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Slogan</Label>
                      <Input 
                        value={config.slogan}
                        onChange={(e) => updateConfig("slogan", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">WhatsApp (com codigo do pais)</Label>
                    <Input 
                      value={config.whatsapp}
                      onChange={(e) => updateConfig("whatsapp", e.target.value)}
                      placeholder="5511999999999"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Logo (URL ou Upload)</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={config.logoUrl}
                          onChange={(e) => updateConfig("logoUrl", e.target.value)}
                          placeholder="https://..."
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <Label className="cursor-pointer bg-gray-800 border border-gray-700 rounded-md px-3 flex items-center hover:bg-gray-700">
                          <Upload className="h-4 w-4" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload("logoUrl")} />
                        </Label>
                      </div>
                      {config.logoUrl && (
                        <img src={config.logoUrl || "/placeholder.svg"} alt="Logo" className="h-12 mt-2" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Favicon (URL ou Upload)</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={config.faviconUrl}
                          onChange={(e) => updateConfig("faviconUrl", e.target.value)}
                          placeholder="https://..."
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <Label className="cursor-pointer bg-gray-800 border border-gray-700 rounded-md px-3 flex items-center hover:bg-gray-700">
                          <Upload className="h-4 w-4" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload("faviconUrl")} />
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={salvando} className="bg-gradient-to-r from-purple-600 to-blue-600">
                      <Save className="h-4 w-4 mr-2" />
                      {salvando ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="border-gray-700 text-gray-300 bg-transparent hover:bg-gray-800">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resetar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA CORES */}
            <TabsContent value="cores">
              <Card className="bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Esquema de Cores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Cor Primaria</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={config.corPrimaria}
                          onChange={(e) => updateConfig("corPrimaria", e.target.value)}
                          className="bg-gray-800 border-gray-700 h-12 w-16"
                        />
                        <Input 
                          value={config.corPrimaria}
                          onChange={(e) => updateConfig("corPrimaria", e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Cor Secundaria</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={config.corSecundaria}
                          onChange={(e) => updateConfig("corSecundaria", e.target.value)}
                          className="bg-gray-800 border-gray-700 h-12 w-16"
                        />
                        <Input 
                          value={config.corSecundaria}
                          onChange={(e) => updateConfig("corSecundaria", e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Cor de Acento</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={config.corAcento}
                          onChange={(e) => updateConfig("corAcento", e.target.value)}
                          className="bg-gray-800 border-gray-700 h-12 w-16"
                        />
                        <Input 
                          value={config.corAcento}
                          onChange={(e) => updateConfig("corAcento", e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Cor de Fundo</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={config.corFundo}
                          onChange={(e) => updateConfig("corFundo", e.target.value)}
                          className="bg-gray-800 border-gray-700 h-12 w-16"
                        />
                        <Input 
                          value={config.corFundo}
                          onChange={(e) => updateConfig("corFundo", e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Cor do Texto</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={config.corTexto}
                          onChange={(e) => updateConfig("corTexto", e.target.value)}
                          className="bg-gray-800 border-gray-700 h-12 w-16"
                        />
                        <Input 
                          value={config.corTexto}
                          onChange={(e) => updateConfig("corTexto", e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Texto Secundario</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={config.corTextoSecundario}
                          onChange={(e) => updateConfig("corTextoSecundario", e.target.value)}
                          className="bg-gray-800 border-gray-700 h-12 w-16"
                        />
                        <Input 
                          value={config.corTextoSecundario}
                          onChange={(e) => updateConfig("corTextoSecundario", e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={salvando} className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Save className="h-4 w-4 mr-2" />
                    {salvando ? "Salvando..." : "Salvar Cores"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA HERO */}
            <TabsContent value="hero">
              <Card className="bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Secao Hero</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Titulo Principal</Label>
                      <Input 
                        value={config.heroTitulo}
                        onChange={(e) => updateConfig("heroTitulo", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Subtitulo</Label>
                      <Input 
                        value={config.heroSubtitulo}
                        onChange={(e) => updateConfig("heroSubtitulo", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Descricao</Label>
                    <Textarea 
                      value={config.heroDescricao}
                      onChange={(e) => updateConfig("heroDescricao", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      rows={3}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Texto do Botao</Label>
                      <Input 
                        value={config.heroBotaoTexto}
                        onChange={(e) => updateConfig("heroBotaoTexto", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Link do Botao</Label>
                      <Input 
                        value={config.heroBotaoLink}
                        onChange={(e) => updateConfig("heroBotaoLink", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Imagem de Fundo</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={config.heroImagemFundo}
                          onChange={(e) => updateConfig("heroImagemFundo", e.target.value)}
                          placeholder="https://... ou /images/..."
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <Label className="cursor-pointer bg-gray-800 border border-gray-700 rounded-md px-3 flex items-center hover:bg-gray-700">
                          <Upload className="h-4 w-4" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload("heroImagemFundo")} />
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Efeito Visual</Label>
                      <Select 
                        value={config.heroEfeito} 
                        onValueChange={(value) => updateConfig("heroEfeito", value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="particles">Particulas</SelectItem>
                          <SelectItem value="gradient">Gradiente Animado</SelectItem>
                          <SelectItem value="none">Nenhum</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Vagas Total</Label>
                      <Input 
                        type="number"
                        value={config.vagasTotal}
                        onChange={(e) => updateConfig("vagasTotal", parseInt(e.target.value) || 0)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Vagas Restantes</Label>
                      <Input 
                        type="number"
                        value={config.vagasRestantes}
                        onChange={(e) => updateConfig("vagasRestantes", parseInt(e.target.value) || 0)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={salvando} className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Save className="h-4 w-4 mr-2" />
                    {salvando ? "Salvando..." : "Salvar Hero"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA OFERTAS */}
            <TabsContent value="ofertas">
              <Card className="bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Ofertas e Precos</CardTitle>
                    <Button 
                      onClick={addOferta} 
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Plano
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Adicione quantos planos precisar. Marque a estrela para destacar um plano.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.ofertas.map((oferta, index) => (
                    <div 
                      key={oferta.id} 
                      className={`p-4 border rounded-lg transition-all ${
                        oferta.destaque 
                          ? "border-purple-500 bg-purple-500/10" 
                          : "border-gray-700 bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-300 font-medium">Plano {index + 1}</span>
                          {oferta.destaque && (
                            <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded">
                              Destaque
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveOferta(oferta.id, "up")}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-white h-8 w-8 p-0"
                            title="Mover para cima"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveOferta(oferta.id, "down")}
                            disabled={index === config.ofertas.length - 1}
                            className="text-gray-400 hover:text-white h-8 w-8 p-0"
                            title="Mover para baixo"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDestaque(oferta.id)}
                            className={`h-8 w-8 p-0 ${oferta.destaque ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"}`}
                            title={oferta.destaque ? "Remover destaque" : "Destacar este plano"}
                          >
                            <Star className={`h-4 w-4 ${oferta.destaque ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOferta(oferta.id)}
                            disabled={config.ofertas.length <= 1}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-8 w-8 p-0"
                            title="Remover plano"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-400 text-sm">Titulo</Label>
                          <Input 
                            value={oferta.titulo}
                            onChange={(e) => updateOferta(oferta.id, "titulo", e.target.value)}
                            placeholder="Ex: Mes 1, Mes 2, Trimestral..."
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-400 text-sm">Valor</Label>
                          <Input 
                            value={oferta.valor}
                            onChange={(e) => updateOferta(oferta.id, "valor", e.target.value)}
                            placeholder="Ex: R$ 100, R$ 0, Gratis..."
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-400 text-sm">Descricao</Label>
                          <Input 
                            value={oferta.descricao}
                            onChange={(e) => updateOferta(oferta.id, "descricao", e.target.value)}
                            placeholder="Ex: Ativacao + Caucao..."
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {config.ofertas.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum plano adicionado. Clique em "Adicionar Plano" para comecar.
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={salvando} className="bg-gradient-to-r from-purple-600 to-blue-600">
                      <Save className="h-4 w-4 mr-2" />
                      {salvando ? "Salvando..." : "Salvar Ofertas"}
                    </Button>
                    <Button 
                      onClick={addOferta} 
                      variant="outline" 
                      className="border-gray-700 text-gray-300 bg-transparent hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Mais
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA HARDWARE */}
            <TabsContent value="hardware">
              <Card className="bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Hardware / TV Box</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Titulo do Box</Label>
                      <Input 
                        value={config.boxTitulo}
                        onChange={(e) => updateConfig("boxTitulo", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Subtitulo (modelo)</Label>
                      <Input 
                        value={config.boxSubtitulo}
                        onChange={(e) => updateConfig("boxSubtitulo", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Descricao</Label>
                    <Textarea 
                      value={config.boxDescricao}
                      onChange={(e) => updateConfig("boxDescricao", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Imagem do Box</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={config.boxImagemUrl}
                        onChange={(e) => updateConfig("boxImagemUrl", e.target.value)}
                        placeholder="https://... ou /images/..."
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <Label className="cursor-pointer bg-gray-800 border border-gray-700 rounded-md px-3 flex items-center hover:bg-gray-700">
                        <Upload className="h-4 w-4" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload("boxImagemUrl")} />
                      </Label>
                    </div>
                    {config.boxImagemUrl && (
                      <img src={config.boxImagemUrl || "/placeholder.svg"} alt="Box" className="h-32 mt-2 rounded" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">Qualidade</Label>
                      <Input 
                        value={config.boxEspecificacoes.qualidade}
                        onChange={(e) => updateNestedConfig("boxEspecificacoes", "qualidade", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">Wi-Fi</Label>
                      <Input 
                        value={config.boxEspecificacoes.wifi}
                        onChange={(e) => updateNestedConfig("boxEspecificacoes", "wifi", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">Resolucao</Label>
                      <Input 
                        value={config.boxEspecificacoes.resolucao}
                        onChange={(e) => updateNestedConfig("boxEspecificacoes", "resolucao", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-400 text-sm">Armazenamento</Label>
                      <Input 
                        value={config.boxEspecificacoes.armazenamento}
                        onChange={(e) => updateNestedConfig("boxEspecificacoes", "armazenamento", e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={salvando} className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Save className="h-4 w-4 mr-2" />
                    {salvando ? "Salvando..." : "Salvar Hardware"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA SEGURANCA */}
            <TabsContent value="seguranca">
              <Card className="bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Configuracoes de Seguranca</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-400 text-sm mb-4">
                      Usuario atual: <span className="text-white font-medium">{getAuthData().usuario}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nova Senha</Label>
                    <Input 
                      type="password"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Digite a nova senha"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Confirmar Senha</Label>
                    <Input 
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Confirme a nova senha"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  {erroSenha && <p className="text-red-400 text-sm">{erroSenha}</p>}
                  <Button onClick={handleAlterarSenha} className="bg-gradient-to-r from-purple-600 to-blue-600">
                    Alterar Senha
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ABA RODAPE */}
            <TabsContent value="rodape">
              <Card className="bg-gray-900/80 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Rodape do Site</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Texto do Rodape</Label>
                    <Input 
                      value={config.rodapeTexto}
                      onChange={(e) => updateConfig("rodapeTexto", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Copyright</Label>
                    <Input 
                      value={config.rodapeCopyright}
                      onChange={(e) => updateConfig("rodapeCopyright", e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <Button onClick={handleSave} disabled={salvando} className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Save className="h-4 w-4 mr-2" />
                    {salvando ? "Salvando..." : "Salvar Rodape"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
