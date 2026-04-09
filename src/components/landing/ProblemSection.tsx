'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ScrollReveal } from './ScrollReveal'

const deadLinks = [
  { title: '10 React patterns avançados', domain: 'dev.to', days: 42, rotation: -3 },
  { title: 'Guia completo de Tailwind CSS', domain: 'youtube.com', days: 67, rotation: 2 },
  { title: 'Como investir em FIIs 2026', domain: 'medium.com', days: 15, rotation: -1 },
  { title: 'The art of clean code', domain: 'github.com', days: 120, rotation: 4 },
  { title: 'Receitas fáceis para o dia a dia', domain: 'instagram.com', days: 8, rotation: -2 },
  { title: 'Machine learning para iniciantes', domain: 'kaggle.com', days: 89, rotation: 1 },
  { title: 'Viagem pelo sul do Brasil', domain: 'youtube.com', days: 34, rotation: -4 },
  { title: 'Nova API do OpenAI explicada', domain: 'twitter.com', days: 3, rotation: 3 },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 0.35,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export function ProblemSection() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="relative py-24 px-6 bg-landing-bg overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-landing-caption">
              O PROBLEMA
            </span>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2 className="mt-4 font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-landing-text">
              Seus links salvos são um{' '}
              <span className="text-red-400/80">cemitério digital</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-lg text-landing-muted max-w-2xl mx-auto leading-relaxed">
              O brasileiro médio salva 200+ links por mês em bookmarks, DMs e abas abertas.
              90% nunca são lidos. Você não precisa de mais um lugar para salvar.
              Você precisa de algo que te faça voltar a lê-los.
            </p>
          </ScrollReveal>
        </div>

        {/* Cemetery composition — stagger entrance */}
        <div className="relative max-w-3xl mx-auto" style={{ perspective: '1000px' }}>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            style={{ rotateX: '2deg' }}
          >
            {deadLinks.map((link) => (
              <motion.div
                key={link.title}
                variants={cardVariants}
                className="rounded-xl bg-landing-card/60 border border-landing-border/50 p-3 backdrop-blur-sm"
                style={{ rotate: `${link.rotation}deg` }}
              >
                <div className="w-full h-14 rounded-lg bg-landing-border/50 mb-2" />
                <p className="text-xs font-medium text-landing-text/60 truncate">{link.title}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-landing-caption">{link.domain}</span>
                  <span className="text-[10px] text-red-400/60">{link.days}d atrás</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Central "never read" badge */}
          <ScrollReveal delay={0.6}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="rounded-full bg-red-500/20 border border-red-500/30 px-5 py-2 backdrop-blur-sm">
                <span className="text-sm font-semibold text-red-400">Nunca lido</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Fade overlay at edges */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, var(--landing-bg-color) 80%)',
          }} />
        </div>

        <ScrollReveal delay={0.4}>
          <p className="mt-12 text-center text-base font-medium text-landing-neon/80 italic">
            &ldquo;Só você sabe quantos links você nunca mais abriu.&rdquo;
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
