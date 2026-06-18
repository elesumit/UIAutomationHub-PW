import { Before, After, BeforeAll, AfterAll, AfterStep, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { BrowserManager } from '../utils/browser-manager';
import { ReportLogger } from '../utils/report-logger';
import * as fs from 'fs';
import * as path from 'path';
import { sendSlack } from "../utils/slack";
import { sendTestStartNotification, sendTestCompletionNotification } from '../utils/emailNotifier';

// Set default timeout to 60 seconds for all steps
setDefaultTimeout(60000);

let start = 0;
let total = 0;
let failed = 0;


//Slack notification before all tests
BeforeAll(async function () {
  
  console.log('Global setup');
  start = Date.now();
  total = 0;
  failed = 0;

  // Only send Slack notification if NOT running in GitHub Actions
  // GitHub Actions will send its own notification with Jira link
  if (!process.env.GITHUB_ACTIONS) {
    const profile = process.env.TEST_PROFILE || 'smoke';
    const triggeredBy = process.env.GITHUB_ACTOR || 'local-user';
    const branch = process.env.GITHUB_REF_NAME || 'local';
    const workflowRun = process.env.GITHUB_RUN_NUMBER || 'local';
    
    const { sendSlackStartNotification } = await import('../utils/slack');
    await sendSlackStartNotification(profile, triggeredBy, branch, workflowRun);
  }
});

BeforeAll(async function () {
  const browserType = process.env.BROWSER || 'chromium';
  await BrowserManager.launchBrowser(browserType);
  
  const dirs = [
    'test-results/screenshots',
    'test-results/videos',
    'storage'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
});

Before(async function (scenario) {
  const storageStatePath = 'storage/storageState.json';
  const useStorageState = fs.existsSync(storageStatePath);
  
  // Grant browser permissions to avoid permission popups
  const permissions = ['microphone', 'camera', 'notifications', 'geolocation'];
  
  await BrowserManager.createContext(
    useStorageState ? storageStatePath : undefined,
    permissions
  );
  const page = await BrowserManager.createPage();
  
  this.page = page;
  this.context = BrowserManager.getContext();
  
  ReportLogger.clearAnnotations();
  ReportLogger.logInfo(`Starting scenario: ${scenario.pickle.name}`);
});

// Call at the start of the test suite
BeforeAll(async function () {
  await sendTestStartNotification();
});

After(async function (scenario) {
  try {
    // Only take screenshot on failure
    if (scenario.result?.status === Status.FAILED) {
      try {
        const screenshot = await this.page.screenshot({ fullPage: true });
        const screenshotPath = `test-results/screenshots/${scenario.pickle.name.replace(/\s+/g, '_')}_FAILED_${Date.now()}.png`;
        
        // Save screenshot to file
        fs.writeFileSync(screenshotPath, screenshot);
        
        // Embed screenshot in Cucumber HTML report for failed scenarios
        this.attach(screenshot, 'image/png');
        ReportLogger.logInfo(`Screenshot embedded in report for failed scenario: ${scenario.pickle.name}`);
      } catch (screenshotError: any) {
        console.error('⚠️ Failed to capture failure screenshot:', screenshotError?.message);
      }
      
      ReportLogger.logError(`Scenario failed: ${scenario.pickle.name}`);
    }
    
    const annotations = ReportLogger.getAnnotations();
    if (annotations.length > 0) {
      console.log('\n--- Smart Report Annotations ---');
      annotations.forEach(annotation => {
        console.log(`[${annotation.type}] ${annotation.description}`);
      });
      console.log('--------------------------------\n');
    }
  } catch (error: any) {
    console.error('⚠️ Error in After hook:', error?.message);
  } finally {
    // Always cleanup, even if screenshot fails
    await BrowserManager.closePage();
    await BrowserManager.closeContext();
  }
});

After(({ result }) => {
  total++;
  if (result?.status === "FAILED") failed++;
});

// Capture screenshot for every Then step and for any failed step
AfterStep(async function ({ pickleStep, result }) {
  try {
    if (!this.page) return;

    const stepText = pickleStep?.text || '';
    const isThenStep = stepText.startsWith('I see ') || stepText.startsWith('I should see') || stepText.startsWith('I should not see');
    const isFailed = result?.status === Status.FAILED;

    if (isThenStep || isFailed) {
      const screenshot = await this.page.screenshot({ fullPage: true });
      const label = isFailed ? 'FAILED' : 'THEN';
      const safeName = stepText.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 80);
      const screenshotPath = `test-results/screenshots/${label}_${safeName}_${Date.now()}.png`;

      fs.writeFileSync(screenshotPath, screenshot);
      this.attach(screenshot, 'image/png');
      ReportLogger.logInfo(`📸 Screenshot [${label}] embedded for step: ${stepText}`);
    }
  } catch (error: any) {
    // Don't fail the step if screenshot capture fails
    console.error('⚠️ AfterStep screenshot failed:', error?.message);
  }
});

// Slack notification after all tests
AfterAll(async () => {
  const seconds = Math.round((Date.now() - start) / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const duration = `${minutes}m ${secs}s`;
  const passed = total - failed;

  // Only send Slack notification if NOT running in GitHub Actions
  // GitHub Actions will send its own notification with Jira link after Xray upload
  if (!process.env.GITHUB_ACTIONS) {
    const reportUrl = process.env.GITHUB_RUN_ID 
      ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : undefined;
    
    const jiraUrl = process.env.JIRA_TEST_EXECUTION_KEY
      ? `https://veradigm.atlassian.net/browse/${process.env.JIRA_TEST_EXECUTION_KEY}`
      : undefined;

    const { sendSlackCompletionNotification } = await import('../utils/slack');
    await sendSlackCompletionNotification(total, passed, failed, duration, reportUrl, jiraUrl);
  }
});

AfterAll(async function () {
  await BrowserManager.cleanup();
});

// Call at the end of the test suite
AfterAll(async function () {
  // If you have feature results to pass, collect and pass them here
  await sendTestCompletionNotification([]);
});