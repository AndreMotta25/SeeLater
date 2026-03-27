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

// IMPORTANT: Try to request persistent storage to prevent browser from clearing IndexedDB
// This is critical for offline functionality
if (typeof window !== 'undefined' && 'storage' in navigator && 'persist' in navigator.storage) {
  navigator.storage.persist().then((persistent) => {
    console.log('[AIService] 💾 Persistent storage granted:', persistent)
    if (!persistent) {
      console.warn('[AIService] ⚠️ Persistent storage NOT granted - IndexedDB may be cleared by browser')
    }
  }).catch((err) => {
    console.warn('[AIService] ⚠️ Could not request persistent storage:', err)
  })
}

// Debug: Log cache status
if (typeof window !== 'undefined') {
  console.log('[AIService] ⚙️ Config:', {
    useBrowserCache: env.useBrowserCache,
    allowLocalModels: env.allowLocalModels,
    allowRemoteModels: env.allowRemoteModels,
    classifierEnabled: process.env.NEXT_PUBLIC_ENABLE_AI_CLASSIFIER !== 'false',
    embedderEnabled: process.env.NEXT_PUBLIC_ENABLE_AI_EMBEDDER !== 'false',
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
  private loadingPromise: Promise<void> | null = null

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
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
      const prefix = `[${timestamp}] [${model.toUpperCase()}]`

      if (data.status === 'progress') {
        // No log para cada porcentagem - apenas atualiza UI
        this.notifyProgress({
          model,
          status: this.isFromCache ? 'loading' : 'downloading',
          progress: data.progress || 0,
          file: data.file,
        })
      } else if (data.status === 'done') {
        console.log(`${prefix} ✓ Done!`)
        this.notifyProgress({
          model,
          status: 'ready',
          progress: 100,
        })
      } else if (data.status === 'initiate') {
        console.log(`${prefix} Starting: ${data.file || 'model files'}`)
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
   * Check if models are cached in Cache API (not IndexedDB!)
   * Transformers.js uses the Cache API (caches), not IndexedDB
   */
  private async checkCache(): Promise<boolean> {
    if (this.cacheChecked) return this.isFromCache

    try {
      console.log('[AIService] 🔍 Checking Cache API for models...')

      // Check if persistent storage is granted
      if ('storage' in navigator && 'persisted' in navigator.storage) {
        const isPersistent = await navigator.storage.persisted()
        console.log('[AIService] 🔒 Persistent storage:', isPersistent ? 'GRANTED' : 'NOT GRANTED')
        if (!isPersistent) {
          console.warn('[AIService] ⚠️ WARNING: Browser may clear cache on exit!')
        }
      }

      // Check estimated storage usage
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        console.log('[AIService] 💾 Storage estimate:', {
          usage: `${(estimate.usage || 0) / 1024 / 1024} MB`,
          quota: `${(estimate.quota || 0) / 1024 / 1024} MB`,
          available: `${((estimate.quota || 0) - (estimate.usage || 0)) / 1024 / 1024} MB`,
        })
      }

      // Transformers.js uses Cache API, NOT IndexedDB!
      // Check if caches are available
      if (!('caches' in self)) {
        console.warn('[AIService] ⚠️ Cache API not available in this environment')
        this.isFromCache = false
        this.cacheChecked = true
        return false
      }

      // List all caches
      const cacheNames = await caches.keys()
      console.log('[AIService] 🗄️ All Cache API caches:', cacheNames)

      // Check for transformers cache
      const transformersCacheNames = cacheNames.filter(name => name.includes('transformers') || name.includes('huggingface') || name.includes('xenova'))
      console.log('[AIService] 📦 Transformers-related caches:', transformersCacheNames.length > 0 ? transformersCacheNames : '(none)')

      if (transformersCacheNames.length > 0) {
        // Open each cache and count entries
        for (const cacheName of transformersCacheNames) {
          const cache = await caches.open(cacheName)
          const keys = await cache.keys()
          console.log(`[AIService]   - "${cacheName}": ${keys.length} entries`)

          // Log some sample URLs
          if (keys.length > 0) {
            const sampleUrls = keys.slice(0, 3).map(req => req.url.split('/').pop())
            console.log(`[AIService]     Sample files: ${sampleUrls.join(', ')}`)
          }
        }

        this.isFromCache = true
        this.cacheChecked = true
        return true
      } else {
        console.log('[AIService] 📦 No transformers cache found (first time?)')
        this.isFromCache = false
        this.cacheChecked = true
        return false
      }
    } catch (error) {
      console.warn('[AIService] ❌ Cache check failed:', error)
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
    if (this.classifier) {
      console.log('[AIService] ✓ Classifier already loaded, skipping...')
      return
    }

    // Check if classifier is disabled via environment variable
    if (process.env.NEXT_PUBLIC_ENABLE_AI_CLASSIFIER === 'false') {
      console.log('[AIService] Classifier disabled via NEXT_PUBLIC_ENABLE_AI_CLASSIFIER=false')
      return
    }

    const fromCache = this.isFromCache
    console.log(`[AIService] Loading classifier (from cache: ${fromCache})...`)
    console.log('[AIService] 🔧 env.useBrowserCache:', env.useBrowserCache)

    this.notifyProgress({
      model: 'classifier',
      status: 'loading',
      progress: 0,
    })

    const startTime = performance.now()
    this.classifier = await pipeline(
      'zero-shot-classification',
      'Xenova/nli-deberta-v3-xsmall',
      {
        progress_callback: this.createProgressCallback('classifier'),
      }
    )
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
    console.log(`[AIService] ✓ Classifier loaded in ${elapsed}s`)

    // Check IndexedDB immediately after loading
    this.checkIndexedDBAfterLoad('classifier')
  }

  /**
   * Load the embedder model (all-MiniLM-L6-v2)
   * Used for semantic similarity
   */
  async loadEmbedder(): Promise<void> {
    if (this.embedder) {
      console.log('[AIService] ✓ Embedder already loaded, skipping...')
      return
    }

    // Check if embedder is disabled via environment variable
    if (process.env.NEXT_PUBLIC_ENABLE_AI_EMBEDDER === 'false') {
      console.log('[AIService] Embedder disabled via NEXT_PUBLIC_ENABLE_AI_EMBEDDER=false')
      return
    }

    const fromCache = this.isFromCache
    console.log(`[AIService] Loading embedder (from cache: ${fromCache})...`)
    console.log('[AIService] 🔧 env.useBrowserCache:', env.useBrowserCache)

    this.notifyProgress({
      model: 'embedder',
      status: 'loading',
      progress: 0,
    })

    const startTime = performance.now()
    this.embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      {
        progress_callback: this.createProgressCallback('embedder'),
      }
    )
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
    console.log(`[AIService] ✓ Embedder loaded in ${elapsed}s`)

    // Check IndexedDB immediately after loading
    this.checkIndexedDBAfterLoad('embedder')
  }

  /**
   * Check Cache API state after loading a model
   */
  private checkIndexedDBAfterLoad(modelName: string): void {
    // Note: Transformers.js uses Cache API, not IndexedDB
    try {
      caches.keys().then(cacheNames => {
        const transformersCacheNames = cacheNames.filter(name =>
          name.includes('transformers') || name.includes('huggingface') || name.includes('xenova')
        )

        console.log(`[AIService] 📊 Cache API after ${modelName} load: ${transformersCacheNames.length} caches`)

        if (transformersCacheNames.length > 0) {
          console.log(`[AIService] ✅ Caches: ${transformersCacheNames.join(', ')}`)
        } else {
          console.warn(`[AIService] ⚠️ No caches found after loading ${modelName}!`)
          console.warn(`[AIService] 💡 Transformers.js should create caches automatically`)
          console.warn(`[AIService] 💡 This could mean:`)
          console.warn(`   1. Browser is clearing cache on exit`)
          console.warn(`   2. Extension is clearing cache`)
          console.warn(`   3. Cache API is disabled`)
        }
      }).catch(err => {
        console.warn(`[AIService] ⚠️ Could not check Cache API:`, err)
      })
    } catch (error) {
      console.warn(`[AIService] ⚠️ Error checking Cache API:`, error)
    }
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
    // If already loading, wait for the existing promise
    if (this.loadingPromise) {
      console.log('[AIService] ⏳ Already loading, waiting for existing promise...')
      return this.loadingPromise
    }

    // If both models are already loaded, return immediately
    if (this.isReady()) {
      console.log('[AIService] ✓ Models already loaded, skipping...')
      return
    }

    // Check browser support first
    const support = this.checkSupport()
    if (!support.supported) {
      this.isSupported = false
      this.supportError = support.error || 'Navegador não suportado'
      console.warn('[AIService] Browser not supported:', this.supportError)
      return // Continue without AI
    }

    const overallStartTime = performance.now()
    console.log('[AIService] 🚀 Starting AI model loading...')

    // Create the loading promise
    this.loadingPromise = (async () => {
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
          console.log('[AIService] ⏭️ Skipping classifier load (disabled)')
        }

        if (!embedderDisabled) {
          tasks.push(this.loadEmbedder())
        } else {
          console.log('[AIService] ⏭️ Skipping embedder load (disabled)')
        }

        if (tasks.length === 0) {
          console.log('[AIService] ⏭️ All AI models disabled')
          return
        }

        await Promise.all(tasks)

        const elapsed = ((performance.now() - overallStartTime) / 1000).toFixed(1)
        console.log(`[AIService] ✅ All models loaded in ${elapsed}s!`)

        // POST-LOAD VERIFICATION: Check if models were actually cached
        console.log('[AIService] 🔍 Verifying Cache API...')
        try {
          const cacheNames = await caches.keys()
          const transformersCacheNames = cacheNames.filter(name =>
            name.includes('transformers') || name.includes('huggingface') || name.includes('xenova')
          )

          console.log(`[AIService] 📊 Cache API after load: ${transformersCacheNames.length} caches`)

          if (transformersCacheNames.length === 0) {
            console.error('[AIService] ❌ CRITICAL: Models loaded but NO Cache API caches created!')
            console.error('[AIService] ❌ This means models will NOT persist between sessions!')
            console.error('[AIService] 💡 Check:')
            console.error('   - Browser settings: "Clear site data when you close all windows"')
            console.error('   - Privacy extensions clearing cache')
            console.error('   - Cache API permission denied')
          } else {
            console.log(`[AIService] ✅ Caches: ${transformersCacheNames.join(', ')}`)

            // Count total entries
            let totalEntries = 0
            for (const cacheName of transformersCacheNames) {
              const cache = await caches.open(cacheName)
              const keys = await cache.keys()
              totalEntries += keys.length
            }
            console.log(`[AIService] ✅ Total cached files: ${totalEntries}`)
          }
        } catch (err) {
          console.warn('[AIService] ⚠️ Could not verify Cache API:', err)
        }
      } catch (error) {
        console.error('[AIService] ❌ Failed to load models:', error)
        this.isSupported = false
        this.supportError = error instanceof Error ? error.message : 'Erro ao carregar modelos'
        // Don't throw - allow app to continue without AI
      } finally {
        // Clear the loading promise when done
        this.loadingPromise = null
      }
    })()

    return this.loadingPromise
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
