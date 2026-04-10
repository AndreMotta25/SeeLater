'use client'

import { useItems } from '@/hooks/use-items'
import { MobileHeader, BottomNavigation } from '@/components/mobile'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, animate, useMotionValue } from 'framer-motion'
import { aiService } from '@/lib/ai'

const AI_LOADED_KEY = 'depois_ai_loaded'
const ITEMS_PER_PAGE = 10
const ACTION_WIDTH = 160
const SNAP_THRESHOLD = 60

interface HistoryCardProps {
  item: {
    id: string
    title: string
    thumbnail: string | null
    favicon: string | null
    siteName: string | null
    type: string
    category: string | null
    viewedAt: number | null
  }
  onDelete: (id: string) => void
  onUnview: (id: string) => void
}

function HistoryCard({ item, onDelete, onUnview }: HistoryCardProps) {
  const router = useRouter()
  const x = useMotionValue(0)
  const [swipeOpen, setSwipeOpen] = useState(false)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!swipeOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeSwipe()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside as unknown as EventListener)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside as unknown as EventListener)
    }
  }, [swipeOpen])

  function closeSwipe() {
    setSwipeOpen(false)
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
  }

  function handleSwipeAction(action: () => void) {
    closeSwipe()
    action()
  }

  function handleClick() {
    if (isDragging.current) return
    if (swipeOpen) {
      closeSwipe()
      return
    }
    router.push(`/item/${item.id}`)
  }

  const handleDragEnd = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    const offset = info.offset.x

    if (offset < -SNAP_THRESHOLD) {
      setSwipeOpen(true)
      animate(x, -ACTION_WIDTH, { type: 'spring', stiffness: 300, damping: 30 })
    } else {
      setSwipeOpen(false)
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }

    setTimeout(() => {
      isDragging.current = false
    }, 50)
  }, [x])

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#2A2A3E]">
      {/* Swipe action buttons */}
      <div className="absolute inset-y-0 right-0 flex">
        <button
          onClick={() => handleSwipeAction(() => onUnview(item.id))}
          className="w-20 h-full bg-[#6366F1] flex flex-col items-center justify-center gap-1"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span className="text-[10px] font-medium text-white">Não visto</span>
        </button>
        <button
          onClick={() => handleSwipeAction(() => onDelete(item.id))}
          className="w-20 h-full bg-red-600 flex flex-col items-center justify-center gap-1"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-[10px] font-medium text-white">Excluir</span>
        </button>
      </div>

      {/* Draggable card */}
      <motion.div
        ref={containerRef}
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => {
          isDragging.current = true
        }}
        onDragEnd={handleDragEnd}
        className="bg-[#1A1A2E] relative z-10"
      >
        <div
          onClick={handleClick}
          className="flex items-start gap-3 p-3 cursor-pointer hover:bg-[#2A2A3E] transition-colors rounded-xl"
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[#0F0F1A]">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {item.category && (
              <div className="text-[10px] font-semibold text-[#6366F1] mb-1 truncate">
                {item.category.toUpperCase()}
              </div>
            )}
            <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2">
              {item.title}
            </h4>
            <div className="flex items-center gap-1">
              {item.favicon && (
                <img src={item.favicon} alt="" className="w-3 h-3 rounded-sm" />
              )}
              <span className="text-xs text-[#94A3B8] truncate">
                {item.siteName || item.type}
              </span>
            </div>
            {item.viewedAt && (
              <span className="text-xs text-[#94A3B8]">
                {new Date(item.viewedAt).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function HistoryPage() {
  const router = useRouter()
  const {
    recentlyViewed,
    markAsUnviewed,
    deleteItem,
    loading,
    error
  } = useItems()

  const [aiLoaded, setAiLoaded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Check if AI was previously loaded
  useEffect(() => {
    const wasLoaded = localStorage.getItem(AI_LOADED_KEY)
    if (wasLoaded === 'true') {
      aiService.loadAll().then(() => {
        console.log('[History] AI models loaded from cache')
        setAiLoaded(true)
      }).catch((err) => {
        console.warn('[History] Failed to load AI models:', err)
        setAiLoaded(true)
      })
    } else {
      setAiLoaded(true)
    }
  }, [])

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < recentlyViewed.length) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, recentlyViewed.length))
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [visibleCount, recentlyViewed.length])

  // Reset visible count when items change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [recentlyViewed.length])

  const visibleItems = recentlyViewed.slice(0, visibleCount)

  if (!aiLoaded) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#94A3B8]">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] pb-20">
      <MobileHeader />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white font-heading mb-2">
            Já Vistos
          </h1>
          <p className="text-sm text-[#94A3B8]">
            {recentlyViewed.length} {recentlyViewed.length === 1 ? 'item' : 'itens'} visto{recentlyViewed.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Items List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#1A1A2E] rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-[#2A2A3E] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#2A2A3E] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : recentlyViewed.length === 0 ? (
          <div className="bg-[#1A1A2E] rounded-xl p-8 text-center border border-[#2A2A3E]">
            <svg
              className="w-12 h-12 text-[#94A3B8] mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <p className="text-sm text-[#94A3B8]">
              Nenhum item visto ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleItems.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onDelete={deleteItem}
                onUnview={markAsUnviewed}
              />
            ))}

            {/* Load More Trigger */}
            {visibleCount < recentlyViewed.length && (
              <div
                ref={observerTarget}
                className="py-4 text-center"
              >
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#6366F1] border-t-transparent" />
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
