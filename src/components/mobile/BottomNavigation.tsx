'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

// Item 24: Bar entrance from bottom
const navEntrance = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      label: 'Início',
      active: pathname === '/',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
          <path d="M2 20V6L10 0L18 6V20H12V12H8V20H2Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      href: '/explore',
      label: 'Fila',
      active: pathname === '/fila',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
          <path d="M2 0H18C19.1 0 20 0.9 20 2V18C20 19.1 19.1 20 18 20H2C0.9 20 0 19.1 0 18V2C0 0.9 0.9 0 2 0ZM4 5V7H16V5H4ZM4 9V11H16V9H4ZM4 13V15H12V13H4Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      href: '/add',
      label: 'Salvar',
      active: pathname === '/add',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
          <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0V0M10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18V18M11 5H9V9H5V11H9V15H11V11H15V9H11V5V5Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      href: '/history',
      label: 'Vistos',
      active: pathname === '/history',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
          <path d="M8.6 14.6L15.65 7.55L14.25 6.15L8.6 11.8L5.75 8.95L4.35 10.35L8.6 14.6V14.6M10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.78333 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20V20M10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18V18M10 10V10V10V10V10V10V10V10V10V10" fill="currentColor"/>
        </svg>
      )
    }
  ]

  return (
    <motion.nav
      variants={navEntrance}
      initial="initial"
      animate="animate"
      className="fixed bottom-0 left-0 right-0 bg-[#0F0F1A]/95 backdrop-blur-sm border-t border-[#1A1A2E] z-50"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex flex-col items-center justify-center
              min-h-[44px] min-w-[44px]
              transition-colors duration-200
              ${item.active ? 'text-[#6366F1]' : 'text-[#94A3B8] hover:text-white'}
            `}
          >
            {/* Item 23: Tap feedback with scale compression */}
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="w-6 h-6 mb-1">
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">
                {item.label}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.nav>
  )
}
