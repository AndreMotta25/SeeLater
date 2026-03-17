'use client'

import { useRouter } from 'next/navigation'

interface ItemDetailHeaderProps {
  onShare?: () => void
}

export function ItemDetailHeader({ onShare }: ItemDetailHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F1A]/80 backdrop-blur-lg border-b border-[#2A2A3E]">
      <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white hover:text-[#6366F1] transition-colors"
          aria-label="Voltar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Title */}
        <h1 className="text-lg font-bold text-white font-heading">
          Detalhes do item
        </h1>

        {/* Share Button */}
        <button
          onClick={onShare}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white hover:text-[#6366F1] transition-colors"
          aria-label="Compartilhar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3V15M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
