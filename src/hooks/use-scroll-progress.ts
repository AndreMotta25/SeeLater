'use client'

import { useScroll, useReducedMotion, useMotionValue, type MotionValue } from 'framer-motion'
import { type RefObject } from 'react'

/**
 * Tracks scroll progress (0→1) of a target element through the viewport.
 * Uses Framer Motion's useScroll internally.
 *
 * IMPORTANT: Always calls useMotionValue to avoid Rules of Hooks violations.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>): { progress: MotionValue<number> } {
  const shouldReduceMotion = useReducedMotion()
  const fallback = useMotionValue(1)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  return { progress: shouldReduceMotion ? fallback : scrollYProgress }
}
