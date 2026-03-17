'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { EnrichedItem } from '@/types'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  enriching: boolean
  addItem: (item: EnrichedItem) => Promise<any>
  enrichUrl: (url: string) => Promise<EnrichedItem | null>
  error: string | null
}

export function AddItemModal({
  isOpen,
  onClose,
  enriching,
  addItem,
  enrichUrl,
  error
}: AddItemModalProps) {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<EnrichedItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setUrl('')
      setPreview(null)
      setFormError(null)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  async function handlePreview() {
    if (!url.trim()) return

    setFormError(null)
    setLoading(true)

    const result = await enrichUrl(url)

    if (result) {
      setPreview(result)
    } else {
      setFormError(error || 'Falha ao carregar pré-visualização')
    }

    setLoading(false)
  }

  async function handleSave() {
    if (!preview) return

    const item = await addItem(preview)

    if (item) {
      // Close modal and go back to home
      onClose()
      router.push('/')
    } else {
      setFormError(error || 'Falha ao salvar item')
    }
  }

  function handleCancel() {
    setPreview(null)
    setFormError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-[#1A1A2E] rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-[#94A3B8]/30 rounded-full" />
        </div>

        <div className="px-4 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white font-heading">
              Salvar para ver depois
            </h2>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Fechar"
            >
              <svg
                className="w-6 h-6 text-[#94A3B8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* URL Input */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Cole a URL aqui..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !preview && handlePreview()}
                disabled={loading || enriching}
                className={`
                  flex-1 min-h-[48px] px-4 py-3 rounded-xl
                  bg-[#0F0F1A] border ${formError ? 'border-red-500' : 'border-[#2A2A3E]'}
                  text-white placeholder-[#94A3B8]
                  focus:outline-none focus:ring-2 focus:ring-[#6366F1]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-base
                `}
                autoFocus
              />
              {!preview && (
                <button
                  onClick={handlePreview}
                  disabled={!url.trim() || loading}
                  className={`
                    min-h-[48px] px-6 rounded-xl font-semibold text-sm
                    bg-[#6366F1] text-white hover:bg-[#5558E3]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  `}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : 'Preview'}
                </button>
              )}
            </div>

            {formError && (
              <p className="mt-2 text-sm text-red-400">{formError}</p>
            )}
          </div>

          {/* Preview Card */}
          {preview && (
            <div className="bg-[#0F0F1A] rounded-xl overflow-hidden border border-[#2A2A3E]">
              {preview.thumbnail && (
                <div className="relative w-full aspect-video">
                  <img
                    src={preview.thumbnail}
                    alt={preview.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <h3 className="font-semibold text-lg text-white mb-2 line-clamp-2">
                  {preview.title}
                </h3>

                {preview.description && (
                  <p className="text-sm text-[#94A3B8] mb-3 line-clamp-2">
                    {preview.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  {preview.favicon && (
                    <img
                      src={preview.favicon}
                      alt=""
                      className="w-4 h-4 rounded-sm"
                    />
                  )}
                  <span className="text-xs text-[#94A3B8]">
                    {preview.siteName || new URL(preview.url).hostname}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={enriching}
                    className={`
                      flex-1 min-h-[44px] px-4 py-3 rounded-xl font-semibold text-sm
                      bg-[#6366F1] text-white hover:bg-[#5558E3]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors
                    `}
                  >
                    {enriching ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={enriching}
                    className={`
                      min-h-[44px] px-6 rounded-xl font-semibold text-sm
                      bg-transparent text-white border border-[#6366F1]
                      hover:bg-[#6366F1]/10
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors
                    `}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
