import { Page, Locator } from '@playwright/test';
import { PlaywrightLocatorGenerator } from './playwright-locator-generator';
import { HealingResult } from './self-healing';

export class EnhancedSelfHealing {
  /**
   * Enhanced healing using Playwright's built-in locator strategies
   */
  static async attemptHealWithPlaywright(
    page: Page,
    originalLocator: string,
    elementName: string
  ): Promise<HealingResult> {
    // Try Playwright's auto-detection
    const detectedLocators = await PlaywrightLocatorGenerator.autoDetectLocator(page, elementName);

    for (const locator of detectedLocators) {
      try {
        await locator.waitFor({ timeout: 2000, state: 'visible' });
        
        // Get the locator string representation
        const healedLocator = await this.getLocatorString(locator);
        
        return {
          success: true,
          healedLocator,
          originalLocator,
          elementName,
        };
      } catch (error) {
        continue;
      }
    }

    return {
      success: false,
      originalLocator,
      elementName,
    };
  }

  /**
   * Click with enhanced Playwright locators
   */
  static async click(
    page: Page,
    originalLocator: string,
    elementName: string,
    onHeal?: (result: HealingResult) => void
  ): Promise<void> {
    // Try original locator first
    try {
      await page.click(originalLocator, { timeout: 5000 });
      return;
    } catch (error) {
      // Original failed, try Playwright's smart locators
    }

    // Try Playwright's getByRole first (most resilient)
    const roleStrategies = [
      { role: 'button', name: elementName },
      { role: 'link', name: elementName },
      { role: 'menuitem', name: elementName },
    ];

    for (const { role, name } of roleStrategies) {
      try {
        const locator = page.getByRole(role as any, { name: new RegExp(name, 'i') });
        await locator.click({ timeout: 2000 });
        
        if (onHeal) {
          onHeal({
            success: true,
            healedLocator: `getByRole('${role}', { name: '${name}' })`,
            originalLocator,
            elementName,
          });
        }
        return;
      } catch (error) {
        continue;
      }
    }

    // Try getByText
    try {
      const locator = page.getByText(elementName, { exact: false });
      await locator.click({ timeout: 2000 });
      
      if (onHeal) {
        onHeal({
          success: true,
          healedLocator: `getByText('${elementName}')`,
          originalLocator,
          elementName,
        });
      }
      return;
    } catch (error) {
      // Continue to next strategy
    }

    // Try auto-detection as last resort
    const healingResult = await this.attemptHealWithPlaywright(page, originalLocator, elementName);
    
    if (healingResult.success && healingResult.healedLocator) {
      if (onHeal) {
        onHeal(healingResult);
      }
      await page.click(healingResult.healedLocator);
    } else {
      throw new Error(`Failed to click on "${elementName}" even after enhanced healing attempts`);
    }
  }

  /**
   * Fill with enhanced Playwright locators
   */
  static async fill(
    page: Page,
    originalLocator: string,
    elementName: string,
    value: string,
    onHeal?: (result: HealingResult) => void
  ): Promise<void> {
    // Try original locator first
    try {
      await page.fill(originalLocator, value, { timeout: 5000 });
      return;
    } catch (error) {
      // Original failed, try Playwright's smart locators
    }

    // Try getByLabel (best for form fields)
    try {
      const locator = page.getByLabel(elementName, { exact: false });
      await locator.fill(value, { timeout: 2000 });
      
      if (onHeal) {
        onHeal({
          success: true,
          healedLocator: `getByLabel('${elementName}')`,
          originalLocator,
          elementName,
        });
      }
      return;
    } catch (error) {
      // Continue
    }

    // Try getByPlaceholder
    try {
      const locator = page.getByPlaceholder(elementName, { exact: false });
      await locator.fill(value, { timeout: 2000 });
      
      if (onHeal) {
        onHeal({
          success: true,
          healedLocator: `getByPlaceholder('${elementName}')`,
          originalLocator,
          elementName,
        });
      }
      return;
    } catch (error) {
      // Continue
    }

    // Try getByRole for textbox
    try {
      const locator = page.getByRole('textbox', { name: new RegExp(elementName, 'i') });
      await locator.fill(value, { timeout: 2000 });
      
      if (onHeal) {
        onHeal({
          success: true,
          healedLocator: `getByRole('textbox', { name: '${elementName}' })`,
          originalLocator,
          elementName,
        });
      }
      return;
    } catch (error) {
      throw new Error(`Failed to fill "${elementName}" even after enhanced healing attempts`);
    }
  }

  /**
   * Get string representation of a Locator
   */
  private static async getLocatorString(locator: Locator): Promise<string> {
    // This is a simplified version - in practice, you'd extract the actual selector
    return locator.toString();
  }

  /**
   * Generate locator suggestion for debugging
   */
  static async suggestLocator(page: Page, elementName: string): Promise<void> {
    const suggestion = await PlaywrightLocatorGenerator.inspectAndSuggest(page, elementName);
    
    console.log('\n🔍 Locator Suggestion for:', elementName);
    console.log('Recommended:', suggestion.recommended);
    console.log('Strategy:', suggestion.strategy);
    console.log('Alternatives:', suggestion.alternatives.slice(0, 5).join(', '));
    console.log('');
  }
}
