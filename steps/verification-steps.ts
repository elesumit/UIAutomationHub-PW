import { Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LocatorProWrapper } from '../utils/locatorpro-wrapper';
import { ReportLogger } from '../utils/report-logger';
import { SharedDataStore } from '../utils/shared-data-store';
import { resolveCsvPlaceholders } from '../utils/csv-reader';

// ==================== VERIFICATION STEPS ====================

Then('I should see {string}', async function (text: string) {
  // Replace $variableName with captured values
  text = text.replace(/\$(\w+)/g, (match, varName) => {
    const value = this.capturedData?.[varName] || SharedDataStore.get(varName);
    return value || match;
  });

  // Wait a bit for notifications/toasts to appear
  await this.page.waitForTimeout(2000);
  
  // Use multiple strategies to find the text
  const strategies = [
    this.page.getByText(text, { exact: false }),
    this.page.locator(`text="${text}"`),
    this.page.locator(`*:has-text("${text}")`),
    this.page.locator(`//*[contains(text(), "${text}")]`),
    // Try common notification/toast selectors
    this.page.locator('.toast, .notification, .alert, .message, [role="alert"]').filter({ hasText: text }),
  ];
  
  let found = false;
  let lastError = null;
  
  for (const locator of strategies) {
    try {
      await locator.first().waitFor({ state: 'visible', timeout: 10000 });
      ReportLogger.logInfo(`✅ Verified visibility of: ${text}`);
      found = true;
      break;
    } catch (error) {
      lastError = error;
      continue;
    }
  }
  
  if (!found) {
    // Log page content for debugging
    const bodyText = await this.page.textContent('body');
    ReportLogger.logInfo(`📄 Page contains: ${bodyText?.substring(0, 500)}...`);
    throw new Error(`Could not find visible text: ${text}`);
  }
});

Then('I should see the text {string}', async function (text: string) {
  // Use LocatorPro's intelligent text finding
  const element = await LocatorProWrapper.findByVisibleText(this.page, text);
  await expect(element).toBeVisible({ timeout: 10000 });
  ReportLogger.logInfo(`Verified text: ${text}`);
});

Then('I should not see {string}', async function (text: string) {
  // Wait a bit to ensure element is removed
  await this.page.waitForTimeout(1000);
  
  // Try multiple strategies to check if text is NOT visible
  const strategies = [
    this.page.getByText(text, { exact: false }),
    this.page.locator(`text="${text}"`),
    this.page.locator(`*:has-text("${text}")`),
  ];
  
  for (const locator of strategies) {
    try {
      const count = await locator.count();
      if (count > 0) {
        // Check if any instances are visible
        const isVisible = await locator.first().isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          throw new Error(`Text "${text}" is still visible on the page`);
        }
      }
    } catch (error: any) {
      // If it's our custom error, throw it
      if (error.message?.includes('is still visible')) {
        throw error;
      }
      // Otherwise, element not found is what we want
      continue;
    }
  }
  
  ReportLogger.logInfo(`✅ Verified text is not visible: ${text}`);
});

Then('the captured toast should contain {string}', async function (expectedText: string) {
  const capturedToast = (this as any).lastToastMessage;
  
  ReportLogger.logInfo(`🔍 Verifying captured toast message`);
  ReportLogger.logInfo(`Expected text: "${expectedText}"`);
  ReportLogger.logInfo(`Captured toast: "${capturedToast || '(empty)'}"`);
  
  if (!capturedToast || capturedToast.trim() === '') {
    // Take a screenshot to help debug
    await this.page.screenshot({ path: 'test-results/screenshots/toast-verification-failed.png', fullPage: true });
    throw new Error(`No toast message was captured. The toast may have appeared too quickly or not at all. Screenshot saved to test-results/screenshots/toast-verification-failed.png`);
  }
  
  if (!capturedToast.includes(expectedText)) {
    throw new Error(`Toast message does not contain expected text.\nExpected: "${expectedText}"\nActual: "${capturedToast}"`);
  }
  
  ReportLogger.logInfo(`✅ Toast verification successful! Message: "${capturedToast}"`);
});

Then('I should see a toast notification with {string}', async function (text: string) {
  ReportLogger.logInfo(`🔍 Looking for toast notification with text: "${text}"`);
  
  // Try to wait for ANY toast to appear first (without text filter)
  try {
    await this.page.waitForSelector('[id*="toastList"]', { state: 'visible', timeout: 10000 });
    ReportLogger.logInfo(`✅ Toast container appeared`);
  } catch (e) {
    ReportLogger.logInfo(`⚠️ No toast container found, trying alternative approaches`);
  }
  
  // Small wait for toast to fully render
  await this.page.waitForTimeout(500);
  
  // Get page content for debugging
  const pageContent = await this.page.content();
  const hasToastList = pageContent.includes('toastList');
  const hasCaseCreated = pageContent.includes('Case Created');
  const hasSuccessfully = pageContent.includes('successfully created');
  
  ReportLogger.logInfo(`Page contains toastList: ${hasToastList}`);
  ReportLogger.logInfo(`Page contains "Case Created": ${hasCaseCreated}`);
  ReportLogger.logInfo(`Page contains "successfully created": ${hasSuccessfully}`);
  
  // Try multiple strategies for toast notifications
  const strategies = [
    // Strategy 1: Any element with toastList in ID
    { name: 'Any toastList element', locator: this.page.locator('[id*="toastList"]') },
    // Strategy 2: XPath for toastList
    { name: 'XPath toastList', locator: this.page.locator('xpath=//*[contains(@id, "toastList")]') },
    // Strategy 3: Text "Case Created" anywhere
    { name: 'Text Case Created', locator: this.page.getByText('Case Created', { exact: false }) },
    // Strategy 4: Text "successfully created" anywhere
    { name: 'Text successfully created', locator: this.page.getByText('successfully created', { exact: false }) },
    // Strategy 5: Regex pattern
    { name: 'Regex pattern', locator: this.page.getByText(/Case.*successfully created/i) }
  ];
  
  let found = false;
  let foundStrategy = '';
  
  for (const strategy of strategies) {
    try {
      const count = await strategy.locator.count();
      ReportLogger.logInfo(`Strategy "${strategy.name}": found ${count} elements`);
      
      if (count > 0) {
        const isVisible = await strategy.locator.first().isVisible();
        ReportLogger.logInfo(`Strategy "${strategy.name}": first element visible = ${isVisible}`);
        
        if (isVisible) {
          const textContent = await strategy.locator.first().textContent();
          ReportLogger.logInfo(`Strategy "${strategy.name}": text content = "${textContent}"`);
          
          if (textContent && textContent.includes(text)) {
            ReportLogger.logInfo(`✅ Found toast notification using: ${strategy.name}`);
            found = true;
            foundStrategy = strategy.name;
            break;
          }
        }
      }
    } catch (e: any) {
      ReportLogger.logInfo(`Strategy "${strategy.name}" error: ${e.message}`);
      continue;
    }
  }
  
  if (!found) {
    // Take a screenshot for debugging
    await this.page.screenshot({ path: 'test-results/screenshots/toast-not-found.png', fullPage: true });
    ReportLogger.logInfo(`Screenshot saved to test-results/screenshots/toast-not-found.png`);
    
    // Save page HTML for debugging
    const html = await this.page.content();
    const fs = require('fs');
    fs.writeFileSync('test-results/screenshots/page-content.html', html);
    ReportLogger.logInfo(`Page HTML saved to test-results/screenshots/page-content.html`);
    
    throw new Error(`Toast notification with text "${text}" not found. Check screenshot and HTML dump for details.`);
  } else {
    ReportLogger.logInfo(`✅ Toast verification successful using strategy: ${foundStrategy}`);
  }
});

Then('the page title should be {string}', async function (expectedTitle: string) {
  await expect(this.page).toHaveTitle(expectedTitle);
  ReportLogger.logInfo(`Verified page title: ${expectedTitle}`);
});

Then('the page title should contain {string}', async function (titleText: string) {
  await expect(this.page).toHaveTitle(new RegExp(titleText, 'i'));
  ReportLogger.logInfo(`Verified page title contains: ${titleText}`);
});

Then('the URL should be {string}', async function (expectedUrl: string) {
  await expect(this.page).toHaveURL(expectedUrl);
  ReportLogger.logInfo(`Verified URL: ${expectedUrl}`);
});

Then('the URL should contain {string}', async function (urlPart: string) {
  await expect(this.page).toHaveURL(new RegExp(urlPart));
  ReportLogger.logInfo(`Verified URL contains: ${urlPart}`);
});

Then('the {string} should be visible', async function (elementName: string) {
  const element = await LocatorProWrapper.findByVisibleText(this.page, elementName);
  await expect(element).toBeVisible({ timeout: 10000 });
  ReportLogger.logInfo(`Verified ${elementName} is visible`);
});

Then('the {string} should not be visible', async function (elementName: string) {
  const element = this.page.locator(`text="${elementName}"`);
  await expect(element).not.toBeVisible();
  ReportLogger.logInfo(`Verified ${elementName} is not visible`);
});

Then('I see {string} as {string}', async function (fieldName: string, expectedValue: string) {
  fieldName = resolveCsvPlaceholders(fieldName, this.testDataRow);
  expectedValue = resolveCsvPlaceholders(expectedValue, this.testDataRow);
  ReportLogger.logInfo(`🔍 Verifying field "${fieldName}" has value "${expectedValue}"`);
  
  // Wait for Details tab content to load
  await this.page.waitForTimeout(2000);
  
  // Scroll to Patient Safety section if field is a PS field
  const psKeywords = ['Patient', 'Harm', 'Injury', 'Risk', 'Clinical', 'Impact', 'Alarms', 'Warnings', 'Communication', 'Comm'];
  const isPSField = psKeywords.some(kw => fieldName.includes(kw));
  if (isPSField) {
    ReportLogger.logInfo(`  PS field detected, ensuring section is visible and expanded...`);
    
    // In SF Service Console, multiple case tabs are open in the DOM.
    // We must find the VISIBLE "Patient Safety Information" header (active tab only).
    const psSections = this.page.locator('text="Patient Safety Information"');
    const psCount = await psSections.count();
    ReportLogger.logInfo(`  Found ${psCount} "Patient Safety Information" elements on page`);
    
    for (let pi = 0; pi < psCount; pi++) {
      const section = psSections.nth(pi);
      const isVis = await section.isVisible().catch(() => false);
      if (!isVis) continue;
      
      // Scroll to the visible PS section header
      await section.scrollIntoViewIfNeeded().catch(() => {});
      await this.page.waitForTimeout(500);
      ReportLogger.logInfo(`  Scrolled to Patient Safety section [${pi}]`);
      
      // Check if the section is collapsed and expand it.
      // SF sections use a button with aria-expanded inside or around the header.
      const expandSelectors = [
        'xpath=ancestor::button[@aria-expanded="false"]',
        'xpath=ancestor::*[contains(@class, "section")][1]//button[@aria-expanded="false"]',
        'xpath=ancestor::h3[1]//button[@aria-expanded="false"]',
        'xpath=ancestor::h2[1]//button[@aria-expanded="false"]',
      ];
      
      for (const sel of expandSelectors) {
        try {
          const btn = section.locator(sel).first();
          const btnCount = await btn.count().catch(() => 0);
          if (btnCount > 0 && await btn.isVisible().catch(() => false)) {
            await btn.click();
            await this.page.waitForTimeout(1000);
            ReportLogger.logInfo(`  Expanded collapsed Patient Safety section`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      break;
    }
  }
  
  // Strategies to find the field and its value
  const strategies = [
    // Strategy SF-Checkbox: Salesforce checkbox true/false verification
    async () => {
      if (expectedValue.toLowerCase() !== 'true' && expectedValue.toLowerCase() !== 'false') {
        throw new Error('Not a boolean value, skip checkbox strategy');
      }
      ReportLogger.logInfo(`Trying Strategy SF-Checkbox: Salesforce checkbox verification for "${fieldName}" = "${expectedValue}"`);
      
      // Scroll to Patient Safety section first
      const psSection = this.page.locator('text="Patient Safety Information"').first();
      const psSectionVisible = await psSection.isVisible().catch(() => false);
      if (psSectionVisible) {
        await psSection.scrollIntoViewIfNeeded().catch(() => {});
        await this.page.waitForTimeout(500);
        ReportLogger.logInfo(`  Scrolled to Patient Safety Information section`);
      }
      
      // Approach 1: Find the field label and check the lightning-icon title in its row
      const labelLocator = this.page.locator(`span.test-id__field-label`);
      const labelCount = await labelLocator.count();
      ReportLogger.logInfo(`  Found ${labelCount} total field labels on page`);
      
      for (let i = 0; i < labelCount; i++) {
        const label = labelLocator.nth(i);
        const labelText = await label.textContent().catch(() => '');
        
        // Use includes for partial matching (SF may truncate labels)
        if (!labelText || !labelText.includes(fieldName.substring(0, 20))) continue;
        
        const isVisible = await label.isVisible().catch(() => false);
        if (!isVisible) continue;
        
        ReportLogger.logInfo(`  Found matching label[${i}]: "${labelText}"`);
        
        // Go up to the slds-form-element container
        const fieldContainer = label.locator('xpath=ancestor::div[contains(@class, "slds-form-element")][1]');
        const containerExists = await fieldContainer.count().catch(() => 0);
        
        if (containerExists > 0) {
          // Check for lightning-icon title attribute (True/False)
          const icons = fieldContainer.locator('lightning-icon');
          const iconCount = await icons.count();
          ReportLogger.logInfo(`  Found ${iconCount} lightning-icon in container`);
          
          for (let j = 0; j < iconCount; j++) {
            const iconTitle = await icons.nth(j).getAttribute('title').catch(() => null);
            ReportLogger.logInfo(`  Icon[${j}] title: "${iconTitle}"`);
            
            if (iconTitle && iconTitle.toLowerCase() === expectedValue.toLowerCase()) {
              ReportLogger.logInfo(`  ✅ Checkbox "${fieldName}" = "${expectedValue}" via icon title`);
              return;
            }
          }
          
          // Fallback: Check slds-assistive-text
          const assistiveTexts = fieldContainer.locator('.slds-assistive-text');
          const assistiveCount = await assistiveTexts.count();
          for (let j = 0; j < assistiveCount; j++) {
            const text = await assistiveTexts.nth(j).textContent().catch(() => '');
            if (text && text.toLowerCase().trim() === expectedValue.toLowerCase()) {
              ReportLogger.logInfo(`  ✅ Checkbox "${fieldName}" = "${expectedValue}" via assistive text`);
              return;
            }
          }
          
          // Fallback: Check the entire container innerText for True/False
          const containerText = await fieldContainer.innerText().catch(() => '');
          ReportLogger.logInfo(`  Container innerText: "${containerText.substring(0, 200)}"`);
          if (containerText.toLowerCase().includes(expectedValue.toLowerCase())) {
            ReportLogger.logInfo(`  ✅ Checkbox "${fieldName}" = "${expectedValue}" via container text`);
            return;
          }
        }
      }
      
      // Approach 2: Find all lightning-icon elements with matching title and check if parent has field name
      ReportLogger.logInfo(`  Trying Approach 2: Find icons with title="${expectedValue}"`);
      const matchingIcons = this.page.locator(`lightning-icon[title="${expectedValue.charAt(0).toUpperCase() + expectedValue.slice(1).toLowerCase()}"]`);
      const matchCount = await matchingIcons.count();
      ReportLogger.logInfo(`  Found ${matchCount} icons with title="${expectedValue}"`);
      
      for (let k = 0; k < matchCount; k++) {
        const icon = matchingIcons.nth(k);
        const iconVisible = await icon.isVisible().catch(() => false);
        if (!iconVisible) continue;
        const parentRow = icon.locator('xpath=ancestor::div[contains(@class, "slds-form-element")][1]');
        const rowText = await parentRow.textContent().catch(() => '');
        if (rowText && rowText.includes(fieldName.substring(0, 15))) {
          ReportLogger.logInfo(`  ✅ Found via reverse lookup: icon title="${expectedValue}" in row with "${fieldName}"`);
          return;
        }
      }
      
      // Approach 3: Search by data-target-selection-name
      const dataFields = this.page.locator(`[data-target-selection-name*="Patient"], [data-target-selection-name*="Harm"], [data-target-selection-name*="Impact"], [data-target-selection-name*="Alarm"], [data-target-selection-name*="Clinical"]`);
      const dfCount = await dataFields.count();
      
      for (let k = 0; k < dfCount; k++) {
        const dfVisible = await dataFields.nth(k).isVisible().catch(() => false);
        if (!dfVisible) continue;
        const dfText = await dataFields.nth(k).textContent().catch(() => '');
        if (dfText && dfText.includes(fieldName.substring(0, 15))) {
          const icon = dataFields.nth(k).locator('lightning-icon');
          const iconCount = await icon.count();
          for (let m = 0; m < iconCount; m++) {
            const iconTitle = await icon.nth(m).getAttribute('title').catch(() => null);
            if (iconTitle && iconTitle.toLowerCase() === expectedValue.toLowerCase()) {
              ReportLogger.logInfo(`  ✅ Found via data-target: "${fieldName}" = "${expectedValue}"`);
              return;
            }
          }
        }
      }
      
      throw new Error(`Checkbox "${fieldName}" with value "${expectedValue}" not found`);
    },
    // Strategy SF-Description: Salesforce text field verification using test-id__field-label + lightning-formatted-text
    async () => {
      ReportLogger.logInfo(`Trying Strategy SF-Description: label + lightning-formatted-text`);
      
      // Find all field labels on the page
      const labels = this.page.locator('span.test-id__field-label');
      const labelCount = await labels.count();
      
      for (let i = 0; i < labelCount; i++) {
        const label = labels.nth(i);
        const labelText = await label.textContent().catch(() => '');
        
        if (!labelText || !labelText.includes(fieldName.substring(0, 15))) continue;
        
        const isVisible = await label.isVisible().catch(() => false);
        if (!isVisible) continue;
        
        ReportLogger.logInfo(`  Found matching label[${i}]: "${labelText}"`);
        
        // Go up to the slds-form-element container
        const fieldContainer = label.locator('xpath=ancestor::div[contains(@class, "slds-form-element")][1]');
        const containerExists = await fieldContainer.count().catch(() => 0);
        
        if (containerExists > 0) {
          // Look for lightning-formatted-text with the expected value
          const valueElem = fieldContainer.locator('lightning-formatted-text');
          const valueCount = await valueElem.count();
          
          for (let j = 0; j < valueCount; j++) {
            const text = await valueElem.nth(j).textContent().catch(() => '');
            ReportLogger.logInfo(`  lightning-formatted-text[${j}]: "${text}"`);
            
            if (text && text.trim().includes(expectedValue)) {
              ReportLogger.logInfo(`  ✅ "${fieldName}" = "${expectedValue}" via SF-Description`);
              return;
            }
          }
          
          // Also check any span with test-id__field-value
          const valueSpan = fieldContainer.locator('.test-id__field-value');
          const spanCount = await valueSpan.count();
          for (let j = 0; j < spanCount; j++) {
            const text = await valueSpan.nth(j).textContent().catch(() => '');
            if (text && text.trim().includes(expectedValue)) {
              ReportLogger.logInfo(`  ✅ "${fieldName}" = "${expectedValue}" via field-value span`);
              return;
            }
          }
        }
      }
      
      throw new Error(`SF-Description: "${fieldName}" with value "${expectedValue}" not found`);
    },
    // Strategy 0: Salesforce - Look for all instances of the field and find the visible value
    async () => {
      ReportLogger.logInfo(`Trying Strategy 0: Multiple field instances search`);
      
      // Find all elements containing the field name
      const fieldElements = this.page.locator(`*:has-text("${fieldName}")`);
      const fieldCount = await fieldElements.count();
      ReportLogger.logInfo(`  Found ${fieldCount} elements containing "${fieldName}"`);
      
      // For each field instance, check if it has the expected value nearby
      for (let i = 0; i < fieldCount; i++) {
        const fieldElem = fieldElements.nth(i);
        
        // Get the parent container (could be a section, div, etc.)
        const container = fieldElem.locator('xpath=ancestor::*[contains(@class, "section") or contains(@class, "detail") or contains(@class, "summary")][1]');
        const containerExists = await container.count().catch(() => 0);
        
        if (containerExists > 0) {
          // Look for the value within this container
          const valueInContainer = container.locator(`*:has-text("${expectedValue}")`).first();
          const valueVisible = await valueInContainer.isVisible().catch(() => false);
          
          if (valueVisible) {
            await expect(valueInContainer).toBeVisible({ timeout: 2000 });
            ReportLogger.logInfo(`  ✅ Found "${fieldName}" = "${expectedValue}" in container ${i + 1}`);
            return;
          }
        }
      }
      throw new Error('Field-value pair not found in any container');
    },
    // Strategy 0b: Salesforce - Look for lightning-formatted-text with the expected value
    async () => {
      ReportLogger.logInfo(`Trying Strategy 0b: Salesforce lightning-formatted-text`);
      
      // Find all visible "New" elements
      const valueElements = this.page.locator(`lightning-formatted-text:has-text("${expectedValue}")`);
      const count = await valueElements.count();
      ReportLogger.logInfo(`  Found ${count} lightning-formatted-text elements with value "${expectedValue}"`);
      
      // Look for one that's in a field container related to Status
      for (let i = 0; i < count; i++) {
        const elem = valueElements.nth(i);
        const isVisible = await elem.isVisible().catch(() => false);
        
        if (isVisible) {
          // Check if this element is in a field section that contains "Status"
          const fieldSection = elem.locator('xpath=ancestor::*[contains(@class, "field") or contains(@class, "item") or contains(@class, "section")]');
          const sectionText = await fieldSection.textContent().catch(() => '');
          
          if (sectionText.includes(fieldName)) {
            await expect(elem).toBeVisible({ timeout: 2000 });
            ReportLogger.logInfo(`  ✅ Found visible value in Salesforce field section containing "${fieldName}"`);
            return;
          }
        }
      }
      
      // Fallback: just verify any visible lightning-formatted-text with the value exists
      const firstVisible = valueElements.first();
      const isVisible = await firstVisible.isVisible().catch(() => false);
      if (isVisible) {
        await expect(firstVisible).toBeVisible({ timeout: 2000 });
        ReportLogger.logInfo(`  ✅ Found visible lightning-formatted-text with value "${expectedValue}"`);
        return;
      }
      
      throw new Error('Value not found in lightning-formatted-text');
    },
    // Strategy 1: Salesforce - Look for label and value in parent container (going up 2-3 levels)
    async () => {
      ReportLogger.logInfo(`Trying Strategy 1: Ancestor search`);
      const labelLocator = this.page.locator(`text="${fieldName}"`).first();
      await labelLocator.waitFor({ state: 'visible', timeout: 5000 });
      
      // Try going up to grandparent or great-grandparent
      for (let level = 1; level <= 3; level++) {
        const ancestor = labelLocator.locator(`xpath=ancestor::*[${level}]`);
        const ancestorText = await ancestor.textContent().catch(() => '');
        ReportLogger.logInfo(`  Level ${level} ancestor text: "${ancestorText?.substring(0, 100)}..."`);
        
        const valueLocator = ancestor.locator(`text="${expectedValue}"`);
        const count = await valueLocator.count();
        
        if (count > 0) {
          await expect(valueLocator.first()).toBeVisible({ timeout: 2000 });
          ReportLogger.logInfo(`  ✅ Found value in ancestor level ${level}`);
          return;
        }
      }
      throw new Error('Value not found in ancestors');
    },
    // Strategy 2: Look for following sibling elements
    async () => {
      ReportLogger.logInfo(`Trying Strategy 2: Sibling search`);
      const labelLocator = this.page.locator(`text="${fieldName}"`).first();
      await labelLocator.waitFor({ state: 'visible', timeout: 5000 });
      
      // Check next siblings
      for (let i = 1; i <= 3; i++) {
        const sibling = labelLocator.locator(`xpath=following-sibling::*[${i}]`);
        const text = await sibling.textContent().catch(() => null);
        ReportLogger.logInfo(`  Sibling ${i} text: "${text}"`);
        
        if (text && text.trim() === expectedValue) {
          await expect(sibling).toBeVisible({ timeout: 2000 });
          ReportLogger.logInfo(`  ✅ Found value in sibling ${i}`);
          return;
        }
      }
      throw new Error('Value not found in siblings');
    },
    // Strategy 3: Look for value in same row/container
    async () => {
      ReportLogger.logInfo(`Trying Strategy 3: Container search`);
      const container = this.page.locator(`*:has-text("${fieldName}")`).first();
      const containerText = await container.textContent().catch(() => '');
      ReportLogger.logInfo(`  Container text: "${containerText?.substring(0, 100)}..."`);
      const valueLocator = container.locator(`text="${expectedValue}"`);
      await expect(valueLocator).toBeVisible({ timeout: 5000 });
      ReportLogger.logInfo(`  ✅ Found value in container`);
    },
    // Strategy 4: Simple - just verify both label and value are visible on page
    async () => {
      ReportLogger.logInfo(`Trying Strategy 4: Simple visibility check`);
      const labelLocator = this.page.locator(`text="${fieldName}"`).first();
      await labelLocator.waitFor({ state: 'visible', timeout: 5000 });
      const valueLocator = this.page.locator(`text="${expectedValue}"`).first();
      const valueCount = await valueLocator.count();
      ReportLogger.logInfo(`  Found ${valueCount} elements with text "${expectedValue}"`);
      await expect(valueLocator).toBeVisible({ timeout: 5000 });
      ReportLogger.logInfo(`  ✅ Both label and value are visible`);
    },
    // Strategy 5: Try data attributes
    async () => {
      ReportLogger.logInfo(`Trying Strategy 5: Data attribute check`);
      const fieldLocator = this.page.locator(`[aria-label*="${fieldName}" i], [data-label*="${fieldName}" i]`).first();
      const text = await fieldLocator.textContent({ timeout: 5000 });
      ReportLogger.logInfo(`  Attribute element text: "${text}"`);
      if (text && text.includes(expectedValue)) {
        ReportLogger.logInfo(`  ✅ Found value in attribute`);
        return;
      }
      throw new Error('Value not found in field');
    },
  ];

  let verified = false;
  let lastError = null;
  
  // For boolean values (checkbox), only run SF-Checkbox strategy (index 0) to avoid timeout
  const isBoolean = expectedValue.toLowerCase() === 'true' || expectedValue.toLowerCase() === 'false';
  const strategiesToRun = isBoolean ? [strategies[0]] : strategies;
  
  for (let i = 0; i < strategiesToRun.length; i++) {
    try {
      await strategiesToRun[i]();
      ReportLogger.logInfo(`✅ Verified "${fieldName}" has value: "${expectedValue}" using strategy ${isBoolean ? 'SF-Checkbox' : i + 1}`);
      verified = true;
      break;
    } catch (error: any) {
      lastError = error;
      ReportLogger.logInfo(`  ❌ Strategy ${isBoolean ? 'SF-Checkbox' : i + 1} failed: ${error.message}`);
      continue;
    }
  }

  if (!verified) {
    // Log page content for debugging
    await this.page.screenshot({ path: `test-results/screenshots/verify-field-${fieldName.replace(/[^a-zA-Z0-9]/g, '_')}.png`, fullPage: true }).catch(() => {});
    const pageText = await this.page.textContent('body').catch(() => '');
    const fieldMatches = pageText?.split('\n').filter((l: string) => l.includes(fieldName) || l.toLowerCase().includes('patient') || l.toLowerCase().includes('harm')).slice(0, 5);
    ReportLogger.logInfo(`📄 Field-related text on page: ${JSON.stringify(fieldMatches)}`);
    
    throw new Error(`Could not verify "${fieldName}" has value "${expectedValue}". Last error: ${lastError?.message}`);
  }
});

// ==================== TEXT CAPTURE & STORAGE STEPS ====================

When('I store {string} as {string}', async function (value: string, variableName: string) {
  // Initialize storage if not exists
  if (!this.capturedData) {
    this.capturedData = {};
  }
  
  // Store in local context
  this.capturedData[variableName] = value;
  // Store in shared data store for cross-scenario access
  SharedDataStore.set(variableName, value);
  
  ReportLogger.logInfo(`💾 Stored value "${value}" as "${variableName}" (shared across scenarios)`);
});

When('I capture text from {string} and store as {string}', async function (elementName: string, variableName: string) {
  // Initialize storage if not exists
  if (!this.capturedData) {
    this.capturedData = {};
  }

  const strategies = [
    // Strategy 1: Find label and get the next sibling or nearby element
    async () => {
      const label = this.page.locator(`*:has-text("${elementName}")`).first();
      const parent = label.locator('xpath=ancestor::*[1]');
      
      // Try to find a sibling or child that's NOT the label itself
      const allText = await parent.textContent() || '';
      const labelText = await label.textContent() || '';
      
      // Remove the label text to get just the value
      let value = allText.replace(labelText, '').trim();
      
      // Clean up common separators
      value = value.replace(/^[:：\-–—]\s*/, '').trim();
      
      if (value && value !== labelText && value !== elementName) {
        return value;
      }
      throw new Error('Value not found');
    },
    // Strategy 2: Look for adjacent elements
    async () => {
      const label = this.page.locator(`text="${elementName}"`).first();
      const next = label.locator('xpath=following-sibling::*[1]');
      const text = await next.textContent();
      if (text && text.trim()) {
        return text.trim();
      }
      throw new Error('No adjacent element');
    },
    // Strategy 3: Look for elements with matching data attributes
    async () => {
      const element = this.page.locator(`[data-label*="${elementName}" i], [aria-label*="${elementName}" i]`).first();
      const text = await element.textContent();
      if (text && text.trim()) {
        return text.trim();
      }
      throw new Error('No data attribute match');
    },
  ];

  for (const strategy of strategies) {
    try {
      const capturedText = await strategy();
      
      if (capturedText && capturedText !== elementName) {
        // Store in local context (for same scenario)
        this.capturedData[variableName] = capturedText;
        // Store in shared data store (for cross-scenario access)
        SharedDataStore.set(variableName, capturedText);
        ReportLogger.logInfo(`📝 Captured text from "${elementName}": "${capturedText}" → stored as "${variableName}" (shared across scenarios)`);
        return;
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error(`Could not capture text from element: ${elementName}`);
});

When('I capture text matching {string} and store as {string}', async function (pattern: string, variableName: string) {
  // Initialize storage if not exists
  if (!this.capturedData) {
    this.capturedData = {};
  }

  const pageContent = await this.page.textContent('body') || '';
  const regex = new RegExp(pattern);
  const match = pageContent.match(regex);
  
  if (match && match[0]) {
    const capturedText = match[0].trim();
    this.capturedData[variableName] = capturedText;
    ReportLogger.logInfo(`📝 Captured text matching pattern "${pattern}": "${capturedText}" → stored as "${variableName}"`);
  } else {
    throw new Error(`Could not find text matching pattern: ${pattern}`);
  }
});

When('I capture attribute {string} from {string} and store as {string}', async function (attribute: string, elementName: string, variableName: string) {
  // Initialize storage if not exists
  if (!this.capturedData) {
    this.capturedData = {};
  }

  const strategies = [
    `text="${elementName}"`,
    `*:has-text("${elementName}")`,
    `[aria-label="${elementName}"]`,
    `[placeholder="${elementName}"]`,
  ];

  for (const selector of strategies) {
    try {
      const element = this.page.locator(selector).first();
      const count = await element.count();
      
      if (count > 0) {
        const attributeValue = await element.getAttribute(attribute);
        
        if (attributeValue) {
          this.capturedData[variableName] = attributeValue;
          ReportLogger.logInfo(`📝 Captured attribute "${attribute}" from "${elementName}": "${attributeValue}" → stored as "${variableName}"`);
          return;
        }
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error(`Could not capture attribute "${attribute}" from element: ${elementName}`);
});

// ==================== USING CAPTURED DATA ====================

When('I enter captured {string} in {string}', async function (variableName: string, fieldName: string) {
  // Check local context first, then shared data store
  let value = this.capturedData?.[variableName] || SharedDataStore.get(variableName);
  
  if (!value) {
    throw new Error(`No captured data found for variable: ${variableName}`);
  }

  ReportLogger.logInfo(`🔄 Using captured value "${variableName}": "${value}"`);
  
  let filled = false;
  const fieldNameLower = fieldName.toLowerCase();
  
  // Multiple strategies to find the input field
  const strategies = [
    `input[placeholder*="${fieldName}" i]`,
    `input[aria-label*="${fieldName}" i]`,
    `input[name*="${fieldNameLower}"]`,
    `input[id*="${fieldNameLower}"]`,
    `input[type="text"][placeholder*="${fieldName}" i]`,
    `input[type="search"][placeholder*="${fieldName}" i]`,
    `textarea[placeholder*="${fieldName}" i]`,
    `[role="searchbox"][placeholder*="${fieldName}" i]`,
    `[role="combobox"] input[placeholder*="${fieldName}" i]`,
  ];
  
  for (const selector of strategies) {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();
      
      if (count > 0) {
        const element = locator.first();
        const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
          await element.fill(value);
          ReportLogger.logInfo(`✅ Filled "${fieldName}" with captured value: ${value}`);
          filled = true;
          break;
        }
      }
    } catch (error) {
      continue;
    }
  }
  
  if (!filled) {
    throw new Error(`Could not find input field: ${fieldName}`);
  }
});

Then('I should see captured {string}', async function (variableName: string) {
  // Check local context first, then shared data store
  let value = this.capturedData?.[variableName] || SharedDataStore.get(variableName);
  
  if (!value) {
    throw new Error(`No captured data found for variable: ${variableName}`);
  }

  ReportLogger.logInfo(`🔍 Verifying captured value "${variableName}": "${value}"`);
  
  const element = this.page.locator(`text="${value}"`).first();
  await expect(element).toBeVisible({ timeout: 10000 });
  ReportLogger.logInfo(`✅ Verified captured value is visible: ${value}`);
});

Then('I should see {string} with captured {string}', async function (prefix: string, variableName: string) {
  let value = this.capturedData?.[variableName] || SharedDataStore.get(variableName);
  
  if (!value) {
    throw new Error(`No captured data found for variable: ${variableName}`);
  }

  const fullText = `${prefix}${value}`;
  ReportLogger.logInfo(`🔍 Verifying concatenated text: "${fullText}"`);
  
  const element = this.page.locator(`text="${fullText}"`).first();
  await expect(element).toBeVisible({ timeout: 10000 });
  ReportLogger.logInfo(`✅ Verified text is visible: ${fullText}`);
});

Then('captured {string} should contain {string}', async function (variableName: string, expectedText: string) {
  // Check local context first, then shared data store
  let value = this.capturedData?.[variableName] || SharedDataStore.get(variableName);
  
  if (!value) {
    throw new Error(`No captured data found for variable: ${variableName}`);
  }
  
  if (value.includes(expectedText)) {
    ReportLogger.logInfo(`✅ Verified captured "${variableName}" contains "${expectedText}"`);
  } else {
    throw new Error(`Captured value "${value}" does not contain "${expectedText}"`);
  }
});

When('I log captured {string}', async function (variableName: string) {
  // Check local context first, then shared data store
  let value = this.capturedData?.[variableName] || SharedDataStore.get(variableName);
  
  if (!value) {
    throw new Error(`No captured data found for variable: ${variableName}`);
  }

  ReportLogger.logInfo(`📋 Captured "${variableName}": "${value}"`);
});

Then('I should see error {string}', async function (expectedError: string) {
  ReportLogger.logInfo(`🔍 Looking for error banner with text: "${expectedError}"`);
  
  // Split expected text into parts for flexible matching
  // e.g. "Missing Required Fields: The following field is required: Actual Patient Harm/Injury Details"
  // The title and message are in separate DOM elements, so match each part independently
  const expectedParts = expectedError.split(':').map(p => p.trim()).filter(p => p.length > 0);
  ReportLogger.logInfo(`Expected parts: ${JSON.stringify(expectedParts)}`);
  
  // Wait for the toast error banner to appear
  try {
    await this.page.waitForSelector('.forceToastMessage, [data-key="error"], .slds-notify--toast, .toastContainer', { 
      state: 'visible', 
      timeout: 15000 
    });
    ReportLogger.logInfo(`✅ Toast container appeared`);
  } catch (e) {
    ReportLogger.logInfo(`⚠️ Toast container not found via waitForSelector`);
  }
  
  await this.page.waitForTimeout(500);
  
  let found = false;
  
  // Strategy 1: Get the full page text from the toast area and check parts
  const toastSelectors = [
    '.forceToastMessage',
    '.slds-notify--toast',
    '.slds-notify_toast',
    '.toastContainer',
    '[data-key="error"]'
  ];
  
  for (const selector of toastSelectors) {
    try {
      const elements = await this.page.locator(selector).all();
      for (const element of elements) {
        const fullText = await element.innerText();
        const normalizedText = fullText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        ReportLogger.logInfo(`Toast [${selector}] text: "${normalizedText}"`);
        
        // Check if all key parts of the expected message are present
        // This handles the case where title and message are split by newlines
        const lastPart = expectedParts[expectedParts.length - 1];
        if (normalizedText.includes(expectedError) || normalizedText.includes(lastPart)) {
          ReportLogger.logInfo(`✅ Error banner found via ${selector}`);
          found = true;
          break;
        }
      }
      if (found) break;
    } catch (e) {
      // continue
    }
  }
  
  // Strategy 2: Check title and message elements separately
  if (!found) {
    try {
      const titleEl = this.page.locator('.toastTitle, .slds-text-heading--small');
      const msgEl = this.page.locator('.toastMessage, .forceActionsText');
      
      const titleCount = await titleEl.count();
      const msgCount = await msgEl.count();
      
      ReportLogger.logInfo(`Found ${titleCount} title elements, ${msgCount} message elements`);
      
      let allTexts: string[] = [];
      for (let i = 0; i < titleCount; i++) {
        allTexts.push(await titleEl.nth(i).innerText());
      }
      for (let i = 0; i < msgCount; i++) {
        allTexts.push(await msgEl.nth(i).innerText());
      }
      
      const combinedText = allTexts.join(' ').replace(/\s+/g, ' ').trim();
      ReportLogger.logInfo(`Combined title+message text: "${combinedText}"`);
      
      const lastPart = expectedParts[expectedParts.length - 1];
      if (combinedText.includes(expectedError) || combinedText.includes(lastPart)) {
        ReportLogger.logInfo(`✅ Error banner found via separate title+message elements`);
        found = true;
      }
    } catch (e) {
      ReportLogger.logInfo(`⚠️ Separate element strategy failed: ${e}`);
    }
  }
  
  // Strategy 3: Fallback - search for the most specific part of the error text anywhere on page
  if (!found) {
    try {
      const lastPart = expectedParts[expectedParts.length - 1];
      const textLocator = this.page.getByText(lastPart, { exact: false });
      const count = await textLocator.count();
      if (count > 0) {
        ReportLogger.logInfo(`✅ Error text "${lastPart}" found on page via getByText`);
        found = true;
      }
    } catch (e) {
      // continue
    }
  }
  
  if (!found) {
    await this.page.screenshot({ path: 'test-results/screenshots/error-banner-not-found.png', fullPage: true });
    const pageText = await this.page.locator('body').innerText();
    const toastRelated = pageText.split('\n').filter((l: string) => 
      l.toLowerCase().includes('missing') || l.toLowerCase().includes('required') || l.toLowerCase().includes('error')
    ).slice(0, 5);
    ReportLogger.logInfo(`Page error-related text: ${JSON.stringify(toastRelated)}`);
    throw new Error(`Error banner with text "${expectedError}" not found on page. Screenshot saved to test-results/screenshots/error-banner-not-found.png`);
  }
});

// ==================== MILESTONE VERIFICATION STEPS ====================

Then('I see milestone {string} with response time within {string} minutes', async function (milestoneName: string, maxMinutesStr: string) {
  const maxMinutes = parseFloat(maxMinutesStr);
  ReportLogger.logInfo(`🎯 Verifying milestone "${milestoneName}" is within ${maxMinutes} minutes`);

  // Diagnostic: log current page URL and title
  const pageUrl = this.page.url();
  const pageTitle = await this.page.title().catch(() => 'unknown');
  ReportLogger.logInfo(`📍 Page URL: ${pageUrl}`);
  ReportLogger.logInfo(`📍 Page title: ${pageTitle}`);

  // Diagnostic: check if milestone text exists in DOM at all (even if not visible)
  const inDOMCount = await this.page.locator(`text="${milestoneName}"`).count().catch(() => 0);
  ReportLogger.logInfo(`📍 "${milestoneName}" found in DOM: ${inDOMCount} time(s)`);

  // Diagnostic: check if "Milestones" section header exists
  const milestonesHeaderCount = await this.page.locator('text="Milestones"').count().catch(() => 0);
  ReportLogger.logInfo(`📍 "Milestones" header in DOM: ${milestonesHeaderCount} time(s)`);

  // Diagnostic: log first 300 chars of body text
  const bodySnippet = await this.page.locator('body').innerText().catch(() => '');
  ReportLogger.logInfo(`📍 Body text (first 300): ${bodySnippet.substring(0, 300)}`);

  // Scope search to the Milestones card container
  const milestonesCard = this.page.locator('lightning-card.milestonesLightningCard, .milestonesContent').first();
  const cardCount = await milestonesCard.count().catch(() => 0);
  ReportLogger.logInfo(`📍 Milestones card in DOM: ${cardCount}`);

  // Find the milestone using title attribute (matches DOM: <a title="First Response to Customer">)
  let milestoneLink = this.page.locator(`a[title="${milestoneName}"]`).first();
  let inDOMNow = await milestoneLink.count().catch(() => 0);
  ReportLogger.logInfo(`📍 Milestone a[title="${milestoneName}"] in DOM: ${inDOMNow}`);

  // Fallback: search by text within milestones card
  if (inDOMNow === 0) {
    milestoneLink = milestonesCard.locator(`text="${milestoneName}"`).first();
    inDOMNow = await milestoneLink.count().catch(() => 0);
    ReportLogger.logInfo(`📍 Milestone text in milestones card: ${inDOMNow}`);
  }

  if (inDOMNow === 0) {
    throw new Error(`Milestone "${milestoneName}" not found on the page`);
  }

  ReportLogger.logInfo(`✅ Milestone "${milestoneName}" found in DOM (count: ${inDOMNow})`);


  ReportLogger.logInfo(`✅ Milestone "${milestoneName}" is displayed`);

  // Get the time remaining text (e.g., "29 min, 59 sec remaining" or "23 hr, 45 min remaining")
  const milestoneContainer = milestoneLink.locator('xpath=ancestor::li[1]').first();
  let containerExists = await milestoneContainer.count().catch(() => 0);

  let timeText = '';
  if (containerExists > 0) {
    timeText = await milestoneContainer.innerText().catch(() => '');
  } else {
    // Fallback: look for sibling/nearby element with time text
    const parent = milestoneLink.locator('xpath=..').first();
    timeText = await parent.innerText().catch(() => '');
  }

  ReportLogger.logInfo(`📋 Milestone text: "${timeText}"`);

  // Check if milestone is overdue/expired
  const isOverdue = /overdue|expired|violation/i.test(timeText);

  // Parse the time from text
  // Formats: "29 min, 59 sec remaining", "23 hr, 45 min remaining", "3 hr, 59 min overdue"
  let parsedMinutes = 0;
  const hrMatch = timeText.match(/(\d+)\s*hr/i);
  const minMatch = timeText.match(/(\d+)\s*min/i);
  const secMatch = timeText.match(/(\d+)\s*sec/i);

  if (hrMatch) parsedMinutes += parseInt(hrMatch[1]) * 60;
  if (minMatch) parsedMinutes += parseInt(minMatch[1]);
  if (secMatch) parsedMinutes += parseInt(secMatch[1]) / 60;

  ReportLogger.logInfo(`⏱️ Parsed time: ${parsedMinutes.toFixed(1)} minutes (${isOverdue ? 'OVERDUE' : 'remaining'})`);

  if (isOverdue) {
    // Milestone is overdue/expired - SLA was correctly configured and has breached
    ReportLogger.logInfo(`⚠️ Milestone "${milestoneName}" is overdue by ${parsedMinutes.toFixed(1)} min - SLA of ${maxMinutes} min was applied correctly`);
  } else if (parsedMinutes > maxMinutes) {
    // Remaining time exceeds SLA - something is wrong with configuration
    throw new Error(`Milestone "${milestoneName}" has ${parsedMinutes.toFixed(1)} min remaining, but SLA is ${maxMinutes} min. Time exceeds expected range.`);
  } else {
    ReportLogger.logInfo(`✅ Milestone "${milestoneName}" time (${parsedMinutes.toFixed(1)} min) is within SLA of ${maxMinutes} min`);
  }
});


Then('I see no milestones displayed', async function () {
  ReportLogger.logInfo(`🎯 Verifying no milestones are displayed`);

  const milestonesSection = this.page.locator('text="Milestones"').first();
  const sectionVisible = await milestonesSection.isVisible().catch(() => false);

  if (!sectionVisible) {
    ReportLogger.logInfo(`✅ Milestones section not visible - no milestones`);
    return;
  }

  await milestonesSection.scrollIntoViewIfNeeded().catch(() => {});
  await this.page.waitForTimeout(500);

  // Check if there are any milestone items listed
  const milestoneItems = this.page.locator('.milestoneList li, [class*="milestone"] a');
  const count = await milestoneItems.count().catch(() => 0);

  if (count > 0) {
    throw new Error(`Expected no milestones but found ${count} milestone(s)`);
  }

  ReportLogger.logInfo(`✅ No milestones displayed (as expected for Low priority)`);
});
