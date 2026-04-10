'use client'

import { motion } from 'framer-motion'

// Item 11: Empty state fade-in entrance
const emptyVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

export function AIRecommendationEmpty() {
  return (
    <motion.div
      variants={emptyVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="mx-4 mt-6 mb-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 text-center"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-700/50 rounded-full mb-3">
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <p className="text-sm text-gray-400">Nenhuma sugestão no momento</p>
      <p className="text-xs text-gray-500 mt-1">Adicione mais itens para receber recomendações</p>
    </motion.div>
  )
}
