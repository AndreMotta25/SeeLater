'use client'

import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'

interface ThumbnailShimmerProps {
  src: string | null | undefined
  alt: string
  className?: string
}

export function ThumbnailShimmer({ src, alt, className }: ThumbnailShimmerProps) {
  const [loaded, setLoaded] = useState(false)

  const handleLoad = useCallback(() => {
    setLoaded(true)
  }, [])

  if (!src) {
    return <div className={cn('shimmer', className)} />
  }

  return (
    <div className={cn('relative', className)}>
      {!loaded && (
        <div className="absolute inset-0 shimmer" aria-hidden="true" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}
