
import * as dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const jiraUrl = process.env.JIRA_HOST || '';
const jiraUser = process.env.JIRA_USER || '';
const jiraApiToken = process.env.JIRA_API_TOKEN || '';
const projectKey = process.env.XRAY_PROJECT_KEY || 'XSP';

export async function createTestExecution(summary?: string, description?: string, testPlanKey?: string): Promise<string> {
  if (!jiraUrl || !jiraUser || !jiraApiToken) {
    throw new Error('JIRA_HOST, JIRA_USER, and JIRA_API_TOKEN must be set in .env');
  }
  // Get ENV and BROWSER from .env
  const env = process.env.ENV || process.env.SF_EXECUTION_ENV || 'UnknownEnv';
  const browser = process.env.BROWSER || 'UnknownBrowser';
  const triggeredBy = process.env.TRIGGERED_BY || process.env.USER || process.env.USERNAME || 'Unknown';
  const reportUrl = process.env.PLAYWRIGHT_REPORT_URL || 'N/A';
  const executionTime = new Date().toISOString();
  const customSummary = summary || `Playwright Automation | ${env} | ${browser}`;
  const customDescription = description ||
    `Description-\nAutomation Test Execution Details\n\nFramework      : Playwright\nEnvironment    : ${env}\nBrowser        : ${browser}\nTriggered By   : ${triggeredBy}\nExecution Time : ${executionTime}\n\nReports\nPlaywright Report : ${reportUrl}\n\nNotes\nAutomated execution triggered from Playwright framework.`;
  const payload: any = {
    fields: {
      project: { key: projectKey },
      summary: customSummary,
      description: customDescription,
      issuetype: { name: 'Test Execution' },
    },
  };
  // Xray uses a custom field for Test Plan - typically customfield_10xxx
  // You may need to find the exact field ID from your Jira instance
  if (testPlanKey) {
    // Try common Xray Test Plan field names
    payload.fields['customfield_10014'] = [testPlanKey]; // Common Xray field for Test Plan
  }
  const auth = Buffer.from(`${jiraUser}:${jiraApiToken}`).toString('base64');
  const res = await axios.post(
    `${jiraUrl}/rest/api/2/issue`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
    }
  );
  return res.data.key;
}
