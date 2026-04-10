'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ScrollReveal } from './ScrollReveal'

const benefits = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Privacidade absoluta',
    description: 'Sua IA roda 100% no navegador. Zero dados enviados. Zero cookies de rastreamento. Zero servidores na nuvem.',
    color: 'text-landing-indigo',
    glowColor: 'rgba(var(--landing-indigo-rgb), 0.15)',
    showGraph: false,
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0" />
      </svg>
    ),
    title: 'Funciona offline',
    description: 'Após carregar os modelos, tudo funciona sem internet.',
    color: 'text-landing-neon',
    glowColor: 'rgba(var(--landing-neon-rgb), 0.15)',
    showGraph: false,
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25" />
      </svg>
    ),
    title: '16 categorias',
    description: 'Tecnologia, Design, Culinária, Música e mais. Tudo automático.',
    color: 'text-landing-indigo',
    glowColor: 'rgba(var(--landing-indigo-rgb), 0.15)',
    showGraph: false,
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'IA que aprende com você',
    description: 'Quanto mais você usa, mais precisas ficam as sugestões. A IA entende seus interesses e prioriza o que importa.',
    color: 'text-landing-neon',
    glowColor: 'rgba(var(--landing-neon-rgb), 0.15)',
    showGraph: true,
  },
]

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export function BenefitsGrid() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="relative py-24 px-6 bg-landing-card overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-landing-caption">
              POR QUE DEPOIS
            </span>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2 className="mt-4 font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-landing-text">
              Não é mais um gerenciador de{' '}
              <span className="text-landing-indigo">bookmarks.</span>
            </h2>
          </ScrollReveal>
        </div>

        {/* Bento grid — whileInView diagonal stagger */}
        <motion.div
          className="grid md:grid-cols-2 gap-6"
          variants={gridContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {benefits.map((b) => (
            <motion.div key={b.title} variants={cardVariants}>
              <motion.div
                className="relative rounded-2xl glass-card p-8 h-full group hover:border-landing-indigo/30 transition-colors"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
              >
                {/* Glow */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: b.glowColor }}
                />

                <div className="relative z-10">
                  <div className={`mb-4 ${b.color}`}>
                    {b.icon}
                  </div>

                  <h3 className="font-heading font-semibold text-xl text-landing-text mb-3">
                    {b.title}
                  </h3>

                  <p className="text-sm text-landing-muted leading-relaxed">
                    {b.description}
                  </p>
                </div>

                {/* Decorative learning graph */}
                {b.showGraph && (
                  <div className="absolute bottom-4 right-4 opacity-20">
                    <svg width="100" height="50" viewBox="0 0 100 50" fill="none">
                      <path
                        d="M0 45 Q15 40, 25 30 T50 20 T75 10 T100 5"
                        stroke="url(#learnGradient)"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="150"
                        strokeDashoffset="150"
                        className={shouldReduceMotion ? '' : 'animate-draw-line'}
                      />
                      <defs>
                        <linearGradient id="learnGradient" x1="0" y1="0" x2="100" y2="0">
                          <stop offset="0%" stopColor="var(--color-landing-indigo)" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="var(--color-landing-neon)" stopOpacity="1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
