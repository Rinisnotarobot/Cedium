import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { scrypt, randomBytes } from 'crypto'

// Simple ID generator
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Hash password using scrypt (Better Auth default)
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err)
      else resolve(key)
    })
  })
  return `${salt}:${derivedKey.toString('hex')}`
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

// Test user credentials (consistent for E2E tests)
export const TEST_USER = {
  email: 'test-user@cedium.test',
  password: 'TestPassword123!',
  name: 'Test User',
}

export const TEST_AUTHOR = {
  email: 'test-author@cedium.test',
  password: 'AuthorPassword123!',
  name: 'Test Author',
}

async function main() {
  console.log('🌱 Seeding test data...')

  // Delete test users (cascade will clean all related data)
  try {
    await prisma.user.deleteMany({
      where: {
        email: { in: [TEST_USER.email, TEST_AUTHOR.email] }
      }
    })
    console.log('   Cleaned existing test data')
  } catch {
    // Ignore if users don't exist
  }

  // Create test users
  const hashedTestPassword = await hashPassword(TEST_USER.password)
  const hashedAuthorPassword = await hashPassword(TEST_AUTHOR.password)

  const testUser = await prisma.user.create({
    data: {
      id: generateId(),
      email: TEST_USER.email,
      name: TEST_USER.name,
      emailVerified: true,
      accounts: {
        create: {
          id: generateId(),
          accountId: TEST_USER.email,
          providerId: 'credential',
          password: hashedTestPassword,
        }
      }
    }
  })
  console.log(`   Created user: ${TEST_USER.email}`)

  const testAuthor = await prisma.user.create({
    data: {
      id: generateId(),
      email: TEST_AUTHOR.email,
      name: TEST_AUTHOR.name,
      emailVerified: true,
      bio: 'Test author for E2E testing',
      accounts: {
        create: {
          id: generateId(),
          accountId: TEST_AUTHOR.email,
          providerId: 'credential',
          password: hashedAuthorPassword,
        }
      }
    }
  })
  console.log(`   Created user: ${TEST_AUTHOR.email}`)

  // Create tags
  const techTag = await prisma.tag.create({
    data: { name: '技术', slug: 'tech-e2e' }
  })
  const lifeTag = await prisma.tag.create({
    data: { name: '生活', slug: 'life-e2e' }
  })

  console.log('   Created tags: 技术, 生活')

  // Create published articles
  const article1 = await prisma.article.create({
    data: {
      title: '测试文章 - E2E Testing',
      slug: 'test-article-e2e-testing',
      excerpt: '这是一篇用于 E2E 测试的文章',
      content: '# 测试文章\n\n这是测试内容。\n\n## 功能\n\n- 点赞\n- 收藏\n- 评论',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: testAuthor.id,
      likeCount: 5,
      bookmarkCount: 2,
      commentCount: 1,
    }
  })
  await prisma.articleTag.create({
    data: { articleId: article1.id, tagId: techTag.id }
  })

  // Create second article with life tag
  const article2 = await prisma.article.create({
    data: {
      title: '生活随笔 - Life Notes',
      slug: 'test-article-life-notes',
      excerpt: '这是一篇关于生活的测试文章',
      content: '# 生活随笔\n\n记录生活的点滴。\n\n## 主题\n\n- 日常\n- 思考\n- 感悟',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: testAuthor.id,
      likeCount: 3,
      bookmarkCount: 1,
      commentCount: 0,
    }
  })
  await prisma.articleTag.create({
    data: { articleId: article2.id, tagId: lifeTag.id }
  })
  console.log('   Created 2 test articles')

  // Create comment
  await prisma.comment.create({
    data: {
      content: '这是一条测试评论',
      articleId: article1.id,
      userId: testUser.id,
      likeCount: 2,
    }
  })

  console.log('✅ Test data seeded!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })