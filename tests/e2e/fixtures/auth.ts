import { test as base, expect, type Page } from '@playwright/test'
import { TEST_USER, TEST_AUTHOR } from '../helpers/auth'

// Extend base test with authenticated fixtures
export const test = base.extend<{
  authenticatedPage: Page
  authorPage: Page
}>({
  // Setup authenticated page for regular user
  authenticatedPage: async ({ page }, use) => {
    await registerAndLogin(page, TEST_USER)
    await use(page)
  },

  // Setup authenticated page for author
  authorPage: async ({ page }, use) => {
    await registerAndLogin(page, TEST_AUTHOR)
    await use(page)
  },
})

/**
 * Register user via API and login
 */
async function registerAndLogin(page: Page, user: typeof TEST_USER) {
  // Try to register via API (will fail if already exists, that's OK)
  await page.request.post('/api/auth/sign-up/email', {
    data: {
      email: user.email,
      password: user.password,
      name: user.name,
    },
  })

  // Then login via UI
  await page.goto('/login')
  await page.locator('#email').fill(user.email)
  await page.locator('#password').fill(user.password)
  await page.getByRole('button', { name: '登录' }).click()

  // Wait for redirect (may stay on login if password wrong)
  try {
    await page.waitForURL('/', { timeout: 5000 })
  } catch {
    // If login fails, user might already exist with different password
    // Try signup flow instead
    await page.goto('/sign-up')
    await page.getByLabel(/姓名|name/i).fill(user.name)
    await page.locator('#email').fill(user.email)
    await page.locator('#password').fill(user.password)
    await page.getByRole('button', { name: '注册' }).click()
    await page.waitForURL('/', { timeout: 10000 })
  }
}

export { expect }