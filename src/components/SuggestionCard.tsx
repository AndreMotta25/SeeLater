'use client'

import { type Item } from '@/types'
import { cn } from '@/lib/utils'

interface SuggestionCardProps {
  item: Item
  onDismiss: () => void
  onView: () => void
  loading?: boolean
}

export function SuggestionCard({ item, onDismiss, onView, loading }: SuggestionCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            Sugestão para você
          </h3>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Baseado no que você tem visto
          </p>
        </div>
      </div>

      {item.thumbnail && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3 bg-gray-200 dark:bg-gray-800">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          {item.type && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {item.type}
            </div>
          )}
        </div>
      )}

      <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
        {item.title}
      </h4>

      {item.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {item.description}
        </p>
      )}

      <div className="flex items-center gap-2">
        {item.favicon && (
          <img
            src={item.favicon}
            alt=""
            className="w-4 h-4 rounded-sm"
          />
        )}
        {item.siteName && (
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {item.siteName}
          </span>
        )}
        {item.category && (
          <>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
              {item.category}
            </span>
          </>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onView}
          disabled={loading}
          className={cn(
            'flex-1 min-h-[44px] px-4 py-2.5 rounded-lg font-medium text-sm',
            'bg-blue-600 text-white hover:bg-blue-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          )}
        >
          Ver agora
        </button>
        <button
          onClick={onDismiss}
          disabled={loading}
          className={cn(
            'min-h-[44px] px-4 py-2.5 rounded-lg font-medium text-sm',
            'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
            'border border-gray-300 dark:border-gray-700',
            'hover:bg-gray-50 dark:hover:bg-gray-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
          )}
        >
          Depois
        </button>
      </div>
    </div>
  )
}

/**
 * Empty state shown when no suggestion is available
 */
export function SuggestionEmpty() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
        <svg
          className="w-6 h-6 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Salve mais itens e marque como vistos para receber sugestões personalizadas
      </p>
    </div>
  )
}
