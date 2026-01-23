"use client"

import type { SiteConfig } from "@/lib/store"

interface FooterSectionProps {
  config: SiteConfig
}

export function FooterSection({ config }: FooterSectionProps) {
  return (
    <footer 
      className="py-12 px-4 border-t"
      style={{ borderColor: `${config.corPrimaria}20` }}
    >
      <div className="max-w-4xl mx-auto text-center">
        {config.logoUrl ? (
          <img src={config.logoUrl || "/placeholder.svg"} alt={`Logo ${config.nomeSite}`} className="h-10 mx-auto mb-4" />
        ) : (
          <h3 
            className="text-2xl font-bold bg-clip-text text-transparent mb-4"
            style={{ backgroundImage: `linear-gradient(to right, ${config.corPrimaria}, ${config.corSecundaria})` }}
          >
            {config.nomeSite}
          </h3>
        )}
        <p className="text-sm mb-6" style={{ color: config.corTextoSecundario }}>
          {config.rodapeTexto}
        </p>
        <p className="text-xs" style={{ color: `${config.corTextoSecundario}80` }}>
          {config.rodapeCopyright}
        </p>
      </div>
    </footer>
  )
}
