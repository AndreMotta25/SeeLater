export type ItemType = 'video' | 'article' | 'repo' | 'tweet' | 'other'

export interface Item {
  id: string
  url: string
  title: string
  description: string | null
  thumbnail: string | null
  siteName: string | null
  favicon: string | null
  type: ItemType
  viewed: boolean
  viewedAt: number | null
  category: string | null
  embedding: number[] | null
  suggestionDismissedAt: number | null
  createdAt: number
  updatedAt: number
}

export interface EnrichedItem {
  url: string
  title: string
  description: string | null
  thumbnail: string | null
  siteName: string | null
  favicon: string | null
  type: ItemType
}

export interface CreateItemInput {
  url: string
  title: string
  description?: string | null
  thumbnail?: string | null
  siteName?: string | null
  favicon?: string | null
  type?: ItemType
  category?: string | null
  embedding?: number[] | null
}
