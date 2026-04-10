'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { LandingNav } from './LandingNav'

const particles = [
  { x: 10, y: 20, size: 3, color: 'bg-landing-indigo', delay: 0, duration: 5 },
  { x: 25, y: 60, size: 2, color: 'bg-landing-neon', delay: 1.2, duration: 6 },
  { x: 70, y: 15, size: 4, color: 'bg-landing-indigo', delay: 0.5, duration: 4.5 },
  { x: 85, y: 45, size: 2, color: 'bg-landing-neon', delay: 2, duration: 7 },
  { x: 55, y: 75, size: 3, color: 'bg-landing-indigo', delay: 0.8, duration: 5.5 },
  { x: 40, y: 30, size: 2, color: 'bg-landing-neon', delay: 1.5, duration: 6.5 },
  { x: 15, y: 85, size: 3, color: 'bg-landing-indigo', delay: 0.3, duration: 4 },
  { x: 60, y: 50, size: 4, color: 'bg-landing-indigo', delay: 1.8, duration: 7.5 },
]

const mockupCards = [
  { title: 'Como o React 19 muda tudo', category: 'Tecnologia', color: 'bg-blue-500' },
  { title: 'O futuro do design em 2026', category: 'Design', color: 'bg-purple-500' },
  { title: 'Receitas fitness para o dia a dia', category: 'Culinaria', color: 'bg-amber-500' },
  { title: 'Neural networks explained', category: 'Ciencia', color: 'bg-emerald-500' },
]

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()

  const badgeDelay = shouldReduceMotion ? 0 : 0.2
  const headline1Delay = shouldReduceMotion ? 0 : 0.4
  const headline2Delay = shouldReduceMotion ? 0 : 0.6
  const subDelay = shouldReduceMotion ? 0 : 0.8
  const ctaDelay = shouldReduceMotion ? 0 : 1
  const deviceDelay = shouldReduceMotion ? 0 : 1.2

  return (
    <section className="relative min-h-screen hero-gradient dot-grid flex items-center overflow-hidden">
      <LandingNav />

      {/* Particles */}
      {!shouldReduceMotion &&
        particles.map((p, i) => (
          <motion.div
            key={i}
            className={`absolute ${p.color} rounded-full opacity-30`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: badgeDelay }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-landing-indigo/30 bg-landing-indigo/10 px-4 py-1.5 text-xs font-medium text-landing-indigo">
                <span className="h-1.5 w-1.5 rounded-full bg-landing-indigo animate-glow-pulse" />
                IA que roda no navegador
              </span>
            </motion.div>

            <motion.h1
              className="mt-6 font-heading font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight text-landing-text"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: headline1Delay }}
            >
              Você salva{' '}
              <span className="text-landing-indigo">47 links</span>
              {' '}por semana.
            </motion.h1>

            <motion.p
              className="mt-2 font-heading font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight text-landing-muted"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: headline2Delay }}
            >
              E lê... zero.
            </motion.p>

            <motion.p
              className="mt-6 text-lg text-landing-muted max-w-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: subDelay }}
            >
              O Depois organiza sua fila de leitura com IA local.
              Funciona offline. Privacidade total.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: ctaDelay }}
            >
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full font-heading font-semibold px-8 min-h-[56px] text-base text-white bg-gradient-to-r from-landing-indigo to-landing-violet cta-glow"
              >
                Começar agora
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-full border border-white/20 font-heading font-semibold px-8 min-h-[56px] text-base text-landing-muted hover:text-landing-text hover:border-white/40 transition-colors"
              >
                Ver como funciona
              </a>
            </motion.div>
          </div>

          {/* Right: Device mockup */}
          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: deviceDelay }}
          >
            {/* Phone frame */}
            <div className="relative w-[280px] sm:w-[300px]">
              {/* Phone outline */}
              <div className="rounded-[40px] border-2 border-white/10 p-3 bg-landing-card/50 backdrop-blur-sm">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-landing-card rounded-b-2xl z-10" />

                {/* Screen content */}
                <div className="rounded-[28px] bg-landing-bg p-4 pt-8 min-h-[480px] flex flex-col gap-3 overflow-hidden">
                  {/* Mini header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading font-bold text-sm text-landing-text">Depois</span>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-landing-neon animate-glow-pulse" />
                      <span className="h-2 w-2 rounded-full bg-landing-indigo animate-glow-pulse" />
                    </div>
                  </div>

                  {/* Suggestion card */}
                  <motion.div
                    className="rounded-2xl border border-landing-indigo/30 bg-landing-indigo/10 p-3"
                    animate={!shouldReduceMotion ? { boxShadow: ['0 0 10px rgba(99,102,241,0.2)', '0 0 25px rgba(99,102,241,0.4)', '0 0 10px rgba(99,102,241,0.2)'] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-landing-indigo" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
                      </svg>
                      <span className="text-xs font-medium text-landing-indigo">Sugestão da IA</span>
                    </div>
                    <p className="text-sm font-medium text-landing-text leading-snug">Como o React 19 muda tudo sobre hooks</p>
                    <span className="mt-1 inline-block rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-400">Tecnologia</span>
                  </motion.div>

                  {/* Queue label */}
                  <span className="text-xs text-landing-caption font-medium mt-2">Sua fila</span>

                  {/* Queue cards */}
                  {mockupCards.slice(1).map((card, i) => (
                    <motion.div
                      key={i}
                      className="rounded-xl bg-landing-card/80 border border-landing-border p-2.5 flex gap-2.5"
                      initial={shouldReduceMotion ? {} : { opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: deviceDelay + 0.15 * (i + 1) }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-landing-border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-landing-text truncate">{card.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${card.color}/20 text-white`}>{card.category}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
        animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-xs text-landing-muted">Saiba mais</span>
        <svg className="w-5 h-5 text-landing-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </motion.div>
    </section>
  )
}
