import { db } from '@/lib/db'
import type { CreateItemInput, Item } from '@/types'

export class ItemsRepository {
  /**
   * Normaliza a URL removendo parâmetros de tracking
   */
  static normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url)
      const trackingParams = [
        'si',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'fbclid',
        'gclid'
      ]

      trackingParams.forEach(param => {
        parsed.searchParams.delete(param)
      })

      return parsed.toString()
    } catch {
      return url
    }
  }

  /**
   * Busca um item existente pela URL normalizada
   */
  static async findByUrl(url: string): Promise<Item | undefined> {
    const normalizedUrl = this.normalizeUrl(url)
    return db.items.where('url').equals(normalizedUrl).first()
  }

  /**
   * Cria um novo item
   */
  static async create(input: CreateItemInput): Promise<Item> {
    const id = crypto.randomUUID()
    const now = Date.now()
    const normalizedUrl = this.normalizeUrl(input.url)

    const item: Item = {
      id,
      url: normalizedUrl,
      title: input.title,
      description: input.description ?? null,
      thumbnail: input.thumbnail ?? null,
      siteName: input.siteName ?? null,
      favicon: input.favicon ?? null,
      type: input.type ?? 'other',
      viewed: false,
      viewedAt: null,
      category: input.category ?? null,
      embedding: input.embedding ?? null,
      suggestionDismissedAt: null,
      createdAt: now,
      updatedAt: now
    }

    await db.items.add(item)
    return item
  }

  /**
   * Marca um item como visto
   */
  static async markAsViewed(id: string): Promise<void> {
    await db.items.update(id, {
      viewed: true,
      viewedAt: Date.now()
    })
  }

  /**
   * Marca uma sugestão como dispensada (o usuário clicou em "Depois")
   * Isso reduz a prioridade do item nas recomendações por um tempo
   */
  static async dismissSuggestion(id: string): Promise<void> {
    await db.items.update(id, {
      suggestionDismissedAt: Date.now(),
      updatedAt: Date.now()
    })
  }

  /**
   * Reseta o tempo de dispensa de uma sugestão
   * Permite que o item seja sugerido novamente imediatamente
   */
  static async resetSuggestionDismissal(id: string): Promise<void> {
    await db.items.update(id, {
      suggestionDismissedAt: null,
      updatedAt: Date.now()
    })
  }

  /**
   * Marca um item como não visto
   */
  static async markAsUnviewed(id: string): Promise<void> {
    await db.items.update(id, {
      viewed: false,
      viewedAt: null
    })
  }

  /**
   * Lista todos os itens não vistos
   */
  static async getUnviewed(): Promise<Item[]> {
    return db.items
      .filter(item => !item.viewed)
      .reverse()
      .sortBy('createdAt')
  }

  /**
   * Lista itens vistos recentemente
   */
  static async getRecentlyViewed(limit = 20): Promise<Item[]> {
    return db.items
      .filter(item => item.viewed && item.viewedAt !== null)
      .reverse()
      .sortBy('viewedAt')
      .then(items => items.slice(0, limit))
  }

  /**
   * Busca um item por ID
   */
  static async getById(id: string): Promise<Item | undefined> {
    return db.items.get(id)
  }

  /**
   * Atualiza categoria e embedding de um item (para V3 - IA)
   */
  static async updateAIFields(id: string, category: string, embedding: number[]): Promise<void> {
    await db.items.update(id, {
      category,
      embedding,
      updatedAt: Date.now()
    })
  }

  /**
   * Atualiza a categoria de um item
   */
  static async updateCategory(id: string, category: string): Promise<void> {
    await db.items.update(id, { category, updatedAt: Date.now() })
  }

  /**
   * Deleta um item
   */
  static async delete(id: string): Promise<void> {
    await db.items.delete(id)
  }

  /**
   * Conta itens não vistos
   */
  static async countUnviewed(): Promise<number> {
    return db.items.filter(item => !item.viewed).count()
  }

  /**
   * Busca todos os itens (para cálculo de similaridade na V3)
   */
  static async getAll(): Promise<Item[]> {
    return db.items.toArray()
  }

  /**
   * Busca itens com embedding (para cálculo de similaridade na V3)
   */
  static async getWithEmbeddings(): Promise<Item[]> {
    return db.items
      .filter(item => item.embedding !== null)
      .toArray()
  }
}
