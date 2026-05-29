import { describe, test, expect } from 'vitest'
import { generateSlug } from './slug'

describe('generateSlug', () => {
  test('converts to lowercase', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
  })

  test('replaces spaces with hyphens', () => {
    expect(generateSlug('test  multiple   spaces')).toBe('test-multiple-spaces')
  })

  test('removes special characters', () => {
    expect(generateSlug('test!@#$%^&*()')).toBe('test')
  })

  test('preserves Chinese characters', () => {
    expect(generateSlug('测试文章')).toBe('测试文章')
  })

  test('handles mixed Chinese and English', () => {
    expect(generateSlug('Test 测试 Article')).toBe('test-测试-article')
  })

  test('trims whitespace', () => {
    expect(generateSlug('  test  ')).toBe('test')
  })

  test('returns empty for empty input', () => {
    expect(generateSlug('')).toBe('')
  })

  test('handles numbers', () => {
    expect(generateSlug('Article 123')).toBe('article-123')
  })

  test('handles underscores', () => {
    expect(generateSlug('test_article_name')).toBe('test_article_name')
  })

  test('collapses consecutive hyphens', () => {
    expect(generateSlug('test---article')).toBe('test-article')
  })

  test('trims leading and trailing hyphens', () => {
    expect(generateSlug('---test---')).toBe('test')
    expect(generateSlug('-test-')).toBe('test')
    expect(generateSlug('--test-article--')).toBe('test-article')
  })
})