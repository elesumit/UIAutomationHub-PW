import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const xrayUrl = 'https://xray.cloud.getxray.app/api/v2';

async function getAuthToken(): Promise<string> {
  const clientId = process.env.XRAY_CLIENT_ID!;
  const clientSecret = process.env.XRAY_CLIENT_SECRET!;
  const res = await axios.post(`${xrayUrl}/authenticate`, {
    client_id: clientId,
    client_secret: clientSecret
  });
  return res.data;
}

async function getTestsFromExecution(executionKey: string): Promise<string[]> {
  const token = await getAuthToken();
  
  try {
    // Get Test Execution details using JQL query with the key
    const response = await axios.post(
      `${xrayUrl}/graphql`,
      {
        query: `{
          getTestExecutions(jql: "key = ${executionKey}", limit: 1) {
            results {
              issueId
              jira(fields: ["key"])
              tests(limit: 100) {
                results {
                  issueId
                  jira(fields: ["key"])
                }
              }
            }
          }
        }`
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const testExecution = response.data?.data?.getTestExecutions?.results?.[0];
    if (!testExecution) {
      console.error(`❌ Test Execution ${executionKey} not found`);
      return [];
    }
    
    const tests = testExecution.tests?.results || [];
    const testKeys = tests.map((test: any) => test.jira.key);
    
    console.log(`📋 Found ${testKeys.length} tests in Test Execution ${executionKey}:`);
    testKeys.forEach((key: string) => console.log(`  - ${key}`));
    
    return testKeys;
  } catch (error: any) {
    console.error('❌ Error fetching tests from Xray:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  const executionKey = process.argv[2];
  
  if (!executionKey) {
    console.error('❌ Usage: ts-node scripts/get-xray-tests.ts <TEST_EXECUTION_KEY>');
    process.exit(1);
  }
  
  try {
    const testKeys = await getTestsFromExecution(executionKey);
    
    // Output as comma-separated list for Cucumber tags
    const tagExpression = testKeys.map(key => `@${key}`).join(' or ');
    console.log('\n🏷️  Cucumber tag expression:');
    console.log(tagExpression);
    console.log('\n⚠️  WARNING: If scenarios don\'t have individual tags, entire feature files will run!');
    
    // Write to file for GitHub Actions to read
    const fs = require('fs');
    fs.writeFileSync('.xray-tests.txt', tagExpression);
    console.log('\n✅ Test tags written to .xray-tests.txt');
    
  } catch (error) {
    console.error('❌ Failed to get tests from Xray');
    process.exit(1);
  }
}

main();
