"use client"

import React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Cpu, Wifi, Shield, Zap } from "lucide-react"
import type { SiteConfig } from "@/lib/store"

interface BoxSectionProps {
  config: SiteConfig
}

const iconMap: Record<string, React.ElementType> = {
  "Hardware Premium": Cpu,
  "Conexao Estavel": Wifi,
  "Seguranca Total": Shield,
  "Alta Velocidade": Zap,
}

export function BoxSection({ config }: BoxSectionProps) {
  return (
    <section 
      className="py-20 px-4"
      style={{
        background: `linear-gradient(to bottom, ${config.corFundo}, ${config.corPrimaria}08, ${config.corFundo})`,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Imagem do Box */}
          <div className="relative order-2 lg:order-1">
            <div 
              className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
              style={{ backgroundColor: config.corPrimaria }}
            />
            <img
              src={config.boxImagemUrl || "/images/mxq-box.jpg"}
              alt={`${config.boxTitulo} - ${config.boxSubtitulo}`}
              className="relative z-10 w-full max-w-md mx-auto rounded-2xl"
            />
          </div>

          {/* Conteudo */}
          <div className="order-1 lg:order-2">
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                <span style={{ color: config.corTexto }}>{config.boxTitulo} </span>
                <span style={{ color: config.corPrimaria }}>Box</span>
              </h2>
              <p style={{ color: config.corSecundaria }} className="text-xl mb-4">
                {config.boxSubtitulo}
              </p>
              <p style={{ color: config.corTextoSecundario }}>
                {config.boxDescricao}
              </p>
            </div>

            {/* Recursos */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {config.boxRecursos.map((recurso, index) => {
                const Icon = iconMap[recurso.titulo] || Cpu
                return (
                  <Card 
                    key={index}
                    className="border transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: `${config.corPrimaria}10`,
                      borderColor: `${config.corPrimaria}20`,
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-2" style={{ color: config.corPrimaria }} />
                      <h4 className="font-semibold text-sm" style={{ color: config.corTexto }}>{recurso.titulo}</h4>
                      <p className="text-xs" style={{ color: config.corTextoSecundario }}>{recurso.descricao}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Specs badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <SpecBadge label={config.boxEspecificacoes.qualidade} sublabel="Qualidade" config={config} />
              <SpecBadge label={config.boxEspecificacoes.wifi} sublabel="Wi-Fi" config={config} />
              <SpecBadge label={config.boxEspecificacoes.resolucao} sublabel="Resolucao" config={config} />
              <SpecBadge label={config.boxEspecificacoes.armazenamento} sublabel="Armazenamento" config={config} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SpecBadge({ label, sublabel, config }: { label: string; sublabel: string; config: SiteConfig }) {
  return (
    <div 
      className="border rounded-full px-4 py-2 text-center"
      style={{ 
        backgroundColor: `${config.corPrimaria}15`,
        borderColor: `${config.corPrimaria}30`,
      }}
    >
      <span className="text-lg font-bold" style={{ color: config.corPrimaria }}>{label}</span>
      <p className="text-xs" style={{ color: config.corTextoSecundario }}>{sublabel}</p>
    </div>
  )
}
