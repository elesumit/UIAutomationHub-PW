import { Page, Locator } from '@playwright/test';
import { LocatorProWrapper } from '../utils/locatorpro-wrapper';
import { ReportLogger } from '../utils/report-logger';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected async click(locator: string, elementName: string): Promise<void> {
    await LocatorProWrapper.smartClick(this.page, locator, elementName);
  }

  protected async clickByText(text: string): Promise<void> {
    await LocatorProWrapper.clickByText(this.page, text);
  }

  protected async fill(locator: string, elementName: string, value: string): Promise<void> {
    await LocatorProWrapper.smartFill(this.page, locator, value, elementName);
  }

  protected async fillByText(text: string, value: string): Promise<void> {
    await LocatorProWrapper.fillByText(this.page, text, value);
  }

  protected async selectOption(locator: string, elementName: string, value: string): Promise<void> {
    const selectLocator = this.page.locator(locator);
    const enhancedLocator = await LocatorProWrapper.autoEnhance(this.page, selectLocator);
    await enhancedLocator.selectOption(value);
    ReportLogger.logInfo(`✅ Selected "${value}" from ${elementName}`);
  }

  protected async findByVisibleText(text: string): Promise<Locator> {
    return await LocatorProWrapper.findByVisibleText(this.page, text);
  }

  protected async findByRole(role: string, name?: string): Promise<Locator> {
    return await LocatorProWrapper.findByRole(this.page, role, name);
  }

  protected async getText(locator: string): Promise<string> {
    return await this.page.locator(locator).textContent() || '';
  }

  protected async isVisible(locator: string): Promise<boolean> {
    return await this.page.locator(locator).isVisible();
  }

  protected async waitForElement(locator: string, timeout: number = 10000): Promise<void> {
    await this.page.locator(locator).waitFor({ timeout, state: 'visible' });
  }

  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}
