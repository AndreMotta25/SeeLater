'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ScrollReveal } from './ScrollReveal'

const faqs = [
  {
    question: 'Meus dados ficam salvos onde?',
    answer: 'Tudo fica armazenado localmente no seu navegador usando IndexedDB. Nada é enviado para servidores externos.',
  },
  {
    question: 'A IA realmente funciona offline?',
    answer: 'Sim. Na primeira visita, os modelos de IA são baixados (~108MB). Depois disso, tudo funciona sem conexão.',
  },
  {
    question: 'Preciso criar conta?',
    answer: 'Não. O Depois não precisa de cadastro, email ou senha. Basta abrir e usar.',
  },
  {
    question: 'Quais navegadores são suportados?',
    answer: 'Chrome e Edge com suporte a WebGPU são recomendados para a IA. O app funciona como PWA em qualquer navegador moderno.',
  },
  {
    question: 'É gratuito?',
    answer: 'Sim. O Depois é 100% gratuito e de código aberto.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="border-b border-landing-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left min-h-[44px]"
        aria-expanded={open}
      >
        <span className="font-heading font-semibold text-base sm:text-lg text-landing-text pr-4">
          {question}
        </span>
        <motion.span
          className="text-landing-muted flex-shrink-0 text-xl font-light"
          animate={shouldReduceMotion ? {} : { rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? { opacity: 0, height: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm sm:text-base text-landing-muted leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQSection() {
  return (
    <section className="relative py-24 px-6 bg-landing-bg">
      <div className="max-w-2xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-landing-caption">
              PERGUNTAS FREQUENTES
            </span>
            <h2 className="mt-4 font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-landing-text">
              Dúvidas? Respostas.
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="divide-y-0">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
