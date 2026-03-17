'use client'

import { type Item } from '@/types'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000 // 2 days

interface QueueCardProps {
  item: Item
  onView: (id: string) => void
  onDelete: (id: string) => void
  onResetDismissal?: (id: string) => void
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

export function QueueCard({ item, onView, onDelete, onResetDismissal }: QueueCardProps) {
  const router = useRouter()
  const [remainingTime, setRemainingTime] = useState<string | null>(
    item.suggestionDismissedAt ? getRemainingTime(item.suggestionDismissedAt) : null
  )
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!item.suggestionDismissedAt) return

    const interval = setInterval(() => {
      const remaining = getRemainingTime(item.suggestionDismissedAt)
      setRemainingTime(remaining)

      if (remaining === null) {
        clearInterval(interval)
      }
    }, 60000) // Update every minute

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

  function handleMenuAction(action: () => void) {
    setShowMenu(false)
    action()
  }

  function handleClick() {
    router.push(`/item/${item.id}`)
  }

  return (
    <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] relative">
      <div
        onClick={handleClick}
        className="flex items-start gap-3 p-3 cursor-pointer hover:bg-[#2A2A3E] transition-colors rounded-xl"
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
            {/* Category Badge */}
            {item.category && (
              <div className="text-[10px] font-semibold text-[#6366F1] truncate">
                {item.category.toUpperCase()}
              </div>
            )}

            {/* Cooldown Badge */}
            {remainingTime && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2A2A3E] rounded-full">
                <svg className="w-3 h-3 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px] font-medium text-[#94A3B8]">{remainingTime}</span>
              </div>
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
              <path d="M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14C0 13.45 0.195833 12.9792 0.5875 12.5875C0.979167 12.1958 1.45 12 2 12C2.55 12 3.02083 12.1958 3.4125 12.5875C3.80417 12.9792 4 13.45 4 14C4 14.55 3.80417 15.0208 3.4125 15.4125C3.02083 15.0208 2.55 16 2 16ZM2 10C1.45 10 0.979167 9.80417 0.5875 9.4125C0.195833 9.02083 0 8.55 0 8C0 7.45 0.195833 6.97917 0.5875 6.5875C0.979167 6.19583 1.45 6 2 6C2.55 6 3.02083 6.19583 3.4125 6.5875C3.80417 6.97917 4 7.45 4 8C4 8.55 3.80417 9.02083 3.4125 9.4125C3.02083 9.02083 2.55 10 2 10ZM2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.80417 2.55 4 2 4Z" fill="currentColor"/>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#1A1A2E] border border-[#2A2A3E] rounded-lg shadow-xl z-50 overflow-hidden">
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface QueueSectionProps {
  items: Item[]
  onView: (id: string) => void
  onDelete: (id: string) => void
  onResetDismissal?: (id: string) => void
}

const ITEMS_PER_PAGE = 10

export function QueueSection({ items, onView, onDelete, onResetDismissal }: QueueSectionProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
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

  if (items.length === 0) {
    return (
      <section className="px-4 py-4">
        <h2 className="text-lg font-bold text-white font-heading mb-3">
          Sua Fila
        </h2>

        <div className="bg-[#1A1A2E] rounded-xl p-6 text-center border border-[#2A2A3E]">
          <p className="text-sm text-[#94A3B8]">
            Sua fila está vazia. Adicione links para ver depois!
          </p>
        </div>
      </section>
    )
  }

  const visibleItems = items.slice(0, visibleCount)

  return (
    <section className="px-4 py-4">
      <h2 className="text-lg font-bold text-white font-heading mb-3">
        Sua Fila ({items.length})
      </h2>

      {/* Vertical List with Lazy Loading */}
      <div className="space-y-3">
        {visibleItems.map((item) => (
          <QueueCard
            key={item.id}
            item={item}
            onView={onView}
            onDelete={onDelete}
            onResetDismissal={onResetDismissal}
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
      </div>
    </section>
  )
}
