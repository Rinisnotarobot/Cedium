/**
 * 将日期转换为相对时间描述（中文）
 * @param date - 日期对象或字符串
 * @returns 相对时间描述，如 "今天"、"昨天"、"3 天前"、"2 周前"
 */
export function timeAgo(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Handle future dates with proper semantics
  if (diffDays < 0) {
    const futureDays = Math.abs(diffDays)
    if (futureDays === 0) return "今天"
    if (futureDays === 1) return "明天"
    if (futureDays < 7) return `${futureDays} 天后`
    if (futureDays < 30) return `${Math.floor(futureDays / 7)} 周后`
    if (futureDays < 365) return `${Math.floor(futureDays / 30)} 个月后`
    return `${Math.floor(futureDays / 365)} 年后`
  }
  if (diffDays === 0) return "今天"
  if (diffDays === 1) return "昨天"
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`
  return `${Math.floor(diffDays / 365)} 年前`
}