'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useRef } from 'react'
import type { Item } from '@/types'
import { ThumbnailShimmer } from '@/components/ui/thumbnail-shimmer'

// --- Variants (outside JSX, as required) ---

const cardVariants = {
  initial: {
    opacity: 0,
    y: 18,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
  exitDismiss: {
    opacity: 0,
    x: 60,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeIn' as const,
    },
  },
  exitView: {
    opacity: 0,
    y: -16,
    transition: {
      duration: 0.25,
      ease: 'easeIn' as const,
    },
  },
}

// --- Component ---

interface AIRecommendationCardProps {
  item: Item
  onView: () => void
  onDismiss: () => void
  loading: boolean
}

export function AIRecommendationCard({ item, onView, onDismiss, loading }: AIRecommendationCardProps) {
  const [isExiting, setIsExiting] = useState<'dismiss' | 'view' | null>(null)
  const exitCallbackRef = useRef<(() => void) | null>(null)

  const handleDismiss = useCallback(() => {
    if (exitCallbackRef.current) return
    exitCallbackRef.current = onDismiss
    setIsExiting('dismiss')
  }, [onDismiss])

  const handleView = useCallback(() => {
    if (exitCallbackRef.current) return
    exitCallbackRef.current = onView
    setIsExiting('view')
  }, [onView])

  const handleAnimationComplete = useCallback((definition: string) => {
    if ((definition === 'exitDismiss' || definition === 'exitView') && exitCallbackRef.current) {
      exitCallbackRef.current()
      exitCallbackRef.current = null
    }
  }, [])

  // Determine the current animation target based on exit state
  const animateTarget = isExiting
    ? (isExiting === 'dismiss' ? 'exitDismiss' : 'exitView')
    : 'animate'

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate={animateTarget}
      onAnimationComplete={handleAnimationComplete}
      className="mx-4 mt-6 mb-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-blue-500/20">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-sm font-semibold text-blue-300">Sugestão da IA</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="aspect-video w-full rounded-lg overflow-hidden mb-3">
          <ThumbnailShimmer
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full rounded-lg"
          />
        </div>

        <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">{item.title}</h3>

        {item.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          {item.favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.favicon} alt="" className="w-4 h-4 rounded" />
          )}
          <span>{item.siteName || new URL(item.url).hostname}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleView}
            disabled={loading || !!isExiting}
            className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 overflow-hidden"
          >
            {/* Item 9: Crossfade between eye icon and spinner */}
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.span
                  key="spinner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.15 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="flex items-center gap-2"
                >
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Carregando...
                </motion.span>
              ) : (
                <motion.span
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.15 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver agora
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={handleDismiss}
            disabled={loading || !!isExiting}
            className="min-h-[44px] min-w-[44px] bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 text-gray-300 rounded-lg transition-colors flex items-center justify-center"
            aria-label="Dispensar sugestão"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
