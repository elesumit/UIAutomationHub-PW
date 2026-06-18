import { Page, Locator } from '@playwright/test';

export class PlaywrightLocatorGenerator {
  /**
   * Generate smart locators using Playwright's built-in strategies
   * This uses Playwright's recommended locator hierarchy
   */
  static async generateSmartLocator(
    page: Page,
    elementName: string,
    options?: {
      role?: string;
      testId?: string;
      placeholder?: string;
      label?: string;
    }
  ): Promise<Locator> {
    // Priority 1: getByRole (most resilient)
    if (options?.role) {
      return page.getByRole(options.role as any, { name: elementName });
    }

    // Priority 2: getByTestId (recommended for custom test attributes)
    if (options?.testId) {
      return page.getByTestId(options.testId);
    }

    // Priority 3: getByLabel (for form fields)
    if (options?.label) {
      return page.getByLabel(options.label);
    }

    // Priority 4: getByPlaceholder (for inputs)
    if (options?.placeholder) {
      return page.getByPlaceholder(options.placeholder);
    }

    // Priority 5: getByText (for visible text)
    return page.getByText(elementName);
  }

  /**
   * Auto-detect and generate the best locator for an element
   */
  static async autoDetectLocator(page: Page, elementName: string): Promise<Locator[]> {
    const locators: Locator[] = [];

    // Try different Playwright locator strategies
    const strategies = [
      // Role-based (most resilient)
      () => page.getByRole('button', { name: new RegExp(elementName, 'i') }),
      () => page.getByRole('link', { name: new RegExp(elementName, 'i') }),
      () => page.getByRole('textbox', { name: new RegExp(elementName, 'i') }),
      () => page.getByRole('heading', { name: new RegExp(elementName, 'i') }),
      
      // Text-based
      () => page.getByText(elementName, { exact: false }),
      () => page.getByText(new RegExp(elementName, 'i')),
      
      // Label-based
      () => page.getByLabel(elementName, { exact: false }),
      () => page.getByLabel(new RegExp(elementName, 'i')),
      
      // Placeholder-based
      () => page.getByPlaceholder(elementName, { exact: false }),
      () => page.getByPlaceholder(new RegExp(elementName, 'i')),
      
      // Alt text (for images)
      () => page.getByAltText(elementName, { exact: false }),
      
      // Title
      () => page.getByTitle(elementName, { exact: false }),
    ];

    for (const strategy of strategies) {
      try {
        const locator = strategy();
        const count = await locator.count();
        if (count > 0) {
          locators.push(locator);
        }
      } catch (error) {
        // Strategy failed, continue to next
        continue;
      }
    }

    return locators;
  }

  /**
   * Get locator with filtering (Playwright's recommended approach)
   */
  static getFilteredLocator(
    page: Page,
    baseSelector: string,
    filters: {
      hasText?: string | RegExp;
      has?: Locator;
      hasNot?: Locator;
    }
  ): Locator {
    let locator = page.locator(baseSelector);

    if (filters.hasText) {
      locator = locator.filter({ hasText: filters.hasText });
    }

    if (filters.has) {
      locator = locator.filter({ has: filters.has });
    }

    if (filters.hasNot) {
      locator = locator.filter({ hasNot: filters.hasNot });
    }

    return locator;
  }

  /**
   * Generate locator chain (for nested elements)
   */
  static getChainedLocator(page: Page, ...selectors: string[]): Locator {
    let locator = page.locator(selectors[0]);
    
    for (let i = 1; i < selectors.length; i++) {
      locator = locator.locator(selectors[i]);
    }
    
    return locator;
  }

  /**
   * Get locator by test ID (recommended for stable tests)
   */
  static getByTestId(page: Page, testId: string): Locator {
    return page.getByTestId(testId);
  }

  /**
   * Generate CSS selector using Playwright's selector engine
   */
  static async generateCSSSelector(page: Page, elementText: string): Promise<string[]> {
    const selectors: string[] = [];

    // Common CSS patterns
    selectors.push(`button:has-text("${elementText}")`);
    selectors.push(`a:has-text("${elementText}")`);
    selectors.push(`[aria-label="${elementText}"]`);
    selectors.push(`[placeholder="${elementText}"]`);
    selectors.push(`[title="${elementText}"]`);
    selectors.push(`input[name="${elementText.toLowerCase().replace(/\s+/g, '-')}"]`);
    selectors.push(`#${elementText.toLowerCase().replace(/\s+/g, '-')}`);
    selectors.push(`.${elementText.toLowerCase().replace(/\s+/g, '-')}`);

    return selectors;
  }

  /**
   * Inspect element and suggest best locator strategy
   */
  static async inspectAndSuggest(page: Page, elementName: string): Promise<{
    recommended: string;
    alternatives: string[];
    strategy: string;
  }> {
    const locators = await this.autoDetectLocator(page, elementName);
    
    if (locators.length === 0) {
      return {
        recommended: `text="${elementName}"`,
        alternatives: await this.generateCSSSelector(page, elementName),
        strategy: 'fallback-css'
      };
    }

    // Get the first working locator
    const firstLocator = locators[0];
    
    // Try to determine the strategy used
    let strategy = 'unknown';
    let recommended = `text="${elementName}"`;

    try {
      // Check if it's a role-based locator
      const roleLocator = page.getByRole('button', { name: new RegExp(elementName, 'i') });
      if (await roleLocator.count() > 0) {
        strategy = 'role-based';
        recommended = `getByRole('button', { name: '${elementName}' })`;
      }
    } catch (e) {
      // Not a role-based locator
    }

    const alternatives = await this.generateCSSSelector(page, elementName);

    return {
      recommended,
      alternatives,
      strategy
    };
  }
}
