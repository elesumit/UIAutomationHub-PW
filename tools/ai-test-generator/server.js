const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.AI_GENERATOR_PORT || 3002;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const GITHUB_TOKEN = process.env.GITHUB_COPILOT_TOKEN || process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'veradigm-project-atlas';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Testing-Automation-PlayWright';

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    copilotConfigured: !!GITHUB_TOKEN,
    repo: `${GITHUB_OWNER}/${GITHUB_REPO}`
  });
});

/**
 * Get existing test examples for context
 */
function getTestExamples() {
  const featuresDir = path.join(__dirname, '../../features');
  const examples = [];
  
  try {
    const files = fs.readdirSync(featuresDir).filter(f => f.endsWith('.feature'));
    
    // Read first 2 feature files as examples
    for (let i = 0; i < Math.min(2, files.length); i++) {
      const content = fs.readFileSync(path.join(featuresDir, files[i]), 'utf-8');
      examples.push(content.substring(0, 1000)); // First 1000 chars
    }
  } catch (err) {
    console.warn('Could not read feature files for examples:', err.message);
  }
  
  return examples;
}

/**
 * Build system prompt with context
 */
function buildSystemPrompt() {
  const examples = getTestExamples();
  
  return `You are an expert test automation engineer for the CE Portal and Salesforce applications.

**Application Context:**
- CE Portal: Customer Experience Portal where support agents create and manage cases
- Salesforce: CRM system for case verification and updates (backend system)
- Support agents work in CE Portal, NOT in Salesforce
- Common fields: Product, Account, Impact, Subject, Description, Contact Method, Case Collaborators
- Mandatory fields: Product, Account, Impact, Subject

**Patient Safety Checkbox Behavior:**
- Checkbox: "Is this a Patient Safety case?"
- When checked, 5 additional checkboxes appear with associated description fields:
  1. "Did Actual Patient Harm/Injury Occur?" → "Actual Patient Harm/Injury Details"
  2. "Is there's Increase Risk for Potential Patient Harm/Injury?" → "Increase Risk for Potential Patient Harm/Injury Details"
  3. "Are there Potential Data Issues with Clinical Impact?" → "Potential Data Issues with Clinical Impact Details"
  4. "Is there a Potential Impact on Alarms or Warnings?" → "Potential Impact on Alarms or Warnings Details"
  5. "Could Clinical Communication Potentially Be Affected?" → "Potential Effect on Clinical Communication Details"
- If ANY of the 5 checkboxes is selected, its associated description field becomes MANDATORY
- Red error banner displays: "Missing Required Fields: The following field is required: [field name]"
- Form cannot be submitted until all mandatory fields are filled

**Available Step Definitions:**
- When I click on "<element>"
- When I check the checkbox "<checkbox_label>"
- When I uncheck the checkbox "<checkbox_label>"
- When I enter "<text>" in "<field>"
- When I select "<option>" from "<dropdown>"
- When I navigate to <application> "<url>"
- When I wait for <seconds> seconds
- When I upload "<filename>" to "<field>"
- When I capture text from "<element>" and store as "<variable>"
- When I log captured "<variable>"
- Then I see "<field>" as "<value>"
- Then I see error message "<message>"
- Then I should see the field "<field_name>"
- Then I should not see the field "<field_name>"
- Then the field "<field_name>" should be mandatory
- Then I should see error banner with text "<error_text>"

**Common Elements:**
- Buttons: "Log in", "Continue", "Submit", "Save", "Done", "Create a Case"
- Fields: "CE_UserName", "CE_Password", "Subject", "Description", "Case Collaborators"
- Dropdowns: "Select a Product", "Select an Account", "Impact", "How would you like to be contacted"
- Salesforce: "App Launcher", "Service Console", "Search apps and items..."

**Mandatory Case Creation Fields (MUST always include after Create a Case):**
- When I select "<product>" from "Select a Product"
- When I select "<account>" from "Select an Account"
- When I select "<impact>" from "Impact"
- When I enter "<text>" in "Subject"
- When I enter "<text>" in "Description"
- When I select "Customer Experience Portal" from "How would you like to be contacted"

**CRITICAL: CE Portal Login and Case Creation Pattern (MUST USE EXACTLY):**
Always use empty strings for credentials (values come from environment variables):

Background: Login to CE Portal
  Given I navigate to CE Portal ""
  When I click on "Log in"
  When I wait for 3 seconds
  When I enter "" in "CE_UserName"
  When I click on "Continue"
  When I enter "" in "CE_Password"
  When I click on "Continue"
  When I wait for 3 seconds
  When I click on "Support"
  When I wait for 3 seconds
  When I enter "Portal" in "Search for help"
  When I wait for 3 seconds
  When I click on "Create a Case"

DO NOT use hardcoded credentials like "valid_user@example.com" or "password123".
The empty strings "" will be replaced by environment variables at runtime.
ALWAYS include the Support → Search → Create a Case flow before filling case details.

**Example Test Structure:**
${examples.length > 0 ? examples[0] : 'No examples available'}

**Tagging Requirements (CRITICAL):**
1. Feature-level tags: Add ONLY descriptive test type tags on Feature line
   - @ErrorValidation for error/validation tests
   - @HappyPath for successful flow tests
   - @E2E for end-to-end tests
   - @CaseCreation for case creation tests
   - DO NOT add @JIRA_PLACEHOLDER or any Jira test keys on the Feature line
   - Only descriptive tags that categorize the test type

2. Scenario-level tags: Add @JIRA_PLACEHOLDER_N on EACH Scenario line
   - Use @JIRA_PLACEHOLDER_1 for first scenario
   - Use @JIRA_PLACEHOLDER_2 for second scenario
   - Use @JIRA_PLACEHOLDER_3 for third scenario, etc.
   - These will be replaced with actual Jira keys (e.g., @BTC-101, @BTC-102)
   - Each scenario MUST have its own unique placeholder tag

**Tag Format Example:**
@ErrorValidation @MandatoryFields
Feature: Display error banner for missing fields

  Background: Login to CE Portal
    Given I navigate to CE Portal ""
    ...

  @JIRA_PLACEHOLDER_1
  Scenario: Submit case without selecting a product
    When I select "Test Account" from "Select an Account"
    ...

  @JIRA_PLACEHOLDER_2
  Scenario: Submit case without selecting an account
    When I select "Test Product" from "Select a Product"
    ...

**Patient Safety Test Pattern - COMPREHENSIVE COVERAGE REQUIRED:**
When testing Patient Safety checkbox functionality, generate scenarios for:

1. Main checkbox behavior (1 scenario):
   - Check "Is this a Patient Safety case?" → Verify 5 sub-checkboxes appear

2. EACH individual sub-checkbox validation (5 scenarios - ONE PER CHECKBOX):
   - Checkbox 1: "Did Actual Patient Harm/Injury Occur?" → Validate "Actual Patient Harm/Injury Details" is mandatory
   - Checkbox 2: "Is there's Increase Risk for Potential Patient Harm/Injury?" → Validate "Increase Risk for Potential Patient Harm/Injury Details" is mandatory
   - Checkbox 3: "Are there Potential Data Issues with Clinical Impact?" → Validate "Potential Data Issues with Clinical Impact Details" is mandatory
   - Checkbox 4: "Is there a Potential Impact on Alarms or Warnings?" → Validate "Potential Impact on Alarms or Warnings Details" is mandatory
   - Checkbox 5: "Could Clinical Communication Potentially Be Affected?" → Validate "Potential Effect on Clinical Communication Details" is mandatory

3. Multiple checkbox combinations (3-5 scenarios):
   - 2 checkboxes selected → Both descriptions mandatory
   - 3 checkboxes selected → All 3 descriptions mandatory
   - All 5 checkboxes selected → All 5 descriptions mandatory

4. Happy path scenarios (2 scenarios):
   - Select checkbox + fill description → Submit successfully
   - Uncheck checkbox → Description no longer mandatory

TOTAL: Generate 10-15 scenarios to cover all combinations comprehensively.

**Your Task:**
Generate detailed Gherkin test scenarios based on user descriptions.
- Use BDD Gherkin syntax with proper Feature/Background/Scenario structure
- Add ONLY descriptive test type tags on Feature line (@ErrorValidation, @HappyPath, @E2E, @CaseCreation, @PatientSafety, etc.)
- DO NOT add @JIRA_PLACEHOLDER or any Jira test keys on the Feature line
- Add @JIRA_PLACEHOLDER_N tag on EACH Scenario line (N = 1, 2, 3, etc.) for selective execution
- DO NOT add tags on Background section
- Use realistic test data matching the application
- Follow existing step definition patterns from examples
- Generate 10-15 distinct scenarios for Patient Safety features (covering all checkbox combinations)
- Generate 3-5 scenarios for other features (covering different edge cases)
- Include Background section ONLY if login is needed (not as a separate scenario)
- Background MUST include: Login → Support → Search → Create a Case flow
- Feature summary should be clear and descriptive (will be used as Jira Test Case summary)
- Background should be part of the feature, not a separate test
- For Patient Safety scenarios: Test EACH of the 5 checkboxes individually, then combinations
- Remember: Support agents work in CE Portal, NOT Salesforce (unless verifying backend sync)
- Each scenario must have unique @JIRA_PLACEHOLDER_N tag (N = 1, 2, 3... up to 15 if needed)`;
}

/**
 * Generate test cases using GitHub Copilot API
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { description, application, testType } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    if (!GITHUB_TOKEN) {
      return res.status(500).json({ 
        error: 'GitHub Copilot token not configured. Please set GITHUB_COPILOT_TOKEN in .env file' 
      });
    }
    
    console.log(`🤖 Generating test cases for: "${description}"`);
    console.log(`   Application: ${application || 'Both'}`);
    console.log(`   Test Type: ${testType || 'General'}`);
    
    const systemPrompt = buildSystemPrompt();
    
    // Determine scenario count based on description content
    const isPatientSafety = description.toLowerCase().includes('patient safety') || 
                            description.toLowerCase().includes('checkbox') ||
                            description.toLowerCase().includes('is this a patient');
    const scenarioCount = isPatientSafety ? '10-15' : '5-8';
    
    const userPrompt = `Generate Gherkin test scenarios for:
"${description}"

Application: ${application || 'CE Portal and Salesforce'}
Test Type: ${testType || 'General'}

Requirements:
- IMPORTANT: You MUST generate at least ${scenarioCount} distinct test scenarios. Do NOT stop at 5.
- Use @JIRA_PLACEHOLDER_N tags on each scenario (N = 1, 2, 3... up to ${scenarioCount})
- Add appropriate descriptive @tags on Feature line only
- Use realistic test data
- Cover ALL edge cases, validation rules, and combinations thoroughly
- Follow the step definition patterns shown in examples
- Background MUST include: Login → Support → Search → Create a Case → Fill mandatory fields
${isPatientSafety ? `- Test EACH of the 5 checkboxes individually (5 separate scenarios)
- Test combinations of 2, 3, and all 5 checkboxes
- Test happy path with all fields filled
- Test unchecking behavior (sub-checkbox and main checkbox)
- Test partial fill scenarios` : ''}

Output only the Feature file content, no explanations.`;
    
    // Use GitHub Models API (free with GitHub account)
    const response = await axios.post(
      'https://models.inference.ai.azure.com/chat/completions',
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'gpt-4o',
        temperature: 0.2,
        max_tokens: 8000,
        top_p: 1.0
      },
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'extra-parameters': 'pass-through'
        },
        timeout: 120000
      }
    );
    
    let generatedContent = response.data.choices[0].message.content;
    
    // Clean up markdown code fences if present
    generatedContent = generatedContent
      .replace(/```gherkin\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    console.log('✅ Test cases generated successfully');
    
    res.json({
      success: true,
      content: generatedContent,
      metadata: {
        model: 'gpt-4o',
        application: application || 'Both',
        testType: testType || 'General',
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error generating test cases:', error.response?.data || error.message);
    
    res.status(500).json({
      error: 'Failed to generate test cases',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * Save generated test to local features folder
 */
app.post('/api/save-to-local', async (req, res) => {
  try {
    const { content, filename } = req.body;
    
    if (!content || !filename) {
      return res.status(400).json({ error: 'Content and filename are required' });
    }
    
    const featuresDir = path.join(__dirname, '../../features');
    const filePath = path.join(featuresDir, filename);
    
    console.log(`💾 Saving to local features folder: ${filename}`);
    
    // Write file to features folder
    fs.writeFileSync(filePath, content, 'utf-8');
    
    console.log('✅ File saved successfully');
    
    res.json({
      success: true,
      path: `features/${filename}`,
      message: 'Feature file saved to local framework'
    });
    
  } catch (error) {
    console.error('❌ Error saving to local:', error.message);
    res.status(500).json({
      error: 'Failed to save feature file',
      details: error.message
    });
  }
});

/**
 * Fetch existing test cases from Jira project BTC linked to test plan BTC-104
 */
app.get('/api/fetch-test-cases', async (req, res) => {
  try {
    const XRAY_CLIENT_ID = process.env.XRAY_CLIENT_ID;
    const XRAY_CLIENT_SECRET = process.env.XRAY_CLIENT_SECRET;
    
    if (!XRAY_CLIENT_ID || !XRAY_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Xray credentials not configured' });
    }
    
    console.log('🔐 Authenticating with Xray...');
    
    // Authenticate with Xray
    const authResponse = await fetch('https://xray.cloud.getxray.app/api/v2/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: XRAY_CLIENT_ID,
        client_secret: XRAY_CLIENT_SECRET
      })
    });
    
    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with Xray');
    }
    
    const xrayToken = await authResponse.text();
    const token = xrayToken.replace(/"/g, '');
    
    console.log('📋 Fetching test cases from Test Plan BTC-104...');
    
    // Fetch tests from Test Plan using GraphQL
    const graphqlQuery = {
      query: `{
        getTestPlans(jql: "key = BTC-104", limit: 1) {
          results {
            issueId
            jira(fields: ["key", "summary"])
            tests(limit: 100) {
              results {
                issueId
                jira(fields: ["key", "summary"])
              }
            }
          }
        }
      }`
    };
    
    const testsResponse = await fetch('https://xray.cloud.getxray.app/api/v2/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(graphqlQuery)
    });
    
    if (!testsResponse.ok) {
      const errorText = await testsResponse.text();
      throw new Error(`Failed to fetch test cases: ${errorText}`);
    }
    
    const result = await testsResponse.json();
    const testPlan = result.data?.getTestPlans?.results?.[0];
    
    if (!testPlan) {
      return res.json({ testCases: [] });
    }
    
    const testCases = testPlan.tests.results.map(test => ({
      key: test.jira.key,
      summary: test.jira.summary
    }));
    
    console.log(`✅ Found ${testCases.length} test cases in BTC-104`);
    
    res.json({ testCases });
    
  } catch (error) {
    console.error('❌ Error fetching test cases:', error.message);
    res.status(500).json({
      error: 'Failed to fetch test cases',
      details: error.message
    });
  }
});

/**
 * Get available issue types for BTC project
 */
app.get('/api/jira-issue-types', async (req, res) => {
  try {
    const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
    const JIRA_USER = process.env.JIRA_USER;
    
    if (!JIRA_API_TOKEN || !JIRA_USER) {
      return res.status(500).json({ error: 'Jira credentials not configured' });
    }
    
    const jiraAuth = Buffer.from(`${JIRA_USER}:${JIRA_API_TOKEN}`).toString('base64');
    
    const response = await axios.get(
      'https://veradigm.atlassian.net/rest/api/3/project/BTC',
      {
        headers: {
          'Authorization': `Basic ${jiraAuth}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const issueTypes = response.data.issueTypes;
    console.log('Available issue types:', JSON.stringify(issueTypes, null, 2));
    
    res.json({ issueTypes });
    
  } catch (error) {
    console.error('Error fetching issue types:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fetch Jira Story by ID for auto test generation
 */
app.get('/api/jira/story/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params;
    
    console.log(`📖 Fetching Jira story: ${storyId}`);
    
    // Jira API credentials
    const jiraBaseUrl = process.env.JIRA_BASE_URL || 'https://veradigm.atlassian.net';
    const jiraEmail = process.env.JIRA_USER || 'sumit.gupta2@veradigm.com';
    const jiraApiToken = process.env.JIRA_API_TOKEN;
    
    if (!jiraApiToken) {
      return res.status(500).json({ 
        error: 'Jira API token not configured',
        details: 'Please set JIRA_API_TOKEN in .env file'
      });
    }
    
    const jiraAuth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');
    
    // Fetch story from Jira
    const response = await axios.get(
      `${jiraBaseUrl}/rest/api/3/issue/${storyId}`,
      {
        headers: {
          'Authorization': `Basic ${jiraAuth}`,
          'Accept': 'application/json'
        }
      }
    );
    
    const issue = response.data;
    
    // Extract text from Atlassian Document Format (ADF)
    function extractTextFromADF(adf) {
      if (!adf) return '';
      let text = '';
      
      function traverse(node) {
        if (node.type === 'text') {
          text += node.text + ' ';
        } else if (node.type === 'hardBreak') {
          text += '\n';
        }
        if (node.content) {
          node.content.forEach(traverse);
        }
      }
      
      if (adf.content) {
        traverse(adf);
      }
      
      return text.trim();
    }
    
    // Parse acceptance criteria from description
    function parseAcceptanceCriteria(text) {
      if (!text) return ['Use the description to generate test scenarios'];
      
      const criteria = [];
      const lines = text.split('\n');
      let inACSection = false;
      let givenWhenThenScenarios = [];
      let currentScenario = { given: '', when: '', then: '' };
      
      // First, try to extract Given/When/Then format (common in Jira tables)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Detect Given/When/Then patterns
        if (/^Given/i.test(line)) {
          if (currentScenario.given || currentScenario.when || currentScenario.then) {
            if (currentScenario.given && currentScenario.when && currentScenario.then) {
              givenWhenThenScenarios.push(`Given ${currentScenario.given}, When ${currentScenario.when}, Then ${currentScenario.then}`);
            }
            currentScenario = { given: '', when: '', then: '' };
          }
          currentScenario.given = line.replace(/^Given\s*/i, '').trim();
        } else if (/^When/i.test(line)) {
          currentScenario.when = line.replace(/^When\s*/i, '').trim();
        } else if (/^Then/i.test(line)) {
          currentScenario.then = line.replace(/^Then\s*/i, '').trim();
        }
      }
      
      // Add last scenario if exists
      if (currentScenario.given && currentScenario.when && currentScenario.then) {
        givenWhenThenScenarios.push(`Given ${currentScenario.given}, When ${currentScenario.when}, Then ${currentScenario.then}`);
      }
      
      // If we found Given/When/Then scenarios, use them
      if (givenWhenThenScenarios.length > 0) {
        return givenWhenThenScenarios;
      }
      
      // Otherwise, look for traditional AC format
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Check if we're entering AC section
        if (/^(Acceptance Criteria|AC|Criteria):/i.test(trimmed)) {
          inACSection = true;
          continue;
        }
        
        // Check if we're leaving AC section (new section header)
        if (inACSection && /^[A-Z][a-z]+:/.test(trimmed) && !/^(Given|When|Then)/i.test(trimmed)) {
          inACSection = false;
        }
        
        // Extract bullet points or numbered items
        if (inACSection || /^[-•*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
          const cleaned = trimmed.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '').trim();
          if (cleaned && cleaned.length > 10) {
            criteria.push(cleaned);
          }
        }
      }
      
      // If we found traditional criteria, return them
      if (criteria.length > 0) {
        return criteria;
      }
      
      // Last resort: extract meaningful sentences from description
      const sentences = text.split(/[.!?]\s+/).filter(s => s.trim().length > 20);
      if (sentences.length > 0) {
        return sentences.slice(0, 5).map(s => s.trim());
      }
      
      return ['Use the full description above to generate comprehensive test scenarios'];
    }
    
    // Extract description
    const description = issue.fields.description 
      ? extractTextFromADF(issue.fields.description)
      : 'No description available';
    
    // Extract relevant fields
    const storyData = {
      key: issue.key,
      summary: issue.fields.summary,
      description: description,
      issueType: issue.fields.issuetype.name,
      status: issue.fields.status.name,
      priority: issue.fields.priority?.name || 'Not set',
      
      // Extract Acceptance Criteria
      acceptanceCriteria: parseAcceptanceCriteria(description),
      
      // Additional fields
      components: issue.fields.components?.map(c => c.name) || [],
      labels: issue.fields.labels || [],
      assignee: issue.fields.assignee?.displayName || 'Unassigned'
    };
    
    console.log(`✅ Story fetched: ${storyData.key} - ${storyData.summary}`);
    
    res.json(storyData);
    
  } catch (error) {
    console.error('❌ Error fetching Jira story:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Story not found',
        details: `Story ${req.params.storyId} does not exist or you don't have access`
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'Invalid Jira credentials. Please check JIRA_API_TOKEN in .env'
      });
    }
    
    res.status(500).json({
      error: 'Failed to fetch Jira story',
      details: error.message
    });
  }
});

/**
 * Upload feature file to Jira/GitHub (creates 1 Test Case with feature file)
 */
app.post('/api/upload-to-jira-github', async (req, res) => {
  try {
    const { content, filename } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Feature file content is required' });
    }
    
    const XRAY_CLIENT_ID = process.env.XRAY_CLIENT_ID;
    const XRAY_CLIENT_SECRET = process.env.XRAY_CLIENT_SECRET;
    
    if (!XRAY_CLIENT_ID || !XRAY_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Xray credentials not configured' });
    }
    
    console.log('🔐 Authenticating with Xray...');
    
    // Authenticate with Xray
    const authResponse = await fetch('https://xray.cloud.getxray.app/api/v2/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: XRAY_CLIENT_ID,
        client_secret: XRAY_CLIENT_SECRET
      })
    });
    
    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with Xray');
    }
    
    const xrayToken = await authResponse.text();
    const token = xrayToken.replace(/"/g, '');
    
    // Extract Feature summary from content
    const featureMatch = content.match(/Feature:\s*(.+)/);
    const featureSummary = featureMatch ? featureMatch[1].trim() : 'AI Generated Test Case';
    
    console.log(`📤 Creating Test Case in Jira: ${featureSummary}`);
    
    // Use Xray Cucumber import endpoint (creates test cases from feature file)
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add feature file as a buffer
    formData.append('file', Buffer.from(content, 'utf-8'), {
      filename: 'test.feature',
      contentType: 'text/plain'
    });
    
    // Use axios for multipart upload
    const importResponse = await axios.post(
      'https://xray.cloud.getxray.app/api/v2/import/feature?projectKey=BTC',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        },
        validateStatus: () => true
      }
    );
    
    console.log(`📥 Import response status: ${importResponse.status}`);
    console.log(`📥 Import response:`, JSON.stringify(importResponse.data));
    
    if (importResponse.status !== 200) {
      const errorMsg = importResponse.data?.error || JSON.stringify(importResponse.data);
      throw new Error(`Xray Import Error (${importResponse.status}): ${errorMsg}`);
    }
    
    const result = importResponse.data;
    
    // Separate Tests from Preconditions
    const testKeys = [];
    const testIds = [];
    const preconditionKeys = [];
    const preconditionIds = [];
    
    if (result.updatedOrCreatedTests) {
      testKeys.push(...result.updatedOrCreatedTests.map(t => t.key));
      testIds.push(...result.updatedOrCreatedTests.map(t => t.id));
    }
    if (result.updatedOrCreatedPreconditions) {
      preconditionKeys.push(...result.updatedOrCreatedPreconditions.map(p => p.key));
      preconditionIds.push(...result.updatedOrCreatedPreconditions.map(p => p.id));
    }
    
    // Combine for display purposes
    const allTestKeys = [...testKeys, ...preconditionKeys];
    
    if (testKeys.length === 0) {
      throw new Error('No test cases created by Xray');
    }
    
    const mainTestKey = testKeys[0];
    
    console.log(`✅ Test Cases created: ${testKeys.join(', ')}`);
    if (preconditionKeys.length > 0) {
      console.log(`✅ Preconditions created: ${preconditionKeys.join(', ')}`);
    }
    console.log(`✅ Main test key: ${mainTestKey}`);
    
    // Update feature file with actual Jira keys
    let updatedContent = content;
    
    // Replace feature-level placeholder with main test key
    updatedContent = updatedContent.replace(/@JIRA_PLACEHOLDER(?!_)/g, `@${mainTestKey}`);
    
    // Replace scenario-level placeholders with individual test keys
    testKeys.forEach((key, index) => {
      const placeholderNum = index + 1;
      const placeholder = `@JIRA_PLACEHOLDER_${placeholderNum}`;
      updatedContent = updatedContent.replace(new RegExp(placeholder, 'g'), `@${key}`);
    });
    
    // Save updated file to local features folder
    const featuresDir = path.join(__dirname, '../../features');
    const filePath = path.join(featuresDir, filename);
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    
    console.log(`✅ Saved to features/${filename} with Jira key ${mainTestKey}`);
    
    // Link ONLY Tests (not Preconditions) to Test Plan BTC-104
    if (testIds.length > 0) {
      console.log(`🔗 Linking ${testIds.length} test(s) to Test Plan BTC-104...`);
      
      try {
        // First, get the numeric ID for BTC-104 using Jira REST API
        const JIRA_USER = process.env.JIRA_USER;
        const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
        const jiraAuth = Buffer.from(`${JIRA_USER}:${JIRA_API_TOKEN}`).toString('base64');
        
        const issueResponse = await axios.get(
          'https://veradigm.atlassian.net/rest/api/3/issue/BTC-104',
          {
            headers: {
              'Authorization': `Basic ${jiraAuth}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const testPlanId = issueResponse.data.id;
        console.log(`📋 BTC-104 numeric ID: ${testPlanId}`);
        
        // Use GraphQL mutation with ONLY test IDs (not preconditions)
        const linkResponse = await fetch(`https://xray.cloud.getxray.app/api/v2/graphql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            query: `mutation AddTestsToTestPlan($issueId: String!, $testIssueIds: [String]!) {
              addTestsToTestPlan(issueId: $issueId, testIssueIds: $testIssueIds) {
                addedTests
                warning
              }
            }`,
            variables: {
              issueId: String(testPlanId),
              testIssueIds: testIds.map(String)
            }
          })
        });
        
        const linkResult = await linkResponse.json();
        console.log(`📥 Link response status: ${linkResponse.status}`);
        console.log(`📥 Link response:`, JSON.stringify(linkResult));
        
        if (linkResponse.ok && linkResult.data?.addTestsToTestPlan) {
          console.log(`✅ Linked ${testIds.length} test(s) to Test Plan BTC-104: ${testKeys.join(', ')}`);
        } else {
          console.log(`⚠️ Failed to link to BTC-104: ${JSON.stringify(linkResult)}`);
        }
      } catch (linkError) {
        console.log(`⚠️ Linking to BTC-104 failed: ${linkError.message}`);
      }
    } else {
      console.log(`⚠️ No tests to link to BTC-104`);
    }
    
    // Upload to GitHub
    console.log('📤 Uploading to GitHub...');
    try {
      const { Octokit } = require('@octokit/rest');
      const octokit = new Octokit({ auth: GITHUB_TOKEN });
      
      const filePath = `features/${filename}`;
      const fileContent = Buffer.from(updatedContent).toString('base64');
      
      // Check if file exists
      let sha = null;
      try {
        const { data } = await octokit.repos.getContent({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: filePath
        });
        sha = data.sha;
        console.log(`📝 File exists, updating...`);
      } catch (error) {
        console.log(`📝 File doesn't exist, creating new...`);
      }
      
      const commitMessage = `Add test case ${mainTestKey}: ${featureSummary}`;
      
      await octokit.repos.createOrUpdateFileContents({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePath,
        message: commitMessage,
        content: fileContent,
        sha: sha,
        branch: 'main'
      });
      
      console.log(`✅ Uploaded to GitHub: ${filePath}`);
    } catch (githubError) {
      console.error('⚠️ GitHub upload failed:', githubError.message);
      // Don't fail the whole request if GitHub upload fails
    }
    
    res.json({
      success: true,
      testKey: mainTestKey,
      allTestKeys: allTestKeys,
      summary: featureSummary,
      jiraUrl: `https://veradigm.atlassian.net/browse/${mainTestKey}`,
      githubUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/main/features/${filename}`,
      message: `Test Case(s) created: ${allTestKeys.join(', ')} - All linked to BTC-104`
    });
    
  } catch (error) {
    console.error('❌ Error uploading to Jira/GitHub:', error.message);
    res.status(500).json({
      error: 'Failed to upload to Jira/GitHub',
      details: error.message
    });
  }
});

/**
 * Create Test Execution in Jira Xray
 */
app.post('/api/create-test-execution', async (req, res) => {
  try {
    const { testKeys, summary } = req.body;
    
    if (!testKeys || testKeys.length === 0) {
      return res.status(400).json({ error: 'Test keys are required' });
    }
    
    const XRAY_CLIENT_ID = process.env.XRAY_CLIENT_ID;
    const XRAY_CLIENT_SECRET = process.env.XRAY_CLIENT_SECRET;
    
    if (!XRAY_CLIENT_ID || !XRAY_CLIENT_SECRET) {
      return res.status(500).json({ error: 'Xray credentials not configured' });
    }
    
    console.log('🔐 Authenticating with Xray...');
    
    // Authenticate with Xray
    const authResponse = await fetch('https://xray.cloud.getxray.app/api/v2/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: XRAY_CLIENT_ID,
        client_secret: XRAY_CLIENT_SECRET
      })
    });
    
    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with Xray');
    }
    
    const xrayToken = await authResponse.text();
    const token = xrayToken.replace(/"/g, '');
    
    console.log('📋 Creating Test Execution in Jira...');
    console.log(`📋 Test keys to add: ${testKeys.join(', ')}`);
    
    // Get numeric IDs for the test keys
    const JIRA_USER = process.env.JIRA_USER;
    const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
    const jiraAuth = Buffer.from(`${JIRA_USER}:${JIRA_API_TOKEN}`).toString('base64');
    
    const testIssueIds = [];
    for (const testKey of testKeys) {
      try {
        const issueResponse = await axios.get(
          `https://veradigm.atlassian.net/rest/api/3/issue/${testKey}`,
          {
            headers: {
              'Authorization': `Basic ${jiraAuth}`,
              'Content-Type': 'application/json'
            }
          }
        );
        testIssueIds.push(issueResponse.data.id);
        console.log(`📋 ${testKey} → ID: ${issueResponse.data.id}`);
      } catch (error) {
        console.error(`⚠️ Failed to get ID for ${testKey}: ${error.message}`);
        throw new Error(`Could not resolve test key ${testKey} to numeric ID`);
      }
    }
    
    // Use GraphQL createTestExecution mutation (correct approach)
    const createMutation = `
      mutation CreateTestExecution($testIssueIds: [String]!, $jira: JSON!) {
        createTestExecution(testIssueIds: $testIssueIds, jira: $jira) {
          testExecution {
            issueId
            jira(fields: ["key"])
          }
          warnings
        }
      }
    `;
    
    const createVariables = {
      testIssueIds: testIssueIds.map(String),
      jira: {
        fields: {
          project: { key: 'BTC' },
          summary: summary || `Test Execution - ${new Date().toLocaleString()}`,
          issuetype: { name: 'Test Execution' }
        }
      }
    };
    
    console.log('📤 Creating Test Execution via GraphQL...');
    console.log('📤 Variables:', JSON.stringify(createVariables, null, 2));
    
    const createResponse = await fetch('https://xray.cloud.getxray.app/api/v2/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: createMutation,
        variables: createVariables
      })
    });
    
    const createResult = await createResponse.json();
    console.log(`📥 createTestExecution status: ${createResponse.status}`);
    console.log(`📥 createTestExecution response:`, JSON.stringify(createResult, null, 2));
    
    if (createResult.errors?.length) {
      const errorMsg = createResult.errors.map(e => e.message).join(', ');
      console.error('❌ GraphQL Errors:', JSON.stringify(createResult.errors, null, 2));
      throw new Error(`GraphQL Error: ${errorMsg}`);
    }
    
    if (!createResult.data?.createTestExecution?.testExecution) {
      throw new Error('No test execution returned from GraphQL mutation');
    }
    
    const testExecution = createResult.data.createTestExecution.testExecution;
    const testExecutionKey = testExecution.jira.key;
    const testExecutionId = testExecution.issueId;
    
    console.log(`✅ Test Execution created: ${testExecutionKey} (ID: ${testExecutionId})`);
    
    // Link Test Execution to Test Plan BTC-104
    console.log(`🔗 Linking Test Execution to Test Plan BTC-104...`);
    
    try {
      // Get BTC-104 numeric ID
      const testPlanResponse = await axios.get(
        'https://veradigm.atlassian.net/rest/api/3/issue/BTC-104',
        {
          headers: {
            'Authorization': `Basic ${jiraAuth}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const testPlanId = testPlanResponse.data.id;
      console.log(`📋 BTC-104 numeric ID: ${testPlanId}`);
      
      const linkMutation = `
        mutation AddExecToPlan($issueId: String!, $testExecIssueIds: [String]!) {
          addTestExecutionsToTestPlan(issueId: $issueId, testExecIssueIds: $testExecIssueIds) {
            addedTestExecutions
            warning
          }
        }
      `;
      
      const linkVariables = {
        issueId: String(testPlanId),
        testExecIssueIds: [String(testExecutionId)]
      };
      
      const linkResponse = await fetch('https://xray.cloud.getxray.app/api/v2/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: linkMutation,
          variables: linkVariables
        })
      });
      
      const linkResult = await linkResponse.json();
      console.log(`📥 addTestExecutionsToTestPlan status: ${linkResponse.status}`);
      console.log(`📥 addTestExecutionsToTestPlan response:`, JSON.stringify(linkResult, null, 2));
      
      if (linkResult.errors?.length) {
        console.warn(`⚠️ Failed to link Test Execution to Test Plan: ${JSON.stringify(linkResult.errors)}`);
      } else {
        console.log(`✅ Linked Test Execution to Test Plan BTC-104`);
      }
    } catch (linkError) {
      console.warn(`⚠️ Failed to link to BTC-104: ${linkError.message}`);
    }
    
    res.json({
      success: true,
      testExecutionKey,
      jiraUrl: `https://veradigm.atlassian.net/browse/${testExecutionKey}`,
      message: 'Test Execution created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating Test Execution:', error.message);
    
    // Check if it's a "test not found" error
    const isTestNotFoundError = error.message.includes('not found') || 
                                 error.message.includes('does not exist') ||
                                 error.message.includes('400');
    
    res.status(500).json({
      error: 'Failed to create Test Execution',
      details: error.message,
      suggestion: isTestNotFoundError 
        ? 'The test keys (BTC-XXX) in your feature file do not exist in Jira. Please create them in Jira first, or remove the @BTC-XXX tags and use local execution only.'
        : 'Check Xray credentials and API access.'
    });
  }
});

/**
 * Trigger GitHub Actions workflow to execute tests
 */
app.post('/api/execute-test', async (req, res) => {
  try {
    const { testExecutionKey, testProfile } = req.body;
    
    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }
    
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    
    console.log(`🚀 Triggering test execution for: ${testExecutionKey}`);
    
    // Trigger repository_dispatch event
    await octokit.repos.createDispatchEvent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      event_type: 'xray-trigger',
      client_payload: {
        test_execution_key: testExecutionKey,
        test_plan_key: 'BTC-104',
        test_profile: testProfile || 'smoke'
      }
    });
    
    console.log('✅ Test execution triggered successfully');
    console.log('⏳ Waiting for workflow to start...');
    
    // Try to get the workflow run ID with retries
    let workflowUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions`;
    let runId = null;
    const triggerTime = new Date();
    
    try {
      // Retry up to 3 times with increasing delays
      for (let attempt = 1; attempt <= 3; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt)); // 3s, 6s, 9s
        
        console.log(`🔍 Attempt ${attempt}: Checking for new workflow run...`);
        
        const runs = await octokit.actions.listWorkflowRunsForRepo({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          per_page: 10,
          event: 'repository_dispatch'
        });
        
        if (runs.data.workflow_runs && runs.data.workflow_runs.length > 0) {
          // Find a run that was created within the last 30 seconds
          const recentRun = runs.data.workflow_runs.find(run => {
            const runCreatedAt = new Date(run.created_at);
            const timeDiff = (runCreatedAt - triggerTime) / 1000; // seconds
            return Math.abs(timeDiff) < 30; // Within 30 seconds of trigger
          });
          
          if (recentRun) {
            runId = recentRun.id;
            workflowUrl = recentRun.html_url;
            console.log(`✅ Found NEW workflow run: ${runId} (created: ${recentRun.created_at})`);
            break;
          } else {
            console.log(`⚠️ No recent runs found (attempt ${attempt}/3)`);
          }
        }
      }
      
      // If still no run found, fall back to latest
      if (!runId) {
        console.warn('⚠️ Could not find recent run, using latest as fallback');
        const runs = await octokit.actions.listWorkflowRunsForRepo({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          per_page: 1,
          event: 'repository_dispatch'
        });
        if (runs.data.workflow_runs && runs.data.workflow_runs.length > 0) {
          const latestRun = runs.data.workflow_runs[0];
          runId = latestRun.id;
          workflowUrl = latestRun.html_url;
          console.log(`📍 Using latest workflow run: ${runId}`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch workflow run ID:', error.message);
    }
    
    res.json({
      success: true,
      message: 'Test execution triggered',
      testExecutionKey,
      workflowUrl,
      runId
    });
    
  } catch (error) {
    console.error('❌ Error triggering test execution:', error.message);
    res.status(500).json({
      error: 'Failed to trigger test execution',
      details: error.message
    });
  }
});

/**
 * Save generated test to GitHub
 */
app.post('/api/save-to-github', async (req, res) => {
  try {
    const { content, filename } = req.body;
    
    if (!content || !filename) {
      return res.status(400).json({ error: 'Content and filename are required' });
    }
    
    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }
    
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    
    const filePath = `features/${filename}`;
    
    console.log(`💾 Saving to GitHub: ${filePath}`);
    
    // Check if file exists
    let sha;
    try {
      const { data } = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePath
      });
      sha = data.sha;
    } catch (err) {
      // File doesn't exist, that's fine
    }
    
    // Create or update file
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: `Add AI-generated test: ${filename}`,
      content: Buffer.from(content).toString('base64'),
      sha: sha,
      branch: 'main'
    });
    
    console.log('✅ File saved to GitHub successfully');
    
    res.json({
      success: true,
      message: 'Test case saved to GitHub',
      path: filePath,
      url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/main/${filePath}`
    });
    
  } catch (error) {
    console.error('❌ Error saving to GitHub:', error.message);
    res.status(500).json({
      error: 'Failed to save to GitHub',
      details: error.message
    });
  }
});

/**
 * Check GitHub Actions workflow status
 */
app.get('/api/check-workflow-status', async (req, res) => {
  try {
    const { runId } = req.query;
    
    if (!runId) {
      return res.status(400).json({ error: 'Run ID is required' });
    }
    
    console.log(`🔍 Checking workflow status for run ID: ${runId}`);
    console.log(`📍 Repository: ${GITHUB_OWNER}/${GITHUB_REPO}`);
    
    const response = await axios.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs/${runId}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Veradigm-AI-Test-Generator'
        },
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors
      }
    );
    
    if (response.status === 404) {
      console.log(`⚠️ Workflow run ${runId} not found - it may still be queued or the URL is incorrect`);
      // Return "in_progress" status so polling continues
      return res.json({
        status: 'in_progress',
        conclusion: null,
        html_url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs/${runId}`
      });
    }
    
    if (response.status !== 200) {
      throw new Error(`GitHub API returned status ${response.status}`);
    }
    
    console.log(`✅ Workflow status: ${response.data.status}, conclusion: ${response.data.conclusion || 'N/A'}`);
    
    res.json({
      status: response.data.status,
      conclusion: response.data.conclusion,
      html_url: response.data.html_url
    });
    
  } catch (error) {
    console.error('❌ Error checking workflow status:', error.message);
    if (error.response) {
      console.error(`   HTTP Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    
    // Return in_progress so polling continues instead of failing
    res.json({
      status: 'in_progress',
      conclusion: null,
      error: error.message
    });
  }
});

/**
 * Get test report HTML from GitHub Actions artifacts
 */
app.get('/api/get-test-report', async (req, res) => {
  try {
    const { runId } = req.query;
    
    if (!runId) {
      return res.status(400).json({ error: 'Run ID is required' });
    }
    
    console.log(`📊 Fetching test report for workflow run: ${runId}`);
    
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    
    // List artifacts for this workflow run
    const artifacts = await octokit.actions.listWorkflowRunArtifacts({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      run_id: runId
    });
    
    console.log(`📦 Found ${artifacts.data.artifacts.length} artifacts`);
    
    // Find the cucumber reports artifact
    const reportArtifact = artifacts.data.artifacts.find(a => 
      a.name.includes('cucumber-reports') || a.name.includes('test-results')
    );
    
    if (!reportArtifact) {
      console.log('⚠️ No report artifact found yet');
      return res.status(404).json({
        error: 'Report not available',
        details: 'Test report artifact not found. Tests may still be running.'
      });
    }
    
    console.log(`✅ Found artifact: ${reportArtifact.name} (ID: ${reportArtifact.id})`);
    
    // Download the artifact
    const download = await octokit.actions.downloadArtifact({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      artifact_id: reportArtifact.id,
      archive_format: 'zip'
    });
    
    // The download.data is a buffer containing the zip file
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(Buffer.from(download.data));
    const zipEntries = zip.getEntries();
    
    // Find the HTML report in the zip
    // Priority: 1. Enhanced report (index.html in enhanced-report folder)
    //           2. Basic cucumber report (cucumber-report.html)
    let htmlEntry = zipEntries.find(entry => 
      entry.entryName.includes('enhanced-report/index.html')
    );
    
    if (!htmlEntry) {
      // Fallback to basic cucumber report
      htmlEntry = zipEntries.find(entry => 
        entry.entryName.includes('cucumber-report.html')
      );
    }
    
    if (!htmlEntry) {
      // Last resort: any HTML file
      htmlEntry = zipEntries.find(entry => 
        entry.entryName.endsWith('.html')
      );
    }
    
    if (!htmlEntry) {
      return res.status(404).json({
        error: 'Report file not found in artifact',
        details: 'HTML report not found in the downloaded artifact.'
      });
    }
    
    console.log(`📊 Serving report: ${htmlEntry.entryName}`);
    
    let reportHtml = htmlEntry.getData().toString('utf8');
    
    // If it's the enhanced report, we need to fix relative paths for CSS/JS files
    if (htmlEntry.entryName.includes('enhanced-report/index.html')) {
      // Extract all files from enhanced-report directory
      const enhancedReportEntries = zipEntries.filter(entry => 
        entry.entryName.includes('enhanced-report/')
      );
      
      // For each CSS/JS file referenced, inject it inline or fix paths
      enhancedReportEntries.forEach(entry => {
        if (entry.entryName.endsWith('.css')) {
          const cssContent = entry.getData().toString('utf8');
          const fileName = entry.entryName.split('/').pop();
          // Replace link tag with inline style
          reportHtml = reportHtml.replace(
            new RegExp(`<link[^>]*href=["'].*${fileName}["'][^>]*>`, 'g'),
            `<style>${cssContent}</style>`
          );
        } else if (entry.entryName.endsWith('.js')) {
          const jsContent = entry.getData().toString('utf8');
          const fileName = entry.entryName.split('/').pop();
          // Replace script tag with inline script
          reportHtml = reportHtml.replace(
            new RegExp(`<script[^>]*src=["'].*${fileName}["'][^>]*></script>`, 'g'),
            `<script>${jsContent}</script>`
          );
        }
      });
    }
    
    res.setHeader('Content-Type', 'text/html');
    res.send(reportHtml);
    
  } catch (error) {
    console.error('❌ Error fetching test report:', error.message);
    res.status(500).json({
      error: 'Failed to fetch test report',
      details: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🤖 ========================================');
  console.log('🤖  AI Test Generator Server Started');
  console.log('🤖 ========================================');
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔑 GitHub Token: ${GITHUB_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`📁 Repository: ${GITHUB_OWNER}/${GITHUB_REPO}`);
  console.log('🤖 ========================================');
  console.log('');
});
