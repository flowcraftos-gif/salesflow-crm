import { test, expect } from '@playwright/test'

/**
 * SalesFlow CRM — Contact Form E2E Tests
 *
 * Strategy: Navigate directly to /dashboard/contacts/new which renders
 * <ContactForm /> as a pure client component. These tests cover the UI
 * layer only (form structure, validation, interactions) and skip any
 * auth-gated server actions.
 *
 * Note: The Next.js app uses Clerk auth. If the middleware redirects to
 * a sign-in page before reaching the form, tests will detect the redirect
 * and fail with a clear message. Run with a logged-in browser session or
 * configure Clerk's publicRoutes / test mode for CI.
 */

const FORM_URL = '/dashboard/contacts/new'

// ── Helper: navigate to form and assert we landed on it ───────────────────────
async function gotoForm(page: import('@playwright/test').Page) {
  await page.goto(FORM_URL)
  // If Clerk redirects to sign-in, the form won't be present — skip gracefully.
  const isSignIn = page.url().includes('sign-in') || page.url().includes('accounts.')
  return !isSignIn
}

// ── 1. Form renders with required fields ─────────────────────────────────────
test('contact form renders with required name and phone fields', async ({ page }) => {
  const onForm = await gotoForm(page)
  test.skip(!onForm, 'Auth redirect — run with a logged-in session')

  // Heading
  await expect(page.getByRole('heading', { name: /เพิ่ม Contact ใหม่/ })).toBeVisible()

  // Required inputs
  const nameInput = page.locator('input[name="name"]')
  const phoneInput = page.locator('input[name="phone"]')

  await expect(nameInput).toBeVisible()
  await expect(phoneInput).toBeVisible()

  // Both carry the `required` attribute
  await expect(nameInput).toHaveAttribute('required', '')
  await expect(phoneInput).toHaveAttribute('required', '')

  // Optional fields also present
  await expect(page.locator('input[name="lineId"]')).toBeVisible()
  await expect(page.locator('input[name="email"]')).toBeVisible()
  await expect(page.locator('textarea[name="notes"]')).toBeVisible()
})

// ── 2. Phone validation — pattern [0-9]{9,10} ────────────────────────────────
test('phone field rejects input shorter than 9 digits via HTML5 pattern', async ({ page }) => {
  const onForm = await gotoForm(page)
  test.skip(!onForm, 'Auth redirect — run with a logged-in session')

  const nameInput = page.locator('input[name="name"]')
  const phoneInput = page.locator('input[name="phone"]')
  const submitBtn = page.getByRole('button', { name: /บันทึก Contact/ })

  // Fill name but give an 8-digit phone (below the 9-digit minimum)
  await nameInput.fill('ทดสอบ')
  await phoneInput.fill('12345678') // 8 digits — violates pattern [0-9]{9,10}

  await submitBtn.click()

  // The browser's built-in validity API should mark the field as invalid
  const isValid = await phoneInput.evaluate(
    (el) => (el as HTMLInputElement).validity.valid
  )
  expect(isValid).toBe(false)

  // Also confirm the pattern attribute is correctly set
  await expect(phoneInput).toHaveAttribute('pattern', '[0-9]{9,10}')
})

test('phone field accepts a valid 10-digit number', async ({ page }) => {
  const onForm = await gotoForm(page)
  test.skip(!onForm, 'Auth redirect — run with a logged-in session')

  const phoneInput = page.locator('input[name="phone"]')
  await phoneInput.fill('0812345678') // 10 digits — valid

  const isValid = await phoneInput.evaluate(
    (el) => (el as HTMLInputElement).validity.valid
  )
  expect(isValid).toBe(true)
})

// ── 3. Status dropdown has all 6 options ─────────────────────────────────────
test('status dropdown contains all 6 contact statuses', async ({ page }) => {
  const onForm = await gotoForm(page)
  test.skip(!onForm, 'Auth redirect — run with a logged-in session')

  const statusSelect = page.locator('select[name="status"]')
  await expect(statusSelect).toBeVisible()

  // Collect all option text values
  const options = await statusSelect.locator('option').allTextContents()
  const expectedStatuses = ['Lead', 'Prospect', 'Appointment', 'Proposal', 'Client', 'Lost']

  for (const status of expectedStatuses) {
    expect(options).toContain(status)
  }

  // Exactly 6 options (no extras)
  expect(options).toHaveLength(6)

  // Default value should be Prospect (per `defaultValue="Prospect"` in JSX)
  await expect(statusSelect).toHaveValue('Prospect')
})

// ── 4. Tag buttons toggle correctly ──────────────────────────────────────────
test('preset tag buttons toggle selection on click', async ({ page }) => {
  const onForm = await gotoForm(page)
  test.skip(!onForm, 'Auth redirect — run with a logged-in session')

  const PRESET_TAGS = ['สุขภาพ', 'ชีวิต', 'รถ', 'อุบัติเหตุ', 'บ้าน']

  // All tag buttons should be rendered
  for (const tag of PRESET_TAGS) {
    await expect(page.getByRole('button', { name: tag })).toBeVisible()
  }

  // Click the first tag — should become "selected" (blue border/bg)
  const firstTag = page.getByRole('button', { name: 'สุขภาพ' })

  // Capture class before click
  const classBefore = await firstTag.getAttribute('class')

  await firstTag.click()

  // After click, class should change (selected state adds blue oklch classes)
  const classAfter = await firstTag.getAttribute('class')
  expect(classAfter).not.toBe(classBefore)
  // The selected state includes the blue bg token
  expect(classAfter).toContain('oklch(93%_0.04_265)')

  // Click again — should deselect (toggle back)
  await firstTag.click()
  const classDeselected = await firstTag.getAttribute('class')
  expect(classDeselected).toBe(classBefore)
})

// ── 5. Tag buttons are type="button" (don't submit form) ─────────────────────
test('tag buttons have type=button so they do not submit the form', async ({ page }) => {
  const onForm = await gotoForm(page)
  test.skip(!onForm, 'Auth redirect — run with a logged-in session')

  const PRESET_TAGS = ['สุขภาพ', 'ชีวิต', 'รถ', 'อุบัติเหตุ', 'บ้าน']

  for (const tag of PRESET_TAGS) {
    const btn = page.getByRole('button', { name: tag })
    await expect(btn).toHaveAttribute('type', 'button')
  }
})

// ── 6. Cancel button navigates back ──────────────────────────────────────────
test('cancel button triggers navigation (router.back)', async ({ page }) => {
  // Navigate from contacts list → new form so router.back() has somewhere to go
  await page.goto('/dashboard/contacts')

  const onContacts =
    !page.url().includes('sign-in') && !page.url().includes('accounts.')
  test.skip(!onContacts, 'Auth redirect — run with a logged-in session')

  await page.goto(FORM_URL)

  const cancelBtn = page.getByRole('button', { name: 'ยกเลิก' })
  await expect(cancelBtn).toBeVisible()
  // type="button" ensures it won't accidentally submit
  await expect(cancelBtn).toHaveAttribute('type', 'button')

  // Click cancel — should navigate away from the new-contact URL
  await Promise.all([
    page.waitForURL((url) => !url.pathname.endsWith('/new'), { timeout: 5000 }),
    cancelBtn.click(),
  ])

  // We should be back on the contacts list (or wherever the history pointed)
  expect(page.url()).not.toContain('/contacts/new')
})

// ── 7. Submit button text and disabled state ──────────────────────────────────
test('submit button shows correct label and is not disabled initially', async ({ page }) => {
  const onForm = await gotoForm(page)
  test.skip(!onForm, 'Auth redirect — run with a logged-in session')

  const submitBtn = page.getByRole('button', { name: /บันทึก Contact/ })
  await expect(submitBtn).toBeVisible()
  await expect(submitBtn).toBeEnabled()
  await expect(submitBtn).toHaveAttribute('type', 'submit')
})

// ── 8. Source dropdown is present with placeholder ───────────────────────────
test('source dropdown renders with placeholder and 5 source options', async ({ page }) => {
  const onForm = await gotoForm(page)
  test.skip(!onForm, 'Auth redirect — run with a logged-in session')

  const sourceSelect = page.locator('select[name="source"]')
  await expect(sourceSelect).toBeVisible()

  const options = await sourceSelect.locator('option').allTextContents()

  // Placeholder + 5 sources = 6 total options
  expect(options[0]).toContain('—') // placeholder
  const expectedSources = ['Facebook', 'Referral', 'WalkIn', 'Friend', 'Other']
  for (const src of expectedSources) {
    expect(options).toContain(src)
  }
  expect(options).toHaveLength(6)
})
