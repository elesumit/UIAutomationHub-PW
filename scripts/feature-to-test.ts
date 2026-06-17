import * as fs from 'fs';
import * as path from 'path';

interface Step {
  keyword: string;
  text: string;
}

interface Scenario {
  name: string;
  steps: Step[];
}

interface Feature {
  name: string;
  scenarios: Scenario[];
}

function parseFeatureFile(filePath: string): Feature {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let featureName = '';
  const scenarios: Scenario[] = [];
  let currentScenario: Scenario | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('Feature:')) {
      featureName = trimmed.replace('Feature:', '').trim();
    } else if (trimmed.startsWith('Scenario:')) {
      if (currentScenario) {
        scenarios.push(currentScenario);
      }
      currentScenario = {
        name: trimmed.replace('Scenario:', '').trim(),
        steps: []
      };
    } else if (currentScenario && /^(Given|When|Then|And|But)\s/.test(trimmed)) {
      const match = trimmed.match(/^(Given|When|Then|And|But)\s+(.+)$/);
      if (match) {
        currentScenario.steps.push({
          keyword: match[1],
          text: match[2]
        });
      }
    }
  }
  
  if (currentScenario) {
    scenarios.push(currentScenario);
  }
  
  return { name: featureName, scenarios };
}

function generatePlaywrightTest(feature: Feature, featureFileName: string): string {
  const testName = featureFileName.replace('.feature', '.spec.ts');
  
  let testCode = `import { test, expect } from '@playwright/test';\n`;
  testCode += `import { BrowserManager } from '../utils/browser-manager';\n`;
  testCode += `import { ReportLogger } from '../utils/report-logger';\n\n`;
  
  testCode += `test.describe('${feature.name}', () => {\n`;
  testCode += `  let page: any;\n\n`;
  
  testCode += `  test.beforeEach(async () => {\n`;
  testCode += `    await BrowserManager.launchBrowser();\n`;
  testCode += `    await BrowserManager.createContext();\n`;
  testCode += `    page = await BrowserManager.createPage();\n`;
  testCode += `  });\n\n`;
  
  testCode += `  test.afterEach(async () => {\n`;
  testCode += `    await BrowserManager.cleanup();\n`;
  testCode += `  });\n\n`;
  
  for (const scenario of feature.scenarios) {
    testCode += `  test('${scenario.name}', async ({ page }, testInfo) => {\n`;
    testCode += `    // TODO: Implement test steps\n`;
    
    for (const step of scenario.steps) {
      const comment = `    // ${step.keyword} ${step.text}\n`;
      testCode += comment;
      
      // Navigate steps
      if (step.text.match(/navigate to "([^"]+)"/)) {
        const urlMatch = step.text.match(/"([^"]+)"/);
        if (urlMatch) {
          testCode += `    await page.goto('${urlMatch[1]}');\n`;
        }
      }
      // Click steps
      else if (step.text.match(/click (on |the )?"([^"]+)"/)) {
        const elementMatch = step.text.match(/"([^"]+)"/);
        if (elementMatch) {
          testCode += `    await page.click('text="${elementMatch[1]}"');\n`;
        }
      }
      // Enter/fill steps
      else if (step.text.match(/enter "([^"]+)" in (the )?"([^"]+)"/)) {
        const matches = step.text.match(/"([^"]+)"/g);
        if (matches && matches.length >= 2) {
          const value = matches[0].replace(/"/g, '');
          const field = matches[1].replace(/"/g, '');
          testCode += `    await page.fill('input[name="${field}"]', '${value}');\n`;
        }
      }
      // Should see text
      else if (step.text.match(/should see "([^"]+)"/)) {
        const textMatch = step.text.match(/"([^"]+)"/);
        if (textMatch) {
          testCode += `    await expect(page.locator('text="${textMatch[1]}"')).toBeVisible();\n`;
        }
      }
      // Should be visible
      else if (step.text.match(/the "([^"]+)" should be visible/)) {
        const textMatch = step.text.match(/"([^"]+)"/);
        if (textMatch) {
          testCode += `    await expect(page.locator('text="${textMatch[1]}"')).toBeVisible();\n`;
        }
      }
      // Page title should contain
      else if (step.text.match(/page title should contain "([^"]+)"/)) {
        const titleMatch = step.text.match(/"([^"]+)"/);
        if (titleMatch) {
          testCode += `    await expect(page).toHaveTitle(new RegExp('${titleMatch[1]}', 'i'));\n`;
        }
      }
      // Page title should be
      else if (step.text.match(/page title should be "([^"]+)"/)) {
        const titleMatch = step.text.match(/"([^"]+)"/);
        if (titleMatch) {
          testCode += `    await expect(page).toHaveTitle('${titleMatch[1]}');\n`;
        }
      }
      // URL should contain
      else if (step.text.match(/URL should contain "([^"]+)"/)) {
        const urlMatch = step.text.match(/"([^"]+)"/);
        if (urlMatch) {
          testCode += `    await expect(page).toHaveURL(new RegExp('${urlMatch[1]}'));\n`;
        }
      }
      // Take screenshot
      else if (step.text.match(/take a screenshot named "([^"]+)"/)) {
        const nameMatch = step.text.match(/"([^"]+)"/);
        if (nameMatch) {
          testCode += `    await page.screenshot({ path: 'test-results/screenshots/${nameMatch[1]}_\${Date.now()}.png', fullPage: true });\n`;
        }
      }
      // Select option
      else if (step.text.match(/select "([^"]+)" from "([^"]+)"/)) {
        const matches = step.text.match(/"([^"]+)"/g);
        if (matches && matches.length >= 2) {
          const value = matches[0].replace(/"/g, '');
          const field = matches[1].replace(/"/g, '');
          testCode += `    await page.selectOption('select[name="${field}"]', '${value}');\n`;
        }
      }
      // Wait for seconds
      else if (step.text.match(/wait for (\d+) seconds?/)) {
        const secondsMatch = step.text.match(/(\d+)/);
        if (secondsMatch) {
          testCode += `    await page.waitForTimeout(${secondsMatch[1]} * 1000);\n`;
        }
      }
      // Default: TODO
      else {
        testCode += `    // TODO: Implement this step\n`;
      }
    }
    
    testCode += `\n    ReportLogger.attachToPlaywrightTest(testInfo);\n`;
    testCode += `  });\n\n`;
  }
  
  testCode += `});\n`;
  
  return testCode;
}

function convertFeatureToTest(featurePath: string, outputDir: string): void {
  const feature = parseFeatureFile(featurePath);
  const featureFileName = path.basename(featurePath);
  const testCode = generatePlaywrightTest(feature, featureFileName);
  
  const outputFileName = featureFileName.replace('.feature', '.spec.ts');
  const outputPath = path.join(outputDir, outputFileName);
  
  fs.writeFileSync(outputPath, testCode, 'utf-8');
  console.log(`✓ Generated test: ${outputPath}`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npm run feature-to-test <feature-file-path>');
    console.log('Example: npm run feature-to-test features/login.feature');
    process.exit(1);
  }
  
  const featurePath = args[0];
  const outputDir = args[1] || 'tests';
  
  if (!fs.existsSync(featurePath)) {
    console.error(`Error: Feature file not found: ${featurePath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`Converting feature file: ${featurePath}`);
  convertFeatureToTest(featurePath, outputDir);
  console.log('✓ Conversion complete!');
}

main();
