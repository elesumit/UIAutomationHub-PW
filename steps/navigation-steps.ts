import { Given, When, Then } from '@cucumber/cucumber';
import { LocatorProWrapper } from '../utils/locatorpro-wrapper';
import { ReportLogger } from '../utils/report-logger';
import { resolveCsvPlaceholders } from '../utils/csv-reader';
import { Dialog } from '@playwright/test';
import { config } from '../utils/config';
// ==================== NAVIGATION STEPS ====================

// Given('I navigate to {string}', async function (url: string) {
//   await this.page.goto(url);
//   ReportLogger.logInfo(`Navigated to: ${url}`);
// });


// Salesforce navigation step
Given('I navigate to Salesforce ""', async function () {
  const baseUrl = config.salesforce.baseUrl;
  if (!baseUrl) {
    throw new Error('Salesforce Base URL is not set. Please check your environment configuration.');
  }
  await this.page.goto(baseUrl);
  await this.page.waitForLoadState('networkidle');
  await this.page.screenshot({ path: `test-results/screenshots/salesforce-homepage_${Date.now()}.png`, fullPage: true });
  ReportLogger.logInfo(`Navigated to Salesforce: ${baseUrl}`);
});

// CE Portal navigation step
Given('I navigate to CE Portal ""', async function () {
  const baseUrl = config.cePortal.baseUrl;
  if (!baseUrl) {
    throw new Error('CE Portal Base URL is not set. Please check your environment configuration.');
  }
  await this.page.goto(baseUrl);
  await this.page.waitForLoadState('networkidle');
  await this.page.screenshot({ path: `test-results/screenshots/ceportal-homepage_${Date.now()}.png`, fullPage: true });
  ReportLogger.logInfo(`Navigated to CE Portal: ${baseUrl}`);
});

// ==================== NAVIGATION STEPS ====================



function buildUrl(base: string, path?: string) {
  if (!path) return base.replace(/\/+$/, '');
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

Given('I navigate to {string}', async function (url: string) {
  // If the step provides a non-empty URL, use it; otherwise, use the config.salesforce.baseUrl
  const targetUrl = url && url.trim() ? url : config.salesforce.baseUrl;
  if (!targetUrl) {
    throw new Error('Salesforce Base URL is not set. Please check your environment configuration.');
  }
  await this.page.goto(buildUrl(targetUrl));
  await this.page.waitForLoadState('networkidle');
  await this.page.screenshot({ path: `test-results/screenshots/example-homepage_${Date.now()}.png`, fullPage: true });
  ReportLogger.logInfo(`Navigated to: ${targetUrl}`);
});


When('I click on the {string} tab', async function (tabName: string) {
  ReportLogger.logInfo(`🔍 Looking for tab: "${tabName}"`);
  
  await this.page.waitForTimeout(2000);
  let clicked = false;

  // Strategies specifically for tabs
  const strategies = [
    `[role="tab"][data-label="${tabName}"]`,
    `[role="tab"]:has-text("${tabName}")`,
    `a[role="tab"]:has-text("${tabName}")`,
    `.slds-tabs_default__link:has-text("${tabName}")`,
  ];

  for (const selector of strategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      
      if (count > 0) {
        ReportLogger.logInfo(`🎯 Found ${count} tabs matching "${tabName}" using: ${selector}`);
        
        for (let i = 0; i < count; i++) {
          const element = locator.nth(i);
          const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (isVisible) {
            await element.click();
            ReportLogger.logInfo(`✅ Clicked on tab: "${tabName}"`);
            clicked = true;
            break;
          }
        }
        
        if (clicked) break;
      }
    } catch (error) {
      continue;
    }
  }

  if (!clicked) {
    throw new Error(`Could not find or click tab: ${tabName}`);
  }
});

When('I click on captured {string}', async function (variableName: string) {
  // Check local context first, then shared data store
  const elementName = this.capturedData?.[variableName] || require('../utils/shared-data-store').SharedDataStore.get(variableName);
  
  if (!elementName) {
    throw new Error(`No captured data found for variable: ${variableName}`);
  }

  ReportLogger.logInfo(`🔄 Using captured value "${variableName}": "${elementName}" for click`);
  
  // Reuse the existing click logic
  await this.page.waitForTimeout(2000);
  let clicked = false;

  const strategies = [
    `a:has-text("${elementName}")`,
    `button:has-text("${elementName}")`,
    `[role="option"]:has-text("${elementName}")`,
    `[role="listitem"]:has-text("${elementName}")`,
    `*:has-text("${elementName}")`,
  ];

  for (const selector of strategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      
      if (count > 0) {
        const element = locator.first();
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await element.click();
        ReportLogger.logInfo(`✅ Clicked on captured value: "${elementName}"`);
        clicked = true;
        break;
      }
    } catch (error) {
      continue;
    }
  }

  if (!clicked) {
    throw new Error(`Could not click on captured value: ${elementName}`);
  }
});

When('I click on {string} and capture toast notification', async function (elementName: string) {
  ReportLogger.logInfo(`🎯 Clicking "${elementName}" and capturing toast notification`);
  
  let capturedToast = '';
  
  // Click the element
  let clicked = false;
  
  try {
    const button = this.page.getByRole('button', { name: elementName, exact: false });
    const count = await button.count();
    if (count > 0) {
      await button.first().click();
      clicked = true;
      ReportLogger.logInfo(`✅ Clicked "${elementName}" using getByRole`);
    }
  } catch (e) {
    // Continue
  }
  
  if (!clicked) {
    await LocatorProWrapper.clickByText(this.page, elementName);
    ReportLogger.logInfo(`✅ Clicked "${elementName}" using LocatorPro`);
  }
  
  // Immediately start checking page content for success message
  // Check right away, then every 50ms for up to 3 seconds
  const maxAttempts = 60; // 60 * 50ms = 3 seconds
  let attempt = 0;
  let navigationStarted = false;
  
  while (attempt < maxAttempts && !capturedToast && !navigationStarted) {
    // Only wait after the first attempt
    if (attempt > 0) {
      await this.page.waitForTimeout(50);
    }
    
    try {
      // Get page HTML content
      const pageContent = await this.page.content();
      
      // Look for success patterns in the HTML
      const patterns = [
        /was successfully created/i,  // Primary pattern - matches the toast text
        /Case\s+([\w\d]+)\s+was successfully created/i,  // Full pattern with case number
        /successfully created/i,
        /Case Created/i
      ];
      
      for (const pattern of patterns) {
        const match = pageContent.match(pattern);
        if (match) {
          capturedToast = match[0];
          console.log(`\n${'='.repeat(80)}`);
          console.log(`🎉 SUCCESS MESSAGE FOUND (attempt ${attempt}, ${attempt * 50}ms):`);
          console.log(`${capturedToast}`);
          console.log(`${'='.repeat(80)}\n`);
          (this as any).lastToastMessage = capturedToast;
          ReportLogger.logInfo(`✅ Success message captured: "${capturedToast}"`);
          return;
        }
      }
    } catch (error) {
      // Page is navigating - can't get content anymore
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('navigating')) {
        ReportLogger.logInfo(`Page started navigating at attempt ${attempt} (${attempt * 50}ms)`);
        navigationStarted = true;
        break;
      }
    }
    
    attempt++;
  }
  
  if (navigationStarted) {
    ReportLogger.logInfo(`⚠️ Page navigated before success message could be captured`);
    
    // Wait for navigation to complete
    await this.page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    
    // Check if we're now on the Salesforce case page (proof of successful case creation)
    const currentUrl = this.page.url();
    if (currentUrl.includes('salesforce') || currentUrl.includes('force.com')) {
      // We successfully navigated to Salesforce - case was created
      // Try to extract case number from the page
      try {
        const pageContent = await this.page.content();
        const caseMatch = pageContent.match(/Case\s+([\w\d]+)/i);
        if (caseMatch) {
          capturedToast = `Case ${caseMatch[1]} was successfully created`;
          console.log(`\n${'='.repeat(80)}`);
          console.log(`🎉 SUCCESS INFERRED FROM SALESFORCE NAVIGATION:`);
          console.log(`${capturedToast}`);
          console.log(`${'='.repeat(80)}\n`);
          (this as any).lastToastMessage = capturedToast;
          ReportLogger.logInfo(`✅ Success inferred from Salesforce page: "${capturedToast}"`);
          return;
        }
      } catch (e) {
        // Couldn't extract case number, but we know it was created
      }
      
      // Generic success message if we can't get case number
      capturedToast = "Case was successfully created";
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🎉 SUCCESS INFERRED FROM SALESFORCE NAVIGATION`);
      console.log(`${'='.repeat(80)}\n`);
      (this as any).lastToastMessage = capturedToast;
      ReportLogger.logInfo(`✅ Success inferred from navigation to Salesforce`);
      return;
    }
  } else {
    ReportLogger.logInfo(`⚠️ No success message found in page content after ${maxAttempts * 50}ms`);
  }
  
  // IMMEDIATELY try to capture the toast BEFORE navigation happens
  // The toast appears on the CURRENT page before it navigates away
  let capturedText = '';
  let toastCaptured = false;
  
  // Strategy 1: Race between toast appearing and page navigating
  // We want to catch the toast even if the page starts navigating
  try {
    ReportLogger.logInfo(`Racing to capture toast before navigation...`);
    
    // Set up multiple toast locators to try
    const toastPromises = [
      this.page.locator('[id*="toastList"]').first().textContent().catch(() => null),
      this.page.getByText(/Case.*Created/i).first().textContent().catch(() => null),
      this.page.getByText(/successfully created/i).first().textContent().catch(() => null),
    ];
    
    // Wait for ANY of the toast locators to return text (max 3 seconds)
    const results = await Promise.race([
      Promise.all(toastPromises),
      new Promise<null[]>(resolve => setTimeout(() => resolve([null, null, null]), 3000))
    ]);
    
    // Find the first non-null result
    capturedText = results.find(r => r && r.trim() !== '') || '';
    
    if (capturedText) {
      toastCaptured = true;
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🎉 TOAST NOTIFICATION CAPTURED (Race Strategy):`);
      console.log(`${capturedText}`);
      console.log(`${'='.repeat(80)}\n`);
      ReportLogger.logInfo(`🎉 Toast captured via race: "${capturedText}"`);
    } else {
      ReportLogger.logInfo(`Race strategy: No toast text captured`);
    }
  } catch (e) {
    ReportLogger.logInfo(`Strategy 1 (race) failed: ${(e as Error).message}`);
  }
  
  // Strategy 2: Look for any element with "Case Created" text
  if (!toastCaptured) {
    try {
      const textLocator = this.page.getByText(/Case.*Created/i).first();
      await textLocator.waitFor({ state: 'visible', timeout: 3000 });
      capturedText = await textLocator.textContent() || '';
      toastCaptured = true;
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🎉 TOAST NOTIFICATION CAPTURED (Strategy 2):`);
      console.log(`${capturedText}`);
      console.log(`${'='.repeat(80)}\n`);
      ReportLogger.logInfo(`🎉 Toast captured via text search: "${capturedText}"`);
    } catch (e) {
      ReportLogger.logInfo(`Strategy 2 failed: ${(e as Error).message}`);
    }
  }
  
  // Strategy 3: Look for "successfully created" pattern
  if (!toastCaptured) {
    try {
      const successLocator = this.page.getByText(/successfully created/i).first();
      await successLocator.waitFor({ state: 'visible', timeout: 3000 });
      capturedText = await successLocator.textContent() || '';
      toastCaptured = true;
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🎉 TOAST NOTIFICATION CAPTURED (Strategy 3):`);
      console.log(`${capturedText}`);
      console.log(`${'='.repeat(80)}\n`);
      ReportLogger.logInfo(`🎉 Toast captured via success pattern: "${capturedText}"`);
    } catch (e) {
      ReportLogger.logInfo(`Strategy 3 failed: ${(e as Error).message}`);
    }
  }
  
  // Strategy 4: Check page HTML content as last resort
  if (!toastCaptured) {
    await this.page.waitForTimeout(2000);
    const pageContent = await this.page.content();
    const match = pageContent.match(/Case\s+[\w\d]+\s+was successfully created/i);
    if (match) {
      capturedText = match[0];
      toastCaptured = true;
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🎉 TOAST NOTIFICATION CAPTURED (Strategy 4 - HTML):`);
      console.log(`${capturedText}`);
      console.log(`${'='.repeat(80)}\n`);
      ReportLogger.logInfo(`🎉 Toast text found in page HTML: "${capturedText}"`);
    }
  }
  
  // Store the result
  if (toastCaptured) {
    (this as any).lastToastMessage = capturedText;
    console.log(`💾 Toast message stored in context for verification`);
    ReportLogger.logInfo(`✅ Toast message stored: "${capturedText}"`);
  } else {
    console.log(`\n${'!'.repeat(80)}`);
    console.log(`⚠️  WARNING: No toast notification was captured after all strategies`);
    console.log(`${'!'.repeat(80)}\n`);
    ReportLogger.logInfo(`⚠️ No toast notification was captured after all strategies`);
    (this as any).lastToastMessage = '';
  }
});

When('I click on {string}', async function (elementName: string) {
  elementName = resolveCsvPlaceholders(elementName, this.testDataRow);
  // Wait for up to 5 seconds for the element to appear
  await this.page.waitForTimeout(5000);
  // Set up listener for potential new page
  const pagePromise = this.context.waitForEvent('page', { timeout: 1000 }).catch(() => null);
  let clicked = false;

  // Strategy 0: Dedicated checkbox handling (Lightning datatable row selectors,
  // SLDS-styled checkboxes). The native <input type="checkbox"> is visually
  // hidden behind .slds-checkbox_faux, so waitFor({state:'visible'}) on the
  // input fails. We must click the associated <label> (which IS visible) or
  // force-click the input.
  try {
    // Build candidate input locators: by data-col-key-value cell, by accessible
    // name, and by assistive-text label span text.
    const inputCandidates = [
      this.page.locator(`[data-col-key-value="${elementName}"] input[type="checkbox"]`),
      this.page.getByRole('checkbox', { name: elementName, exact: true }),
      this.page.getByRole('checkbox', { name: elementName, exact: false }),
      // Label that contains an assistive-text span with the exact label.
      this.page.locator(`label:has(span.slds-assistive-text:text-is("${elementName}"))`),
    ];

    for (const inputLoc of inputCandidates) {
      const c = await inputLoc.count().catch(() => 0);
      if (c === 0) continue;

      for (let i = 0; i < c && !clicked; i++) {
        const input = inputLoc.nth(i);
        // Resolve the associated <label> via id, scoped to the same root
        // (datatable cell or shadow boundary) so the click hits the real UI.
        const labelHandle = await input.evaluateHandle((el: Element) => {
          if (!(el instanceof HTMLInputElement)) {
            // The locator may already be a <label>; in that case return it as-is.
            return el.tagName === 'LABEL' ? el : null;
          }
          const root = el.getRootNode() as Document | ShadowRoot;
          const id = el.id;
          if (id) {
            const lbl = (root as any).querySelector?.(`label[for="${id}"]`) as HTMLElement | null;
            if (lbl) return lbl;
          }
          return el.closest('label');
        }).catch(() => null);

        const label = labelHandle ? labelHandle.asElement() : null;
        if (label) {
          try {
            await (label as any).scrollIntoViewIfNeeded().catch(() => {});
            await (label as any).click({ timeout: 5000 });
            ReportLogger.logInfo(`✅ Clicked checkbox label for "${elementName}"`);
            clicked = true;
            break;
          } catch {
            // fall through to force-click on the input
          }
        }

        try {
          await input.scrollIntoViewIfNeeded().catch(() => {});
          await input.click({ force: true, timeout: 5000 });
          ReportLogger.logInfo(`✅ Force-clicked checkbox "${elementName}"`);
          clicked = true;
          break;
        } catch {
          // try next candidate
        }
      }

      if (clicked) break;
    }
  } catch {
    // fall through to generic strategies
  }

  // Strategy 1: Use Playwright's getByRole (most reliable for accessible buttons, comboboxes, and tabs)
  if (!clicked) try {
    // Try button role first — prefer exact match so "Save" doesn't also hit "Save & New" / "Save & Close"
    let element = this.page.getByRole('button', { name: elementName, exact: true });
    let count = await element.count();
    if (count === 0) {
      element = this.page.getByRole('button', { name: elementName, exact: false });
      count = await element.count();
    }
    
    // If not found as button, try tab role
    if (count === 0) {
      element = this.page.getByRole('tab', { name: elementName, exact: false });
      count = await element.count();
      
      // Also try finding tab by data-label attribute
      if (count === 0) {
        element = this.page.locator(`[role="tab"][data-label="${elementName}"]`);
        count = await element.count();
      }
    }
    
    // If not found as tab, try combobox role
    if (count === 0) {
      element = this.page.getByRole('combobox', { name: elementName, exact: false });
      count = await element.count();
      
      // Also try finding combobox by data-value attribute
      if (count === 0) {
        element = this.page.locator(`[role="combobox"][data-value*="${elementName}"]`);
        count = await element.count();
      }
    }

    // If still not found, try checkbox role (e.g. Lightning datatable row checkboxes
    // which expose an assistive-text label like "Select Item 1").
    if (count === 0) {
      element = this.page.getByRole('checkbox', { name: elementName, exact: true });
      count = await element.count();
      if (count === 0) {
        element = this.page.getByRole('checkbox', { name: elementName, exact: false });
        count = await element.count();
      }

      // Lightning datatable cells expose data-col-key-value like "1-SELECTABLE_CHECKBOX-1".
      // Target the input/label inside the cell so the click actually toggles the checkbox.
      if (count === 0) {
        element = this.page.locator(
          `[data-col-key-value="${elementName}"] label, [data-col-key-value="${elementName}"] input[type="checkbox"]`
        ).first();
        count = await element.count();
      }
    }
    
    if (count > 0) {
      ReportLogger.logInfo(`🎯 Found ${count} elements with accessible name "${elementName}"`);
      for (let i = 0; i < count; i++) {
        const elem = element.nth(i);
        // Ensure the element is visible and interactable
        await elem.waitFor({ state: 'visible', timeout: 5000 });
        await elem.scrollIntoViewIfNeeded();
        const isVisible = await elem.isVisible().catch(() => false);
        if (isVisible) {
          // Check if this is a navigation link
          const tagName = await elem.evaluate((el: any) => el.tagName.toLowerCase()).catch(() => 'button');
          const href = await elem.evaluate((el: any) => el.getAttribute('href')).catch(() => null);
          
          if (tagName === 'a' && href && !href.startsWith('#')) {
            if (href.startsWith('javascript:')) {
              // JavaScript-triggered navigation (SPA)
              ReportLogger.logInfo(`🔗 Detected JavaScript navigation link, waiting for content to load...`);
              await elem.click();
              await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
              await this.page.waitForTimeout(2000); // Extra wait for dynamic content
              ReportLogger.logInfo(`✅ JavaScript navigation completed after clicking "${elementName}"`);
            } else {
              // Traditional href navigation
              ReportLogger.logInfo(`🔗 Detected navigation link, waiting for navigation...`);
              await Promise.all([
                this.page.waitForNavigation({ timeout: 30000, waitUntil: 'domcontentloaded' }).catch(() => {}),
                elem.click()
              ]);
              await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
              ReportLogger.logInfo(`✅ Navigation completed after clicking "${elementName}"`);
            }
          } else {
            await elem.click();
          }
          
          ReportLogger.logInfo(`✅ Clicked on "${elementName}"`);
          clicked = true;
          break;
        }
      }
    }
  } catch (error) {
    // Continue to fallback strategies
  }

  // Strategy 2: Try multiple selector-based strategies
  if (!clicked) {
    // Wait for page to be ready after navigation
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    
    const fieldName = elementName.toLowerCase();
    const strategies = [
      // Exact and partial text matches
      `button:text-is("${elementName}")`,
      `button:has-text("${elementName}")`,
      `input[type="submit"][value="${elementName}"]`,
      `input[type="button"][value="${elementName}"]`,
      // Case-insensitive search
      `button:text-matches("${elementName}", "i")`,
      // Attribute-based
      `button[name="${fieldName}"]`,
      `button[id="${fieldName}"]`,
      `button[aria-label="${elementName}"]`,
      // Role-based
      `[role="button"]:has-text("${elementName}")`,
      `[role="option"]:has-text("${elementName}")`,
      `[role="listitem"]:has-text("${elementName}")`,
      // Search results and list items
      `[data-refid]:has-text("${elementName}")`,
      `[data-recordid]:has-text("${elementName}")`,
      `.slds-listbox__option:has-text("${elementName}")`,
      // Links (last resort)
      `a:has-text("${elementName}")`,
    ];
  
    for (const selector of strategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      
      if (count > 0) {
        ReportLogger.logInfo(`🎯 Found ${count} elements matching "${elementName}" using: ${selector}`);
        
        // First, try to find elements with real navigation hrefs (not javascript:void)
        let preferredElement = null;
        let preferredIndex = -1;
        
        for (let i = 0; i < count; i++) {
          const element = locator.nth(i);
          try {
            const isVisible = await element.isVisible({ timeout: 1000 });
            const isEnabled = await element.isEnabled({ timeout: 1000 });
            
            if (isVisible && isEnabled) {
              const tagName = await element.evaluate((el: any) => el.tagName.toLowerCase());
              const href = await element.evaluate((el: any) => el.getAttribute('href')).catch(() => null);
              
              ReportLogger.logInfo(`🔍 Element ${i + 1}/${count}: tagName=${tagName}, href=${href}`);
              
              // Prefer links with real URLs over javascript:void(0)
              if (tagName === 'a' && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                preferredElement = element;
                preferredIndex = i;
                ReportLogger.logInfo(`⭐ Preferred element found at index ${i + 1} with real href`);
                break;
              } else if (!preferredElement && isVisible && isEnabled) {
                // Fallback to first visible/enabled element
                preferredElement = element;
                preferredIndex = i;
              }
            }
          } catch (e: any) {
            continue;
          }
        }
        
        // Click the preferred element
        if (preferredElement) {
          const element = preferredElement;
          const i = preferredIndex;
          
          try {
            ReportLogger.logInfo(`✅ Clicking element (${i + 1}/${count})`);
            
            // Check if this is a navigation link
            const tagName = await element.evaluate((el: any) => el.tagName.toLowerCase());
            const href = await element.evaluate((el: any) => el.getAttribute('href')).catch(() => null);
            
            if (tagName === 'a' && href && !href.startsWith('#')) {
              if (href.startsWith('javascript:')) {
                // JavaScript-triggered navigation (SPA)
                ReportLogger.logInfo(`🔗 Detected JavaScript navigation link, waiting for content to load...`);
                await element.click();
                await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
                await this.page.waitForTimeout(2000); // Extra wait for dynamic content
                const currentUrl = this.page.url();
                const pageTitle = await this.page.title();
                ReportLogger.logInfo(`✅ JavaScript navigation completed after clicking "${elementName}"`);
                ReportLogger.logInfo(`📍 Current URL: ${currentUrl}`);
                ReportLogger.logInfo(`📄 Page title: ${pageTitle}`);
              } else {
                // Traditional href navigation
                ReportLogger.logInfo(`🔗 Detected navigation link with href: ${href}`);
                await Promise.all([
                  this.page.waitForNavigation({ timeout: 30000, waitUntil: 'domcontentloaded' }).catch(() => {}),
                  element.click()
                ]);
                await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
                const currentUrl = this.page.url();
                const pageTitle = await this.page.title();
                ReportLogger.logInfo(`✅ Navigation completed after clicking "${elementName}"`);
                ReportLogger.logInfo(`📍 Current URL: ${currentUrl}`);
                ReportLogger.logInfo(`📄 Page title: ${pageTitle}`);
              }
            } else {
              await element.click();
            }
            
            ReportLogger.logInfo(`✅ Clicked on "${elementName}" (${selector})`);
            clicked = true;
          } catch (e: any) {
            ReportLogger.logInfo(`⚠️ Click failed: ${e.message}`);
          }
        }
        
        if (clicked) break;
      }
    } catch (error) {
      continue;
    }
  }
  }
  
  // Fallback to LocatorPro's intelligent text-based clicking, but filter out navigation links
  if (!clicked) {
    ReportLogger.logInfo(`🔍 Using LocatorPro text-based search for: "${elementName}"`);
    
    // Try to find button-like elements only, excluding navigation links
    const buttonLikeSelectors = [
      `button:has-text("${elementName}")`,
      `input[type="submit"]:has-text("${elementName}")`,
      `input[type="button"]:has-text("${elementName}")`,
      `[role="button"]:has-text("${elementName}")`,
      `div[onclick]:has-text("${elementName}")`,
    ];
    
    for (const selector of buttonLikeSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < count; i++) {
        const element = elements.nth(i);
        const isVisible = await element.isVisible().catch(() => false);
        const isEnabled = await element.isEnabled().catch(() => false);
        
        if (isVisible && isEnabled) {
          // Check if this is a navigation link
          const tagName = await element.evaluate((el: any) => el.tagName.toLowerCase()).catch(() => 'button');
          const href = await element.evaluate((el: any) => el.getAttribute('href')).catch(() => null);
          
          if (tagName === 'a' && href && !href.startsWith('#')) {
            if (href.startsWith('javascript:')) {
              // JavaScript-triggered navigation (SPA)
              ReportLogger.logInfo(`🔗 Detected JavaScript navigation link, waiting for content to load...`);
              await element.click();
              await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
              await this.page.waitForTimeout(2000); // Extra wait for dynamic content
              ReportLogger.logInfo(`✅ JavaScript navigation completed after clicking "${elementName}"`);
            } else {
              // Traditional href navigation
              ReportLogger.logInfo(`🔗 Detected navigation link, waiting for navigation...`);
              await Promise.all([
                this.page.waitForNavigation({ timeout: 30000, waitUntil: 'domcontentloaded' }).catch(() => {}),
                element.click()
              ]);
              await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
              ReportLogger.logInfo(`✅ Navigation completed after clicking "${elementName}"`);
            }
          } else {
            await element.click();
          }
          
          ReportLogger.logInfo(`✅ Clicked on "${elementName}" (fallback: ${selector})`);
          clicked = true;
          break;
        }
      }
      
      if (clicked) break;
    }
    
    if (!clicked) {
      throw new Error(`Could not find clickable element: ${elementName}`);
    }
  }
  
  // Check if a new page was opened (only switch if intentional)
  const newPage = await pagePromise;
  if (newPage) {
    const currentUrl = this.page.url();
    const newUrl = newPage.url();
    
    // Only switch if it's a legitimate new window (not a privacy link)
    if (!newUrl.includes('/privacy') && !newUrl.includes('/terms')) {
      await newPage.waitForLoadState();
      this.page = newPage;
      ReportLogger.logInfo(`🔄 Switched to new page: ${newPage.url()}`);
    } else {
      ReportLogger.logInfo(`⏭️ Ignoring privacy/terms popup: ${newUrl}`);
      await newPage.close();
    }
  }
});

When('I click on the {string} link', async function (linkText: string) {
  // Set up listener for potential new page
  const pagePromise = this.context.waitForEvent('page', { timeout: 1000 }).catch(() => null);
  
  // Try multiple strategies to find links/anchors
  const strategies = [
    `a:has-text("${linkText}")`,
    `a[href]:has-text("${linkText}")`,
    `a[title="${linkText}"]`,
    `a[aria-label="${linkText}"]`,
    `[role="link"]:has-text("${linkText}")`,
  ];
  
  let clicked = false;
  for (const selector of strategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        ReportLogger.logInfo(`🎯 Found link "${linkText}" using strategy: ${selector}`);
        const enhancedLocator = await LocatorProWrapper.autoEnhance(this.page, locator);
        await enhancedLocator.click();
        ReportLogger.logInfo(`✅ Clicked on link "${linkText}" (${selector})`);
        clicked = true;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  // Fallback to LocatorPro's intelligent text-based clicking
  if (!clicked) {
    ReportLogger.logInfo(`🔍 Using LocatorPro text-based search for link: "${linkText}"`);
    await LocatorProWrapper.clickByText(this.page, linkText);
  }
  
  // Check if a new page was opened and automatically switch to it
  const newPage = await pagePromise;
  if (newPage) {
    await newPage.waitForLoadState();
    this.page = newPage;
    ReportLogger.logInfo(`🔄 Automatically switched to new page: ${newPage.url()}`);
  }
});

When('I hover over {string}', async function (elementName: string) {
  // Try multiple strategies to find the element to hover
  const fieldName = elementName.toLowerCase();
  const strategies = [
    `button:has-text("${elementName}")`,
    `a:has-text("${elementName}")`,
    `[role="button"]:has-text("${elementName}")`,
    `[role="menuitem"]:has-text("${elementName}")`,
    `nav a:has-text("${elementName}")`,
    `.menu-item:has-text("${elementName}")`,
    `[id="${fieldName}"]`,
    `[class*="${fieldName}"]`,
  ];
  
  let hovered = false;
  for (const selector of strategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        ReportLogger.logInfo(`🎯 Found element "${elementName}" using strategy: ${selector}`);
        const enhancedLocator = await LocatorProWrapper.autoEnhance(this.page, locator);
        await enhancedLocator.hover();
        ReportLogger.logInfo(`✅ Hovered over "${elementName}" (${selector})`);
        hovered = true;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  // Fallback to LocatorPro's text-based search
  if (!hovered) {
    ReportLogger.logInfo(`🔍 Using LocatorPro text-based search to hover: "${elementName}"`);
    const element = await LocatorProWrapper.findByVisibleText(this.page, elementName);
    await element.hover();
    ReportLogger.logInfo(`✅ Hovered over "${elementName}" using LocatorPro`);
  }
});

When('I hover over {string} and click on {string}', async function (menuName: string, menuItem: string) {
  // First, hover over the main menu
  const menuFieldName = menuName.toLowerCase();
  const menuStrategies = [
    `button:has-text("${menuName}")`,
    `a:has-text("${menuName}")`,
    `[role="button"]:has-text("${menuName}")`,
    `[role="menuitem"]:has-text("${menuName}")`,
    `nav a:has-text("${menuName}")`,
    `.menu-item:has-text("${menuName}")`,
    `[id="${menuFieldName}"]`,
  ];
  
  let menuHovered = false;
  for (const selector of menuStrategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        ReportLogger.logInfo(`🎯 Found menu "${menuName}" using strategy: ${selector}`);
        const enhancedLocator = await LocatorProWrapper.autoEnhance(this.page, locator);
        await enhancedLocator.hover();
        ReportLogger.logInfo(`✅ Hovered over menu "${menuName}" (${selector})`);
        menuHovered = true;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (!menuHovered) {
    ReportLogger.logInfo(`🔍 Using LocatorPro to hover over menu: "${menuName}"`);
    const menuElement = await LocatorProWrapper.findByVisibleText(this.page, menuName);
    await menuElement.hover();
  }
  
  // Wait a bit for the dropdown to appear
  await this.page.waitForTimeout(500);
  
  // Now click on the menu item
  const itemStrategies = [
    `a:has-text("${menuItem}")`,
    `button:has-text("${menuItem}")`,
    `[role="menuitem"]:has-text("${menuItem}")`,
    `.dropdown-item:has-text("${menuItem}")`,
    `.menu-item:has-text("${menuItem}")`,
  ];
  
  let itemClicked = false;
  for (const selector of itemStrategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        ReportLogger.logInfo(`🎯 Found menu item "${menuItem}" using strategy: ${selector}`);
        const enhancedLocator = await LocatorProWrapper.autoEnhance(this.page, locator);
        await enhancedLocator.click();
        ReportLogger.logInfo(`✅ Clicked on menu item "${menuItem}" (${selector})`);
        itemClicked = true;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (!itemClicked) {
    ReportLogger.logInfo(`🔍 Using LocatorPro to click menu item: "${menuItem}"`);
    await LocatorProWrapper.clickByText(this.page, menuItem);
  }
});

When('I click on the remove icon', async function () {
  ReportLogger.logInfo('🗑️ Clicking on remove icon');
  
  // Try multiple strategies to find and click remove/delete icons
  const strategies = [
    // Strategy 1: Salesforce Lightning icon container (recorded selector)
    { name: 'Lightning icon container', locator: this.page.locator('.slds-icon_container_circle .slds-icon, .slds-icon_container_circle lightning-primitive-icon') },
    // Strategy 2: Direct lightning primitive icon
    { name: 'Lightning primitive icon', locator: this.page.locator('lightning-primitive-icon .slds-icon').filter({ hasText: '' }) },
    // Strategy 3: Button with title/aria-label containing delete/remove
    { name: 'Button with delete/remove label', locator: this.page.locator('button[title*="delete" i], button[title*="remove" i], button[aria-label*="delete" i], button[aria-label*="remove" i]') },
    // Strategy 4: Icon button with close/times icon class
    { name: 'Icon button with close class', locator: this.page.locator('button.slds-button_icon, button[class*="icon"]').filter({ has: this.page.locator('svg, i, span[class*="close"], span[class*="times"], span[class*="delete"]') }) },
    // Strategy 5: Lightning-icon with close/delete icon name
    { name: 'Lightning icon close/delete', locator: this.page.locator('lightning-icon[icon-name*="close"], lightning-icon[icon-name*="delete"]').locator('..') },
    // Strategy 6: Button with X or close symbol SVG
    { name: 'Button with close SVG', locator: this.page.locator('button:has(svg[data-key="close"]), button:has(svg[data-key="delete"])') },
    // Strategy 7: Any clickable element with slds-icon_container_circle class
    { name: 'SLDS icon container circle', locator: this.page.locator('.slds-icon_container_circle').filter({ hasText: '' }) },
    // Strategy 8: Generic close button in file upload context
    { name: 'File upload close button', locator: this.page.locator('[class*="file-upload"], [class*="upload"]').locator('button[class*="icon"]').last() },
  ];
  
  let clicked = false;
  for (const strategy of strategies) {
    try {
      const count = await strategy.locator.count();
      ReportLogger.logInfo(`  Trying strategy: ${strategy.name} (found ${count} elements)`);
      
      if (count > 0) {
        // Try to click the last visible one (usually the most recent file)
        const lastIndex = count - 1;
        const element = strategy.locator.nth(lastIndex);
        
        // Check if visible
        const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          await element.click({ timeout: 5000 });
          ReportLogger.logInfo(`✅ Successfully clicked remove icon using strategy: ${strategy.name}`);
          clicked = true;
          break;
        }
      }
    } catch (error) {
      ReportLogger.logInfo(`  Strategy "${strategy.name}" failed: ${error}`);
      continue;
    }
  }
  
  if (!clicked) {
    throw new Error('Could not find or click remove icon button. Tried all strategies.');
  }
});

/**
 * Clears the value selected in a Salesforce lookup / pill field, scoped by the
 * field's visible label. Use this when several "deleteAction" / "deleteIcon"
 * elements exist on the page (e.g. New Task form has Name, Related To, Assigned
 * To, etc.) and you must target one specific field.
 *
 * Matches typical Salesforce lookup markup, e.g.:
 *   <a role="button" class="deleteAction" ...>
 *     <span class="deleteIcon"></span>
 *     <span class="assistiveText">To remove the selected record, ...</span>
 *   </a>
 * and the SLDS pill variant: <a class="slds-pill__remove" ...>.
 */
When('I clear the {string} lookup field', async function (fieldLabel: string) {
  ReportLogger.logInfo(`🗑️ Clearing lookup field: "${fieldLabel}"`);

  // Locate the field container by its visible label, then find the delete icon inside it.
  // Salesforce lookups generally render the label as a <label> sibling of the input/pill
  // container, both wrapped in a slds-form-element (or similar) container.
  const scopedContainers = [
    // Form-element wrapper that contains a label with the given text
    this.page.locator(`.slds-form-element:has(label:has-text("${fieldLabel}"))`),
    // Lookup field marked by data-target-selection-name (LWC lookups)
    this.page.locator(`[data-target-selection-name*="${fieldLabel}" i]`),
    // Fallback: any ancestor of a label that also contains a deleteAction/pill remove
    this.page.locator(`xpath=//label[normalize-space()="${fieldLabel}"]/ancestor::*[.//a[contains(@class,"deleteAction") or contains(@class,"slds-pill__remove")]][1]`),
  ];

  const deleteSelectors = [
    'a.deleteAction',
    'a.slds-pill__remove',
    'button[title*="Remove" i]',
    'button[aria-label*="Remove" i]',
    '[role="button"]:has(.deleteIcon)',
  ];

  let clicked = false;
  for (const container of scopedContainers) {
    const containerCount = await container.count().catch(() => 0);
    if (containerCount === 0) continue;
    ReportLogger.logInfo(`  Found ${containerCount} container(s) matching label "${fieldLabel}"`);

    for (const selector of deleteSelectors) {
      const delIcon = container.first().locator(selector);
      const count = await delIcon.count().catch(() => 0);
      if (count === 0) continue;

      const target = delIcon.first();
      const isVisible = await target.isVisible({ timeout: 2000 }).catch(() => false);
      if (!isVisible) continue;

      await target.scrollIntoViewIfNeeded().catch(() => {});
      await target.click({ timeout: 5000 });
      ReportLogger.logInfo(`✅ Cleared "${fieldLabel}" using selector: ${selector}`);
      clicked = true;
      break;
    }
    if (clicked) break;
  }

  if (!clicked) {
    throw new Error(`Could not find delete icon inside lookup field "${fieldLabel}"`);
  }
});

/**
 * Opens the Salesforce entity-type picker (the small down-chevron next to a
 * lookup field that lets you switch between People / Queues / Account / etc.).
 * Scoped by the field's visible label so it works even when several lookups
 * are present (e.g. Name, Related To, Assigned To on the New Task form).
 *
 * Targets markup such as:
 *   <a role="button"
 *      class="entityMenuTrigger ..."
 *      aria-label="Assigned To—Current Selection: People, Pick an object">
 *     ...<lightning-icon icon-name="utility:down">...</lightning-icon>
 *   </a>
 */
When('I open the object picker for {string}', async function (fieldLabel: string) {
  ReportLogger.logInfo(`🔽 Opening object picker for lookup field: "${fieldLabel}"`);

  const candidates = [
    // Most reliable: aria-label that starts with "<FieldLabel>—Current Selection"
    this.page.locator(`a.entityMenuTrigger[aria-label*="${fieldLabel}"][aria-label*="Pick an object"]`),
    this.page.locator(`a[aria-label*="${fieldLabel}"][aria-label*="Current Selection"]`),
    // Fallback: any button containing utility:down icon next to the field
    this.page.locator(`a[role="button"][aria-label*="${fieldLabel}"]:has(lightning-icon[icon-name="utility:down"])`),
  ];

  let clicked = false;
  for (const candidate of candidates) {
    const count = await candidate.count().catch(() => 0);
    if (count === 0) continue;
    const target = candidate.first();
    const isVisible = await target.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isVisible) continue;

    await target.scrollIntoViewIfNeeded().catch(() => {});
    await target.click({ timeout: 5000 });
    ReportLogger.logInfo(`✅ Opened object picker for "${fieldLabel}"`);
    clicked = true;
    break;
  }

  if (!clicked) {
    throw new Error(`Could not find object picker (entityMenuTrigger) for lookup field "${fieldLabel}"`);
  }
});

When('I wait for {int} seconds', async function (seconds: number) {
  await this.page.waitForTimeout(seconds * 1000);
  ReportLogger.logInfo(`Waited for ${seconds} seconds`);
});

When('I scroll down', async function () {
  await this.page.mouse.wheel(0, 500);
  await this.page.waitForTimeout(1000);
  ReportLogger.logInfo(`📜 Scrolled down on the page`);
});

When('I click milestone Show More', async function () {
  const showMoreBtn = this.page.locator('button[title="Show More"]').first();
  try {
    await showMoreBtn.click({ timeout: 5000 });
  } catch (e) {
    ReportLogger.logInfo(`⚠️ Normal click failed, using JS click fallback`);
    await showMoreBtn.evaluate((el: HTMLElement) => el.click());
  }
  await this.page.waitForTimeout(1000);
  ReportLogger.logInfo(`📋 Clicked "Show More" in Milestones section`);
});

// Salesforce: Click global search button and clear existing search text
When('I click on Salesforce search and clear', async function () {
  ReportLogger.logInfo('🔍 Clicking Salesforce global search and clearing...');
  
  // The SF global search button's aria-label changes from "Search..." to "Search: <term>"
  // Use button.search-button or aria-label starting with "Search"
  const searchSelectors = [
    'button.search-button',
    'button[aria-label^="Search"]',
    '[data-aura-class="forceSearchAssistant"] button',
  ];
  
  let clicked = false;
  for (const selector of searchSelectors) {
    try {
      const btn = this.page.locator(selector).first();
      const isVisible = await btn.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        await btn.click();
        ReportLogger.logInfo(`  ✅ Clicked search button using: ${selector}`);
        clicked = true;
        break;
      }
    } catch (e) {
      continue;
    }
  }
  
  if (!clicked) {
    throw new Error('Could not find Salesforce global search button');
  }
  
  await this.page.waitForTimeout(1000);
  
  // Clear existing search text in the search input
  const inputSelectors = [
    'input[type="search"]',
    'input[placeholder*="Search" i]',
    'input[aria-label*="Search" i]',
    '[role="combobox"] input',
  ];
  
  for (const selector of inputSelectors) {
    try {
      const input = this.page.locator(selector).first();
      const isVisible = await input.isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        await input.click({ clickCount: 3 }); // Select all text
        await this.page.keyboard.press('Backspace');
        await this.page.waitForTimeout(500);
        ReportLogger.logInfo(`  🧹 Cleared search input using: ${selector}`);
        return;
      }
    } catch (e) {
      continue;
    }
  }
  
  // Fallback: Use keyboard shortcut to select all and delete
  await this.page.keyboard.press('Control+a');
  await this.page.keyboard.press('Backspace');
  ReportLogger.logInfo('  🧹 Cleared search input using keyboard shortcut');
});

Then('I take a screenshot named {string}', async function (screenshotName: string) {
  const embedScreenshots = process.env.EMBED_SCREENSHOTS === 'true';
  const screenshot = await this.page.screenshot({ fullPage: true });
  const screenshotPath = `test-results/screenshots/${screenshotName}_${Date.now()}.png`;
  
  // Save screenshot to file
  const fs = require('fs');
  fs.writeFileSync(screenshotPath, screenshot);
  
  // Embed screenshot in Cucumber HTML report if flag is enabled
  if (embedScreenshots) {
    this.attach(screenshot, 'image/png');
    ReportLogger.logInfo(`Screenshot "${screenshotName}" saved and embedded in report: ${screenshotPath}`);
  } else {
    ReportLogger.logInfo(`Screenshot saved: ${screenshotPath}`);
  }
});

// ==================== NEW PAGE/TAB HANDLING ====================

When('I click on {string} and switch to new page', async function (elementName: string) {
  // Set up listener for new page before clicking
  const pagePromise = this.context.waitForEvent('page');
  
  // Click the element that opens new page/tab
  const fieldName = elementName.toLowerCase();
  const strategies = [
    `button:has-text("${elementName}")`,
    `a:has-text("${elementName}")`,
    `a[target="_blank"]:has-text("${elementName}")`,
    `[role="button"]:has-text("${elementName}")`,
  ];
  
  let clicked = false;
  for (const selector of strategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      if (count > 0) {
        ReportLogger.logInfo(`🎯 Found "${elementName}" using strategy: ${selector}`);
        const enhancedLocator = await LocatorProWrapper.autoEnhance(this.page, locator);
        await enhancedLocator.click();
        clicked = true;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (!clicked) {
    ReportLogger.logInfo(`🔍 Using LocatorPro to click: "${elementName}"`);
    await LocatorProWrapper.clickByText(this.page, elementName);
  }
  
  // Wait for new page and switch to it
  const newPage = await pagePromise;
  await newPage.waitForLoadState();
  this.page = newPage;
  ReportLogger.logInfo(`✅ Switched to new page: ${newPage.url()}`);
});

When('I switch to new tab', async function () {
  const pages = this.context.pages();
  if (pages.length > 1) {
    this.page = pages[pages.length - 1];
    await this.page.waitForLoadState();
    ReportLogger.logInfo(`✅ Switched to new tab: ${this.page.url()}`);
  } else {
    throw new Error('No new tab found');
  }
});

When('I switch to tab {int}', async function (tabIndex: number) {
  const pages = this.context.pages();
  if (tabIndex >= 0 && tabIndex < pages.length) {
    this.page = pages[tabIndex];
    await this.page.waitForLoadState();
    ReportLogger.logInfo(`✅ Switched to tab ${tabIndex}: ${this.page.url()}`);
  } else {
    throw new Error(`Tab ${tabIndex} not found. Total tabs: ${pages.length}`);
  }
});

When('I switch to original tab', async function () {
  const pages = this.context.pages();
  if (pages.length > 0) {
    this.page = pages[0];
    await this.page.waitForLoadState();
    ReportLogger.logInfo(`✅ Switched back to original tab: ${this.page.url()}`);
  }
});

When('I close current tab', async function () {
  const pages = this.context.pages();
  if (pages.length > 1) {
    await this.page.close();
    this.page = pages[0];
    ReportLogger.logInfo(`✅ Closed tab and switched to: ${this.page.url()}`);
  } else {
    throw new Error('Cannot close the only tab');
  }
});

// ==================== POPUP/ALERT/DIALOG HANDLING ====================

When('I accept the alert', async function () {
  this.page.once('dialog', async (dialog: Dialog) => {
    ReportLogger.logInfo(`⚠️ Alert detected: ${dialog.message()}`);
    await dialog.accept();
    ReportLogger.logInfo(`✅ Alert accepted`);
  });
});

When('I dismiss the alert', async function () {
  this.page.once('dialog', async (dialog: Dialog) => {
    ReportLogger.logInfo(`⚠️ Alert detected: ${dialog.message()}`);
    await dialog.dismiss();
    ReportLogger.logInfo(`✅ Alert dismissed`);
  });
});

// ==================== BROWSER PERMISSION POPUP HANDLING ====================

When('I allow browser permissions', async function () {
  // Handle browser permission popups (microphone, camera, location, notifications)
  const strategies = [
    // Strategy 1: Click "Allow this time" button
    async () => {
      const allowButton = this.page.locator('button:has-text("Allow this time"), button:has-text("Allow")');
      const count = await allowButton.count();
      if (count > 0) {
        await allowButton.first().click();
        ReportLogger.logInfo(`✅ Clicked "Allow this time" button`);
        return true;
      }
      return false;
    },
    // Strategy 2: Click "Allow while visiting the site" button
    async () => {
      const allowButton = this.page.locator('button:has-text("Allow while visiting the site")');
      const count = await allowButton.count();
      if (count > 0) {
        await allowButton.first().click();
        ReportLogger.logInfo(`✅ Clicked "Allow while visiting the site" button`);
        return true;
      }
      return false;
    },
  ];

  let handled = false;
  for (const strategy of strategies) {
    try {
      const result = await strategy();
      if (result) {
        handled = true;
        break;
      }
    } catch (error) {
      continue;
    }
  }

  if (!handled) {
    ReportLogger.logInfo(`⚠️ No permission popup found to handle`);
  }
});

When('I deny browser permissions', async function () {
  // Handle browser permission popups by denying
  const denyButton = this.page.locator('button:has-text("Never allow"), button:has-text("Block"), button:has-text("Deny")');
  const count = await denyButton.count();
  
  if (count > 0) {
    await denyButton.first().click();
    ReportLogger.logInfo(`✅ Clicked deny/block button for browser permissions`);
  } else {
    ReportLogger.logInfo(`⚠️ No permission popup found to deny`);
  }
});

When('I close the permission popup', async function () {
  // Close permission popup without allowing or denying
  await this.page.waitForTimeout(1000);
  
  const strategies = [
    // Strategy 1: Click X button
    async () => {
      const closeButton = this.page.locator('button[aria-label="Close"]');
      const count = await closeButton.count();
      if (count > 0) {
        await closeButton.first().click();
        ReportLogger.logInfo(`✅ Closed permission popup using Close button`);
        return true;
      }
      return false;
    },
    // Strategy 2: Click "Never allow" button
    async () => {
      const neverButton = this.page.locator('button:has-text("Never allow")');
      const count = await neverButton.count();
      if (count > 0) {
        await neverButton.first().click();
        ReportLogger.logInfo(`✅ Closed permission popup using Never allow`);
        return true;
      }
      return false;
    },
    // Strategy 3: Press Escape key
    async () => {
      await this.page.keyboard.press('Escape');
      ReportLogger.logInfo(`✅ Closed permission popup using Escape key`);
      return true;
    },
  ];
  
  let closed = false;
  for (const strategy of strategies) {
    try {
      const result = await strategy();
      if (result) {
        closed = true;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (!closed) {
    ReportLogger.logInfo(`⚠️ No permission popup found to close`);
  }
  
  await this.page.waitForTimeout(1000);
});

When('I accept the alert with text {string}', async function (text: string) {
  this.page.once('dialog', async (dialog: Dialog) => {
    ReportLogger.logInfo(`⚠️ Alert detected: ${dialog.message()}`);
    await dialog.accept(text);
    ReportLogger.logInfo(`✅ Alert accepted with text: ${text}`);
  });
});

Then('I should see alert with message {string}', async function (expectedMessage: string) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Alert with message "${expectedMessage}" not found within timeout`));
    }, 5000);
    
    this.page.once('dialog', async (dialog: Dialog) => {
      clearTimeout(timeout);
      const actualMessage = dialog.message();
      ReportLogger.logInfo(`⚠️ Alert message: ${actualMessage}`);
      
      if (actualMessage.includes(expectedMessage)) {
        await dialog.accept();
        ReportLogger.logInfo(`✅ Alert message verified: ${expectedMessage}`);
        resolve(true);
      } else {
        await dialog.accept();
        reject(new Error(`Expected alert message to contain "${expectedMessage}", but got "${actualMessage}"`));
      }
    });
  });
});
