import { type Page } from '@playwright/test'

// Test user credentials (must match prisma/seed.ts)
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

/**
 * Login a test user via the login page
 */
export async function login(page: Page, user: typeof TEST_USER = TEST_USER) {
  await page.goto('/login')

  // Fill login form - use actual IDs from LoginForm component
  await page.locator('#email').fill(user.email)
  await page.locator('#password').fill(user.password)

  // Submit form
  await page.getByRole('button', { name: '登录' }).click()

  // Wait for redirect to home
  await page.waitForURL('/', { timeout: 10000 })
}

/**
 * Logout the current user
 */
export async function logout(page: Page) {
  // Navigate to settings or find logout button
  await page.goto('/me/settings')

  // Find and click logout button
  const logoutButton = page.getByRole('button', { name: /退出|logout|登出/i })
  if (await logoutButton.isVisible()) {
    await logoutButton.click()
  }

  await page.waitForURL('/')
}

/**
 * Create a new user via signup (for testing registration flow)
 */
export async function signup(page: Page, userData: {
  name: string
  email: string
  password: string
}) {
  await page.goto('/sign-up')

  await page.getByPlaceholder(/姓名|name/i).fill(userData.name)
  await page.getByPlaceholder(/邮箱|email/i).fill(userData.email)
  await page.getByPlaceholder(/密码|password/i).fill(userData.password)

  // Submit
  await page.getByRole('button', { name: /注册|signup/i }).click()

  // Wait for redirect or verification page
  await page.waitForURL(/\/|verify/, { timeout: 10000 })
}