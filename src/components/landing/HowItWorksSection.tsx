'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ScrollReveal } from './ScrollReveal'

const steps = [
  {
    number: '01',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
    ),
    title: 'Salve de qualquer lugar',
    description: 'Compartilhe qualquer link direto do navegador, Instagram ou YouTube.',
    color: 'text-landing-indigo',
  },
  {
    number: '02',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
      </svg>
    ),
    title: 'A IA organiza tudo',
    description: 'Modelos de IA rodam direto no seu dispositivo. Categorização e sugestões automáticas.',
    color: 'text-landing-neon',
  },
  {
    number: '03',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Leia o que importa',
    description: 'Receba sugestões personalizadas e nunca mais esqueça um conteúdo que importa.',
    color: 'text-landing-indigo',
  },
]

const stepsContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
}

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

export function HowItWorksSection() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="como-funciona" className="relative py-24 px-6 bg-landing-bg overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <ScrollReveal>
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-landing-caption">
              COMO FUNCIONA
            </span>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2 className="mt-4 font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-landing-text">
              Três passos.{' '}
              <span className="text-landing-indigo">Zero complicação.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-lg text-landing-muted max-w-xl mx-auto">
              Sem cadastro. Sem email. Sem banco de dados na nuvem.
            </p>
          </ScrollReveal>
        </div>

        <div className="relative">
          {/* Connector line — whileInView draw animation */}
          {!shouldReduceMotion && (
            <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] -translate-y-1/2 z-0">
              <motion.svg
                className="w-full h-0.5"
                viewBox="0 0 1000 2"
                preserveAspectRatio="none"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                <motion.line
                  x1="0" y1="1" x2="1000" y2="1"
                  stroke="rgba(var(--landing-indigo-rgb), 0.2)"
                  strokeWidth="2"
                  strokeDasharray="8 6"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
              </motion.svg>
            </div>
          )}

          {/* Steps — whileInView stagger */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 relative z-10"
            variants={stepsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {steps.map((step) => (
              <motion.div key={step.number} variants={stepVariants}>
                <div className="relative rounded-3xl border border-landing-border bg-landing-bg p-8 group hover:border-landing-indigo/30 transition-colors">
                  {/* Large background number */}
                  <span className="absolute -top-4 -right-2 font-heading font-bold text-[120px] leading-none text-landing-indigo/[0.04] select-none pointer-events-none">
                    {step.number}
                  </span>

                  <div className={`mb-5 ${step.color}`}>
                    {step.icon}
                  </div>

                  <h3 className="font-heading font-semibold text-xl text-landing-text mb-3">
                    {step.title}
                  </h3>

                  <p className="text-sm text-landing-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
