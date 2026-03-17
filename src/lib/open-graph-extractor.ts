export interface OpenGraphData {
  title: string
  description: string | null
  thumbnail: string | null
  siteName: string | null
  type: string | null
}

/**
 * Extrai tags Open Graph do HTML
 */
export function extractOpenGraph(html: string): OpenGraphData {
  const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["'][^>]*>/i)
  const descriptionMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
  const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["'][^>]*>/i)
  const siteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["'][^>]*>/i)
  const typeMatch = html.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']*)["'][^>]*>/i)

  // Fallback para title tag
  const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)

  return {
    title: titleMatch?.[1] || titleTagMatch?.[1] || '',
    description: descriptionMatch?.[1] || null,
    thumbnail: imageMatch?.[1] || null,
    siteName: siteNameMatch?.[1] || null,
    type: typeMatch?.[1] || null
  }
}

/**
 * Fetch HTML e extrai Open Graph tags
 */
export async function fetchOpenGraphData(url: string): Promise<OpenGraphData> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    signal: AbortSignal.timeout(10000)
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`)
  }

  const html = await response.text()
  return extractOpenGraph(html)
}
