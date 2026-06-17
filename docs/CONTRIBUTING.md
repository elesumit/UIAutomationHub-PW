# Contributing to Everest Framework

## Adding New Page Objects

1. Create a new file in `automation/pom/`
2. Extend `BasePage` class
3. Define locators in a private object
4. Implement page-specific methods
5. Use self-healing methods from BasePage

Example:
```typescript
import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  private locators = {
    welcomeMessage: '.welcome-message',
    logoutButton: '#logout',
  };

  constructor(page: Page) {
    super(page);
  }

  async logout(): Promise<void> {
    await this.click(this.locators.logoutButton, 'Logout');
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.getText(this.locators.welcomeMessage);
  }
}
```

## Adding New Step Definitions

1. Create a new file in `automation/steps/` with suffix `-steps.ts`
2. Import necessary decorators from `@cucumber/cucumber`
3. Implement step functions
4. Use `this.page` to access the current page
5. Log actions using `ReportLogger`

Example:
```typescript
import { When, Then } from '@cucumber/cucumber';
import { DashboardPage } from '../pom/dashboard-page';
import { ReportLogger } from '../utils/report-logger';

When('I logout from the dashboard', async function () {
  const dashboardPage = new DashboardPage(this.page);
  await dashboardPage.logout();
  ReportLogger.logInfo('User logged out');
});
```

## Adding New Healing Strategies

To add a new self-healing strategy, edit `automation/utils/self-healing.ts`:

```typescript
private static healingStrategies = [
  // Existing strategies...
  (elementName: string) => `[data-testid="${elementName}"]`, // New strategy
];
```

## Writing Feature Files

Follow Gherkin best practices:
- Use descriptive scenario names
- Keep scenarios focused and independent
- Use Background for common setup steps
- Use Scenario Outline for data-driven tests

Example:
```gherkin
Feature: User Management
  Background:
    Given I am logged in as admin

  Scenario Outline: Create user with different roles
    When I create a user with role "<role>"
    Then the user should have "<permissions>" permissions

    Examples:
      | role  | permissions |
      | Admin | Full        |
      | User  | Limited     |
```

## Code Style

- Use TypeScript strict mode
- Follow async/await patterns
- Add JSDoc comments for public methods
- Use meaningful variable names
- Keep functions small and focused

## Testing Your Changes

1. Run linting: `npm run lint` (if configured)
2. Run all tests: `npm test`
3. Run Playwright tests: `npx playwright test`
4. Check reports for any issues

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add/update tests
4. Update documentation
5. Submit PR with clear description
