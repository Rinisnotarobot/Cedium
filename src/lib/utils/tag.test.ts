import { describe, test, expect } from 'vitest'
import { searchTags } from './tag'
import type { Tag } from '#/types/tag'

const mockTags: Tag[] = [
  { id: '1', name: 'React', slug: 'react' },
  { id: '2', name: 'TypeScript', slug: 'typescript' },
  { id: '3', name: '测试', slug: 'test' },
]

describe('searchTags', () => {
  test('returns all tags when query is empty', () => {
    expect(searchTags(mockTags, '')).toEqual(mockTags)
  })

  test('returns all tags when query is whitespace', () => {
    expect(searchTags(mockTags, '   ')).toEqual(mockTags)
  })

  test('returns empty array when tags is undefined', () => {
    expect(searchTags(undefined, 'react')).toEqual([])
  })

  test('filters by name', () => {
    const result = searchTags(mockTags, 'react')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('React')
  })

  test('filters by slug', () => {
    const result = searchTags(mockTags, 'typescript')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('typescript')
  })

  test('filters Chinese tags', () => {
    const result = searchTags(mockTags, '测试')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('测试')
  })

  test('case-insensitive search', () => {
    const result = searchTags(mockTags, 'REACT')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('React')
  })

  test('partial match', () => {
    const result = searchTags(mockTags, 'type')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('TypeScript')
  })

  test('returns empty array when no match', () => {
    expect(searchTags(mockTags, 'nonexistent')).toEqual([])
  })
})