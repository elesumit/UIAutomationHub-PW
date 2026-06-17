import { Page } from '@playwright/test';

export interface HealingResult {
  success: boolean;
  healedLocator?: string;
  originalLocator: string;
  elementName: string;
}

export class SelfHealingLocator {
  private static healingStrategies = [
    (elementName: string) => `button:has-text("${elementName}")`,
    (elementName: string) => `[aria-label="${elementName}"]`,
    (elementName: string) => `[placeholder="${elementName}"]`,
    (elementName: string) => `text="${elementName}"`,
    (elementName: string) => `//*[contains(text(), "${elementName}")]`,
    (elementName: string) => `[title="${elementName}"]`,
    (elementName: string) => `[name="${elementName}"]`,
    (elementName: string) => `input:has-text("${elementName}")`,
    (elementName: string) => `a:has-text("${elementName}")`,
  ];

  static async attemptHeal(
    page: Page,
    originalLocator: string,
    elementName: string
  ): Promise<HealingResult> {
    for (const strategy of this.healingStrategies) {
      try {
        const healedLocator = strategy(elementName);
        const element = page.locator(healedLocator);
        
        await element.waitFor({ timeout: 2000, state: 'visible' });
        
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

  static async click(
    page: Page,
    locator: string,
    elementName: string,
    onHeal?: (result: HealingResult) => void
  ): Promise<void> {
    try {
      await page.click(locator, { timeout: 5000 });
    } catch (error) {
      const healingResult = await this.attemptHeal(page, locator, elementName);
      
      if (healingResult.success && healingResult.healedLocator) {
        if (onHeal) {
          onHeal(healingResult);
        }
        await page.click(healingResult.healedLocator);
      } else {
        throw new Error(`Failed to click on "${elementName}" even after healing attempts`);
      }
    }
  }

  static async fill(
    page: Page,
    locator: string,
    elementName: string,
    value: string,
    onHeal?: (result: HealingResult) => void
  ): Promise<void> {
    try {
      await page.fill(locator, value, { timeout: 5000 });
    } catch (error) {
      const healingResult = await this.attemptHeal(page, locator, elementName);
      
      if (healingResult.success && healingResult.healedLocator) {
        if (onHeal) {
          onHeal(healingResult);
        }
        await page.fill(healingResult.healedLocator, value);
      } else {
        throw new Error(`Failed to fill "${elementName}" even after healing attempts`);
      }
    }
  }

  static async selectOption(
    page: Page,
    locator: string,
    elementName: string,
    value: string,
    onHeal?: (result: HealingResult) => void
  ): Promise<void> {
    try {
      await page.selectOption(locator, value, { timeout: 5000 });
    } catch (error) {
      const healingResult = await this.attemptHeal(page, locator, elementName);
      
      if (healingResult.success && healingResult.healedLocator) {
        if (onHeal) {
          onHeal(healingResult);
        }
        await page.selectOption(healingResult.healedLocator, value);
      } else {
        throw new Error(`Failed to select option in "${elementName}" even after healing attempts`);
      }
    }
  }
}
