import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import config from './config';

export class BrowserManager {
  private static browser: Browser;
  private static context: BrowserContext;
  private static page: Page;

  static async launchBrowser(browserType: string = 'chromium'): Promise<void> {
    const headless = process.env.HEADLESS === 'true';
    const slowMo = config.slowMo;

    // Support launching Edge if EDGE_EXECUTABLE_PATH is set in .env
    let launchOptions: any = {
      headless,
      slowMo, // Slows down operations by specified milliseconds
    };

    // Support explicit Edge and Chrome selection
    switch (browserType.toLowerCase()) {
      case 'firefox':
        this.browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        this.browser = await webkit.launch(launchOptions);
        break;
      case 'edge':
        launchOptions.executablePath = process.env.EDGE_EXECUTABLE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
        this.browser = await chromium.launch(launchOptions);
        break;
      case 'chrome':
        launchOptions.executablePath = process.env.CHROME_EXECUTABLE_PATH || undefined;
        this.browser = await chromium.launch(launchOptions);
        break;
      case 'chromium':
      default:
        this.browser = await chromium.launch(launchOptions);
    }
  }

  static async createContext(storageStatePath?: string, permissions?: string[]): Promise<void> {
    const contextOptions: any = {
      viewport: { width: 1920, height: 1080 },
      recordVideo: { dir: 'test-results/videos' },
    };

    if (storageStatePath) {
      contextOptions.storageState = storageStatePath;
    }

    if (permissions && permissions.length > 0) {
      contextOptions.permissions = permissions;
    }

    this.context = await this.browser.newContext(contextOptions);
  }

  static async createPage(): Promise<Page> {
    this.page = await this.context.newPage();
    // Set viewport to typical laptop resolution
    const screenSize = { width: 1366, height: 768 };
    await this.page.setViewportSize(screenSize);
    return this.page;
  }

  static getPage(): Page {
    if (!this.page) {
      throw new Error('Page not initialized. Call createPage() first.');
    }
    return this.page;
  }

  static getContext(): BrowserContext {
    if (!this.context) {
      throw new Error('Context not initialized. Call createContext() first.');
    }
    return this.context;
  }

  static async saveStorageState(path: string): Promise<void> {
    await this.context.storageState({ path });
  }

  static async closePage(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
  }

  static async closeContext(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
  }

  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  static async cleanup(): Promise<void> {
    await this.closePage();
    await this.closeContext();
    await this.closeBrowser();
  }
}
