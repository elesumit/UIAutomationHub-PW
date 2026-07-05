/**
 * Automation Hub backend — Azure Functions (v4 programming model, FC1).
 *
 * Ported from tools/ai-test-generator/server.js (Express). Stateless: talks only
 * to GitHub Models, GitHub REST, Jira, and Xray. No local persistence — the
 * Express `/api/save-to-local` is re-pointed at the GitHub commit path because a
 * Function App filesystem is ephemeral.
 *
 * Routes are exposed under /api/* (Functions default prefix) and reached through
 * the SWA linked-backend registration under the site's Entra auth.
 */
const { app } = require('@azure/functions');
const { AzureOpenAI } = require('openai');
const { DefaultAzureCredential, getBearerTokenProvider } = require('@azure/identity');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'techops';
const GITHUB_REPO = process.env.GITHUB_REPO || 'az-staticWeb-automation-pw';
const JIRA_BASE_URL = process.env.JIRA_BASE_URL || 'https://automationhubpw.atlassian.net';
const XRAY_BASE = 'https://xray.cloud.getxray.app/api/v2';
// Branch that save-to-github / upload-to-jira-github commit to. Defaults to main
// (legacy behaviour); set GITHUB_TARGET_BRANCH to a non-default branch to avoid
// authenticated users writing straight to main (see api/README.md security note).
const GITHUB_TARGET_BRANCH = process.env.GITHUB_TARGET_BRANCH || 'main';

// Azure AI Foundry client — MI auth via DefaultAzureCredential, no API key
const openAIClient = new AzureOpenAI({
  endpoint:             process.env.AIF_ENDPOINT,
  apiVersion:           process.env.AIF_API_VERSION,
  azureADTokenProvider: getBearerTokenProvider(
    new DefaultAzureCredential(),
    'https://cognitiveservices.azure.com/.default'
  ),
});

// ──────────────────────────── helpers ────────────────────────────

/** Read bundled sample feature files for LLM prompt context (replaces the
 *  Express read of ../../features which doesn't exist in the Function App). */
function getTestExamples() {
  const samplesDir = path.join(__dirname, '..', 'samples');
  const examples = [];
  try {
    const files = fs.readdirSync(samplesDir).filter((f) => f.endsWith('.feature'));
    for (let i = 0; i < Math.min(2, files.length); i++) {
      examples.push(fs.readFileSync(path.join(samplesDir, files[i]), 'utf-8').substring(0, 1000));
    }
  } catch (err) {
    // Non-fatal — prompt still works without examples.
  }
  return examples;
}

function buildSystemPrompt() {
  const examples = getTestExamples();
  return `You are an expert test automation engineer generating Gherkin/Cucumber BDD scenarios for a Playwright automation framework.

**Core rule — stay faithful to the story:**
Generate scenarios that reflect ONLY the user story and acceptance criteria you are given. Do NOT invent unrelated business flows. If the story is about logging out, test logging out — do not add case-creation, product selection, or any steps the story does not call for.

**Available Step Definitions (use ONLY these):**
- Given I navigate to CE Portal "<url>"   (use "" to hit the configured base URL from env)
- When I click on "<element>"
- When I check the checkbox "<checkbox_label>"
- When I uncheck the checkbox "<checkbox_label>"
- When I enter "<text>" in "<field>"
- When I select "<option>" from "<dropdown>"
- When I wait for <seconds> seconds
- Then I should see "<text>"
- Then I should not see "<text>"
- Then I see error message "<message>"
- Then the field "<field_name>" should be mandatory
- Then I should see error banner with text "<error_text>"

**Credentials:** Use empty strings for credential values — real values are injected from environment variables at runtime. The username field is "CE_UserName" and the password field is "CE_Password":
  When I enter "" in "CE_UserName"
  When I enter "" in "CE_Password"
DO NOT hardcode credentials.

**Login Background (include ONLY when the story needs an authenticated session):**
  Background: Login
    Given I navigate to CE Portal ""
    When I enter "" in "CE_UserName"
    When I enter "" in "CE_Password"
    When I click on "Login"
Adjust the login steps to fit the application under test; do not bolt on Support/Search/Create-a-Case steps unless the story is specifically about those features.

**Example Test Structure (for FORMAT reference only — do not copy its domain):**
${examples.length > 0 ? examples[0] : 'No examples available'}

**Tagging Requirements (CRITICAL):**
1. Feature-level tags: descriptive test-type tags only (e.g., @HappyPath, @E2E, @Regression, @ErrorValidation). DO NOT put @JIRA_PLACEHOLDER on the Feature line.
2. Scenario-level tags: add @JIRA_PLACEHOLDER_N on EACH Scenario line (N = 1, 2, 3, ...). These are replaced with real Jira keys.
3. DO NOT tag the Background section.

**Assertions:** Only assert what the acceptance criteria actually state. Use "Then I should see" for positive checks and "Then I see error message" / "Then I should see error banner with text" for error checks — do not use error-message assertions for success outcomes.

**Output:** Only the Feature file content, no explanations. Each scenario must have a unique @JIRA_PLACEHOLDER_N tag.`;
}

async function xrayAuthenticate() {
  const XRAY_CLIENT_ID = process.env.XRAY_CLIENT_ID;
  const XRAY_CLIENT_SECRET = process.env.XRAY_CLIENT_SECRET;
  if (!XRAY_CLIENT_ID || !XRAY_CLIENT_SECRET) {
    throw new Error('Xray credentials not configured');
  }
  const res = await fetch(`${XRAY_BASE}/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: XRAY_CLIENT_ID, client_secret: XRAY_CLIENT_SECRET }),
  });
  if (!res.ok) throw new Error('Failed to authenticate with Xray');
  return (await res.text()).replace(/"/g, '');
}

function jiraAuthHeader() {
  const JIRA_USER = process.env.JIRA_USER;
  const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
  if (!JIRA_USER || !JIRA_API_TOKEN) throw new Error('Jira credentials not configured');
  return 'Basic ' + Buffer.from(`${JIRA_USER}:${JIRA_API_TOKEN}`).toString('base64');
}

async function octokitClient() {
  const { Octokit } = await import('@octokit/rest');
  return new Octokit({ auth: GITHUB_TOKEN });
}

/** Create or update features/<filename> on the default branch. */
async function commitFeatureToGitHub(filename, content, message) {
  const octokit = await octokitClient();
  const filePath = `features/${filename}`;
  let sha;
  try {
    const { data } = await octokit.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path: filePath, ref: GITHUB_TARGET_BRANCH });
    sha = data.sha;
  } catch (_) {
    /* file doesn't exist yet */
  }
  await octokit.repos.createOrUpdateFileContents({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path: filePath,
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch: GITHUB_TARGET_BRANCH,
  });
  return filePath;
}

const json = (status, body) => ({ status, jsonBody: body });

// ──────────────────────────── routes ────────────────────────────

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: async () => {
    const aifConfigured = !!(process.env.AIF_ENDPOINT && process.env.AIF_DEPLOYMENT_NAME);
    return json(200, {
      status: 'ok',
      aifConfigured,
      copilotConfigured: aifConfigured, // backward-compat alias — older page versions check this field
      repo: `${GITHUB_OWNER}/${GITHUB_REPO}`,
    });
  },
});

// POST /api/generate — AI test generation via Azure AI Foundry (MI auth)
// Replaces the previous GitHub Models / GITHUB_COPILOT_TOKEN call.
app.http('generate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'generate',
  handler: async (request, context) => {
    try {
      const { description, application, testType } = await request.json();
      if (!description) return json(400, { error: 'Description is required' });

      const isPatientSafety = /patient safety|checkbox|is this a patient/i.test(description);
      const scenarioCount = isPatientSafety ? '10-15' : '5-8';

      const userPrompt = `Generate Gherkin test scenarios for:
"${description}"

Application: ${application || 'CE Portal and Salesforce'}
Test Type: ${testType || 'General'}

Requirements:
- You MUST generate at least ${scenarioCount} distinct test scenarios.
- Use @JIRA_PLACEHOLDER_N tags on each scenario (N = 1, 2, 3...).
- Add appropriate descriptive @tags on the Feature line only.
- Use realistic test data and cover edge cases and validation rules.
- Background MUST include: Login → Support → Search → Create a Case → Fill mandatory fields.

Output only the Feature file content, no explanations.`;

      const result = await openAIClient.chat.completions.create({
        model:       process.env.AIF_DEPLOYMENT_NAME,
        messages:    [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user',   content: userPrompt },
        ],
        // gpt-5 family (reasoning models): uses max_completion_tokens, not
        // max_tokens, and only supports the default temperature (1) — passing
        // temperature: 0.2 returns 400. Was written for gpt-4o originally.
        max_completion_tokens: 8000,
      });

      const content = (result.choices[0].message.content || '')
        .replace(/```gherkin\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      context.log('✅ Test cases generated via Azure AI Foundry');
      return json(200, {
        success: true,
        content,
        metadata: { model: process.env.AIF_DEPLOYMENT_NAME, application: application || 'Both', testType: testType || 'General' },
      });
    } catch (error) {
      context.error('generate failed:', error.message);
      return json(500, { error: 'Failed to generate test cases', details: error.message });
    }
  },
});

// In the cloud there is no local framework checkout — "save to local" persists
// to the GitHub repo's features/ folder (same destination as save-to-github).
app.http('save-to-local', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'save-to-local',
  handler: async (request, context) => {
    try {
      const { content, filename } = await request.json();
      if (!content || !filename) return json(400, { error: 'Content and filename are required' });
      if (!GITHUB_TOKEN) return json(500, { error: 'GitHub token not configured' });
      const filePath = await commitFeatureToGitHub(filename, content, `Add AI-generated test: ${filename}`);
      return json(200, { success: true, path: filePath, message: 'Feature file committed to the framework repo' });
    } catch (error) {
      context.error('save-to-local failed:', error.message);
      return json(500, { error: 'Failed to save feature file', details: error.message });
    }
  },
});

app.http('save-to-github', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'save-to-github',
  handler: async (request, context) => {
    try {
      const { content, filename } = await request.json();
      if (!content || !filename) return json(400, { error: 'Content and filename are required' });
      if (!GITHUB_TOKEN) return json(500, { error: 'GitHub token not configured' });
      const filePath = await commitFeatureToGitHub(filename, content, `Add AI-generated test: ${filename}`);
      return json(200, {
        success: true,
        message: 'Test case saved to GitHub',
        path: filePath,
        url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_TARGET_BRANCH}/${filePath}`,
      });
    } catch (error) {
      context.error('save-to-github failed:', error.message);
      return json(500, { error: 'Failed to save to GitHub', details: error.message });
    }
  },
});

app.http('fetch-test-cases', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'fetch-test-cases',
  handler: async (request, context) => {
    try {
      const token = await xrayAuthenticate();
      const graphqlQuery = {
        query: `{
          getTestPlans(jql: "key = XSP-58", limit: 1) {
            results {
              issueId
              jira(fields: ["key", "summary"])
              tests(limit: 100) { results { issueId jira(fields: ["key", "summary"]) } }
            }
          }
        }`,
      };
      const res = await fetch(`${XRAY_BASE}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(graphqlQuery),
      });
      if (!res.ok) throw new Error(`Failed to fetch test cases: ${await res.text()}`);
      const result = await res.json();
      const testPlan = result.data?.getTestPlans?.results?.[0];
      if (!testPlan) return json(200, { testCases: [] });
      const testCases = testPlan.tests.results.map((t) => ({ key: t.jira.key, summary: t.jira.summary }));
      return json(200, { testCases });
    } catch (error) {
      context.error('fetch-test-cases failed:', error.message);
      return json(500, { error: 'Failed to fetch test cases', details: error.message });
    }
  },
});

app.http('jira-issue-types', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'jira-issue-types',
  handler: async (request, context) => {
    try {
      const response = await axios.get(`${JIRA_BASE_URL}/rest/api/3/project/XSP`, {
        headers: { Authorization: jiraAuthHeader(), 'Content-Type': 'application/json' },
      });
      return json(200, { issueTypes: response.data.issueTypes });
    } catch (error) {
      context.error('jira-issue-types failed:', error.message);
      return json(500, { error: error.message });
    }
  },
});

app.http('jira-story', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'jira/story/{storyId}',
  handler: async (request, context) => {
    const storyId = request.params.storyId;
    try {
      const response = await axios.get(`${JIRA_BASE_URL}/rest/api/3/issue/${storyId}`, {
        headers: { Authorization: jiraAuthHeader(), Accept: 'application/json' },
      });
      const issue = response.data;

      const extractTextFromADF = (adf) => {
        if (!adf) return '';
        let text = '';
        const traverse = (node) => {
          if (node.type === 'text') text += node.text + ' ';
          else if (node.type === 'hardBreak') text += '\n';
          if (node.content) node.content.forEach(traverse);
        };
        if (adf.content) traverse(adf);
        return text.trim();
      };

      const parseAcceptanceCriteria = (text) => {
        if (!text) return ['Use the description to generate test scenarios'];
        const lines = text.split('\n');
        const gwt = [];
        let cur = { given: '', when: '', then: '' };
        for (const raw of lines) {
          const line = raw.trim();
          if (/^Given/i.test(line)) {
            if (cur.given && cur.when && cur.then) gwt.push(`Given ${cur.given}, When ${cur.when}, Then ${cur.then}`);
            cur = { given: line.replace(/^Given\s*/i, '').trim(), when: '', then: '' };
          } else if (/^When/i.test(line)) cur.when = line.replace(/^When\s*/i, '').trim();
          else if (/^Then/i.test(line)) cur.then = line.replace(/^Then\s*/i, '').trim();
        }
        if (cur.given && cur.when && cur.then) gwt.push(`Given ${cur.given}, When ${cur.when}, Then ${cur.then}`);
        if (gwt.length) return gwt;
        const sentences = text.split(/[.!?]\s+/).filter((s) => s.trim().length > 20);
        return sentences.length ? sentences.slice(0, 5).map((s) => s.trim()) : ['Use the full description to generate scenarios'];
      };

      const description = issue.fields.description ? extractTextFromADF(issue.fields.description) : 'No description available';
      return json(200, {
        key: issue.key,
        summary: issue.fields.summary,
        description,
        issueType: issue.fields.issuetype.name,
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name || 'Not set',
        acceptanceCriteria: parseAcceptanceCriteria(description),
        components: issue.fields.components?.map((c) => c.name) || [],
        labels: issue.fields.labels || [],
        assignee: issue.fields.assignee?.displayName || 'Unassigned',
      });
    } catch (error) {
      if (error.response?.status === 404) return json(404, { error: 'Story not found', details: `Story ${storyId} does not exist or you don't have access` });
      if (error.response?.status === 401) return json(401, { error: 'Authentication failed', details: 'Invalid Jira credentials' });
      context.error('jira-story failed:', error.message);
      return json(500, { error: 'Failed to fetch Jira story', details: error.message });
    }
  },
});

app.http('upload-to-jira-github', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'upload-to-jira-github',
  handler: async (request, context) => {
    try {
      const { content, filename } = await request.json();
      if (!content) return json(400, { error: 'Feature file content is required' });
      const token = await xrayAuthenticate();

      const featureMatch = content.match(/Feature:\s*(.+)/);
      const featureSummary = featureMatch ? featureMatch[1].trim() : 'AI Generated Test Case';

      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', Buffer.from(content, 'utf-8'), { filename: 'test.feature', contentType: 'text/plain' });

      const importResponse = await axios.post(`${XRAY_BASE}/import/feature?projectKey=XSP`, formData, {
        headers: { Authorization: `Bearer ${token}`, ...formData.getHeaders() },
        validateStatus: () => true,
      });
      if (importResponse.status !== 200) {
        throw new Error(`Xray Import Error (${importResponse.status}): ${importResponse.data?.error || JSON.stringify(importResponse.data)}`);
      }

      const result = importResponse.data;
      const testKeys = (result.updatedOrCreatedTests || []).map((t) => t.key);
      const testIds = (result.updatedOrCreatedTests || []).map((t) => t.id);
      const preconditionKeys = (result.updatedOrCreatedPreconditions || []).map((p) => p.key);
      if (testKeys.length === 0) throw new Error('No test cases created by Xray');
      const mainTestKey = testKeys[0];

      // Replace placeholders with actual Jira keys.
      let updatedContent = content.replace(/@JIRA_PLACEHOLDER(?!_)/g, `@${mainTestKey}`);
      testKeys.forEach((key, index) => {
        updatedContent = updatedContent.replace(new RegExp(`@JIRA_PLACEHOLDER_${index + 1}\\b`, 'g'), `@${key}`);
      });

      // Link tests to Test Plan XSP-58.
      if (testIds.length > 0) {
        try {
          const issueResponse = await axios.get(`${JIRA_BASE_URL}/rest/api/3/issue/XSP-58`, {
            headers: { Authorization: jiraAuthHeader(), 'Content-Type': 'application/json' },
          });
          const testPlanId = issueResponse.data.id;
          await fetch(`${XRAY_BASE}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              query: `mutation AddTestsToTestPlan($issueId: String!, $testIssueIds: [String]!) {
                addTestsToTestPlan(issueId: $issueId, testIssueIds: $testIssueIds) { addedTests warning }
              }`,
              variables: { issueId: String(testPlanId), testIssueIds: testIds.map(String) },
            }),
          });
        } catch (linkError) {
          context.warn(`Linking to XSP-58 failed: ${linkError.message}`);
        }
      }

      // Persist the key-substituted feature to the framework repo.
      // The Jira/Xray side already succeeded above; if the GitHub commit fails we
      // still return 200 (the tests exist in Jira) but report githubUrl=null and a
      // githubError so the UI can tell the truth instead of faking success.
      let githubUrl = null;
      let githubError = null;
      try {
        const filePath = await commitFeatureToGitHub(filename, updatedContent, `Add test case ${mainTestKey}: ${featureSummary}`);
        githubUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_TARGET_BRANCH}/${filePath}`;
      } catch (e) {
        githubError = e.message;
        context.error(`GitHub commit failed (Jira succeeded): ${e.status || ''} ${e.message}`);
      }

      return json(200, {
        success: true,
        testKey: mainTestKey,
        allTestKeys: [...testKeys, ...preconditionKeys],
        summary: featureSummary,
        jiraUrl: `${JIRA_BASE_URL}/browse/${mainTestKey}`,
        githubUrl,
        githubError,
        message: `Test Case(s) created: ${[...testKeys, ...preconditionKeys].join(', ')} — linked to XSP-58`,
      });
    } catch (error) {
      context.error('upload-to-jira-github failed:', error.message);
      return json(500, { error: 'Failed to upload to Jira/GitHub', details: error.message });
    }
  },
});

app.http('create-test-execution', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'create-test-execution',
  handler: async (request, context) => {
    try {
      const { testKeys, summary } = await request.json();
      if (!testKeys || testKeys.length === 0) return json(400, { error: 'Test keys are required' });
      const token = await xrayAuthenticate();
      const authHeader = jiraAuthHeader();

      const testIssueIds = [];
      for (const testKey of testKeys) {
        const issueResponse = await axios.get(`${JIRA_BASE_URL}/rest/api/3/issue/${testKey}`, {
          headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        });
        testIssueIds.push(issueResponse.data.id);
      }

      const createResponse = await fetch(`${XRAY_BASE}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: `mutation CreateTestExecution($testIssueIds: [String]!, $jira: JSON!) {
            createTestExecution(testIssueIds: $testIssueIds, jira: $jira) {
              testExecution { issueId jira(fields: ["key"]) } warnings
            }
          }`,
          variables: {
            testIssueIds: testIssueIds.map(String),
            jira: {
              fields: {
                project: { key: 'XSP' },
                summary: summary || `Test Execution - ${new Date().toISOString()}`,
                issuetype: { name: 'Test Execution' },
              },
            },
          },
        }),
      });
      const createResult = await createResponse.json();
      if (createResult.errors?.length) throw new Error(`GraphQL Error: ${createResult.errors.map((e) => e.message).join(', ')}`);
      const testExecution = createResult.data?.createTestExecution?.testExecution;
      if (!testExecution) throw new Error('No test execution returned from GraphQL mutation');
      const testExecutionKey = testExecution.jira.key;
      const testExecutionId = testExecution.issueId;

      // Link execution to Test Plan XSP-58.
      try {
        const testPlanResponse = await axios.get(`${JIRA_BASE_URL}/rest/api/3/issue/XSP-58`, {
          headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        });
        await fetch(`${XRAY_BASE}/graphql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            query: `mutation AddExecToPlan($issueId: String!, $testExecIssueIds: [String]!) {
              addTestExecutionsToTestPlan(issueId: $issueId, testExecIssueIds: $testExecIssueIds) { addedTestExecutions warning }
            }`,
            variables: { issueId: String(testPlanResponse.data.id), testExecIssueIds: [String(testExecutionId)] },
          }),
        });
      } catch (linkError) {
        context.warn(`Failed to link execution to XSP-58: ${linkError.message}`);
      }

      return json(200, {
        success: true,
        testExecutionKey,
        jiraUrl: `${JIRA_BASE_URL}/browse/${testExecutionKey}`,
        message: 'Test Execution created successfully',
      });
    } catch (error) {
      context.error('create-test-execution failed:', error.message);
      const isTestNotFound = /not found|does not exist|400/.test(error.message);
      return json(500, {
        error: 'Failed to create Test Execution',
        details: error.message,
        suggestion: isTestNotFound
          ? 'The XSP-XXX test keys in your feature file do not exist in Jira. Create them first, or remove the @XSP-XXX tags.'
          : 'Check Xray credentials and API access.',
      });
    }
  },
});

app.http('execute-test', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'execute-test',
  handler: async (request, context) => {
    try {
      const { testExecutionKey, testProfile } = await request.json();
      if (!GITHUB_TOKEN) return json(500, { error: 'GitHub token not configured' });

      const EXEC_KEY_RE = /^[A-Z][A-Z0-9]+-\d+$/;
      if (!testExecutionKey || !EXEC_KEY_RE.test(testExecutionKey)) {
        return json(400, { error: 'Invalid testExecutionKey format — expected e.g. XSP-123' });
      }

      const ALLOWED_PROFILES = ['smoke', 'regression'];
      const safeProfile = ALLOWED_PROFILES.includes(testProfile) ? testProfile : 'smoke';
      if (testProfile && !ALLOWED_PROFILES.includes(testProfile)) {
        context.warn(`execute-test: unknown testProfile "${testProfile}", defaulting to smoke`);
      }

      const octokit = await octokitClient();

      await octokit.repos.createDispatchEvent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        event_type: 'xray-trigger',
        client_payload: { test_execution_key: testExecutionKey, test_plan_key: 'XSP-58', test_profile: safeProfile },
      });

      // Best-effort: resolve the freshly-created workflow run id.
      let workflowUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions`;
      let runId = null;
      const triggerTime = Date.now();
      try {
        for (let attempt = 1; attempt <= 3; attempt++) {
          await new Promise((r) => setTimeout(r, 3000 * attempt));
          const runs = await octokit.actions.listWorkflowRunsForRepo({ owner: GITHUB_OWNER, repo: GITHUB_REPO, per_page: 10, event: 'repository_dispatch' });
          const recent = runs.data.workflow_runs?.find((run) => Math.abs((new Date(run.created_at).getTime() - triggerTime) / 1000) < 30);
          if (recent) {
            runId = recent.id;
            workflowUrl = recent.html_url;
            break;
          }
        }
        if (!runId) {
          const runs = await octokit.actions.listWorkflowRunsForRepo({ owner: GITHUB_OWNER, repo: GITHUB_REPO, per_page: 1, event: 'repository_dispatch' });
          if (runs.data.workflow_runs?.length) {
            runId = runs.data.workflow_runs[0].id;
            workflowUrl = runs.data.workflow_runs[0].html_url;
          }
        }
      } catch (e) {
        context.warn(`Could not fetch workflow run id: ${e.message}`);
      }

      return json(200, { success: true, message: 'Test execution triggered', testExecutionKey, workflowUrl, runId });
    } catch (error) {
      context.error('execute-test failed:', error.message);
      return json(500, { error: 'Failed to trigger test execution', details: error.message });
    }
  },
});

app.http('check-workflow-status', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'check-workflow-status',
  handler: async (request, context) => {
    try {
      const runId = request.query.get('runId');
      if (!runId) return json(400, { error: 'Run ID is required' });
      const response = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs/${runId}`, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'Automation-Hub' },
        validateStatus: (s) => s < 500,
      });
      if (response.status === 404 || response.status !== 200) {
        // Keep the client polling.
        return json(200, { status: 'in_progress', conclusion: null, html_url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs/${runId}` });
      }
      return json(200, { status: response.data.status, conclusion: response.data.conclusion, html_url: response.data.html_url });
    } catch (error) {
      context.error('check-workflow-status failed:', error.message);
      return json(200, { status: 'in_progress', conclusion: null, error: error.message });
    }
  },
});

app.http('get-test-report', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'get-test-report',
  handler: async (request, context) => {
    try {
      const runId = request.query.get('runId');
      if (!runId) return json(400, { error: 'Run ID is required' });
      const octokit = await octokitClient();

      const artifacts = await octokit.actions.listWorkflowRunArtifacts({ owner: GITHUB_OWNER, repo: GITHUB_REPO, run_id: Number(runId) });
      const reportArtifact = artifacts.data.artifacts.find((a) => a.name.includes('cucumber-reports') || a.name.includes('test-results'));
      if (!reportArtifact) return json(404, { error: 'Report not available', details: 'Test report artifact not found. Tests may still be running.' });

      const download = await octokit.actions.downloadArtifact({ owner: GITHUB_OWNER, repo: GITHUB_REPO, artifact_id: reportArtifact.id, archive_format: 'zip' });
      const AdmZip = require('adm-zip');
      const zip = new AdmZip(Buffer.from(download.data));
      const entries = zip.getEntries();

      let htmlEntry =
        entries.find((e) => e.entryName.includes('enhanced-report/index.html')) ||
        entries.find((e) => e.entryName.includes('cucumber-report.html')) ||
        entries.find((e) => e.entryName.endsWith('.html'));
      if (!htmlEntry) return json(404, { error: 'Report file not found in artifact' });

      let reportHtml = htmlEntry.getData().toString('utf8');
      if (htmlEntry.entryName.includes('enhanced-report/index.html')) {
        entries
          .filter((e) => e.entryName.includes('enhanced-report/'))
          .forEach((e) => {
            const fileName = e.entryName.split('/').pop();
            if (e.entryName.endsWith('.css')) {
              reportHtml = reportHtml.replace(new RegExp(`<link[^>]*href=["'].*${fileName}["'][^>]*>`, 'g'), `<style>${e.getData().toString('utf8')}</style>`);
            } else if (e.entryName.endsWith('.js')) {
              reportHtml = reportHtml.replace(new RegExp(`<script[^>]*src=["'].*${fileName}["'][^>]*></script>`, 'g'), `<script>${e.getData().toString('utf8')}</script>`);
            }
          });
      }

      return { status: 200, headers: { 'Content-Type': 'text/html' }, body: reportHtml };
    } catch (error) {
      context.error('get-test-report failed:', error.message);
      return json(500, { error: 'Failed to fetch test report', details: error.message });
    }
  },
});
