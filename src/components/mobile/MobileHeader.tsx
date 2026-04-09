'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Check which AI models are enabled
const classifierEnabled = process.env.NEXT_PUBLIC_ENABLE_AI_CLASSIFIER !== 'false'
const embedderEnabled = process.env.NEXT_PUBLIC_ENABLE_AI_EMBEDDER !== 'false'

// Item 5: Menu animation variants
const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const panelVariants = {
  initial: { x: -256 },
  animate: {
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  exit: {
    x: -256,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
}

const menuListVariants = {
  animate: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05,
    },
  },
}

const menuItemVariants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
}

// Item 6: AI dots fade-in
const dotVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#0F0F1A] border-b border-[#1A1A2E]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Hamburger Menu with AI indicators */}
        <div className="flex items-center gap-1">
          {/* Item 6: AI Model Indicators with fade-in */}
          {classifierEnabled && (
            <motion.div
              variants={dotVariants}
              initial="initial"
              animate="animate"
              className="w-2 h-2 rounded-full bg-green-500"
              title="Classificador ativo"
            />
          )}
          {embedderEnabled && (
            <motion.div
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 }}
              className="w-2 h-2 rounded-full bg-blue-500"
              title="Embedder ativo"
            />
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white"
            aria-label="Abrir menu"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[12px]">
              <path d="M0 12V10H18V12H0ZM0 7V5H18V7H0ZM0 2V0H18V2H0Z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* Logo/Title */}
        <h1 className="text-xl font-bold text-white font-heading">
          Depois
        </h1>

        {/* User Avatar */}
        <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#6366F1] overflow-hidden bg-[#1A1A2E]">
            <img
              src="/images/icons/perfil.png"
              alt="Perfil"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Item 5: Side Menu Overlay with AnimatePresence */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-64 bg-[#1A1A2E] p-4"
              onClick={(e) => e.stopPropagation()}
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.nav
                className="space-y-4 mt-8"
                variants={menuListVariants}
                initial="initial"
                animate="animate"
              >
                <motion.a
                  href="/"
                  variants={menuItemVariants}
                  className="block px-4 py-3 text-white hover:bg-[#6366F1]/20 rounded-lg transition-colors"
                >
                  Início
                </motion.a>
                <motion.a
                  href="/history"
                  variants={menuItemVariants}
                  className="block px-4 py-3 text-white hover:bg-[#6366F1]/20 rounded-lg transition-colors"
                >
                  Histórico
                </motion.a>
                <motion.a
                  href="/settings"
                  variants={menuItemVariants}
                  className="block px-4 py-3 text-white hover:bg-[#6366F1]/20 rounded-lg transition-colors"
                >
                  Configurações
                </motion.a>
              </motion.nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
