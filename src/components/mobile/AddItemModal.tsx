'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { EnrichedItem, Item, ItemType } from '@/types'
import { relativeTime } from '@/lib/utils'

interface AddItemModalProps {
  initialUrl?: string
  onSaved?: () => void
}

const typeLabels: Record<ItemType, string> = {
  video: 'VÍDEO',
  article: 'ARTIGO',
  repo: 'REPO',
  tweet: 'TWEET',
  other: 'OUTRO',
}

const typeColors: Record<ItemType, string> = {
  video: 'bg-red-500',
  article: 'bg-blue-500',
  repo: 'bg-gray-500',
  tweet: 'bg-sky-500',
  other: 'bg-gray-400',
}

export function AddItemModal({ initialUrl, onSaved }: AddItemModalProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [url, setUrl] = useState(initialUrl ?? '')
  const [enrichedData, setEnrichedData] = useState<EnrichedItem | null>(null)
  const [enriching, setEnriching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [duplicateItem, setDuplicateItem] = useState<Item | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Focus input on mount if no initial URL
  useEffect(() => {
    if (!initialUrl) {
      inputRef.current?.focus()
    }
  }, [initialUrl])

  // Auto-enrich when URL changes (debounced)
  const enrichTimerRef = useRef<NodeJS.Timeout>(null)
  const enrichUrl = useCallback(async (rawUrl: string) => {
    if (enrichTimerRef.current) clearTimeout(enrichTimerRef.current)

    // Basic URL validation
    try {
      new URL(rawUrl)
    } catch {
      setEnrichedData(null)
      setDuplicateItem(null)
      return
    }

    setEnriching(true)
    setError(null)
    setDuplicateItem(null)

    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to enrich URL')
      }
      const data: EnrichedItem = await res.json()
      setEnrichedData(data)

      // Check for duplicate
      const { ItemsRepository } = await import('@/repositories/items-repository')
      const existing = await ItemsRepository.findByUrl(rawUrl)
      if (existing) {
        setDuplicateItem(existing)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview')
    } finally {
      setEnriching(false)
    }
  }, [])

  // Debounce enrichment on URL change
  useEffect(() => {
    if (!url.trim()) {
      setEnrichedData(null)
      setDuplicateItem(null)
      return
    }
    enrichTimerRef.current = setTimeout(() => enrichUrl(url.trim()), 800)
    return () => {
      if (enrichTimerRef.current) clearTimeout(enrichTimerRef.current)
    }
  }, [url, enrichUrl])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (enrichTimerRef.current) clearTimeout(enrichTimerRef.current)
    }
  }, [])

  async function handleSave() {
    if (!enrichedData) return

    setSaving(true)
    setError(null)

    // Yield to browser so the loading overlay paints before heavy work starts
    await new Promise<void>((r) => requestAnimationFrame(() => r()))

    try {
      const { ItemsRepository } = await import('@/repositories/items-repository')
      const { aiService } = await import('@/lib/ai')

      let category: string | null = null
      let embedding: number[] | null = null

      if (aiService.isReady()) {
        try {
          const aiResult = await aiService.processItem(
            enrichedData.title,
            enrichedData.description
          )
          category = aiResult.category
          embedding = aiResult.embedding
        } catch {
          // Continue without AI
        }
      }

      await ItemsRepository.create({
        url: enrichedData.url,
        title: enrichedData.title,
        description: enrichedData.description,
        thumbnail: enrichedData.thumbnail,
        siteName: enrichedData.siteName,
        favicon: enrichedData.favicon,
        type: enrichedData.type,
        category,
        embedding,
      })

      onSaved?.()
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (initialUrl) {
      router.push('/')
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-[#121826] pb-20">
      {/* Full-screen saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#121826]/90 backdrop-blur-sm">
          <span className="h-12 w-12 animate-spin rounded-full border-4 border-[#6366F1] border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-white">Salvando link...</p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#121826] border-b border-[#1E2532]">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleCancel}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white"
            aria-label="Voltar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-white flex-1">Novo Link</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5">
        {/* Input Section */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1.5">Colar Link</label>
          <div className="relative">
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-[#1E2532] border border-[#2A3441] rounded-xl px-4 py-3 pr-11 text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
            />
            {/* Link icon inside input */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6366F1] pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {enriching && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">Prévia do Conteúdo</p>
            <div className="bg-white rounded-xl p-4 animate-pulse">
              <div className="h-36 bg-gray-200 rounded-lg mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          </div>
        )}

        {enrichedData && !enriching && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-[#6366F1] uppercase tracking-wider mb-2">Prévia do Conteúdo</p>
            <div className="bg-white rounded-xl overflow-hidden">
              {/* Thumbnail */}
              {enrichedData.thumbnail && (
                <div className="relative">
                  <img
                    src={enrichedData.thumbnail}
                    alt=""
                    className="w-full h-44 object-cover"
                  />
                  {/* Play overlay for videos */}
                  {enrichedData.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M6 4.5L16 10L6 15.5V4.5Z" fill="#1F2937" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {/* Type badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded ${typeColors[enrichedData.type]}`}>
                      {typeLabels[enrichedData.type]}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-3">
                {/* Source */}
                <div className="flex items-center gap-1.5 mb-1">
                  {enrichedData.favicon && (
                    <img src={enrichedData.favicon} alt="" className="w-3.5 h-3.5 rounded-sm" />
                  )}
                  <span className="text-xs text-gray-500">{enrichedData.siteName || new URL(enrichedData.url).hostname}</span>
                </div>
                {/* Title */}
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">
                  {enrichedData.title}
                </h3>
                {/* Description */}
                {enrichedData.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {enrichedData.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Warning */}
        {duplicateItem && (
          <div className="mb-4 bg-[#92400E] rounded-lg p-3 flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-yellow-300">
                <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64563 18.3045 1.55466 18.6484 1.55596 18.9975C1.55726 19.3466 1.65079 19.6898 1.82745 19.9931C2.00412 20.2963 2.25763 20.5497 2.56095 20.7262C2.86427 20.9027 3.20755 20.996 3.55664 20.997H20.4434C20.7925 20.996 21.1358 20.9027 21.4391 20.7262C21.7424 20.5497 21.9959 20.2963 22.1726 19.9931C22.3492 19.6898 22.4428 19.3466 22.4441 18.9975C22.4454 18.6484 22.3544 18.3045 22.18 18L13.71 3.86C13.5317 3.55906 13.2776 3.30816 12.9745 3.13356C12.6715 2.95895 12.3291 2.86682 11.9815 2.86682C11.6339 2.86682 11.2915 2.95895 10.9885 3.13356C10.6854 3.30816 10.4313 3.55906 10.253 3.86L10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Aviso de duplicata</p>
              <p className="text-sm text-yellow-200 mt-0.5">
                Este link já foi salvo{duplicateItem.category ? ` na sua pasta '${duplicateItem.category}'` : ''} {duplicateItem.createdAt ? `há ${relativeTime(duplicateItem.createdAt)}` : ''}.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !duplicateItem && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="flex-1 min-h-[48px] bg-[#374151] hover:bg-[#4B5563] text-white font-medium rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!enrichedData || saving || !!duplicateItem}
            className="flex-1 min-h-[48px] bg-[#6366F1] hover:bg-[#5558E6] disabled:bg-[#6366F1]/40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving && (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {saving ? 'Salvando...' : 'Salvar Link'}
          </button>
        </div>
      </main>
    </div>
  )
}
