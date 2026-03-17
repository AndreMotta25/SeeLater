import Dexie, { Table } from 'dexie'
import type { Item } from '@/types'

export class DepoisDatabase extends Dexie {
  items!: Table<Item>

  constructor() {
    super('DepoisDB')

    // Version 1: Initial schema
    this.version(1).stores({
      items: 'id, url, [url+viewed], viewed, viewedAt, createdAt'
    })

    // Version 2: Add AI fields (category, embedding)
    this.version(2).stores({
      items: 'id, url, [url+viewed], viewed, viewedAt, createdAt, category, embedding'
    }).upgrade(async () => {
      // Migration: Add null values for existing items
      await this.items.toCollection().modify((item) => {
        if (!item.category) {
          item.category = null
        }
        if (!item.embedding) {
          item.embedding = null
        }
        item.updatedAt = Date.now()
      })
    })

    // Version 3: Add suggestionDismissedAt field
    this.version(3).stores({
      items: 'id, url, [url+viewed], viewed, viewedAt, createdAt, category, embedding, suggestionDismissedAt'
    }).upgrade(async () => {
      // Migration: Add null values for existing items
      await this.items.toCollection().modify((item) => {
        if (item.suggestionDismissedAt === undefined) {
          item.suggestionDismissedAt = null
        }
        item.updatedAt = Date.now()
      })
    })
  }
}

export const db = new DepoisDatabase()
