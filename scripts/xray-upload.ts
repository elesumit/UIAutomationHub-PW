import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createTestExecution } from './xray-create-execution';

dotenv.config();

const xrayUrl = 'https://xray.cloud.getxray.app/api/v2';
const resultsPath = path.resolve(__dirname, '../test-results/junit-report.xml');

function extractFeaturesFromJUnit(xmlContent: string): string[] {
  const features: string[] = [];
  const featureRegex = /<testsuite[^>]*name="([^"]+)"/g;
  let match;
  
  while ((match = featureRegex.exec(xmlContent)) !== null) {
    const featureName = match[1];
    // Clean up the feature name (remove file path if present)
    const cleanName = featureName.split('/').pop()?.replace('.feature', '') || featureName;
    if (!features.includes(cleanName)) {
      features.push(cleanName);
    }
  }
  
  return features;
}

function getFeatureDescription(featureName: string): string {
  const featuresDir = path.resolve(__dirname, '../features');
  const featureFiles = fs.readdirSync(featuresDir).filter(f => f.endsWith('.feature'));
  
  for (const file of featureFiles) {
    const filePath = path.join(featuresDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract Feature line
    const featureMatch = content.match(/Feature:\s*(.+)/);
    if (featureMatch) {
      return featureMatch[1].trim();
    }
  }
  
  return 'Case Creation via CE Portal, Salesforce Case Verification, Case Status Update to Resolution Provided';
}

async function getAuthToken(): Promise<string> {
  const clientId = process.env.XRAY_CLIENT_ID!;
  const clientSecret = process.env.XRAY_CLIENT_SECRET!;
  const res = await axios.post(`${xrayUrl}/authenticate`, {
    client_id: clientId,
    client_secret: clientSecret,
  });
  return typeof res.data === 'string' ? res.data.replace(/^"|"$/g, '') : res.data;
}

async function uploadResults(token: string, testPlanKey?: string, projectKey?: string, testExecutionKey?: string) {
  const xml = fs.readFileSync(resultsPath, 'utf-8');
  
  // Build URL with parameters
  let url = `${xrayUrl}/import/execution/junit`;
  const params = [];
  
  // If Test Execution key is provided, update that specific execution
  if (testExecutionKey) {
    params.push(`testExecKey=${testExecutionKey}`);
  } else if (testPlanKey) {
    // Otherwise, link to Test Plan (creates new execution)
    params.push(`testPlanKey=${testPlanKey}`);
  }
  
  if (projectKey) {
    params.push(`projectKey=${projectKey}`);
  }
  
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  
  const res = await axios.post(url, xml, {
    headers: {
      'Content-Type': 'application/xml',
      Authorization: `Bearer ${token}`,
    },
    maxBodyLength: Infinity,
  });
  return res.data;
}

async function updateTestExecution(executionKey: string) {
  const jiraUrl = 'https://veradigm.atlassian.net/rest/api/2/issue';
  
  // Get Jira credentials from environment
  const jiraUser = process.env.JIRA_USER;
  const jiraApiToken = process.env.JIRA_API_TOKEN;
  
  if (!jiraUser || !jiraApiToken) {
    console.warn('⚠️ JIRA_USER or JIRA_API_TOKEN not set in .env - skipping summary/description update');
    return;
  }
  
  // Get current date/time
  const now = new Date();
  const dateTime = now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  // Determine execution type based on environment
  const isCI = process.env.GITHUB_ACTIONS === 'true';
  const executionType = isCI ? 'CI/CD Pipeline' : 'Manual Local Run';
  
  // Get environment from .env file (defaults to QA if not set)
  const environment = process.env.CE_Portal_Execution_Env || 'QA';
  
  // Read feature description from JUnit report
  const xml = fs.readFileSync(resultsPath, 'utf-8');
  const features = extractFeaturesFromJUnit(xml);
  const featureDescription = features.length > 0 ? getFeatureDescription(features[0]) : 'Case Creation via CE Portal, Salesforce Case Verification, Case Status Update to Resolution Provided';
  
  const summary = 'Automation Test Execution Results';
  
  let description = `*Execution Type:* Automation Regression Testing
*Environment:* ${environment}
*Date/Time:* ${dateTime}
*Triggered By:* ${executionType}

*Features Tested:*
• ${featureDescription}`;

  // Add GitHub Actions artifacts links if running in CI
  if (isCI) {
    const githubRepo = process.env.GITHUB_REPOSITORY || 'veradigm-project-atlas/Testing-Automation-PlayWright';
    const githubRunId = process.env.GITHUB_RUN_ID;
    const githubRunNumber = process.env.GITHUB_RUN_NUMBER;
    
    if (githubRunId) {
      const artifactsUrl = `https://github.com/${githubRepo}/actions/runs/${githubRunId}`;
      description += `\n\n*Test Artifacts:*\n• [View GitHub Actions Run #${githubRunNumber}|${artifactsUrl}]\n• Screenshots and videos available in artifacts`;
    }
  }
  
  // Create Basic Auth token
  const auth = Buffer.from(`${jiraUser}:${jiraApiToken}`).toString('base64');
  
  try {
    await axios.put(
      `${jiraUrl}/${executionKey}`,
      {
        fields: {
          summary: summary,
          description: description
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
      }
    );
    console.log('✅ Test Execution summary and description updated');
  } catch (err: any) {
    console.warn('⚠️ Failed to update Test Execution details:', err.response?.data || err.message);
  }
}

(async () => {
  try {
    console.log('🚀 Starting Xray upload...');
    
    // Get Test Execution Key (for updating existing execution) or Test Plan Key (for creating new)
    const testExecutionKey = process.env.XRAY_TEST_EXECUTION_KEY;
    const testPlanKey = process.env.XRAY_TEST_PLAN_KEY || process.argv[2];
    // Get Project Key from environment variable (defaults to BTC)
    const projectKey = process.env.XRAY_PROJECT_KEY || 'BTC';
    
    if (testExecutionKey) {
      console.log(`📋 Updating Test Execution: ${testExecutionKey}`);
    } else if (testPlanKey) {
      console.log(`📋 Creating new Test Execution for Test Plan: ${testPlanKey}`);
    } else {
      console.log('⚠️ No Test Plan or Test Execution Key provided. Xray will create a standalone Test Execution.');
      console.log('💡 Tip: Set XRAY_TEST_PLAN_KEY or XRAY_TEST_EXECUTION_KEY in .env');
    }
    
    console.log(`📁 Project Key: ${projectKey}`);
    
    // Get auth token
    const token = await getAuthToken();
    console.log('✅ Authenticated with Xray API');
    
    // Upload results
    const result = await uploadResults(token, testPlanKey, projectKey, testExecutionKey);
    console.log('✅ Test results uploaded successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
    if (result.key) {
      console.log(`\n🔗 Test Execution: https://veradigm.atlassian.net/browse/${result.key}`);
      
      // Update Test Execution with summary and description
      console.log(`📝 Updating Test Execution ${result.key} with description and artifacts link...`);
      await updateTestExecution(result.key);
      console.log(`✅ Test Execution ${result.key} description update completed`);
      
      // Send Slack notification with Jira link and GitHub artifacts
      if (process.env.ENABLE_SLACK_NOTIFICATIONS === 'true' && process.env.SLACK_WEBHOOK_URL) {
        try {
          const { sendSlack } = await import('../utils/slack');
          const jiraUrl = `https://veradigm.atlassian.net/browse/${result.key}`;
          
          // Parse JUnit XML to get test statistics
          const junitContent = fs.readFileSync(resultsPath, 'utf-8');
          const totalMatch = junitContent.match(/tests="(\d+)"/);
          const failuresMatch = junitContent.match(/failures="(\d+)"/);
          const timeMatch = junitContent.match(/time="([\d.]+)"/);
          
          const total = totalMatch ? parseInt(totalMatch[1]) : 0;
          const failed = failuresMatch ? parseInt(failuresMatch[1]) : 0;
          const passed = total - failed;
          const duration = timeMatch ? parseFloat(timeMatch[1]) : 0;
          const durationMinutes = Math.floor(duration / 60);
          const durationSeconds = Math.floor(duration % 60);
          
          const status = failed === 0 ? '✅ Test Execution Completed Successfully' : '❌ Test Execution Completed with Failures';
          const passIcon = '✅';
          const failIcon = '❌';
          
          let message = `${status}\n\n`;
          message += `*Total:* ${total} | *Passed:* ${passed} ${passIcon} | *Failed:* ${failed} ${failIcon}\n`;
          message += `*Duration:* ${durationMinutes}m ${durationSeconds}s\n`;
          message += `*Environment:* QA\n\n`;
          message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          message += `✅ *Xray Upload Complete*\n`;
          message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
          message += `🔗 *Test Execution:* <${jiraUrl}|${result.key}>`;
          
          // Add GitHub Actions link if running in GitHub Actions
          if (process.env.GITHUB_ACTIONS === 'true') {
            const githubRepo = process.env.GITHUB_REPOSITORY || 'veradigm-project-atlas/Testing-Automation-PlayWright';
            const githubRunId = process.env.GITHUB_RUN_ID;
            const githubRunNumber = process.env.GITHUB_RUN_NUMBER;
            
            if (githubRunId) {
              const githubUrl = `https://github.com/${githubRepo}/actions/runs/${githubRunId}`;
              message += `\n🔧 *GitHub Actions:* <${githubUrl}|Run #${githubRunNumber || githubRunId}>`;
            }
          }
          
          await sendSlack(message);
          console.log('✅ Slack notification sent with test results and links');
        } catch (slackErr: any) {
          console.warn('⚠️ Failed to send Slack notification:', slackErr.message);
        }
      }
    }
  } catch (err: any) {
    console.error('❌ Xray upload failed:', err.response?.data || err.message);
    process.exit(1);
  }
})();