/**
 * Obtém a URL do favicon de um site
 */
export function getFavicon(url: string): string | null {
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.hostname}/favicon.ico`
  } catch {
    return null
  }
}

/**
 * Obtém favicon de alta qualidade usando Google Favicon Service (fallback)
 */
export function getFaviconFromGoogle(url: string): string | null {
  try {
    const parsed = new URL(url)
    const domain = parsed.hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return null
  }
}
