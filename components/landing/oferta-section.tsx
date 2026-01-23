"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { SiteConfig } from "@/lib/store"

interface OfertaSectionProps {
  config: SiteConfig
}

export function OfertaSection({ config }: OfertaSectionProps) {
  // Usa o array dinamico de ofertas
  const ofertas = config.ofertas || []

  // Define grid columns baseado na quantidade de ofertas
  const getGridCols = () => {
    const count = ofertas.length
    if (count <= 2) return "md:grid-cols-2"
    if (count === 3) return "md:grid-cols-3"
    if (count === 4) return "md:grid-cols-4"
    return "md:grid-cols-3 lg:grid-cols-5"
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span style={{ color: config.corPrimaria }}>Oferta</span>
          <span style={{ color: config.corTexto }}> Irresistivel</span>
        </h2>
        <p className="mb-12" style={{ color: config.corTextoSecundario }}>
          Comece com condicoes especiais e descubra o poder do {config.nomeSite}
        </p>
        
        <div className={`grid grid-cols-1 ${getGridCols()} gap-6`}>
          {ofertas.map((oferta) => (
            <Card 
              key={oferta.id}
              className={`border transition-all hover:scale-105 ${oferta.destaque ? "scale-105 shadow-lg" : ""}`}
              style={{ 
                backgroundColor: oferta.destaque 
                  ? `linear-gradient(to bottom right, ${config.corPrimaria}30, ${config.corSecundaria}30)` 
                  : `${config.corPrimaria}10`,
                borderColor: oferta.destaque ? `${config.corPrimaria}50` : `${config.corPrimaria}20`,
                background: oferta.destaque 
                  ? `linear-gradient(to bottom right, ${config.corPrimaria}20, ${config.corSecundaria}20)` 
                  : `${config.corPrimaria}10`,
                boxShadow: oferta.destaque ? `0 10px 40px ${config.corPrimaria}20` : "none",
              }}
            >
              <CardContent className="p-8 text-center">
                <p 
                  className="text-sm mb-2"
                  style={{ color: oferta.destaque ? config.corPrimaria : config.corTextoSecundario }}
                >
                  {oferta.titulo}
                </p>
                <div className="mb-4">
                  <span 
                    className="text-5xl font-bold"
                    style={{ color: config.corTexto }}
                  >
                    {oferta.valor}
                  </span>
                </div>
                <p 
                  className="text-sm"
                  style={{ color: oferta.destaque ? config.corPrimaria : config.corTextoSecundario }}
                >
                  {oferta.descricao}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
