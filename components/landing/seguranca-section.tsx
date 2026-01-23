"use client"

import React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Server, Link2, Headphones, ShieldCheck } from "lucide-react"
import type { SiteConfig } from "@/lib/store"

interface SegurancaSectionProps {
  config: SiteConfig
}

const iconMap: Record<string, React.ElementType> = {
  "Servidor Proprio": Server,
  "Sem Intermediarios": Link2,
  "Suporte 24/7": Headphones,
  "Garantia Total": ShieldCheck,
}

export function SegurancaSection({ config }: SegurancaSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span style={{ color: config.corPrimaria }}>{config.segurancaTitulo}</span>
          <br />
          <span style={{ color: config.corTextoSecundario }} className="text-2xl">{config.segurancaSubtitulo}</span>
        </h2>
        <p className="mb-12" style={{ color: config.corTextoSecundario }}>Sua tranquilidade e nossa prioridade</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.segurancaItens.map((item, index) => {
            const Icon = iconMap[item.titulo] || ShieldCheck
            return (
              <Card 
                key={index}
                className="border transition-all hover:scale-105 text-left"
                style={{ 
                  backgroundColor: `${config.corPrimaria}10`,
                  borderColor: `${config.corPrimaria}20`,
                }}
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${config.corPrimaria}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: config.corPrimaria }} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: config.corTexto }}>{item.titulo}</h4>
                    <p className="text-sm" style={{ color: config.corTextoSecundario }}>{item.descricao}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
