'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">
          Você está offline
        </h1>

        {/* Message */}
        <p className="text-slate-300 mb-8">
          Verifique sua conexão com a internet para acessar o Depois.
        </p>

        {/* Info box */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-8 border border-white/10">
          <p className="text-sm text-slate-300 text-left">
            <span className="text-2xl mr-2">💡</span>
            <strong className="text-white">Dica:</strong> Depois que os modelos de IA
            forem carregados uma vez, o app funciona completamente offline!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="min-h-[44px] px-6 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="min-h-[44px] px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            Ir para início
          </Link>
        </div>

        {/* Script to reload when online */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('online', () => {
                window.location.reload();
              });
            `,
          }}
        />
      </div>
    </div>
  )
}
