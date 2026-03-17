'use client'

import { useItems } from '@/hooks/use-items'
import { AddItemModal } from '@/components/mobile'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AddPage() {
  const router = useRouter()
  const { enriching, addItem, enrichUrl, error } = useItems()

  // Close modal and redirect to home
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
    />
  )
}
