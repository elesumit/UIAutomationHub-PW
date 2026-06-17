# Everest Framework Architecture

## Overview
The Everest Framework is a comprehensive Playwright-based automation framework that combines Gherkin/Cucumber for BDD testing with advanced features like self-healing locators and smart reporting.

## Core Components

### 1. Browser Management (`utils/browser-manager.ts`)
- Manages browser lifecycle (launch, context, page creation)
- Supports multiple browsers (Chromium, Firefox, WebKit)
- Handles session state management
- Provides video recording and screenshot capabilities

### 2. Self-Healing Locators (`utils/self-healing.ts`)
- Automatically attempts to heal broken locators
- Uses multiple fallback strategies:
  - Text-based locators
  - ARIA labels
  - Placeholders
  - Titles
  - Names
  - XPath expressions
- Logs healed locators for reporting

### 3. Smart Reporting (`utils/report-logger.ts`)
- Tracks all test actions and healing events
- Creates annotations for Playwright reports
- Provides structured logging
- Integrates with Cucumber and Playwright reporters

### 4. Page Object Model (`pom/`)
- **BasePage**: Abstract base class with common page operations
  - Self-healing click, fill, select operations
  - Element visibility checks
  - Screenshot capabilities
  - Navigation helpers
- **LoginPage**: Example implementation
  - Demonstrates POM pattern
  - Shows locator management
  - Implements page-specific actions

### 5. Step Definitions (`steps/`)
- **hooks.ts**: Cucumber lifecycle hooks
  - BeforeAll: Browser setup
  - Before: Context and page creation
  - After: Cleanup and screenshot on failure
  - AfterAll: Browser teardown
- **generic-steps.ts**: Reusable step definitions
  - Navigation steps
  - Click actions
  - Form filling
  - Verification steps
- **login-steps.ts**: Domain-specific steps
  - Login-specific actions
  - Session state management

### 6. Configuration (`utils/config.ts`)
- Centralized configuration management
- Environment variable support
- Default values for all settings
- Type-safe configuration object

## Data Flow

```
Feature File (.feature)
    ↓
Cucumber Parser
    ↓
Step Definitions
    ↓
Page Objects (POM)
    ↓
Self-Healing Layer
    ↓
Playwright API
    ↓
Browser Actions
    ↓
Smart Report Logger
```

## Self-Healing Process

```
1. Attempt original locator
    ↓
2. If fails, try healing strategies in order:
   - button:has-text()
   - [aria-label]
   - [placeholder]
   - text=
   - XPath contains
   - [title]
   - [name]
   - input:has-text()
   - a:has-text()
    ↓
3. If healed successfully:
   - Log healing event
   - Add annotation to report
   - Execute action with healed locator
    ↓
4. If all strategies fail:
   - Throw descriptive error
```

## Session State Management

```
1. Login scenario runs
    ↓
2. Save session state to storage/storageState.json
    ↓
3. Subsequent tests load saved state
    ↓
4. Skip login, start from authenticated state
```

## Report Generation

### Cucumber Reports
- HTML report: `test-results/cucumber-report.html`
- JSON report: `test-results/cucumber-report.json`
- Includes scenario results, steps, and timings

### Playwright Reports
- HTML report: `playwright-report/`
- Includes screenshots, videos, traces
- Shows healed locator annotations
- Provides detailed test execution data

## Extension Points

### Adding New Page Objects
1. Extend `BasePage`
2. Define locators object
3. Implement page-specific methods
4. Use inherited self-healing methods

### Adding New Step Definitions
1. Create new file in `steps/`
2. Import Cucumber decorators
3. Access `this.page` for browser interaction
4. Use `ReportLogger` for logging

### Adding New Healing Strategies
1. Edit `utils/self-healing.ts`
2. Add strategy function to `healingStrategies` array
3. Strategy receives element name, returns locator string

### Custom Reporters
1. Add reporter configuration to `cucumber.js`
2. Implement custom reporter interface
3. Access annotations from `ReportLogger`

## Best Practices

1. **Locator Strategy**
   - Use stable, semantic locators (IDs, data-testid)
   - Avoid brittle selectors (nth-child, complex XPath)
   - Let self-healing handle minor changes

2. **Page Objects**
   - Keep locators private
   - Expose high-level actions
   - Return page objects for method chaining
   - Use meaningful method names

3. **Step Definitions**
   - Keep steps atomic and reusable
   - Use generic steps when possible
   - Create custom steps for domain logic
   - Log all actions for debugging

4. **Session Management**
   - Save state after successful login
   - Clear state when testing auth flows
   - Use separate states for different user roles

5. **Error Handling**
   - Let self-healing attempt recovery
   - Provide descriptive error messages
   - Capture screenshots on failure
   - Use appropriate timeouts

## Performance Considerations

- **Parallel Execution**: Cucumber runs scenarios in parallel (configurable)
- **Browser Reuse**: Context is recreated per scenario, browser per suite
- **Session State**: Skips login, reducing test execution time
- **Smart Timeouts**: Configurable timeouts prevent hanging tests
- **Selective Recording**: Videos only on failure to save disk space

## Security

- Environment variables for sensitive data
- `.env` file excluded from version control
- Session state files in `.gitignore`
- No hardcoded credentials in code

## Troubleshooting

### Common Issues

1. **Locator Not Found**
   - Check if element exists on page
   - Review healing strategies
   - Add custom healing strategy if needed

2. **Timeout Errors**
   - Increase timeout in config
   - Check if page is loading slowly
   - Verify element visibility conditions

3. **Session State Not Loading**
   - Verify file exists in `storage/`
   - Check file permissions
   - Ensure context is created with state path

4. **TypeScript Errors**
   - Run `npm install` to install dependencies
   - Check `tsconfig.json` configuration
   - Verify import paths are correct
