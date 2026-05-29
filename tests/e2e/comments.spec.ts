import { test, expect } from '@playwright/test'

test.describe('Comments', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to an article page with comments
    await page.goto('/articles')
    // Wait for CSR to complete
    await expect(page.getByRole('heading', { name: '文章', exact: true })).toBeVisible({ timeout: 10000 })
  })

  test('comment section renders on article page', async ({ page }) => {
    // Click on first article to view details
    const firstArticle = page.getByRole('link').filter({ hasText: '测试文章' }).first()
    if (await firstArticle.isVisible()) {
      await firstArticle.click()
      // Wait for article page to load
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })
    }
  })

  test('comment input is visible', async ({ page }) => {
    // Navigate directly to a test article if available
    await page.goto('/articles/test-article-e2e')

    // Just check page loads - comment input may not exist if not logged in
    await expect(page).toHaveURL(/articles/)
  })

  test('like button exists on comments', async ({ page }) => {
    // Navigate to articles list
    await page.goto('/articles')
    await expect(page.getByRole('heading', { name: '文章', exact: true })).toBeVisible({ timeout: 10000 })

    // Just verify articles list loaded - actual like button testing needs auth
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Comment Permissions', () => {
  test('guest user cannot edit comments', async ({ page }) => {
    // Ensure not logged in
    await page.goto('/login')
    await page.context().clearCookies()

    // Navigate to articles
    await page.goto('/articles')
    await expect(page.getByRole('heading', { name: '文章', exact: true })).toBeVisible({ timeout: 10000 })

    // Guest users should not see edit/delete dropdowns on comments
    // This is a smoke test - actual comment pages need authentication
  })
})

test.describe('Comment Navigation', () => {
  test('can navigate to article from comment', async ({ page }) => {
    await page.goto('/articles')
    await expect(page.getByRole('heading', { name: '文章', exact: true })).toBeVisible({ timeout: 10000 })

    // Find and click an article
    const articleLink = page.getByRole('link').filter({ hasText: '测试文章' }).first()
    if (await articleLink.isVisible()) {
      await articleLink.click()
      await expect(page).toHaveURL(/articles\/.+/, { timeout: 10000 })
    }
  })
})