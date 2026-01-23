"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Video } from "lucide-react"
import type { SiteConfig } from "@/lib/store"

interface HeroSectionProps {
  config: SiteConfig
}

export function HeroSection({ config }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (config.heroEfeito !== "particles") return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }[] = []
    const particleCount = 50

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    let animationId: number

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `${config.corPrimaria}${Math.round(particle.opacity * 255).toString(16).padStart(2, "0")}`
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [config.heroEfeito, config.corPrimaria])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Imagem de fundo */}
      {config.heroImagemFundo && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${config.heroImagemFundo})` }}
        />
      )}
      
      {/* Overlay gradiente */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${config.corFundo}DD, ${config.corFundo}F5)`,
        }}
      />

      {/* Efeito de particulas */}
      {config.heroEfeito === "particles" && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      )}

      {/* Efeito gradiente animado */}
      {config.heroEfeito === "gradient" && (
        <>
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{ backgroundColor: `${config.corPrimaria}15` }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
            style={{ backgroundColor: `${config.corSecundaria}15`, animationDelay: "1s" }}
          />
        </>
      )}
      
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {config.logoUrl && (
          <img 
            src={config.logoUrl || "/placeholder.svg"} 
            alt={`Logo ${config.nomeSite}`} 
            className="h-16 md:h-24 mx-auto mb-6"
          />
        )}
        <h1 
          className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(to right, ${config.corPrimaria}, ${config.corSecundaria})`,
          }}
        >
          {config.heroTitulo}
        </h1>
        <h2 
          className="text-xl md:text-2xl mb-8 font-light"
          style={{ color: config.corTextoSecundario }}
        >
          {config.heroSubtitulo}
        </h2>
        <p 
          className="mb-10 max-w-2xl mx-auto text-lg"
          style={{ color: config.corTextoSecundario }}
        >
          {config.heroDescricao}
        </p>
        <Button 
          size="lg" 
          className="text-white px-8 py-6 text-lg rounded-full shadow-lg"
          style={{
            background: `linear-gradient(to right, ${config.corPrimaria}, ${config.corSecundaria})`,
            boxShadow: `0 10px 40px ${config.corPrimaria}40`,
          }}
          onClick={() => window.open(config.heroBotaoLink, "_blank")}
          aria-label={config.heroBotaoTexto}
        >
          <Video className="mr-2 h-5 w-5" aria-hidden="true" />
          {config.heroBotaoTexto}
        </Button>
      </div>
    </section>
  )
}
