'use client'

import { useItems } from '@/hooks/use-items'
import { AILoadingScreen } from '@/components/AILoadingScreen'
import {
  MobileHeader,
  BottomNavigation,
  AIRecommendationCard,
  AIRecommendationEmpty,
  QueueSection
} from '@/components/mobile'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { aiService } from '@/lib/ai'
import type { Item } from '@/types'

const AI_LOADED_KEY = 'depois_ai_loaded'

const pageEnter = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
}

const pageEnterTransition = {
  duration: 0.4,
  ease: 'easeOut' as const,
}

// Item 26: Orchestrated reveal delays
const headerReveal = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, delay: 0 } },
}

const suggestionReveal = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, delay: 0.1 } },
}

const queueReveal = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, delay: 0.2 } },
}

// Item 25: Error message entrance
const errorVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export default function HomePage() {
  const {
    unviewed,
    recentlyViewed,
    markAsViewed,
    deleteItem,
    updateCategory,
    getSuggestion,
    dismissSuggestion,
    resetSuggestionDismissal,
    loading,
    unviewedCount,
    enriching,
    addItem,
    enrichUrl,
    error
  } = useItems()

  const [aiLoaded, setAiLoaded] = useState(false)
  const [suggestion, setSuggestion] = useState<Item | null>(null)
  const [suggestionLoading, setSuggestionLoading] = useState(false)

  // Check if AI was previously loaded and load models
  useEffect(() => {
    const wasLoaded = localStorage.getItem(AI_LOADED_KEY)
    if (wasLoaded === 'true') {
      // Models were downloaded before, load them in background
      aiService.loadAll().then(() => {
        console.log('[Page] AI models loaded from cache')
        setAiLoaded(true)
        loadSuggestion()
      }).catch((err) => {
        console.warn('[Page] Failed to load AI models:', err)
        setAiLoaded(true) // Continue anyway
      })
    }
  }, [])

  async function loadSuggestion() {
    console.log('[Page] loadSuggestion called')

    if (!aiService.isReady()) {
      console.log('[Page] AI not ready for suggestion')
      return
    }

    setSuggestionLoading(true)
    try {
      const suggested = await getSuggestion()
      console.log('[Page] Suggestion result:', suggested?.title || 'none')
      setSuggestion(suggested)
    } catch (err) {
      console.warn('[Page] Failed to load suggestion:', err)
    } finally {
      setSuggestionLoading(false)
    }
  }

  async function handleAILoaded() {
    setAiLoaded(true)
    localStorage.setItem(AI_LOADED_KEY, 'true')
    await loadSuggestion()
  }

  async function handleViewItem(id: string) {
    console.log('[Page] Handling view item:', id)
    await markAsViewed(id)

    // Clear suggestion if it was the viewed item
    if (suggestion?.id === id) {
      setSuggestion(null)
    }

    // Load new suggestion after viewing an item
    console.log('[Page] Loading new suggestion after viewing item')
    await loadSuggestion()
  }

  async function handleDismissSuggestion() {
    if (!suggestion) return

    console.log('[Page] Dismissing suggestion:', suggestion.id)
    await dismissSuggestion(suggestion.id)
    setSuggestion(null)

    // Load new suggestion
    console.log('[Page] Loading new suggestion after dismiss')
    await loadSuggestion()
  }

  async function handleViewSuggestion() {
    if (!suggestion) return

    await markAsViewed(suggestion.id)
    setSuggestion(null)

    // Load new suggestion
    await loadSuggestion()
  }

  return (
    <AnimatePresence mode="wait">
      {!aiLoaded ? (
        <AILoadingScreen key="loading" onComplete={handleAILoaded} />
      ) : (
        <motion.div
          key="home"
          className="min-h-screen bg-[#0F0F1A] pb-20"
          variants={pageEnter}
          initial="initial"
          animate="animate"
          transition={pageEnterTransition}
        >
          <motion.div variants={headerReveal} initial="initial" animate="animate">
            <MobileHeader />
          </motion.div>

          <main className="max-w-lg mx-auto">
            {/* AI Suggestion Section - Item 12: AnimatePresence for card↔empty transition */}
            <AnimatePresence mode="wait">
              {suggestion ? (
                <motion.div
                  key="suggestion"
                  variants={suggestionReveal}
                  initial="initial"
                  animate="animate"
                >
                  <AIRecommendationCard
                    key={suggestion.id}
                    item={suggestion}
                    onView={handleViewSuggestion}
                    onDismiss={handleDismissSuggestion}
                    loading={suggestionLoading}
                  />
                </motion.div>
              ) : !suggestionLoading && recentlyViewed.length > 0 ? (
                <motion.div
                  key="empty"
                  variants={suggestionReveal}
                  initial="initial"
                  animate="animate"
                >
                  <AIRecommendationEmpty />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Queue Section - Item 26: delayed reveal */}
            <motion.div variants={queueReveal} initial="initial" animate="animate">
              <QueueSection
                items={unviewed}
                onView={handleViewItem}
                onDelete={deleteItem}
                onUpdateCategory={updateCategory}
                onResetDismissal={resetSuggestionDismissal}
              />
            </motion.div>

            {/* Error Message - Item 25: fade-in + slide */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  variants={errorVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="mx-4 mb-4 p-4 bg-red-900/20 border border-red-800 rounded-xl"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <motion.div variants={headerReveal} initial="initial" animate="animate">
            <BottomNavigation />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
