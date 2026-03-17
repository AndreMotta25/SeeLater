'use client'

import type { Item } from '@/types'

interface AIRecommendationCardProps {
  item: Item
  onView: () => void
  onDismiss: () => void
  loading: boolean
}

export function AIRecommendationCard({ item, onView, onDismiss, loading }: AIRecommendationCardProps) {
  return (
    <div className="mx-4 mt-6 mb-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-blue-500/20">
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-sm font-semibold text-blue-300">Sugestão da IA</span>
      </div>

      {/* Content */}
      <div className="p-4">
        {item.thumbnail && (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-800 mb-3">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">{item.title}</h3>

        {item.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          {item.favicon && (
            <img src={item.favicon} alt="" className="w-4 h-4 rounded" />
          )}
          <span>{item.siteName || new URL(item.url).hostname}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            disabled={loading}
            className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Carregando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver agora
              </>
            )}
          </button>

          <button
            onClick={onDismiss}
            disabled={loading}
            className="min-h-[44px] min-w-[44px] bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 text-gray-300 rounded-lg transition-colors flex items-center justify-center"
            aria-label="Dispensar sugestão"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
