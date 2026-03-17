const TRACKING_PARAMS = [
  'si',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid'
]

/**
 * Remove parâmetros de tracking da URL
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)

    TRACKING_PARAMS.forEach(param => {
      parsed.searchParams.delete(param)
    })

    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * Extrai o hostname de uma URL
 */
export function extractHostname(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return null
  }
}

/**
 * Extrai o protocolo e hostname para construir URLs absolutas
 */
export function getBaseUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.hostname}`
  } catch {
    return null
  }
}
