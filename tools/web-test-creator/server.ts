import express from 'express';
import multer from 'multer';
import { Octokit } from '@octokit/rest';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Create uploads directory with absolute path
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ dest: uploadsDir });

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'veradigm-project-atlas';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Testing-Automation-PlayWright';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    githubConfigured: !!GITHUB_TOKEN,
    repo: `${GITHUB_OWNER}/${GITHUB_REPO}`
  });
});

/**
 * Download template
 */
app.get('/api/download-template', (req, res) => {
  const templatePath = path.join(__dirname, '../test-case-template-simple.csv');
  res.download(templatePath, 'test-case-template.csv');
});

/**
 * Convert Excel to preview (without saving to GitHub)
 */
app.post('/api/convert-preview', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📤 Converting file to preview: ${req.file.originalname}`);

    // Read and parse Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Parse Excel data
    const scenarios = parseExcelData(data);

    if (scenarios.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'No valid test scenarios found in Excel file' });
    }

    // Generate Gherkin for all scenarios
    let featureContent = '';
    scenarios.forEach((scenario, index) => {
      if (index > 0) featureContent += '\n\n';
      featureContent += generateGherkinFeature(scenario);
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      featureContent,
      scenarioCount: scenarios.length
    });

  } catch (error: any) {
    console.error('Error converting file:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Failed to convert file',
      details: error.message 
    });
  }
});

/**
 * Save feature content to GitHub
 */
app.post('/api/save-to-github', async (req, res) => {
  try {
    const { featureContent } = req.body;

    if (!featureContent) {
      return res.status(400).json({ error: 'No feature content provided' });
    }

    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GitHub token not configured. Please set GITHUB_TOKEN environment variable.' });
    }

    console.log(`💾 Saving feature file to GitHub`);

    // Extract test case IDs and scenario names from feature content
    const testCaseIdMatch = featureContent.match(/@(BTC-\d+)/);
    const scenarioMatch = featureContent.match(/Scenario:\s*(.+)/);
    
    if (!testCaseIdMatch || !scenarioMatch) {
      return res.status(400).json({ error: 'Invalid feature file format. Missing test case ID or scenario name.' });
    }

    const testCaseId = testCaseIdMatch[1];
    const scenarioName = scenarioMatch[1].replace(testCaseId, '').trim();
    const fileName = sanitizeFileName(scenarioName);

    // Commit to GitHub
    const commitResult = await commitToGitHub(
      `${fileName}.feature`,
      featureContent,
      `Add test case ${testCaseId}: ${scenarioName}`
    );

    const results = [{
      testCaseId,
      scenarioName,
      fileName: `${fileName}.feature`,
      githubUrl: commitResult.url,
      success: true
    }];

    console.log(`✅ Committed ${fileName}.feature to GitHub`);

    res.json({
      success: true,
      message: `Successfully saved test to GitHub`,
      results
    });

  } catch (error: any) {
    console.error('Error saving to GitHub:', error);
    res.status(500).json({ 
      error: 'Failed to save to GitHub',
      details: error.message 
    });
  }
});

/**
 * Upload Excel and convert to Gherkin (legacy endpoint - kept for compatibility)
 */
app.post('/api/upload-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GitHub token not configured. Please set GITHUB_TOKEN environment variable.' });
    }

    console.log(`📤 Processing uploaded file: ${req.file.originalname}`);

    // Read and parse Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Parse Excel data
    const scenarios = parseExcelData(data);

    if (scenarios.length === 0) {
      fs.unlinkSync(req.file.path); // Clean up
      return res.status(400).json({ error: 'No valid test scenarios found in Excel file' });
    }

    // Generate Gherkin for each scenario
    const results = [];
    for (const scenario of scenarios) {
      const gherkinContent = generateGherkinFeature(scenario);
      const fileName = sanitizeFileName(scenario.scenarioName);
      
      // Commit to GitHub
      const commitResult = await commitToGitHub(
        `${fileName}.feature`,
        gherkinContent,
        `Add test case ${scenario.testCaseId}: ${scenario.scenarioName}`
      );

      results.push({
        testCaseId: scenario.testCaseId,
        scenarioName: scenario.scenarioName,
        fileName: `${fileName}.feature`,
        githubUrl: commitResult.url,
        success: true
      });

      console.log(`✅ Committed ${fileName}.feature to GitHub`);
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Successfully created ${results.length} test(s) and committed to GitHub`,
      results
    });

  } catch (error: any) {
    console.error('Error processing upload:', error);
    
    // Clean up on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Failed to process file',
      details: error.message 
    });
  }
});

/**
 * Parse Excel data into test scenarios
 */
function parseExcelData(data: any[]): TestScenario[] {
  const scenarios: TestScenario[] = [];
  let currentScenario: TestScenario | null = null;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    if (!row || row.length === 0) continue;
    
    const testCaseId = row[0]?.toString().trim();
    const scenarioName = row[1]?.toString().trim();
    const tags = row[2]?.toString().trim();
    const action = row[3]?.toString().trim().toLowerCase();
    const element = row[4]?.toString().trim();
    const value = row[5]?.toString().trim();
    
    if (!testCaseId && !scenarioName && !action && !element) continue;
    
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
    
    if (currentScenario && action && element) {
      currentScenario.steps.push({ action, element, value });
    }
  }
  
  if (currentScenario) {
    scenarios.push(currentScenario);
  }
  
  return scenarios;
}

/**
 * Generate Gherkin feature file
 */
function generateGherkinFeature(scenario: TestScenario): string {
  const lines: string[] = [];
  
  lines.push(`@${scenario.testCaseId}`);
  lines.push(`Feature: ${scenario.scenarioName}`);
  lines.push('');
  lines.push(`  ${scenario.tags.join(' ')}`);
  lines.push(`  Scenario: ${scenario.testCaseId} ${scenario.scenarioName}`);
  
  scenario.steps.forEach(step => {
    const gherkinStep = convertStepToGherkin(step);
    if (gherkinStep) {
      lines.push(`    ${gherkinStep}`);
    }
  });
  
  lines.push('');
  return lines.join('\n');
}

/**
 * Convert step to Gherkin
 */
function convertStepToGherkin(step: TestStep): string | null {
  const actionMap: { [key: string]: (element: string, value?: string) => string } = {
    'open': (element) => `Given I navigate to ${element} ""`,
    'click': (element) => `When I click on "${element}"`,
    'type': (element, value) => {
      if (value && value.toLowerCase().startsWith('use remembered ')) {
        const varName = value.replace(/use remembered /i, '').trim();
        return `When I enter captured "${varName}" in "${element}"`;
      }
      return `When I enter "${value || ''}" in "${element}"`;
    },
    'choose': (element, value) => `When I select "${value || ''}" from "${element}"`,
    'attach': (element, value) => `When I upload "${value || ''}" to "${element}"`,
    'remember': (element, value) => `When I capture text from "${element}" and store as "${value || ''}"`,
    'check': (element, value) => `Then I see "${element}" as "${value || ''}"`,
    'navigate': (element) => `Given I navigate to ${element} ""`,
    'enter': (element, value) => `When I enter "${value || ''}" in "${element}"`,
    'select': (element, value) => `When I select "${value || ''}" from "${element}"`,
    'upload': (element, value) => `When I upload "${value || ''}" to "${element}"`,
    'capture': (element, value) => `When I capture text from "${element}" and store as "${value || ''}"`,
    'verify': (element, value) => `Then I see "${element}" as "${value || ''}"`,
    'wait': (element) => `When I wait for ${element} seconds`,
    'tab': (element) => `When I click on the "${element}" tab`,
  };

  const converter = actionMap[step.action];
  if (converter) {
    return converter(step.element, step.value);
  }
  
  console.warn(`⚠️ Unknown action: ${step.action}`);
  return `# TODO: Unknown action - ${step.action} on "${step.element}"`;
}

/**
 * Commit file to GitHub
 */
async function commitToGitHub(fileName: string, content: string, message: string) {
  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  
  const filePath = `features/${fileName}`;
  
  try {
    // Check if file exists
    let sha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePath,
        ref: GITHUB_BRANCH
      });
      
      if ('sha' in data) {
        sha = data.sha;
      }
    } catch (error: any) {
      if (error.status !== 404) throw error;
    }
    
    // Create or update file
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: message,
      content: Buffer.from(content).toString('base64'),
      branch: GITHUB_BRANCH,
      sha: sha
    });
    
    return {
      success: true,
      url: data.content?.html_url || `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${filePath}`
    };
  } catch (error: any) {
    console.error('GitHub commit error:', error);
    throw new Error(`Failed to commit to GitHub: ${error.message}`);
  }
}

/**
 * Sanitize file name
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Web Test Creator Server Running!

📝 Access URLs:
  - On this machine: http://localhost:${PORT}
  - From other machines: http://YOUR_IP:${PORT}

Configuration:
  - GitHub Repo: ${GITHUB_OWNER}/${GITHUB_REPO}
  - Branch: ${GITHUB_BRANCH}
  - Token Configured: ${GITHUB_TOKEN ? '✅ Yes' : '❌ No - Set GITHUB_TOKEN env variable'}
  - Listening on: 0.0.0.0:${PORT} (accessible from network)

Features:
  - Upload Excel test cases
  - Automatic conversion to Gherkin
  - Direct commit to GitHub
  - No local Playwright setup needed for testers

Next Steps:
  1. Get your IP: Run 'ipconfig' and look for IPv4 Address
  2. Share with testers: http://YOUR_IP:${PORT}
  3. Check firewall: Ensure port ${PORT} is allowed
  `);
});
