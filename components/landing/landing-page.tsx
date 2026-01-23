"use client"

import { useState, useEffect } from "react"
import { HeroSection } from "./hero-section"
import { VagasSection } from "./vagas-section"
import { OfertaSection } from "./oferta-section"
import { BoxSection } from "./box-section"
import { SegurancaSection } from "./seguranca-section"
import { FooterSection } from "./footer-section"
import { fetchConfig, type SiteConfig } from "@/lib/store"

export function LandingPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null)

  useEffect(() => {
    // Carregar config do servidor
    fetchConfig().then(setConfig)
  }, [])

  if (!config) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Carregando...</div>
      </main>
    )
  }

  return (
    <main 
      className="min-h-screen text-white overflow-x-hidden"
      style={{ 
        backgroundColor: config.corFundo,
        color: config.corTexto,
        ["--cor-primaria" as string]: config.corPrimaria,
        ["--cor-secundaria" as string]: config.corSecundaria,
        ["--cor-acento" as string]: config.corAcento,
      }}
    >
      <HeroSection config={config} />
      <VagasSection config={config} />
      <OfertaSection config={config} />
      <BoxSection config={config} />
      <SegurancaSection config={config} />
      <FooterSection config={config} />
    </main>
  )
}
