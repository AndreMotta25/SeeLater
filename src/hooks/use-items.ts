'use client'

import { ItemsRepository } from '@/repositories/items-repository'
import type { CreateItemInput, Item, EnrichedItem } from '@/types'
import { useEffect, useState } from 'react'
import { aiService, calculateInterestProfile, findMostSimilar } from '@/lib/ai'

interface EnrichResponse {
  url: string
  title: string
  description: string | null
  thumbnail: string | null
  siteName: string | null
  favicon: string | null
  type: 'video' | 'article' | 'repo' | 'tweet' | 'other'
}

export function useItems() {
  const [unviewed, setUnviewed] = useState<Item[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [enriching, setEnriching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicateItem, setDuplicateItem] = useState<Item | null>(null)

  // Carrega os itens ao montar do componente
  useEffect(() => {
    loadItems()
  }, [])

  async function loadItems() {
    try {
      setLoading(true)
      setError(null)
      const [unviewedItems, viewedItems] = await Promise.all([
        ItemsRepository.getUnviewed(),
        ItemsRepository.getRecentlyViewed(10)
      ])
      setUnviewed(unviewedItems)
      setRecentlyViewed(viewedItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  async function enrichUrl(url: string): Promise<EnrichedItem | null> {
    try {
      setEnriching(true)
      setError(null)

      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to enrich URL')
      }

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enrich URL')
      return null
    } finally {
      setEnriching(false)
    }
  }

  async function addItem(enrichedData: EnrichedItem): Promise<Item | null> {
    try {
      setError(null)
      setDuplicateItem(null)

      // Verifica se já existe
      const existing = await ItemsRepository.findByUrl(enrichedData.url)
      if (existing) {
        setDuplicateItem(existing)
        setError('Este link já foi salvo')
        return null
      }

      // Process with AI if available
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
        } catch (aiError) {
          console.warn('AI processing failed, continuing without it:', aiError)
        }
      }

      const input: CreateItemInput = {
        url: enrichedData.url,
        title: enrichedData.title,
        description: enrichedData.description,
        thumbnail: enrichedData.thumbnail,
        siteName: enrichedData.siteName,
        favicon: enrichedData.favicon,
        type: enrichedData.type,
        category,
        embedding
      }

      const item = await ItemsRepository.create(input)

      // Reload from database to ensure consistency
      await loadItems()

      return item
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
      return null
    }
  }

  async function markAsViewed(id: string): Promise<void> {
    try {
      await ItemsRepository.markAsViewed(id)

      // Move de unviewed para recentlyViewed
      const item = unviewed.find(i => i.id === id)
      if (item) {
        setUnviewed(prev => prev.filter(i => i.id !== id))
        setRecentlyViewed(prev => [{ ...item, viewed: true, viewedAt: Date.now() }, ...prev])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as viewed')
    }
  }

  async function markAsUnviewed(id: string): Promise<void> {
    try {
      await ItemsRepository.markAsUnviewed(id)

      // Move de recentlyViewed para unviewed
      const item = recentlyViewed.find(i => i.id === id)
      if (item) {
        setRecentlyViewed(prev => prev.filter(i => i.id !== id))
        setUnviewed(prev => [{ ...item, viewed: false, viewedAt: null }, ...prev])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as unviewed')
    }
  }

  async function updateCategory(id: string, category: string): Promise<void> {
    try {
      await ItemsRepository.updateCategory(id, category)
      setUnviewed(prev =>
        prev.map(item => item.id === id ? { ...item, category } : item)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
    }
  }

  async function deleteItem(id: string): Promise<void> {
    try {
      await ItemsRepository.delete(id)
      setUnviewed(prev => prev.filter(i => i.id !== id))
      setRecentlyViewed(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  async function dismissSuggestion(id: string): Promise<void> {
    try {
      await ItemsRepository.dismissSuggestion(id)
      setUnviewed(prev =>
        prev.map(item => item.id === id ? { ...item, suggestionDismissedAt: Date.now() } : item)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss suggestion')
    }
  }

  async function resetSuggestionDismissal(id: string): Promise<void> {
    try {
      await ItemsRepository.resetSuggestionDismissal(id)
      setUnviewed(prev =>
        prev.map(item => item.id === id ? { ...item, suggestionDismissedAt: null } : item)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset suggestion')
    }
  }

  /**
   * Get AI-powered suggestion based on user's viewing history
   * Returns the item from the queue most similar to recently viewed items
   * Ignores items that were dismissed in the last 7 days
   */
  async function getSuggestion(): Promise<Item | null> {
    try {
      console.log('[Suggestion] Starting suggestion process...')

      if (!aiService.isReady()) {
        console.log('[Suggestion] AI not ready')
        return null
      }

      // Get viewed items with embeddings
      const viewedItems = await ItemsRepository.getRecentlyViewed(50)
      console.log('[Suggestion] Viewed items:', viewedItems.length)

      const viewedWithEmbeddings = viewedItems.filter(
        (item) => item.embedding !== null && item.embedding.length > 0
      ) as Array<{ embedding: number[]; viewedAt: number }>

      console.log('[Suggestion] Viewed with embeddings:', viewedWithEmbeddings.length)

      if (viewedWithEmbeddings.length === 0) {
        console.log('[Suggestion] No viewed items with embeddings')
        return null
      }

      // Calculate interest profile from viewed items
      const interestProfile = calculateInterestProfile(viewedWithEmbeddings, {
        maxItems: 20,
        maxDaysOld: 30,
      })

      if (!interestProfile) {
        console.log('[Suggestion] No interest profile calculated')
        return null
      }

      console.log('[Suggestion] Interest profile calculated')

      // Get unviewed items with embeddings, excluding recently dismissed ones
      const unviewedItems = await ItemsRepository.getUnviewed()
      console.log('[Suggestion] Unviewed items:', unviewedItems.length)

      // Filter out items dismissed in the last 2 days
      const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000)
      const eligibleItems = unviewedItems.filter(
        (item) => !item.suggestionDismissedAt || item.suggestionDismissedAt < twoDaysAgo
      )

      console.log('[Suggestion] Items after filtering dismissed:', eligibleItems.length)

      const unviewedWithEmbeddings = eligibleItems
        .filter((item) => item.embedding !== null && item.embedding.length > 0)
        .map((item) => ({ id: item.id, embedding: item.embedding! }))

      console.log('[Suggestion] Unviewed with embeddings:', unviewedWithEmbeddings.length)

      if (unviewedWithEmbeddings.length === 0) {
        console.log('[Suggestion] No eligible items with embeddings')
        return null
      }

      // Find most similar item
      const suggestedId = findMostSimilar(interestProfile, unviewedWithEmbeddings)

      console.log('[Suggestion] Suggested ID:', suggestedId)

      if (!suggestedId) {
        return null
      }

      const suggestedItem = unviewedItems.find((item) => item.id === suggestedId) || null
      console.log('[Suggestion] Suggested item:', suggestedItem?.title)

      return suggestedItem
    } catch (err) {
      console.warn('[Suggestion] Failed to get suggestion:', err)
      return null
    }
  }

  const unviewedCount = unviewed.length

  return {
    unviewed,
    recentlyViewed,
    unviewedCount,
    loading,
    enriching,
    error,
    duplicateItem,
    enrichUrl,
    addItem,
    markAsViewed,
    markAsUnviewed,
    deleteItem,
    updateCategory,
    getSuggestion,
    dismissSuggestion,
    resetSuggestionDismissal,
    reload: loadItems
  }
}
