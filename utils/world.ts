import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Page, BrowserContext } from '@playwright/test';

export interface EverestWorld extends World {
  page: Page;
  context: BrowserContext;
}

export class CustomWorld extends World implements EverestWorld {
  page!: Page;
  context!: BrowserContext;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);