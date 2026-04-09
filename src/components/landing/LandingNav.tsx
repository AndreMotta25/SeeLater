'use client'

import { motion, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

export function LandingNav() {
  const [visible, setVisible] = useState(false)
  const { scrollY } = useScroll()
  const shouldReduceMotion = useReducedMotion()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (latest > 100) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  })

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-landing-border/50"
      initial={{ opacity: 0, y: -20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' }}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-heading font-bold text-xl text-landing-text">
          Depois
        </a>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-full font-heading font-semibold px-6 min-h-[44px] text-sm text-white bg-gradient-to-r from-landing-indigo to-landing-violet cta-glow"
        >
          Acessar app
        </a>
      </nav>
    </motion.header>
  )
}
