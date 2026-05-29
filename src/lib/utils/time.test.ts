import { describe, test, expect } from 'vitest'
import { timeAgo } from './time'

describe('timeAgo', () => {
  test('returns "今天" for today', () => {
    const now = new Date()
    expect(timeAgo(now)).toBe('今天')
  })

  test('returns "昨天" for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(timeAgo(yesterday)).toBe('昨天')
  })

  test('returns days ago for days within a week', () => {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    expect(timeAgo(threeDaysAgo)).toBe('3 天前')
  })

  test('returns weeks ago for days within a month', () => {
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    expect(timeAgo(twoWeeksAgo)).toBe('2 周前')
  })

  test('returns months ago for days within a year', () => {
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60)
    expect(timeAgo(twoMonthsAgo)).toBe('2 个月前')
  })

  test('returns years ago for days over a year', () => {
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    expect(timeAgo(twoYearsAgo)).toBe('2 年前')
  })

  test('accepts string date', () => {
    const dateString = new Date().toISOString()
    expect(timeAgo(dateString)).toBe('今天')
  })

  test('returns future relative time for future dates', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(timeAgo(tomorrow)).toBe('明天')

    const threeDaysLater = new Date()
    threeDaysLater.setDate(threeDaysLater.getDate() + 3)
    expect(timeAgo(threeDaysLater)).toBe('3 天后')

    const twoWeeksLater = new Date()
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
    expect(timeAgo(twoWeeksLater)).toBe('2 周后')
  })
})