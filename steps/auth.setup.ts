// import { Before, After } from '@cucumber/cucumber';
// import { chromium } from '@playwright/test';

// // Launch browser and reuse session for each scenario
// Before(async function () {
//   this.browser = await chromium.launch();
//   this.context = await this.browser.newContext({ storageState: 'storage/state.json' });
//   this.page = await this.context.newPage();
// });

// // Close browser after each scenario
// After(async function () {
//   if (this.page) await this.page.close();
//   if (this.context) await this.context.close();
//   if (this.browser) await this.browser.close();
// });
