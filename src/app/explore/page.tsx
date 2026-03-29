'use client'

import { useItems } from '@/hooks/use-items'
import { MobileHeader, BottomNavigation } from '@/components/mobile'
import { CATEGORIES } from '@/lib/ai'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Item } from '@/types'

const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  'Tecnologia': { text: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  'Design':     { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  'Culinária':  { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  'Negócios':   { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  'Ciência':    { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  'Arte':       { text: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
  'Esportes':   { text: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  'Música':     { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  'Cinema':     { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  'Saúde':      { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  'Educação':   { text: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20' },
  'Humor':      { text: 'text-lime-400', bg: 'bg-lime-400/10', border: 'border-lime-400/20' },
  'Notícias':   { text: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
  'Jogos':      { text: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
  'Viagem':     { text: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
  'Outros':     { text: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
}

const DEFAULT_COLOR = { text: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' }

function getCategoryColor(category: string | null) {
  if (!category) return DEFAULT_COLOR
  return CATEGORY_COLORS[category] ?? DEFAULT_COLOR
}

function groupByCategory(items: Item[]): Map<string, Item[]> {
  const groups = new Map<string, Item[]>()

  for (const item of items) {
    const key = item.category || 'Sem categoria'
    const existing = groups.get(key) ?? []
    existing.push(item)
    groups.set(key, existing)
  }

  return groups
}

function FilaCard({
  item,
  onView,
  onUpdateCategory,
}: {
  item: Item
  onView: (id: string) => void
  onUpdateCategory: (id: string, category: string) => void
}) {
  const router = useRouter()
  const colors = getCategoryColor(item.category)
  const [showMenu, setShowMenu] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showMenu) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
        setShowCategoryPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  function handleMenuAction(action: () => void) {
    setShowMenu(false)
    setShowCategoryPicker(false)
    action()
  }

  return (
    <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] relative">
      <div
        onClick={() => router.push(`/item/${item.id}`)}
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
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-1">
            {item.category && (
              <span className={`text-[10px] font-semibold ${colors.text} truncate`}>
                {item.category.toUpperCase()}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2">{item.title}</h4>

          {/* Source */}
          <div className="flex items-center gap-1">
            {item.favicon && <img src={item.favicon} alt="" className="w-3 h-3 rounded-sm" />}
            <span className="text-xs text-[#94A3B8] truncate">{item.siteName || item.type}</span>
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
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#94A3B8] hover:text-[#6366F1] transition-colors"
            aria-label="Mais opções"
          >
            <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 16C1.45 16 0.979167 15.8042 0.5875 15.4125C0.195833 15.0208 0 14.55 0 14C0 13.45 0.195833 12.9792 0.5875 12.5875C0.979167 12.1958 1.45 12 2 12C2.55 12 3.02083 12.1958 3.4125 12.5875C3.80417 12.9792 4 13.45 4 14C4 14.55 3.80417 15.0208 3.4125 15.4125C3.02083 15.0208 2.55 16 2 16ZM2 10C1.45 10 0.979167 9.80417 0.5875 9.4125C0.195833 9.02083 0 8.55 0 8C0 7.45 0.195833 6.97917 0.5875 6.5875C0.979167 6.19583 1.45 6 2 6C2.55 6 3.02083 6.19583 3.4125 6.5875C3.80417 6.97917 4 7.45 4 8C4 8.55 3.80417 9.02083 3.4125 9.4125C3.02083 9.02083 2.55 10 2 10ZM2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.02083 2.55 4 2 4Z" fill="currentColor"/>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#1A1A2E] border border-[#2A2A3E] rounded-lg shadow-xl z-50 overflow-hidden">
              {showCategoryPicker ? (
                <>
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
                        onClick={() => handleMenuAction(() => onUpdateCategory(item.id, category))}
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
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowCategoryPicker(true)}
                    className="w-full px-4 py-3 text-left text-sm text-[#94A3B8] hover:bg-[#2A2A3E] hover:text-white transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>Alterar categoria</span>
                  </button>
                  <button
                    onClick={() => handleMenuAction(() => onView(item.id))}
                    className="w-full px-4 py-3 text-left text-sm text-[#94A3B8] hover:bg-[#2A2A3E] hover:text-white transition-colors flex items-center gap-3"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Marcar como visto</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FilaPage() {
  const { unviewed, markAsViewed, updateCategory, loading } = useItems()
  const [search, setSearch] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  function toggleCategory(category: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const filteredItems = useMemo(() => {
    if (!search.trim()) return unviewed
    const q = search.toLowerCase()
    return unviewed.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.siteName && item.siteName.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
    )
  }, [unviewed, search])

  const grouped = useMemo(() => groupByCategory(filteredItems), [filteredItems])

  return (
    <div className="min-h-screen bg-[#0F0F1A] pb-20">
      <MobileHeader />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white font-heading mb-2">Sua Fila</h1>
          <p className="text-sm text-[#94A3B8]">
            {unviewed.length} {unviewed.length === 1 ? 'item' : 'itens'} na fila
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar na fila"
            className="w-full bg-[#1A1A2E] text-white text-base rounded-xl pl-10 pr-4 py-3 border border-[#2A2A3E] focus:outline-none focus:ring-2 focus:ring-[#6366F1] placeholder:text-[#94A3B8]"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#1A1A2E] rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-[#2A2A3E] rounded-lg" />
                  <div className="flex-1">
                    <div className="h-3 bg-[#2A2A3E] rounded w-16 mb-2" />
                    <div className="h-4 bg-[#2A2A3E] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#2A2A3E] rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-[#1A1A2E] rounded-xl p-8 text-center border border-[#2A2A3E]">
            {search.trim() ? (
              <>
                <svg className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm text-[#94A3B8]">Nenhum resultado para &quot;{search}&quot;</p>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm text-[#94A3B8]">Sua fila está vazia. Adicione links para ver depois!</p>
              </>
            )}
          </div>
        ) : (
          /* Grouped Items */
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([category, items]) => {
              const colors = getCategoryColor(category === 'Sem categoria' ? null : category)
              return (
                <section key={category}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-2 mb-3 min-h-[44px] w-full text-left"
                  >
                    <svg
                      className={`w-4 h-4 ${colors.text} transition-transform ${collapsedCategories.has(category) ? '-rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <h2 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>
                      {category}
                    </h2>
                    <span className={`text-xs ${colors.text} opacity-60`}>({items.length})</span>
                  </button>

                  {/* Items */}
                  {!collapsedCategories.has(category) && (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <FilaCard
                          key={item.id}
                          item={item}
                          onView={markAsViewed}
                          onUpdateCategory={updateCategory}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
