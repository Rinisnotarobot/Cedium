const WORDS_PER_MINUTE = 500
const MIN_READ_TIME = 1

export function estimateReadTime(content: string): number {
  if (!content) return MIN_READ_TIME
  try {
    const parsed = JSON.parse(content)
    const text = extractTextFromJson(parsed)
    const wordCount = text.length
    return Math.max(MIN_READ_TIME, Math.ceil(wordCount / WORDS_PER_MINUTE))
  } catch {
    const wordCount = content.length
    return Math.max(MIN_READ_TIME, Math.ceil(wordCount / WORDS_PER_MINUTE))
  }
}

export function extractTextFromJson(json: unknown): string {
  if (typeof json === "string") return json
  if (!json || typeof json !== "object") return ""
  if (Array.isArray(json)) {
    return json.map(extractTextFromJson).join("")
  }
  const obj = json as Record<string, unknown>
  if (obj.type === "text" && typeof obj.text === "string") {
    return obj.text
  }
  if (obj.content && Array.isArray(obj.content)) {
    return obj.content.map(extractTextFromJson).join("")
  }
  return ""
}