'use client'

// Check which AI models are enabled
const classifierEnabled = process.env.NEXT_PUBLIC_ENABLE_AI_CLASSIFIER !== 'false'
const embedderEnabled = process.env.NEXT_PUBLIC_ENABLE_AI_EMBEDDER !== 'false'

// AI dots fade-in
const dotVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#0F0F1A] border-b border-[#1A1A2E]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* AI Model Indicators */}
        <div className="flex items-center gap-1 min-w-[44px]">
          {classifierEnabled && (
            <div
              className="w-2 h-2 rounded-full bg-green-500"
              title="Classificador ativo"
            />
          )}
          {embedderEnabled && (
            <div
              className="w-2 h-2 rounded-full bg-blue-500"
              title="Embedder ativo"
            />
          )}
        </div>

        {/* Logo/Title */}
        <h1 className="text-xl font-bold text-white font-heading">
          Depois
        </h1>

        {/* Spacer to keep title centered */}
        <div className="min-w-[44px]" />
      </div>
    </header>
  )
}
