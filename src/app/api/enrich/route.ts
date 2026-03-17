import { NextRequest, NextResponse } from 'next/server'
import { enrichUrlSchema } from '@/lib/validations/api'
import { normalizeUrl, extractHostname } from '@/lib/url-normalizer'
import { detectContentType, isYouTubeUrl } from '@/lib/content-detector'
import { enrichYouTube } from '@/lib/youtube-enricher'
import { fetchOpenGraphData } from '@/lib/open-graph-extractor'
import { getFavicon } from '@/lib/favicon-helper'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = enrichUrlSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', fieldErrors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { url } = parsed.data

    // Primeiro tenta enriquecer via YouTube oEmbed
    if (isYouTubeUrl(url)) {
      const youtubeData = await enrichYouTube(url)

      if (youtubeData) {
        return NextResponse.json({
          url: normalizeUrl(url),
          title: youtubeData.title,
          description: null,
          thumbnail: youtubeData.thumbnail,
          siteName: 'YouTube',
          favicon: getFavicon(url),
          type: youtubeData.type
        })
      }
    }

    // Fetch da página para extrair Open Graph
    const ogData = await fetchOpenGraphData(url)
    const type = detectContentType(url, ogData.type)

    return NextResponse.json({
      url: normalizeUrl(url),
      title: ogData.title || extractHostname(url) || url,
      description: ogData.description,
      thumbnail: ogData.thumbnail,
      siteName: ogData.siteName,
      favicon: getFavicon(url),
      type
    })

  } catch (error) {
    console.error('Error enriching URL:', error)

    return NextResponse.json(
      {
        error: 'Failed to enrich URL',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
