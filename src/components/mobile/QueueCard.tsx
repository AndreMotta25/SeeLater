'use client'

import { type Item } from '@/types'
import { CATEGORIES } from '@/lib/ai'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'

const COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000 // 2 days

// --- Swipe constants ---
const ACTION_WIDTH = 160
const SNAP_THRESHOLD = 60

// --- Animation variants (outside JSX) ---

// Item 16: Hover/press feedback
const cardTap = {
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
}

// Item 17: Dropdown menu entrance/exit
const menuVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.1, ease: 'easeIn' as const },
  },
}

// Item 18: Category picker crossfade directional
const categoryPickerVariants = {
  enter: { opacity: 0, x: 20 },
  active: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
}

const mainMenuVariants = {
  enter: { opacity: 0, x: -20 },
  active: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.15 } },
}

// Item 19: Category badge transition
const badgeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

// Item 20: Cooldown badge entrance
const cooldownBadgeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

// Item 13: Stagger entrance for initial batch
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

// Item 14: Scroll-loaded items fade-in only (no movement)
export const cardScrollVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
}

// Item 21: Counter scale animation
const counterVariants = {
  initial: { scale: 1 },
  animate: { scale: 1.1, transition: { duration: 0.1 } },
  bounce: { scale: 1, transition: { duration: 0.1 } },
}

// Item 22: Empty state fade-in
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
  /** Item 13/14: which animation variant to use */
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
  const [showMenu, setShowMenu] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Swipe state
  const x = useMotionValue(0)
  const [swipeOpen, setSwipeOpen] = useState(false)
  const isDragging = useRef(false)
  const dragStartTime = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Cooldown timer
  useEffect(() => {
    if (!item.suggestionDismissedAt) return

    const interval = setInterval(() => {
      const remaining = getRemainingTime(item.suggestionDismissedAt)
      setRemainingTime(remaining)

      if (remaining === null) {
        clearInterval(interval)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [item.suggestionDismissedAt])

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

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

  function handleMenuAction(action: () => void) {
    setShowMenu(false)
    setShowCategoryPicker(false)
    action()
  }

  function handleSwipeAction(action: () => void) {
    closeSwipe()
    action()
  }

  function handleClick() {
    // Ignore clicks that were actually drags
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

    // Keep isDragging true briefly so the onClick handler ignores it
    setTimeout(() => {
      isDragging.current = false
    }, 50)
  }, [x])

  // Pick entrance variant based on whether it's initial load or scroll load
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
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => {
          isDragging.current = true
          dragStartTime.current = Date.now()
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
              {/* Item 19: Category Badge with fade */}
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

              {/* Item 20: Cooldown Badge with fade-in */}
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

          {/* More Button with Dropdown */}
          <div
            className="relative flex-shrink-0"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="min-h-[32px] min-w-[32px] flex items-center justify-center text-[#94A3B8] hover:text-[#6366F1] transition-colors p-1"
              aria-label="Mais opções"
            >
              <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14C0 13.45 0.195833 12.9792 0.5875 12.5875C0.979167 12.1958 1.45 12 2 12C2.55 12 3.02083 12.1958 3.4125 12.5875C3.80417 12.9792 4 13.45 4 14C4 14.55 3.80417 15.0208 3.4125 15.4125C3.02083 15.8042 2.55 16 2 16ZM2 10C1.45 10 0.979167 9.80417 0.5875 9.4125C0.195833 9.02083 0 8.55 0 8C0 7.45 0.195833 6.97917 0.5875 6.5875C0.979167 6.19583 1.45 6 2 6C2.55 6 3.02083 6.19583 3.4125 6.5875C3.80417 6.97917 4 7.45 4 8C4 8.55 3.80417 9.02083 3.4125 9.4125C3.02083 9.80417 2.55 10 2 10ZM2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.80417 2.55 4 2 4Z" fill="currentColor"/>
              </svg>
            </button>

            {/* Item 17: Dropdown Menu with AnimatePresence */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  variants={menuVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{ transformOrigin: 'top right' }}
                  className="absolute right-0 top-full mt-1 w-48 bg-[#1A1A2E] border border-[#2A2A3E] rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  {/* Item 18: Category picker crossfade directional */}
                  <AnimatePresence mode="wait">
                    {showCategoryPicker ? (
                      <motion.div
                        key="category-picker"
                        variants={categoryPickerVariants}
                        initial="enter"
                        animate="active"
                        exit="exit"
                      >
                        {/* Category picker header */}
                        <div className="px-4 py-2 border-b border-[#2A2A3E] flex items-center gap-2">
                          <button
                            onClick={() => setShowCategoryPicker(false)}
                            className="min-h-[32px] min-w-[32px] flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <span className="text-sm font-medium text-white">Categoria</span>
                        </div>
                        {/* Category list */}
                        <div className="max-h-64 overflow-y-auto">
                          {CATEGORIES.map((category) => (
                            <button
                              key={category}
                              onClick={() => handleMenuAction(() => onUpdateCategory?.(item.id, category))}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                                item.category === category
                                  ? 'text-[#6366F1] bg-[#6366F1]/10'
                                  : 'text-[#94A3B8] hover:bg-[#2A2A3E] hover:text-white'
                              }`}
                            >
                              {item.category === category && (
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              <span>{category}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="main-menu"
                        variants={mainMenuVariants}
                        initial="enter"
                        animate="active"
                        exit="exit"
                      >
                        {onUpdateCategory && (
                          <button
                            onClick={() => setShowCategoryPicker(true)}
                            className="w-full px-4 py-3 text-left text-sm text-[#94A3B8] hover:bg-[#2A2A3E] hover:text-white transition-colors flex items-center gap-3 border-b border-[#2A2A3E]"
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>Alterar categoria</span>
                          </button>
                        )}
                        {onResetDismissal && item.suggestionDismissedAt && (
                          <button
                            onClick={() => handleMenuAction(() => onResetDismissal(item.id))}
                            className="w-full px-4 py-3 text-left text-sm text-[#94A3B8] hover:bg-[#2A2A3E] hover:text-white transition-colors flex items-center gap-3 border-b border-[#2A2A3E]"
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Resetar sugestão</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleMenuAction(() => onDelete(item.id))}
                          className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-[#2A2A3E] hover:text-red-300 transition-colors flex items-center gap-3"
                        >
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Excluir</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
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

  // Reset visible count when items change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
  }, [items.length])

  // Track count changes for Item 21 counter animation
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

        {/* Item 22: Empty state with fade-in */}
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
      {/* Item 21: Title with animated counter */}
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

      {/* Item 13: Vertical List with stagger entrance */}
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

        {/* Load More Trigger */}
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
