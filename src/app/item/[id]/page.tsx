'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ItemsRepository } from '@/repositories/items-repository'
import { ItemDetailHeader, ItemDetail } from '@/components/mobile'
import { useItems } from '@/hooks/use-items'

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { markAsViewed, deleteItem, markAsUnviewed } = useItems()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadItem() {
      try {
        const id = params.id as string
        const foundItem = await ItemsRepository.getById(id)
        if (!foundItem) {
          router.back()
          return
        }
        setItem(foundItem)
      } catch (err) {
        console.error('Failed to load item:', err)
        router.back()
      } finally {
        setLoading(false)
      }
    }

    loadItem()
  }, [params.id, router])

  async function handleMarkAsUnviewed(id: string) {
    await markAsUnviewed(id)
    // Update local state
    if (item) {
      setItem({ ...item, viewed: false, viewedAt: null })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6366F1] border-t-transparent" />
      </div>
    )
  }

  if (!item) {
    return null
  }

  async function handleShare() {
    if (item && navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description || '',
          url: item.url,
        })
      } catch (err) {
        console.warn('Share canceled:', err)
      }
    } else if (item) {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(item.url)
      alert('Link copiado para a área de transferência!')
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <div className="max-w-md mx-auto min-h-screen bg-[#0F0F1A]">
        <ItemDetailHeader onShare={handleShare} />
        <ItemDetail
          item={item}
          onMarkAsViewed={markAsViewed}
          onDelete={deleteItem}
          onMarkAsUnviewed={handleMarkAsUnviewed}
        />
      </div>
    </div>
  )
}
