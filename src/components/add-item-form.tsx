'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { EnrichedItem } from '@/types'
import Image from 'next/image'

interface AddItemFormProps {
  enriching: boolean
  addItem: (item: EnrichedItem) => Promise<any>
  enrichUrl: (url: string) => Promise<EnrichedItem | null>
  error: string | null
}

export function AddItemForm({ enriching, addItem, enrichUrl, error }: AddItemFormProps) {
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<EnrichedItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handlePreview() {
    if (!url.trim()) return

    setFormError(null)
    setLoading(true)

    const result = await enrichUrl(url)

    if (result) {
      setPreview(result)
    } else {
      setFormError(error || 'Failed to load preview')
    }

    setLoading(false)
  }

  async function handleSave() {
    if (!preview) return

    const item = await addItem(preview)

    if (item) {
      // Reset form
      setUrl('')
      setPreview(null)
      setFormError(null)
    } else {
      setFormError(error || 'Failed to save item')
    }
  }

  function handleCancel() {
    setPreview(null)
    setFormError(null)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Salvar para ver depois</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Cole a URL aqui..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !preview && handlePreview()}
            error={formError || undefined}
            disabled={loading || enriching}
          />
          {!preview && (
            <Button
              onClick={handlePreview}
              loading={loading}
              disabled={!url.trim() || loading}
            >
              Preview
            </Button>
          )}
        </div>

        {preview && (
          <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-4">
              {preview.thumbnail && (
                <div className="relative w-32 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-200">
                  <Image
                    src={preview.thumbnail}
                    alt={preview.title}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base line-clamp-2 mb-1">
                  {preview.title}
                </h3>
                {preview.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {preview.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {preview.favicon && (
                    <Image
                      src={preview.favicon}
                      alt=""
                      width={16}
                      height={16}
                      className="rounded-sm"
                    />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {preview.siteName || new URL(preview.url).hostname}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {preview && (
        <CardFooter className="gap-2">
          <Button onClick={handleSave} loading={enriching} className="flex-1">
            Salvar
          </Button>
          <Button variant="ghost" onClick={handleCancel} disabled={enriching}>
            Cancelar
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
