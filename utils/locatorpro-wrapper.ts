import { Page, Locator } from '@playwright/test';
import { SmartLocator } from 'locatorpro-playwright';
import { ReportLogger } from './report-logger';

export class LocatorProWrapper {
  /**
   * Get SmartLocator instance for the current page
   * Always creates a new instance to avoid stale page references
   */
  static getInstance(page: Page): SmartLocator {
    return new SmartLocator(page);
  }

  /**
   * Smart Click - Click with auto-enhancement and self-healing
   */
  static async smartClick(page: Page, selector: string, elementName?: string): Promise<void> {
    const smartLocator = this.getInstance(page);
    
    try {
      const locator = page.locator(selector);
      await smartLocator.smartClick(locator);
      
      if (elementName) {
        ReportLogger.logInfo(`✅ Smart clicked on: ${elementName}`);
      }
    } catch (error) {
      ReportLogger.logError(`❌ Failed to smart click on: ${elementName || selector}`);
      throw error;
    }
  }

  /**
   * Smart Fill - Fill with auto-enhancement and self-healing
   */
  static async smartFill(page: Page, selector: string, value: string, elementName?: string): Promise<void> {
    const smartLocator = this.getInstance(page);
    
    try {
      const locator = page.locator(selector);
      await smartLocator.smartFill(locator, value);
      
      if (elementName) {
        ReportLogger.logInfo(`✅ Smart filled "${elementName}" (${selector}) with: ${value}`);
      }
    } catch (error) {
      ReportLogger.logError(`❌ Failed to smart fill: ${elementName || selector}`);
      throw error;
    }
  }

  /**
   * Find by visible text with intelligent DOM scanning
   */
  static async findByVisibleText(page: Page, text: string, options?: {
    fallbacks?: string[];
    elementTypes?: string[];
    maxResults?: number;
  }): Promise<Locator> {
    const smartLocator = this.getInstance(page);
    return await smartLocator.findByVisibleText(text, options);
  }

  /**
   * Find by text with self-healing
   */
  static async findByText(page: Page, text: string, fallbacks?: string[]): Promise<Locator> {
    const smartLocator = this.getInstance(page);
    return await smartLocator.findByText(text, { fallbacks });
  }

  /**
   * Find by role with self-healing
   */
  static async findByRole(page: Page, role: string, name?: string): Promise<Locator> {
    const smartLocator = this.getInstance(page);
    return await smartLocator.findByRole(role, { name });
  }

  /**
   * Find by test ID with self-healing
   */
  static async findByTestId(page: Page, testId: string): Promise<Locator> {
    const smartLocator = this.getInstance(page);
    return await smartLocator.findByTestId(testId);
  }

  /**
   * Find by CSS selector with self-healing
   */
  static async findBySelector(page: Page, selector: string): Promise<Locator> {
    const smartLocator = this.getInstance(page);
    return await smartLocator.findBySelector(selector);
  }

  /**
   * Enhance existing locator with self-healing
   */
  static async enhanceLocator(page: Page, locator: Locator): Promise<Locator> {
    const smartLocator = this.getInstance(page);
    return await smartLocator.enhanceLocator(locator);
  }

  /**
   * Auto-enhance: Try original locator first, enhance if it fails
   */
  static async autoEnhance(page: Page, locator: Locator, timeout?: number): Promise<Locator> {
    const smartLocator = this.getInstance(page);
    return await smartLocator.autoEnhance(locator, { timeout });
  }

  /**
   * Smart Expect - Expect with auto-enhancement
   */
  static smartExpect(page: Page, locator: Locator) {
    const smartLocator = this.getInstance(page);
    return smartLocator.smartExpected(locator);
  }

  /**
   * Find element by its relationship to specific text
   */
  static async findByRelatedText(
    page: Page,
    targetText: string,
    relatedText: string,
    options?: {
      containerTypes?: string[];
      maxLevelsUp?: number;
      maxStrategies?: number;
    }
  ): Promise<Locator> {
    const smartLocator = this.getInstance(page);
    return await smartLocator.findByRelatedText(targetText, relatedText, options);
  }

  /**
   * Validate that a locator can find elements
   */
  static async validateLocator(page: Page, locator: Locator): Promise<boolean> {
    const smartLocator = this.getInstance(page);
    return await smartLocator.validateLocator(locator);
  }

  /**
   * Get debug information about generated strategies
   */
  static async getDebugInfo(page: Page, selector: string): Promise<{
    strategies: any[];
    validStrategies: any[];
    recommended: string;
  }> {
    const smartLocator = this.getInstance(page);
    return await smartLocator.getDebugInfo(selector);
  }

  /**
   * Click by visible text (most user-friendly)
   */
  static async clickByText(page: Page, text: string, fallbacks?: string[]): Promise<void> {
    try {
      const locator = await this.findByVisibleText(page, text, { fallbacks });
      await locator.click();
      ReportLogger.logInfo(`✅ Clicked on text: "${text}"`);
    } catch (error) {
      ReportLogger.logError(`❌ Failed to click on text: "${text}"`);
      throw error;
    }
  }

  /**
   * Fill by visible text/label (most user-friendly)
   */
  static async fillByText(page: Page, text: string, value: string, fallbacks?: string[]): Promise<void> {
    try {
      const locator = await this.findByVisibleText(page, text, { fallbacks, elementTypes: ['input', 'textarea'] });
      await locator.fill(value);
      ReportLogger.logInfo(`✅ Filled "${text}" with: ${value}`);
    } catch (error) {
      // Extra debug: log all visible input/textarea field labels and placeholders
      const inputLabels = await page.$$eval('label', labels => labels.map(l => l.textContent?.trim() || ''));
      const inputPlaceholders = await page.$$eval('input,textarea', els => els.map(e => (e as HTMLInputElement | HTMLTextAreaElement).placeholder || ''));
      ReportLogger.logWarning(`No element found for text: "${text}". Visible labels: [${inputLabels.join(', ')}], placeholders: [${inputPlaceholders.join(', ')}]`);
      ReportLogger.logError(`❌ Failed to fill "${text}"`);
      throw error;
    }
  }

}
