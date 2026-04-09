'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ScrollReveal } from './ScrollReveal'

export function CTAFinalSection() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="relative py-24 px-6 bg-landing-bg dot-grid overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-landing-indigo/5 blur-[120px]" />

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Separator line — whileInView draw animation */}
        <div className="flex justify-center mb-16">
          <motion.svg
            width="200"
            height="2"
            viewBox="0 0 200 2"
            className="overflow-visible"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <motion.line
              x1="0" y1="1" x2="200" y2="1"
              stroke="url(#ctaGradient)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
            <defs>
              <linearGradient id="ctaGradient" x1="0" y1="0" x2="200" y2="0">
                <stop offset="0%" stopColor="var(--color-landing-indigo)" stopOpacity="0" />
                <stop offset="50%" stopColor="var(--color-landing-indigo)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--color-landing-indigo)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>

        <ScrollReveal>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-landing-text leading-tight">
            Pare de esquecer seus{' '}
            <span className="text-landing-indigo">links salvos.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mt-6 text-lg text-landing-muted max-w-xl mx-auto">
            Comece agora. Grátis, sem cadastro, sem compromisso.
          </p>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <motion.a
              href="/"
              className="inline-flex items-center justify-center rounded-full font-heading font-bold px-10 min-h-[56px] text-lg text-white bg-gradient-to-r from-landing-indigo to-landing-violet cta-glow"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              Abrir o Depois
            </motion.a>
            <span className="text-sm text-landing-caption">
              Funciona no Chrome e Edge. PWA instalável.
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
