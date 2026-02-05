import { test, expect, Page } from '@playwright/test';

/**
 * Auth strategy:
 * - Recommended (stable for Docker/headless): use storageState (auth.json) in playwright.config.ts
 * - Optional UI login flow is provided below but commented out (may be blocked by Wikipedia anti-bot)
 */
async function ensureLoggedIn(page: Page) {
  await page.goto('https://en.wikipedia.org/wiki/Main_Page', { waitUntil: 'domcontentloaded' });

  // If using storageState, user menu checkbox should be present
  await expect(page.locator('#vector-user-links-dropdown-checkbox')).toBeVisible();

  // -----------------------------------------------------------------------
  // OPTIONAL UI LOGIN FLOW (uncomment to try UI login)
  // NOTE: UI login may be blocked in headless/Docker due to anti-bot protection.
  // If you use UI login, you likely want to DISABLE storageState in config.
  // -----------------------------------------------------------------------
  //
  // const user = process.env.WIKI_USER;
  // const pass = process.env.WIKI_PASS;
  // if (!user || !pass) {
  //   throw new Error('Missing env vars: WIKI_USER / WIKI_PASS. Put them in .env');
  // }
  
  // // Go to login page
  // await page.getByRole('link', { name: /log in/i }).click();
  
  // // Fill credentials
  // await page.fill('#wpName1', user);
  // await page.fill('#wpPassword1', pass);
  // await page.click('#wpLoginAttempt');
  
  // // Assert logged in
  // await expect(page.locator('#vector-user-links-dropdown-checkbox')).toBeVisible();
}

async function setInterfaceLanguage(page: Page, optionNameRegex: RegExp) {
  await page.goto('https://en.wikipedia.org/wiki/Special:Preferences', { waitUntil: 'domcontentloaded' });

  const widget = page.locator('#mw-input-wplanguage');
  await expect(widget).toBeVisible();

  // OOUI dropdown (not a native <select>)
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

  // Preferences save triggers navigation / reload
  await page.waitForLoadState('networkidle');
}

async function logout(page: Page) {
  // Stable logout endpoint
  await page.goto('https://en.wikipedia.org/wiki/Special:UserLogout', { waitUntil: 'domcontentloaded' });

  // After logout, "Log in" should be visible
  await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
}

test.afterEach(async ({ page }) => {
  // Best-effort cleanup: revert language + logout
  try {
    const loggedIn = await page
      .locator('#vector-user-links-dropdown-checkbox')
      .isVisible()
      .catch(() => false);

    if (!loggedIn) return;

    // Revert language back to English
    await setInterfaceLanguage(page, /en\s*-\s*English/i);

    // Optional sanity check (English heading usually "Preferences")
    await expect(page.getByRole('heading', { name: /Preferences/i })).toBeVisible();

    // Logout
    await logout(page);
  } catch {
    // do not fail test due to cleanup issues
  }
});

test('TC-001: change interface language for authorized user', async ({ page }) => {
  // 1) Ensure user is logged in
  await ensureLoggedIn(page);

  // 2) Change interface language to Deutsch
  await setInterfaceLanguage(page, /de\s*-\s*Deutsch/i);

  // 3) Assert German UI on Preferences page (Einstellungen)
  await expect(page.getByRole('heading', { name: /Einstellungen/i })).toBeVisible();
});
