# 🤖 AI Test Generator

AI-powered test case generator using GitHub Copilot API. Describe your test in plain English, and AI generates detailed Gherkin scenarios.

## Features

- 🤖 **AI-Powered Generation** - Uses GitHub Copilot (GPT-4) to generate test cases
- 📝 **Natural Language Input** - Describe tests in plain English
- ✨ **Context-Aware** - Learns from your existing test cases
- 🎯 **Application-Specific** - Supports CE Portal, Salesforce, or both
- 📋 **Multiple Test Types** - Error validation, happy path, end-to-end
- 💾 **GitHub Integration** - Save generated tests directly to repository
- ✏️ **Editable Preview** - Review and edit before saving

## Prerequisites

1. **GitHub Copilot Business/Enterprise** subscription
2. **GitHub Personal Access Token** with `copilot` scope

## Setup

### 1. Install Dependencies

```bash
cd tools/ai-test-generator
npm install
```

### 2. Configure GitHub Token

Add to your `.env` file in the project root:

```env
GITHUB_COPILOT_TOKEN=ghp_your_token_here
GITHUB_OWNER=project-atlas
GITHUB_REPO=Testing-Automation-PlayWright
AI_GENERATOR_PORT=3002
```

### 3. Generate GitHub Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `copilot` (GitHub Copilot access)
   - ✅ `read:org` (Read org membership)
4. Generate and copy the token
5. Add to `.env` as `GITHUB_COPILOT_TOKEN`

## Usage

### Start the Server

```bash
npm start
```

Or with auto-reload:

```bash
npm run dev
```

### Access the UI

Open browser: http://localhost:3002

### Generate Test Cases

1. **Describe your test** in plain English:
   ```
   Validate all error messages when mandatory fields are missing in CE Portal case creation
   ```

2. **Select application**: CE Portal, Salesforce, or Both

3. **Select test type**: Error Validation, Happy Path, or End-to-End

4. **Click "Generate Test Cases with AI"**

5. **Review and edit** the generated scenarios

6. **Save to GitHub** or copy to clipboard

## Example Descriptions

- "Validate error messages when mandatory fields are missing in CE Portal"
- "Create a case in CE Portal and verify it appears in Salesforce"
- "Test case creation with all valid data and verify priority is set correctly"
- "Verify user cannot submit case without selecting a product"
- "Test file upload functionality in case creation"

## How It Works

1. **Context Building** - Reads your existing feature files as examples
2. **Prompt Engineering** - Builds context-aware prompt with step definitions
3. **AI Generation** - Calls GitHub Copilot API with GPT-4 model
4. **Response Parsing** - Extracts and formats Gherkin scenarios
5. **Preview & Edit** - Shows generated content for review
6. **GitHub Save** - Commits to repository via GitHub API

## API Endpoints

### `GET /api/health`
Health check and configuration status

### `POST /api/generate`
Generate test cases from description

**Request:**
```json
{
  "description": "Validate error messages when mandatory fields missing",
  "application": "CE Portal",
  "testType": "Error Validation"
}
```

**Response:**
```json
{
  "success": true,
  "content": "Feature: ...",
  "metadata": {
    "model": "gpt-4",
    "application": "CE Portal",
    "testType": "Error Validation",
    "generatedAt": "2026-04-07T11:05:00Z"
  }
}
```

### `POST /api/save-to-github`
Save generated test to GitHub

**Request:**
```json
{
  "content": "Feature: ...",
  "filename": "error_validation.feature"
}
```

## Troubleshooting

### "GitHub Copilot token not configured"
- Ensure `GITHUB_COPILOT_TOKEN` is set in `.env` file
- Verify token has `copilot` scope

### "Failed to generate test cases"
- Check token is valid: https://github.com/settings/tokens
- Verify you have Copilot Business/Enterprise (not Individual)
- Check server logs for detailed error

### "Failed to save to GitHub"
- Verify `GITHUB_OWNER` and `GITHUB_REPO` in `.env`
- Ensure token has `repo` scope
- Check you have write access to the repository

## Uninstall

To completely remove the AI Test Generator:

```bash
# Stop the server (Ctrl+C)
# Delete the folder
rm -rf tools/ai-test-generator
```

No other files are modified - completely standalone!

## Tech Stack

- **Backend**: Node.js + Express
- **AI**: GitHub Copilot API (GPT-4)
- **GitHub**: Octokit REST API
- **Frontend**: Vanilla HTML/CSS/JavaScript

## Port

Default: `3002` (configurable via `AI_GENERATOR_PORT` in `.env`)

## License

ISC
