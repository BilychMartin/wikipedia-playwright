import { test, expect, Page } from '@playwright/test';

async function loginIfNeeded(page: Page) {
  const user = process.env.WIKI_USER;
  const pass = process.env.WIKI_PASS;

  await page.goto('https://en.wikipedia.org/wiki/Main_Page');

  // Assert logged in
  await expect(page.locator('#vector-user-links-dropdown-checkbox')).toBeVisible();
}

/**
 * Selects a language option by visible option text
 * (e.g., "de - Deutsch", "en - English")
 * and saves preferences.
 */
async function setInterfaceLanguage(page: Page, optionNameRegex: RegExp) {
  await page.goto('https://en.wikipedia.org/wiki/Special:Preferences');

  const widget = page.locator('#mw-input-wplanguage');
  await expect(widget).toBeVisible();

  const handle = widget
    .locator('.oo-ui-dropdownWidget-handle, .oo-ui-comboBoxInputWidget-dropdownButton')
    .first();

  await expect(handle).toBeVisible();
  await handle.scrollIntoViewIfNeeded();
  await handle.click();

  const option = page.getByRole('option', { name: optionNameRegex }).first();
  await expect(option).toBeVisible();
  await option.click();

  // Save (English: Save, German: Speichern)
  await page.getByRole('button', { name: /save|speichern/i }).click();
  await page.waitForLoadState('networkidle');
}

/**
 * cleanup after each test
 * Revert interface language back to English
 * to avoid affecting subsequent tests.
 */
test.afterEach(async ({ page }) => {
  try {
    // If not logged in — nothing to revert
    const loggedIn = await page.locator('#vector-user-links-dropdown-checkbox').isVisible().catch(() => false);
    if (!loggedIn) return;

    await setInterfaceLanguage(page, /en\s*-\s*English/i);

    // (Optional) assert language reverted
    await expect(page.getByRole('heading', { name: /Preferences/i })).toBeVisible();
  } catch {
    // Best-effort cleanup: do not fail test if cleanup fails
  }
});

test('TC-001: change interface language for authorized user', async ({ page }) => {
  // 1) Login
  await loginIfNeeded(page);

  // 2) Change language to Deutsch
  await setInterfaceLanguage(page, /de\s*-\s*Deutsch/i);

  // 3) Assert German UI on Preferences page
  await expect(page.getByRole('heading', { name: /Einstellungen/i })).toBeVisible();
});
