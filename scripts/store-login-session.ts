import { chromium } from '@playwright/test';

(async () => {
  let browser;
  try {
    console.log('[DEBUG] Launching browser...');
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    const url = process.env.CE_QA_URL || 'https://veradigmllc--qa.sandbox.my.site.com/veradigmsupport/s/';
    console.log('[DEBUG] Navigating to:', url);
    await page.goto(url);
    console.log('[DEBUG] Please complete the login manually in the opened browser window.');
    await page.waitForTimeout(60000); // Wait 60 seconds for manual login
    // Save storage state
    await page.context().storageState({ path: 'storage/state.json' });
    console.log('[DEBUG] Storage state saved to storage/state.json');
  } catch (err) {
    console.error('[ERROR] store-login-session.ts:', err);
  } finally {
    if (browser) await browser.close();
  }
})();
