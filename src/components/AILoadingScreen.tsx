'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { aiService, type AIProgress } from '@/lib/ai'

const loadingExit = {
  initial: { opacity: 1 },
  exit: { opacity: 0 },
}

const loadingExitTransition = {
  duration: 0.4,
  ease: 'easeInOut' as const,
}

const statusTextVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

const statusTextTransition = {
  duration: 0.2,
  ease: 'easeOut' as const,
}

// Item 3: Error message fade-in + slide
const errorBlockVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

// Item 4: Storage warning fade-in
const storageWarningVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

interface ModelProgress {
  classifier: { progress: number; status: string; file?: string }
  embedder: { progress: number; status: string; file?: string }
}

export function AILoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState<ModelProgress>({
    classifier: { progress: 0, status: 'Aguardando...' },
    embedder: { progress: 0, status: 'Aguardando...' },
  })
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [persistentStorage, setPersistentStorage] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadAI() {
      // Subscribe to progress updates
      const unsubscribe = aiService.onProgress((update: AIProgress) => {
        if (!mounted) return

        setProgress((prev) => {
          const newProgress = { ...prev }
          if (update.model === 'classifier') {
            newProgress.classifier = {
              progress: update.progress,
              status: getStatusText(update),
              file: update.file,
            }
          } else if (update.model === 'embedder') {
            newProgress.embedder = {
              progress: update.progress,
              status: getStatusText(update),
              file: update.file,
            }
          }
          return newProgress
        })
      })

      try {
        // Check if loading from cache BEFORE loading starts
        const isFromCache = aiService.isLoadingFromCache()
        if (mounted) {
          setFromCache(isFromCache)
        }

        // Check persistent storage permission
        if ('storage' in navigator && 'persisted' in navigator.storage) {
          const isPersistent = await navigator.storage.persisted()
          if (mounted) {
            setPersistentStorage(isPersistent)
          }
        }

        // Load all models
        await aiService.loadAll()

        // Check if AI is supported
        const support = aiService.getIsSupported()
        if (!support.supported && support.error) {
          if (mounted) {
            setError(support.error)
            // Still continue after showing error briefly
            setTimeout(() => {
              if (mounted) {
                unsubscribe()
                onComplete()
              }
            }, 3000)
          }
          return
        }

        if (mounted) {
          setIsComplete(true)
          // Small delay to show 100% progress
          setTimeout(() => {
            if (mounted) {
              unsubscribe()
              onComplete()
            }
          }, 500)
        }
      } catch (err) {
        console.error('Failed to load AI models:', err)
        if (mounted) {
          const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar IA'
          setError(errorMsg)
          // Continue anyway - app works without AI
          setTimeout(() => {
            if (mounted) {
              unsubscribe()
              onComplete()
            }
          }, 3000)
        }
      }
    }

    loadAI()

    return () => {
      mounted = false
    }
  }, [onComplete])

  const overallProgress = Math.floor(
    (progress.classifier.progress + progress.embedder.progress) / 2
  )

  function getStatusText(update: AIProgress): string {
    if (update.status === 'downloading') {
      return fromCache
        ? `Carregando do cache ${update.file ? update.file.split('/').pop() : ''}...`
        : `Baixando ${update.file ? update.file.split('/').pop() : 'arquivo'}...`
    }
    if (update.status === 'loading') {
      return fromCache ? 'Carregando do cache...' : 'Carregando modelo...'
    }
    if (update.status === 'ready') {
      return 'Pronto!'
    }
    return 'Aguardando...'
  }

  function ProgressBar({
    label,
    progress,
    status,
  }: {
    label: string
    progress: number
    status: string
  }) {
    const progressPercent = Math.floor(progress)

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="h-4 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={status}
              className="text-xs text-gray-500 dark:text-gray-400"
              variants={statusTextVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={statusTextTransition}
            >
              {status}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50 px-4"
      variants={loadingExit}
      initial="initial"
      exit="exit"
      transition={loadingExitTransition}
    >
      <div className="max-w-md w-full">
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Depois
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {fromCache ? 'Carregando IA do cache...' : 'Preparando sua IA pessoal...'}
          </p>
        </div>

        {/* Progress Bars */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
          <ProgressBar
            label="Modelo de Classificação"
            progress={progress.classifier.progress}
            status={progress.classifier.status}
          />
          <ProgressBar
            label="Modelo de Sugestões"
            progress={progress.embedder.progress}
            status={progress.embedder.status}
          />
        </div>

        {/* Overall Progress */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Progresso Geral
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isComplete
              ? '✓ IA pronta!'
              : fromCache
                ? overallProgress < 50
                  ? 'Carregando do cache...'
                  : 'Quase pronto...'
                : overallProgress < 25
                  ? 'Isso acontece só na primeira vez'
                  : overallProgress < 50
                    ? 'Baixando modelos (~108MB)...'
                    : overallProgress < 75
                      ? 'Quase pronto...'
                      : 'Finalizando...'}
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
            {fromCache ? (
              <span className="font-medium">✨ Funciona offline!</span>
            ) : (
              <span className="font-medium">💡 Privacidade total:</span>
            )}{' '}
            {fromCache
              ? 'Os modelos estão cacheados no seu dispositivo. A IA funciona sem internet.'
              : 'A IA roda 100% no seu navegador. Nenhum dado sai do seu dispositivo.'}
          </p>
        </div>

        {/* Persistent Storage Warning - Item 4 */}
        {!fromCache && persistentStorage === false && (
          <motion.div
            variants={storageWarningVariants}
            initial="initial"
            animate="animate"
            className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
          >
            <p className="text-sm text-orange-800 dark:text-orange-300 text-center">
              <span className="font-medium">⚠️ Armazenamento não persistente:</span>
            </p>
            <p className="text-xs text-orange-700 dark:text-orange-400 text-center mt-2">
              O navegador pode apagar os modelos de IA. Para usar offline, verifique as configurações de privacidade do navegador e desative "Limpar dados ao sair".
            </p>
          </motion.div>
        )}

        {/* Error Message - Item 3 */}
        {error && (
          <motion.div
            variants={errorBlockVariants}
            initial="initial"
            animate="animate"
            className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          >
            <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center">
              <span className="font-medium">⚠️ IA não disponível:</span> {error}
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 text-center mt-2">
              O app continuará funcionando sem recomendações de IA.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
