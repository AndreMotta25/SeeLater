'use client'

import { ItemCard } from './item-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Item } from '@/types'

interface ItemsListProps {
  title: string
  items: Item[]
  onView: (id: string) => void
  onDelete?: (id: string) => void
  loading?: boolean
  emptyMessage?: string
}

export function ItemsList({
  title,
  items,
  onView,
  onDelete,
  loading = false,
  emptyMessage = 'Nenhum item encontrado'
}: ItemsListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-4">
            <div className="flex gap-4">
              <Skeleton className="w-32 h-24 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
