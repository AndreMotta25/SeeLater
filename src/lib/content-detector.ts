import type { ItemType } from '@/types'

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
const GITHUB_REGEX = /^(https?:\/\/)?(github\.com)\/.+\/.+$/
const TWITTER_REGEX = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+$/

/**
 * Detecta o tipo de conteúdo baseado na URL e metadados OG
 */
export function detectContentType(url: string, ogType: string | null): ItemType {
  if (YOUTUBE_REGEX.test(url)) return 'video'
  if (GITHUB_REGEX.test(url)) return 'repo'
  if (TWITTER_REGEX.test(url)) return 'tweet'
  if (ogType === 'video') return 'video'
  if (ogType === 'article') return 'article'
  return 'other'
}

/**
 * Verifica se a URL é do YouTube
 */
export function isYouTubeUrl(url: string): boolean {
  return YOUTUBE_REGEX.test(url)
}

/**
 * Verifica se a URL é do GitHub
 */
export function isGitHubUrl(url: string): boolean {
  return GITHUB_REGEX.test(url)
}

/**
 * Verifica se a URL é do Twitter/X
 */
export function isTwitterUrl(url: string): boolean {
  return TWITTER_REGEX.test(url)
}
