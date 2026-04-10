'use client'

import { type Item } from '@/types'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'

const COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000 // 2 days

// --- Swipe constants ---
const BUTTON_WIDTH = 80
const SNAP_THRESHOLD = 60

// --- Animation variants (outside JSX) ---

const cardTap = {
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
}

const badgeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const cooldownBadgeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

const listContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const cardEntranceVariants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
}

export const cardScrollVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
}

const counterVariants = {
  initial: { scale: 1 },
  animate: { scale: 1.1, transition: { duration: 0.1 } },
  bounce: { scale: 1, transition: { duration: 0.1 } },
}

const emptyStateVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

interface QueueCardProps {
  item: Item
  onView: (id: string) => void
  onDelete: (id: string) => void
  onUpdateCategory?: (id: string, category: string) => void
  onResetDismissal?: (id: string) => void
  entranceVariant?: 'stagger' | 'scroll'
}

function getRemainingTime(dismissedAt: number | null): string | null {
  if (!dismissedAt) return null

  const elapsed = Date.now() - dismissedAt
  const remaining = COOLDOWN_MS - elapsed

  if (remaining <= 0) return null

  const hours = Math.floor(remaining / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

export function QueueCard({ item, onView, onDelete, onUpdateCategory, onResetDismissal, entranceVariant = 'stagger' }: QueueCardProps) {
  const router = useRouter()
  const [remainingTime, setRemainingTime] = useState<string | null>(
    item.suggestionDismissedAt ? getRemainingTime(item.suggestionDismissedAt) : null
  )

  // Swipe state
  const x = useMotionValue(0)
  const [swipeOpen, setSwipeOpen] = useState(false)
  const isDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate action width based on visible buttons
  const buttonCount = [
    !!onUpdateCategory,
    !!(onResetDismissal && item.suggestionDismissedAt),
    true // delete is always present
  ].filter(Boolean).length
  const actionWidth = buttonCount * BUTTON_WIDTH

  // Cooldown timer
  useEffect(() => {
    if (!item.suggestionDismissedAt) {
      setRemainingTime(null)
      return
    }

    const update = () => getRemainingTime(item.suggestionDismissedAt!)
    setRemainingTime(update())

    const interval = setInterval(() => {
      const remaining = update()
      setRemainingTime(remaining)

      if (remaining === null) {
        clearInterval(interval)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [item.suggestionDismissedAt])

  // Close swipe when clicking outside
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
      animate(x, -actionWidth, { type: 'spring', stiffness: 300, damping: 30 })
    } else {
      setSwipeOpen(false)
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }

    setTimeout(() => {
      isDragging.current = false
    }, 50)
  }, [x, actionWidth])

  const variants = entranceVariant === 'stagger' ? cardEntranceVariants : cardScrollVariants

  return (
    <motion.div
      variants={variants}
      layout
      className="relative overflow-hidden rounded-xl border border-[#2A2A3E]"
    >
      {/* Swipe action buttons (behind the card) */}
      <div className="absolute inset-y-0 right-0 flex">
        {onUpdateCategory && (
          <button
            onClick={() => handleSwipeAction(() => onUpdateCategory(item.id, ''))}
            className="w-20 h-full bg-[#6366F1] flex flex-col items-center justify-center gap-1"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-[10px] font-medium text-white">Categoria</span>
          </button>
        )}
        {onResetDismissal && item.suggestionDismissedAt && (
          <button
            onClick={() => handleSwipeAction(() => onResetDismissal(item.id))}
            className="w-20 h-full bg-amber-600 flex flex-col items-center justify-center gap-1"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[10px] font-medium text-white">Resetar</span>
          </button>
        )}
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
        dragConstraints={{ left: -actionWidth, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => {
          isDragging.current = true
        }}
        onDragEnd={handleDragEnd}
        className="bg-[#1A1A2E] relative z-10"
      >
        <motion.div
          onClick={handleClick}
          className="flex items-start gap-3 p-3 cursor-pointer hover:bg-[#2A2A3E] transition-colors rounded-xl"
          {...cardTap}
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-[#0F0F1A]">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#94A3B8]"
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
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-1">
              <AnimatePresence mode="wait">
                {item.category && (
                  <motion.div
                    key={item.category}
                    variants={badgeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="text-[10px] font-semibold text-[#6366F1] truncate"
                  >
                    {item.category.toUpperCase()}
                  </motion.div>
                )}
              </AnimatePresence>

              {remainingTime && (
                <motion.div
                  variants={cooldownBadgeVariants}
                  initial="initial"
                  animate="animate"
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2A2A3E] rounded-full"
                >
                  <svg className="w-3 h-3 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[10px] font-medium text-[#94A3B8]">{remainingTime}</span>
                </motion.div>
              )}
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2">
              {item.title}
            </h4>

            {/* Source */}
            <div className="flex items-center gap-1">
              {item.favicon && (
                <img
                  src={item.favicon}
                  alt=""
                  className="w-3 h-3 rounded-sm"
                />
              )}
              <span className="text-xs text-[#94A3B8] truncate">
                {item.siteName || item.type}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

interface QueueSectionProps {
  items: Item[]
  onView: (id: string) => void
  onDelete: (id: string) => void
  onUpdateCategory?: (id: string, category: string) => void
  onResetDismissal?: (id: string) => void
}

const ITEMS_PER_PAGE = 10

export function QueueSection({ items, onView, onDelete, onUpdateCategory, onResetDismissal }: QueueSectionProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [prevCount, setPrevCount] = useState(items.length)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < items.length) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, items.length))
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
  }, [visibleCount, items.length])

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [items.length])

  const countChanged = prevCount !== items.length
  useEffect(() => {
    setPrevCount(items.length)
  }, [items.length])

  if (items.length === 0) {
    return (
      <section className="px-4 py-4">
        <h2 className="text-lg font-bold text-white font-heading mb-3">
          Sua Fila
        </h2>

        <motion.div
          variants={emptyStateVariants}
          initial="initial"
          animate="animate"
          className="bg-[#1A1A2E] rounded-xl p-6 text-center border border-[#2A2A3E]"
        >
          <p className="text-sm text-[#94A3B8]">
            Sua fila está vazia. Adicione links para ver depois!
          </p>
        </motion.div>
      </section>
    )
  }

  const visibleItems = items.slice(0, visibleCount)

  return (
    <section className="px-4 py-4">
      <h2 className="text-lg font-bold text-white font-heading mb-3">
        Sua Fila ({countChanged ? (
          <motion.span
            key={items.length}
            variants={counterVariants}
            initial="initial"
            animate="animate"
            onAnimationComplete={() => {}}
          >
            {items.length}
          </motion.span>
        ) : items.length})
      </h2>

      <motion.div
        className="space-y-3"
        variants={listContainerVariants}
        initial="initial"
        animate="animate"
      >
        {visibleItems.map((item, index) => (
          <QueueCard
            key={item.id}
            item={item}
            onView={onView}
            onDelete={onDelete}
            onUpdateCategory={onUpdateCategory}
            onResetDismissal={onResetDismissal}
            entranceVariant={index < ITEMS_PER_PAGE ? 'stagger' : 'scroll'}
          />
        ))}

        {visibleCount < items.length && (
          <div
            ref={observerTarget}
            className="py-4 text-center"
          >
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#6366F1] border-t-transparent" />
          </div>
        )}
      </motion.div>
    </section>
  )
}
