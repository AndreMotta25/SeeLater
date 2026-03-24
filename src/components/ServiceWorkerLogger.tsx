'use client'

import { useEffect } from 'react'

export function ServiceWorkerLogger() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('[PWA] ===== Service Worker Diagnostics =====')
    console.log('[PWA] User Agent:', navigator.userAgent)
    console.log('[PWA] Service Worker Support:', 'serviceWorker' in navigator)
    console.log('[PWA] Online:', navigator.onLine)

    // Log mudanças de status online/offline
    const handleOnline = () => {
      console.log('[PWA] ✅ Network status: ONLINE')
    }
    const handleOffline = () => {
      console.log('[PWA] ❌ Network status: OFFLINE')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Registrar service worker com logs detalhados
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { type: 'module' })
        .then((registration) => {
          console.log('[PWA] ✅ Service Worker registrado:', registration.scope)

          // Verificar estado de ativação
          if (registration.active) {
            console.log('[PWA] ✅ Service Worker está ATIVO')
          } else if (registration.installing) {
            console.log('[PWA] ⏳ Service Worker está instalando...')
            registration.installing.addEventListener('statechange', () => {
              if (registration.active) {
                console.log('[PWA] ✅ Service Worker agora está ATIVO')
              }
            })
          } else if (registration.waiting) {
            console.log('[PWA] ⏳ Service Worker está aguardando ativação')
          }

          // Verificar updates
          registration.addEventListener('updatefound', () => {
            console.log('[PWA] 🔄 Novo Service Worker encontrado!')
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                console.log('[PWA] Estado do SW:', newWorker.state)
              })
            }
          })

          // Listar caches
          caches.keys().then((cacheNames) => {
            console.log('[PWA] 📦 Caches encontrados:', cacheNames)
            cacheNames.forEach((cacheName) => {
              caches.open(cacheName).then((cache) => {
                cache.keys().then((keys) => {
                  console.log(`[PWA] Cache "${cacheName}": ${keys.length} itens`)
                })
              })
            })
          })
        })
        .catch((error) => {
          console.error('[PWA] ❌ Erro ao registrar Service Worker:', error)
        })

      // Monitorar mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[PWA] 📨 Mensagem do SW:', event.data)
      })

      // Verificar controller
      if (navigator.serviceWorker.controller) {
        console.log('[PWA] ✅ Service Worker está controlando a página')
      } else {
        console.log('[PWA] ⚠️ Service Worker NÃO está controlando a página (recarregue)')
      }
    } else {
      console.error('[PWA] ❌ Service Worker não é suportado')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return null
}
