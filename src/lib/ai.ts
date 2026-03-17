/**
 * AI Service - Local AI using Transformers.js
 * Runs entirely in the browser with WebGPU/WebAssembly
 */

import { pipeline, env } from '@xenova/transformers'

// Progress callback type for Transformers.js
export type ProgressCallback = (data: {
  status: 'initiate' | 'progress' | 'done' | 'download'
  progress?: number
  file?: string
}) => void

// Configure to use local models only (no external calls)
env.allowLocalModels = true
env.allowRemoteModels = true

// Categories for automatic classification
export const CATEGORIES = [
  'Tecnologia',
  'Design',
  'Culinária',
  'Negócios',
  'Ciência',
  'Arte',
  'Esportes',
  'Música',
  'Cinema',
  'Saúde',
  'Educação',
  'Humor',
  'Notícias',
  'Jogos',
  'Viagem',
  'Outros',
] as const

export type Category = typeof CATEGORIES[number]

// Progress callback type
export type AIProgress = {
  model: 'classifier' | 'embedder'
  status: 'downloading' | 'loading' | 'ready'
  progress: number
  file?: string
}

export type AIProgressCallback = (progress: AIProgress) => void

/**
 * AI Service Singleton
 * Manages model loading and inference
 */
class AIService {
  private classifier: any = null
  private embedder: any = null
  private progressCallbacks: Set<AIProgressCallback> = new Set()

  /**
   * Register a callback for model loading progress
   */
  onProgress(callback: AIProgressCallback) {
    this.progressCallbacks.add(callback)
    return () => this.progressCallbacks.delete(callback)
  }

  /**
   * Notify all callbacks of progress
   */
  private notifyProgress(progress: AIProgress) {
    this.progressCallbacks.forEach((cb) => cb(progress))
  }

  /**
   * Create a progress callback for Transformers.js
   */
  private createProgressCallback(model: AIProgress['model']): ProgressCallback {
    return (data: any) => {
      if (data.status === 'progress') {
        this.notifyProgress({
          model,
          status: 'downloading',
          progress: data.progress || 0,
          file: data.file,
        })
      } else if (data.status === 'done') {
        this.notifyProgress({
          model,
          status: 'ready',
          progress: 100,
        })
      } else if (data.status === 'initiate') {
        this.notifyProgress({
          model,
          status: 'downloading',
          progress: 0,
          file: data.file,
        })
      }
    }
  }

  /**
   * Load the classifier model (nli-deberta-v3-small)
   * Used for automatic categorization
   */
  async loadClassifier(): Promise<void> {
    if (this.classifier) return

    this.notifyProgress({
      model: 'classifier',
      status: 'loading',
      progress: 0,
    })

    this.classifier = await pipeline(
      'zero-shot-classification',
      'Xenova/nli-deberta-v3-small',
      {
        progress_callback: this.createProgressCallback('classifier'),
      }
    )
  }

  /**
   * Load the embedder model (all-MiniLM-L6-v2)
   * Used for semantic similarity
   */
  async loadEmbedder(): Promise<void> {
    if (this.embedder) return

    this.notifyProgress({
      model: 'embedder',
      status: 'loading',
      progress: 0,
    })

    this.embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      {
        progress_callback: this.createProgressCallback('embedder'),
      }
    )
  }

  /**
   * Load both models
   */
  async loadAll(): Promise<void> {
    await Promise.all([this.loadClassifier(), this.loadEmbedder()])
  }

  /**
   * Check if models are loaded
   */
  isReady(): boolean {
    return this.classifier !== null && this.embedder !== null
  }

  /**
   * Classify text into categories
   * Uses zero-shot classification with NLI
   */
  async classify(text: string): Promise<Category> {
    if (!this.classifier) {
      await this.loadClassifier()
    }

    const result = await this.classifier(text, CATEGORIES, {
      multi_label: false,
    })

    return result.labels[0] as Category
  }

  /**
   * Generate embedding for text
   * Returns a 384-dimensional vector
   */
  async embed(text: string): Promise<number[]> {
    if (!this.embedder) {
      await this.loadEmbedder()
    }

    const output = await this.embedder(text, {
      pooling: 'mean',
      normalize: true,
    })

    // Convert Tensor to array
    const embedding = Array.from(output.data) as number[]
    return embedding
  }

  /**
   * Process a single item: classify and generate embedding
   */
  async processItem(title: string, description?: string | null): Promise<{
    category: Category
    embedding: number[]
  }> {
    const text = description ? `${title}. ${description}` : title

    const [category, embedding] = await Promise.all([
      this.classify(text),
      this.embed(text),
    ])

    return { category, embedding }
  }
}

// Export singleton instance
export const aiService = new AIService()

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Calculate the average embedding of multiple vectors
 */
export function averageEmbedding(embeddings: number[][]): number[] {
  if (embeddings.length === 0) {
    throw new Error('Cannot average empty embeddings array')
  }

  const dimension = embeddings[0].length
  const result = new Array(dimension).fill(0)

  for (const embedding of embeddings) {
    for (let i = 0; i < dimension; i++) {
      result[i] += embedding[i]
    }
  }

  // Divide by count
  for (let i = 0; i < dimension; i++) {
    result[i] /= embeddings.length
  }

  return result
}

/**
 * Find the most similar item from a list based on a query embedding
 */
export function findMostSimilar(
  queryEmbedding: number[],
  items: Array<{ embedding: number[]; id: string }>
): string | null {
  if (items.length === 0) return null

  let bestMatch: { id: string; score: number } | null = null

  for (const item of items) {
    if (!item.embedding || item.embedding.length === 0) continue

    const score = cosineSimilarity(queryEmbedding, item.embedding)
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { id: item.id, score }
    }
  }

  return bestMatch?.id ?? null
}

/**
 * Calculate user interest profile from recently viewed items
 */
export function calculateInterestProfile(
  viewedItems: Array<{ embedding: number[]; viewedAt: number }>,
  options: {
    maxItems?: number
    maxDaysOld?: number
  } = {}
): number[] | null {
  const { maxItems = 20, maxDaysOld = 30 } = options

  // Filter by recency
  const now = Date.now()
  const dayInMs = 24 * 60 * 60 * 1000
  const cutoff = now - maxDaysOld * dayInMs

  const recentItems = viewedItems
    .filter((item) => item.viewedAt > cutoff)
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .slice(0, maxItems)

  if (recentItems.length === 0) return null

  const embeddings = recentItems.map((item) => item.embedding)
  return averageEmbedding(embeddings)
}
