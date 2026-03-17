/**
 * Extrai o ID do vídeo da URL do YouTube
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

/**
 * Enriquece dados do YouTube via oEmbed
 */
export async function enrichYouTube(videoUrl: string): Promise<{
  title: string
  thumbnail: string
  type: 'video'
} | null> {
  try {
    const videoId = extractYouTubeId(videoUrl)
    if (!videoId) return null

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`

    const response = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) return null

    const data = await response.json()

    return {
      title: data.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      type: 'video'
    }
  } catch {
    return null
  }
}
