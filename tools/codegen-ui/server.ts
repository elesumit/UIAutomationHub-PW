import express from 'express';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const app = express();
const PORT = 3000;

let codegenProcess: ChildProcess | null = null;
let recordedCode: string = '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Start Playwright Codegen
 */
app.post('/api/start-recording', (req, res) => {
  const { url, testCaseId } = req.body;
  
  if (codegenProcess) {
    return res.status(400).json({ error: 'Recording already in progress' });
  }
  
  console.log(`🎬 Starting Codegen for ${testCaseId} at ${url}`);
  
  // Start Playwright Codegen
  codegenProcess = spawn('npx', [
    'playwright',
    'codegen',
    url || 'https://qa.example.com',
    '--target=javascript',
    '--save-storage=auth.json'
  ], {
    cwd: path.resolve(__dirname, '../..'),
    shell: true
  });
  
  let output = '';
  
  codegenProcess.stdout?.on('data', (data) => {
    output += data.toString();
  });
  
  codegenProcess.stderr?.on('data', (data) => {
    console.log('Codegen output:', data.toString());
  });
  
  codegenProcess.on('close', (code) => {
    console.log(`✅ Codegen stopped with code ${code}`);
    recordedCode = output;
    codegenProcess = null;
  });
  
  res.json({ 
    success: true, 
    message: 'Recording started. Interact with the browser, then click Stop Recording.',
    testCaseId 
  });
});

/**
 * Stop Playwright Codegen
 */
app.post('/api/stop-recording', (req, res) => {
  if (!codegenProcess) {
    return res.status(400).json({ error: 'No recording in progress' });
  }
  
  console.log('⏹️ Stopping Codegen...');
  codegenProcess.kill();
  codegenProcess = null;
  
  res.json({ 
    success: true, 
    message: 'Recording stopped',
    code: recordedCode 
  });
});

/**
 * Convert Playwright code to Gherkin
 */
app.post('/api/convert-to-gherkin', (req, res) => {
  const { code, testCaseId, scenarioName, tags } = req.body;
  
  console.log(`🔄 Converting to Gherkin for ${testCaseId}`);
  
  try {
    const gherkinSteps = convertPlaywrightToGherkin(code);
    const featureFile = generateFeatureFile(testCaseId, scenarioName, tags, gherkinSteps);
    
    res.json({ 
      success: true, 
      gherkin: featureFile,
      steps: gherkinSteps
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Save feature file
 */
app.post('/api/save-feature', (req, res) => {
  const { testCaseId, content } = req.body;
  
  const fileName = `${testCaseId.replace('-', '_')}.feature`;
  const filePath = path.join(__dirname, '../../features', fileName);
  
  fs.writeFileSync(filePath, content, 'utf-8');
  
  console.log(`💾 Saved feature file: ${filePath}`);
  
  res.json({ 
    success: true, 
    message: `Feature file saved: ${fileName}`,
    path: filePath
  });
});

/**
 * Convert Playwright code to Gherkin steps
 */
function convertPlaywrightToGherkin(code: string): string[] {
  const steps: string[] = [];
  const lines = code.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Click actions
    if (trimmed.includes('.click()')) {
      const match = trimmed.match(/getByRole\(['"](\w+)['"],\s*{\s*name:\s*['"]([^'"]+)['"]/);
      if (match) {
        steps.push(`When I click on "${match[2]}"`);
      } else {
        const textMatch = trimmed.match(/getByText\(['"]([^'"]+)['"]/);
        if (textMatch) {
          steps.push(`When I click on "${textMatch[1]}"`);
        }
      }
    }
    
    // Fill actions
    else if (trimmed.includes('.fill(')) {
      const match = trimmed.match(/getByLabel\(['"]([^'"]+)['"]\)\.fill\(['"]([^'"]+)['"]/);
      if (match) {
        steps.push(`When I enter "${match[2]}" in "${match[1]}"`);
      } else {
        const placeholderMatch = trimmed.match(/getByPlaceholder\(['"]([^'"]+)['"]\)\.fill\(['"]([^'"]+)['"]/);
        if (placeholderMatch) {
          steps.push(`When I enter "${placeholderMatch[2]}" in "${placeholderMatch[1]}"`);
        }
      }
    }
    
    // Select actions
    else if (trimmed.includes('.selectOption(')) {
      const match = trimmed.match(/getByLabel\(['"]([^'"]+)['"]\)\.selectOption\(['"]([^'"]+)['"]/);
      if (match) {
        steps.push(`When I select "${match[2]}" from "${match[1]}"`);
      }
    }
    
    // Navigate
    else if (trimmed.includes('page.goto(')) {
      const match = trimmed.match(/goto\(['"]([^'"]+)['"]/);
      if (match) {
        steps.push(`Given I navigate to CE Portal ""`);
      }
    }
    
    // Wait
    else if (trimmed.includes('waitForTimeout(')) {
      const match = trimmed.match(/waitForTimeout\((\d+)\)/);
      if (match) {
        const seconds = Math.round(parseInt(match[1]) / 1000);
        steps.push(`When I wait for ${seconds} seconds`);
      }
    }
  }
  
  return steps;
}

/**
 * Generate feature file content
 */
function generateFeatureFile(
  testCaseId: string, 
  scenarioName: string, 
  tags: string[], 
  steps: string[]
): string {
  const lines: string[] = [];
  
  lines.push(`@${testCaseId}`);
  lines.push(`Feature: ${scenarioName}`);
  lines.push('');
  
  const allTags = [`@${testCaseId}`, ...tags];
  lines.push(`  ${allTags.join(' ')}`);
  lines.push(`  Scenario: ${scenarioName}`);
  
  steps.forEach(step => {
    lines.push(`    ${step}`);
  });
  
  lines.push('');
  return lines.join('\n');
}

app.listen(PORT, () => {
  console.log(`
🚀 Codegen UI Server Running!

📝 Open in browser: http://localhost:${PORT}

Features:
  - Record tests visually using Playwright Codegen
  - Automatically convert to Gherkin format
  - Link to Jira test cases
  - Save directly to features folder
  `);
});
