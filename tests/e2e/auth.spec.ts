import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('home page renders', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '让思想自由流淌' })).toBeVisible()
  })

  test('navigation to articles works', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: '阅览文章' }).click()
    await expect(page).toHaveURL(/articles/)
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
  test('protected routes redirect to login', async ({ page }) => {
    await page.goto('/write')
    await expect(page).toHaveURL(/login/)
  })

  test('settings redirects to login', async ({ page }) => {
    await page.goto('/me/settings')
    await expect(page).toHaveURL(/login/)
  })
})

test.describe('Articles', () => {
  test('articles list page renders', async ({ page }) => {
    await page.goto('/articles')
    await expect(page.getByRole('link', { name: 'Cedium' })).toBeVisible()
  })

  test('about page renders', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})