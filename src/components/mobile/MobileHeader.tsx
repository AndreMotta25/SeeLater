'use client'

import { useState } from 'react'

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#0F0F1A] border-b border-[#1A1A2E]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Hamburger Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white"
          aria-label="Abrir menu"
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[12px]">
            <path d="M0 12V10H18V12H0ZM0 7V5H18V7H0ZM0 2V0H18V2H0Z" fill="currentColor"/>
          </svg>
        </button>

        {/* Logo/Title */}
        <h1 className="text-xl font-bold text-white font-heading">
          Depois
        </h1>

        {/* User Avatar */}
        <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#6366F1] overflow-hidden bg-[#1A1A2E]">
            <img
              src="/images/icons/perfil.png"
              alt="Perfil"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Side Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-[#1A1A2E] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-4 mt-8">
              <a href="/" className="block px-4 py-3 text-white hover:bg-[#6366F1]/20 rounded-lg transition-colors">
                Início
              </a>
              <a href="/history" className="block px-4 py-3 text-white hover:bg-[#6366F1]/20 rounded-lg transition-colors">
                Histórico
              </a>
              <a href="/settings" className="block px-4 py-3 text-white hover:bg-[#6366F1]/20 rounded-lg transition-colors">
                Configurações
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
