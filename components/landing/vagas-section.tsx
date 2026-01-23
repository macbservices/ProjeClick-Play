"use client"

import type { SiteConfig } from "@/lib/store"

interface VagasSectionProps {
  config: SiteConfig
}

export function VagasSection({ config }: VagasSectionProps) {
  const porcentagem = (config.vagasRestantes / config.vagasTotal) * 100

  return (
    <section className="py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <h3 
          className="text-sm uppercase tracking-wider mb-4"
          style={{ color: config.corTextoSecundario }}
        >
          Vagas do Projeto Piloto
        </h3>
        <div className="relative">
          <div className="flex items-baseline justify-center gap-2 mb-4">
            <span 
              className="text-6xl font-bold"
              style={{ color: config.corPrimaria }}
            >
              {config.vagasRestantes}
            </span>
            <span style={{ color: config.corTextoSecundario }} className="text-xl">de</span>
            <span style={{ color: config.corTextoSecundario }} className="text-2xl">{config.vagasTotal}</span>
            <span style={{ color: config.corTextoSecundario }} className="text-sm">restantes</span>
          </div>
          <div 
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: `${config.corPrimaria}20` }}
            role="progressbar"
            aria-valuenow={config.vagasRestantes}
            aria-valuemin={0}
            aria-valuemax={config.vagasTotal}
            aria-label={`${config.vagasRestantes} de ${config.vagasTotal} vagas restantes`}
          >
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ 
                width: `${porcentagem}%`,
                background: `linear-gradient(to right, ${config.corPrimaria}, ${config.corSecundaria})`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
