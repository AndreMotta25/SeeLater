'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Item } from '@/types'
import Image from 'next/image'

interface ItemCardProps {
  item: Item
  onView: (id: string) => void
  onDelete?: (id: string) => void
}

const typeLabels: Record<Item['type'], string> = {
  video: 'Vídeo',
  article: 'Artigo',
  repo: 'Repositório',
  tweet: 'Tweet',
  other: 'Link'
}

export function ItemCard({ item, onView, onDelete }: ItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(item.id)}>
      <div className="flex gap-4 p-4">
        {item.thumbnail && (
          <div className="relative w-32 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-200">
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-base line-clamp-2 flex-1">
              {item.title}
            </h3>
            <Badge className="flex-shrink-0">
              {typeLabels[item.type]}
            </Badge>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {item.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.favicon && (
                <Image
                  src={item.favicon}
                  alt=""
                  width={16}
                  height={16}
                  className="rounded-sm"
                />
              )}
              <span className="text-xs text-muted-foreground">
                {item.siteName || new URL(item.url).hostname}
              </span>
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                className="min-h-[32px] min-w-[32px] px-2"
                onClick={e => {
                  e.stopPropagation()
                  onDelete(item.id)
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
