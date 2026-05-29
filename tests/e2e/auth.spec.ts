import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('home page renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '让思想自由流淌' })).toBeVisible()
  })

  test('navigation to articles works', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: '阅览文章' }).click()
    // CSR 页面导航需要等待内容加载 - 使用精确匹配页面标题
    await expect(page.getByRole('heading', { name: '文章', exact: true })).toBeVisible({ timeout: 10000 })
  })

  test('sign-up page accessible', async ({ page }) => {
    await page.goto('/sign-up')
    await expect(page.locator('#email')).toBeVisible()
  })

  test('login page accessible', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('#email')).toBeVisible()
  })

  test('login form has correct fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
  })
})

test.describe('Auth Redirect', () => {
  test('protected routes redirect to login when not authenticated', async ({ page }) => {
    // 先确保未登录状态
    await page.goto('/login')
    // 访问需要认证的页面
    await page.goto('/write')
    // 应该被重定向到登录页
    await expect(page).toHaveURL(/login/)
  })
})

test.describe('Articles', () => {
  test('articles list page renders', async ({ page }) => {
    await page.goto('/articles')
    // CSR 页面需要等待 hydration 完成 - 使用精确匹配页面标题
    await expect(page.getByRole('heading', { name: '文章', exact: true })).toBeVisible({ timeout: 10000 })
  })

  test('about page renders', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})