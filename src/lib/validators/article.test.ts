import { describe, test, expect } from 'vitest'
import {
  createArticleSchema,
  updateArticleSchema,
  publishArticleSchema,
  archiveArticleSchema,
  unpublishArticleSchema,
  restoreArticleSchema,
  getArticleByIdSchema,
  getMyArticlesSchema,
  searchArticlesSchema,
  getArticlesByAuthorSchema,
  deleteArticleSchema,
  paginationSchema,
  cursorPaginationSchema,
} from './article'

describe('createArticleSchema', () => {
  test('accepts valid article data', () => {
    const result = createArticleSchema.safeParse({
      title: 'Test Article',
      excerpt: 'Test excerpt',
      content: 'Test content',
      coverImage: 'https://example.com/image.jpg',
      tags: ['tag1', 'tag2'],
    })
    expect(result.success).toBe(true)
  })

  test('accepts article without optional fields', () => {
    const result = createArticleSchema.safeParse({
      title: 'Test Article',
      content: 'Test content',
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty title', () => {
    const result = createArticleSchema.safeParse({
      title: '',
      content: 'Test content',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('标题不能为空')
    }
  })

  test('rejects title over 100 characters', () => {
    const result = createArticleSchema.safeParse({
      title: 'a'.repeat(101),
      content: 'Test content',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('标题不能超过100个字符')
    }
  })

  test('rejects excerpt over 200 characters', () => {
    const result = createArticleSchema.safeParse({
      title: 'Test Article',
      excerpt: 'a'.repeat(201),
      content: 'Test content',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('摘要不能超过200个字符')
    }
  })

  test('rejects invalid coverImage URL', () => {
    const result = createArticleSchema.safeParse({
      title: 'Test Article',
      content: 'Test content',
      coverImage: 'invalid-url',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入有效的图片URL')
    }
  })

  test('rejects more than 5 tags', () => {
    const result = createArticleSchema.safeParse({
      title: 'Test Article',
      content: 'Test content',
      tags: ['t1', 't2', 't3', 't4', 't5', 't6'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('最多添加5个标签')
    }
  })
})

describe('updateArticleSchema', () => {
  test('accepts valid update data', () => {
    const result = updateArticleSchema.safeParse({
      id: 'article-id',
      title: 'Updated Title',
      content: 'Updated content',
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty id', () => {
    const result = updateArticleSchema.safeParse({
      id: '',
      title: 'Updated Title',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID不能为空')
    }
  })

  test('rejects empty content if provided', () => {
    const result = updateArticleSchema.safeParse({
      id: 'article-id',
      content: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('内容不能为空')
    }
  })

  test('rejects title over 100 characters', () => {
    const result = updateArticleSchema.safeParse({
      id: 'article-id',
      title: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('标题不能超过100个字符')
    }
  })

  test('rejects excerpt over 200 characters', () => {
    const result = updateArticleSchema.safeParse({
      id: 'article-id',
      excerpt: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('摘要不能超过200个字符')
    }
  })
})

describe('publishArticleSchema', () => {
  test('accepts valid id', () => {
    const result = publishArticleSchema.safeParse({ id: 'article-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty id', () => {
    const result = publishArticleSchema.safeParse({ id: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID不能为空')
    }
  })
})

describe('archiveArticleSchema', () => {
  test('accepts valid id', () => {
    const result = archiveArticleSchema.safeParse({ id: 'article-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty id', () => {
    const result = archiveArticleSchema.safeParse({ id: '' })
    expect(result.success).toBe(false)
  })
})

describe('unpublishArticleSchema', () => {
  test('accepts valid id', () => {
    const result = unpublishArticleSchema.safeParse({ id: 'article-id' })
    expect(result.success).toBe(true)
  })
})

describe('restoreArticleSchema', () => {
  test('accepts valid id', () => {
    const result = restoreArticleSchema.safeParse({ id: 'article-id' })
    expect(result.success).toBe(true)
  })
})

describe('getArticleByIdSchema', () => {
  test('accepts valid id', () => {
    const result = getArticleByIdSchema.safeParse({ id: 'article-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty id', () => {
    const result = getArticleByIdSchema.safeParse({ id: '' })
    expect(result.success).toBe(false)
  })
})

describe('paginationSchema', () => {
  test('applies defaults', () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(10)
    }
  })

  test('accepts valid pagination', () => {
    const result = paginationSchema.safeParse({ page: 2, limit: 20 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.limit).toBe(20)
    }
  })

  test('rejects limit over 50', () => {
    const result = paginationSchema.safeParse({ page: 1, limit: 51 })
    expect(result.success).toBe(false)
  })

  test('rejects page less than 1', () => {
    const result = paginationSchema.safeParse({ page: 0, limit: 10 })
    expect(result.success).toBe(false)
  })
})

describe('cursorPaginationSchema', () => {
  test('applies default limit', () => {
    const result = cursorPaginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(10)
    }
  })

  test('accepts valid cursor', () => {
    const result = cursorPaginationSchema.safeParse({ cursor: 'abc123', limit: 15 })
    expect(result.success).toBe(true)
  })

  test('rejects limit over 20', () => {
    const result = cursorPaginationSchema.safeParse({ limit: 21 })
    expect(result.success).toBe(false)
  })
})

describe('searchArticlesSchema', () => {
  test('accepts valid search query', () => {
    const result = searchArticlesSchema.safeParse({ query: 'test' })
    expect(result.success).toBe(true)
  })

  test('rejects empty query', () => {
    const result = searchArticlesSchema.safeParse({ query: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('搜索关键词不能为空')
    }
  })

  test('rejects query over 100 characters', () => {
    const result = searchArticlesSchema.safeParse({ query: 'a'.repeat(101) })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('搜索关键词不能超过100个字符')
    }
  })
})

describe('getArticlesByAuthorSchema', () => {
  test('accepts username', () => {
    const result = getArticlesByAuthorSchema.safeParse({ username: 'testuser' })
    expect(result.success).toBe(true)
  })

  test('accepts authorId', () => {
    const result = getArticlesByAuthorSchema.safeParse({ authorId: 'author-id' })
    expect(result.success).toBe(true)
  })

  test('rejects missing both username and authorId', () => {
    const result = getArticlesByAuthorSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请提供用户名或用户ID')
    }
  })
})

describe('deleteArticleSchema', () => {
  test('accepts valid id', () => {
    const result = deleteArticleSchema.safeParse({ id: 'article-id' })
    expect(result.success).toBe(true)
  })

  test('rejects empty id', () => {
    const result = deleteArticleSchema.safeParse({ id: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('文章ID不能为空')
    }
  })
})

describe('getMyArticlesSchema', () => {
  test('accepts valid input with status', () => {
    const result = getMyArticlesSchema.safeParse({ status: 'DRAFT' })
    expect(result.success).toBe(true)
  })

  test('accepts valid input without status', () => {
    const result = getMyArticlesSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})