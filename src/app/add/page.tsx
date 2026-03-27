'use client'

import { useItems } from '@/hooks/use-items'
import { AddItemModal } from '@/components/mobile'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AddPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { enriching, addItem, enrichUrl, error } = useItems()

  // Get shared URL from query params (Share Target API)
  const sharedUrl = searchParams.get('url') || searchParams.get('text') || ''

  function handleClose() {
    router.push('/')
  }

  return (
    <AddItemModal
      isOpen={true}
      onClose={handleClose}
      enriching={enriching}
      addItem={addItem}
      enrichUrl={enrichUrl}
      error={error}
      initialUrl={sharedUrl}
    />
  )
}

export default function AddPage() {
  return (
    <Suspense>
      <AddPageContent />
    </Suspense>
  )
}
