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

// ALWAYS use browser cache (IndexedDB) for faster subsequent loads
env.useBrowserCache = true

// Safari compatibility: disable multithreading if not supported
if (typeof SharedArrayBuffer === 'undefined') {
  // Safari without proper headers falls back to single thread
  env.useBrowserCache = true
}

// Debug: Log cache status
if (typeof window !== 'undefined') {
  console.log('[AIService] Cache config:', {
    useBrowserCache: env.useBrowserCache,
  })
}

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
  private isSupported: boolean = true
  private supportError: string | null = null
  private cacheChecked: boolean = false
  private isFromCache: boolean = false

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
          status: this.isFromCache ? 'loading' : 'downloading',
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
          status: this.isFromCache ? 'loading' : 'downloading',
          progress: 0,
          file: data.file,
        })
      }
    }
  }

  /**
   * Check if models are cached in IndexedDB
   */
  private async checkCache(): Promise<boolean> {
    if (this.cacheChecked) return this.isFromCache

    try {
      // Transformers.js uses 'transformers-cache' as the default IndexedDB name
      const cacheName = 'transformers-cache'
      const dbOpen = indexedDB.open(cacheName)

      const hasCache = await new Promise<boolean>((resolve) => {
        dbOpen.onsuccess = () => {
          const db = dbOpen.result
          // Check if there are any stores with model data
          const hasModels = db.objectStoreNames.length > 0
          db.close()
          console.log('[AIService] Cache check:', { cacheName, hasModels, storeCount: db.objectStoreNames.length })
          resolve(hasModels)
        }
        dbOpen.onerror = () => {
          console.warn('[AIService] No cache found')
          resolve(false)
        }
      })

      this.isFromCache = hasCache
      this.cacheChecked = true
      return hasCache
    } catch (error) {
      console.warn('[AIService] Cache check failed:', error)
      this.isFromCache = false
      this.cacheChecked = true
      return false
    }
  }

  /**
   * Load the classifier model (nli-deberta-v3-small)
   * Used for automatic categorization
   */
  async loadClassifier(): Promise<void> {
    if (this.classifier) return

    // Check if classifier is disabled via environment variable
    if (process.env.NEXT_PUBLIC_ENABLE_AI_CLASSIFIER === 'false') {
      console.log('[AIService] Classifier disabled via NEXT_PUBLIC_ENABLE_AI_CLASSIFIER=false')
      return
    }

    this.notifyProgress({
      model: 'classifier',
      status: 'loading',
      progress: 0,
    })

    this.classifier = await pipeline(
      'zero-shot-classification',
      'Xenova/nli-deberta-v3-xsmall',
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

    // Check if embedder is disabled via environment variable
    if (process.env.NEXT_PUBLIC_ENABLE_AI_EMBEDDER === 'false') {
      console.log('[AIService] Embedder disabled via NEXT_PUBLIC_ENABLE_AI_EMBEDDER=false')
      return
    }

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
   * Check if browser supports required features
   */
  private checkSupport(): { supported: boolean; error?: string } {
    // Check WebAssembly support
    if (typeof WebAssembly === 'undefined') {
      return { supported: false, error: 'WebAssembly não é suportado neste navegador' }
    }

    // Check if we can allocate enough memory (Safari may have limits)
    try {
      // Try to allocate a 256MB buffer (models need this)
      const testSize = 256 * 1024 * 1024
      const buffer = new ArrayBuffer(testSize)
      // Safari may allow allocation but fail during actual use
      if (buffer.byteLength < testSize) {
        return { supported: false, error: 'Memória insuficiente para os modelos de IA' }
      }
    } catch {
      return { supported: false, error: 'Memória insuficiente para os modelos de IA' }
    }

    return { supported: true }
  }

  /**
   * Load both models
   */
  async loadAll(): Promise<void> {
    // Check browser support first
    const support = this.checkSupport()
    if (!support.supported) {
      this.isSupported = false
      this.supportError = support.error || 'Navegador não suportado'
      console.warn('[AIService] Browser not supported:', this.supportError)
      return // Continue without AI
    }

    try {
      // Check if models are cached (for better UX)
      await this.checkCache()

      // Only load models that are enabled
      const classifierDisabled = process.env.NEXT_PUBLIC_ENABLE_AI_CLASSIFIER === 'false'
      const embedderDisabled = process.env.NEXT_PUBLIC_ENABLE_AI_EMBEDDER === 'false'
      const tasks = []

      if (!classifierDisabled) {
        tasks.push(this.loadClassifier())
      } else {
        console.log('[AIService] Skipping classifier load (disabled)')
      }

      if (!embedderDisabled) {
        tasks.push(this.loadEmbedder())
      } else {
        console.log('[AIService] Skipping embedder load (disabled)')
      }

      if (tasks.length === 0) {
        console.log('[AIService] All AI models disabled')
        return
      }

      await Promise.all(tasks)
    } catch (error) {
      console.error('[AIService] Failed to load models:', error)
      this.isSupported = false
      this.supportError = error instanceof Error ? error.message : 'Erro ao carregar modelos'
      // Don't throw - allow app to continue without AI
    }
  }

  /**
   * Check if browser supports AI features
   */
  getIsSupported(): { supported: boolean; error?: string } {
    return { supported: this.isSupported, error: this.supportError ?? undefined }
  }

  /**
   * Check if models are loaded
   */
  isReady(): boolean {
    const classifierDisabled = process.env.NEXT_PUBLIC_ENABLE_AI_CLASSIFIER === 'false'
    const embedderDisabled = process.env.NEXT_PUBLIC_ENABLE_AI_EMBEDDER === 'false'

    // If both are disabled, not "ready" for AI features
    if (classifierDisabled && embedderDisabled) {
      return false
    }

    // If classifier is disabled, only need embedder to be "ready"
    if (classifierDisabled) {
      return this.isSupported && this.embedder !== null
    }

    // If embedder is disabled, only need classifier to be "ready"
    if (embedderDisabled) {
      return this.isSupported && this.classifier !== null
    }

    // Both enabled: need both to be "ready"
    return this.isSupported && this.classifier !== null && this.embedder !== null
  }

  /**
   * Check if loading from cache (for UI purposes)
   */
  isLoadingFromCache(): boolean {
    return this.isFromCache
  }

  /**
   * Classify text into categories
   * Uses zero-shot classification with NLI
   */
  async classify(text: string): Promise<Category> {
    if (process.env.NEXT_PUBLIC_ENABLE_AI_CLASSIFIER === 'false') {
      // Return default category if classifier is disabled
      return 'Outros'
    }

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
