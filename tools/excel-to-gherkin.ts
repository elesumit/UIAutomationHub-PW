import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface TestStep {
  action: string;
  element: string;
  value?: string;
}

interface TestScenario {
  testCaseId: string;
  scenarioName: string;
  tags: string[];
  steps: TestStep[];
}

/**
 * Converts Excel test cases to Gherkin feature files
 * 
 * Excel Format:
 * Column A: Test Case ID (e.g., XSP-135)
 * Column B: Scenario Name
 * Column C: Tags (comma-separated, e.g., @smoke, @regression)
 * Column D: Action (Click, Enter, Select, Wait, Verify, Navigate, etc.)
 * Column E: Element (button name, field name, etc.)
 * Column F: Value (optional - text to enter, option to select, etc.)
 */
class ExcelToGherkinConverter {
  private actionMap: Map<string, (element: string, value?: string) => string>;

  constructor() {
    this.actionMap = new Map([
      // Original actions
      ['click', (element) => `When I click on "${element}"`],
      ['enter', (element, value) => `When I enter "${value || ''}" in "${element}"`],
      ['select', (element, value) => `When I select "${value || ''}" from "${element}"`],
      ['wait', (element) => `When I wait for ${element} seconds`],
      ['verify', (element, value) => `Then I see "${element}" as "${value || ''}"`],
      ['navigate', (element) => `Given I navigate to ${element} ""`],
      ['upload', (element, value) => `When I upload "${value || ''}" to "${element}"`],
      ['capture', (element, value) => `When I capture text from "${element}" and store as "${value || ''}"`],
      ['clickcaptured', (element) => `When I click on captured "${element}"`],
      ['entercaptured', (element, value) => `When I enter captured "${element}" in "${value || ''}"`],
      ['tab', (element) => `When I click on the "${element}" tab`],
      
      // Simplified actions for manual testers
      ['open', (element) => `Given I navigate to ${element} ""`],
      ['type', (element, value) => {
        // Handle "Use remembered X" pattern
        if (value && value.toLowerCase().startsWith('use remembered ')) {
          const varName = value.replace(/use remembered /i, '').trim();
          return `When I enter captured "${varName}" in "${element}"`;
        }
        return `When I enter "${value || ''}" in "${element}"`;
      }],
      ['choose', (element, value) => `When I select "${value || ''}" from "${element}"`],
      ['attach', (element, value) => `When I upload "${value || ''}" to "${element}"`],
      ['remember', (element, value) => `When I capture text from "${element}" and store as "${value || ''}"`],
      ['check', (element, value) => `Then I see "${element}" as "${value || ''}"`],
    ]);
  }

  /**
   * Convert Excel file to Gherkin feature file
   */
  convertExcelToGherkin(excelFilePath: string, outputDir: string = 'features'): void {
    console.log(`📖 Reading Excel file: ${excelFilePath}`);
    
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Parse scenarios
    const scenarios = this.parseExcelData(data);
    
    // Generate feature files
    scenarios.forEach(scenario => {
      const featureContent = this.generateGherkinFeature(scenario);
      const fileName = this.sanitizeFileName(scenario.scenarioName);
      const outputPath = path.join(outputDir, `${fileName}.feature`);
      
      fs.writeFileSync(outputPath, featureContent, 'utf-8');
      console.log(`✅ Generated: ${outputPath}`);
    });
    
    console.log(`\n🎉 Successfully converted ${scenarios.length} test case(s) to Gherkin!`);
  }

  /**
   * Parse Excel data into test scenarios
   */
  private parseExcelData(data: any[]): TestScenario[] {
    const scenarios: TestScenario[] = [];
    let currentScenario: TestScenario | null = null;
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Skip completely empty rows
      if (!row || row.length === 0) continue;
      
      const testCaseId = row[0]?.toString().trim();
      const scenarioName = row[1]?.toString().trim();
      const tags = row[2]?.toString().trim();
      const action = row[3]?.toString().trim().toLowerCase();
      const element = row[4]?.toString().trim();
      const value = row[5]?.toString().trim();
      
      // Skip rows with no action or element (truly empty rows)
      if (!testCaseId && !scenarioName && !action && !element) continue;
      
      // New scenario starts when we have a Test Case ID
      if (testCaseId && scenarioName) {
        if (currentScenario) {
          scenarios.push(currentScenario);
        }
        
        const tagArray = tags ? tags.split(',').map((t: string) => t.trim()) : [];
        if (testCaseId) tagArray.unshift(`@${testCaseId}`);
        
        currentScenario = {
          testCaseId,
          scenarioName,
          tags: tagArray,
          steps: []
        };
      }
      
      // Add step to current scenario
      if (currentScenario && action && element) {
        currentScenario.steps.push({ action, element, value });
      }
    }
    
    // Add last scenario
    if (currentScenario) {
      scenarios.push(currentScenario);
    }
    
    return scenarios;
  }

  /**
   * Generate Gherkin feature file content
   */
  private generateGherkinFeature(scenario: TestScenario): string {
    const lines: string[] = [];
    
    // Feature header
    lines.push(`@${scenario.testCaseId}`);
    lines.push(`Feature: ${scenario.scenarioName}`);
    lines.push('');
    
    // Tags
    lines.push(`  ${scenario.tags.join(' ')}`);
    
    // Scenario
    lines.push(`  Scenario: ${scenario.scenarioName}`);
    
    // Steps
    scenario.steps.forEach(step => {
      const gherkinStep = this.convertStepToGherkin(step);
      if (gherkinStep) {
        lines.push(`    ${gherkinStep}`);
      }
    });
    
    lines.push('');
    return lines.join('\n');
  }

  /**
   * Convert a test step to Gherkin format
   */
  private convertStepToGherkin(step: TestStep): string | null {
    const converter = this.actionMap.get(step.action);
    
    if (converter) {
      return converter(step.element, step.value);
    }
    
    console.warn(`⚠️ Unknown action: ${step.action}`);
    return `# TODO: Unknown action - ${step.action} on "${step.element}"`;
  }

  /**
   * Sanitize file name
   */
  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📝 Excel to Gherkin Converter

Usage:
  npx ts-node tools/excel-to-gherkin.ts <excel-file> [output-dir]

Example:
  npx ts-node tools/excel-to-gherkin.ts test-cases.xlsx features

Excel Format:
  Column A: Test Case ID (e.g., XSP-135)
  Column B: Scenario Name
  Column C: Tags (comma-separated, e.g., @smoke, @regression)
  Column D: Action (Click, Enter, Select, Wait, Verify, Navigate, etc.)
  Column E: Element (button name, field name, etc.)
  Column F: Value (optional)

Supported Actions:
  - Click: Click on a button/link
  - Enter: Enter text in a field
  - Select: Select option from dropdown
  - Wait: Wait for X seconds
  - Verify: Verify element text/value
  - Navigate: Navigate to a page
  - Upload: Upload a file
  - Capture: Capture text and store
  - ClickCaptured: Click on captured element
  - EnterCaptured: Enter captured value
  - Tab: Click on a tab
    `);
    process.exit(0);
  }
  
  const excelFile = args[0];
  const outputDir = args[1] || 'features';
  
  if (!fs.existsSync(excelFile)) {
    console.error(`❌ Error: File not found - ${excelFile}`);
    process.exit(1);
  }
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const converter = new ExcelToGherkinConverter();
  converter.convertExcelToGherkin(excelFile, outputDir);
}

export { ExcelToGherkinConverter };
