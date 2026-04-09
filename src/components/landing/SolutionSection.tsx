'use client'

import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { useScrollProgress } from '@/hooks/use-scroll-progress'
import { ScrollReveal } from './ScrollReveal'

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
      </svg>
    ),
    title: 'IA local',
    description: 'Nenhum dado sai do dispositivo',
    color: 'text-landing-indigo',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
      </svg>
    ),
    title: 'Offline',
    description: 'Funciona sem internet após carregar',
    color: 'text-landing-neon',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25" />
      </svg>
    ),
    title: '16 categorias',
    description: 'Classificação automática inteligente',
    color: 'text-landing-indigo',
  },
]

const queueItems = [
  { title: 'Design systems escaláveis', category: 'Design', color: 'bg-purple-500', time: '3h atrás' },
  { title: 'Aprenda Rust em 2026', category: 'Tecnologia', color: 'bg-blue-500', time: '1d atrás' },
  { title: 'Os melhores cafés de SP', category: 'Viagem', color: 'bg-teal-500', time: '2d atrás' },
  { title: 'Como funciona WebGPU', category: 'Tecnologia', color: 'bg-blue-500', time: '5d atrás' },
]

const pillsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const pillVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export function SolutionSection() {
  const shouldReduceMotion = useReducedMotion()
  const mockupRef = useRef<HTMLDivElement>(null)

  // Only use scroll-driven for parallax (genuinely needs continuous tracking)
  const { progress: mockupProgress } = useScrollProgress(mockupRef)
  const mockupY = useTransform(mockupProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-30, 30])

  return (
    <section className="relative py-24 px-6 bg-landing-card overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <ScrollReveal>
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-landing-caption">
                A SOLUÇÃO
              </span>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <h2 className="mt-4 font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-landing-text">
                IA que entende o que{' '}
                <span className="text-landing-neon">você quer ler</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="mt-6 text-lg text-landing-muted leading-relaxed">
                O Depois usa inteligência artificial local para categorizar e sugerir
                o conteúdo mais relevante da sua fila — direto no seu navegador.
              </p>
            </ScrollReveal>
          </div>

          {/* Right: App demo mockup with parallax */}
          <div className="relative mx-auto w-full max-w-[320px]">
            <div className="absolute -inset-8 rounded-full bg-landing-indigo/5 blur-3xl" />

            <motion.div
              ref={mockupRef}
              className="relative rounded-3xl border border-landing-border bg-landing-bg p-4 shadow-2xl"
              style={!shouldReduceMotion ? { y: mockupY } : undefined}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <span className="font-heading font-bold text-base text-landing-text">Depois</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-landing-neon animate-glow-pulse" />
                  <span className="text-[10px] text-landing-neon">IA ativa</span>
                </div>
              </div>

              {/* AI Suggestion */}
              <motion.div
                className="rounded-2xl border border-landing-indigo/30 bg-gradient-to-br from-landing-indigo/15 to-landing-violet/10 p-4 mb-4"
                animate={!shouldReduceMotion ? {
                  boxShadow: [
                    '0 0 10px rgba(var(--landing-indigo-rgb),0.15)',
                    '0 0 25px rgba(var(--landing-indigo-rgb),0.35)',
                    '0 0 10px rgba(var(--landing-indigo-rgb),0.15)',
                  ],
                } : {}}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-landing-indigo" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
                  </svg>
                  <span className="text-xs font-semibold text-landing-indigo">Sugestão da IA</span>
                </div>
                <p className="text-sm font-semibold text-landing-text leading-snug">
                  Design systems escaláveis: do zero à produção
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="inline-flex rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[11px] text-purple-400 font-medium">
                    Design
                  </span>
                  <span className="text-[11px] text-landing-caption">medium.com</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="rounded-lg bg-landing-indigo px-3 py-1.5 text-xs font-semibold text-white">
                    Ver agora
                  </span>
                  <span className="rounded-lg border border-landing-border px-3 py-1.5 text-xs font-medium text-landing-muted">
                    Depois
                  </span>
                </div>
              </motion.div>

              {/* Queue label */}
              <span className="text-xs text-landing-caption font-medium uppercase tracking-wider">Sua fila</span>

              {/* Queue items */}
              <div className="mt-3 flex flex-col gap-2.5">
                {queueItems.map((item) => (
                  <motion.div
                    key={item.title}
                    className="flex items-center gap-3 rounded-xl bg-landing-card/80 border border-landing-border/50 p-2.5"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-landing-border/60 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-landing-text truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${item.color}/20 text-white/80`}>
                          {item.category}
                        </span>
                        <span className="text-[10px] text-landing-caption">{item.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Feature pills — whileInView stagger */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-4"
          variants={pillsContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={pillVariants}>
              <div className="flex items-center gap-3 rounded-full border border-landing-border bg-landing-bg px-5 py-3">
                <span className={f.color}>{f.icon}</span>
                <div>
                  <span className="text-sm font-semibold text-landing-text">{f.title}</span>
                  <span className="ml-2 text-sm text-landing-muted">{f.description}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
