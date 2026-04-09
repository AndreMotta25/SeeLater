'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  once?: boolean
}

const directionMap: Record<string, Record<string, number>> = {
  up: { y: 1 },
  down: { y: -1 },
  left: { x: 1 },
  right: { x: -1 },
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 40,
  once = true,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion()
  const axis = directionMap[direction]

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...axis, x: axis.x ? axis.x * distance : 0, y: axis.y ? axis.y * distance : 0 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
