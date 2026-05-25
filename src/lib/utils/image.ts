import { PUBLIC_URL } from '#/lib/r2'

interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
}

function extractImageUrlsFromNode(node: TiptapNode): string[] {
  const urls: string[] = []

  if (node.type === 'image' && node.attrs) {
    const src = node.attrs.src
    if (typeof src === 'string') {
      urls.push(src)
    }
  }

  if (node.content) {
    for (const child of node.content) {
      urls.push(...extractImageUrlsFromNode(child))
    }
  }

  return urls
}

export function extractR2ImageUrls(content: string | null | undefined): string[] {
  if (!content) return []

  try {
    const parsed: TiptapNode = typeof content === 'string' ? JSON.parse(content) : content
    const allUrls = extractImageUrlsFromNode(parsed)
    return allUrls.filter(url => url.startsWith(PUBLIC_URL))
  } catch {
    return []
  }
}

export function findOrphanImages(
  oldContent: string | null | undefined,
  newContent: string | null | undefined
): string[] {
  const oldUrls = extractR2ImageUrls(oldContent)
  const newUrls = extractR2ImageUrls(newContent)
  const newUrlSet = new Set(newUrls)

  return oldUrls.filter(url => !newUrlSet.has(url))
}