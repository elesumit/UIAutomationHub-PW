# Slack Notifications Configuration

## Overview

The framework supports Slack notifications for test execution status. You can control whether notifications are sent using environment variables.

## Environment Variables

### `ENABLE_SLACK_NOTIFICATIONS`

Controls whether Slack notifications are sent.

- **`true`** (default) - Slack notifications are enabled
- **`false`** - Slack notifications are disabled

### `SLACK_WEBHOOK_URL`

The Slack webhook URL to send notifications to.

## Configuration

### 1. Create/Update `.env` file

```bash
# Enable or disable Slack notifications
ENABLE_SLACK_NOTIFICATIONS=true

# Slack webhook URL
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 2. Disable Slack Notifications

To disable Slack notifications, set the flag to `false`:

```bash
ENABLE_SLACK_NOTIFICATIONS=false
```

## Usage Examples

### Enable Notifications (Default)

```bash
# In .env file
ENABLE_SLACK_NOTIFICATIONS=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Disable Notifications

```bash
# In .env file
ENABLE_SLACK_NOTIFICATIONS=false
```

### Temporary Override (Command Line)

```bash
# Disable for a single run
ENABLE_SLACK_NOTIFICATIONS=false npm run test:smoke

# Enable for a single run
ENABLE_SLACK_NOTIFICATIONS=true npm run test:smoke
```

## Notification Types

The framework sends two types of Slack notifications:

### 1. Start Notification
Sent when test execution begins (GitHub Actions only)

```
🚀 Test Execution Started
━━━━━━━━━━━━━━━━━━━━━━━━
Profile: smoke
Triggered by: @username
Branch: main
Workflow: #123
Environment: GITHUB_ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2. Completion Notification
Sent when test execution completes

```
✅ Test Execution Completed Successfully
━━━━━━━━━━━━━━━━━━━━━━━━
Total: 10 | Passed: 10 ✅ | Failed: 0 ❌
Duration: 2m 30s
Environment: LOCAL
━━━━━━━━━━━━━━━━━━━━━━━━
View Report | Jira Execution
```

## Behavior by Environment

### Local Execution
- Notifications sent from `hooks.ts` (AfterAll)
- Xray upload script sends additional notification with Jira link
- Both respect `ENABLE_SLACK_NOTIFICATIONS` flag

### GitHub Actions
- Notifications sent from workflow (not from hooks)
- Single comprehensive message with test results and Jira link
- Respects `ENABLE_SLACK_NOTIFICATIONS` secret

## GitHub Actions Configuration

Add the environment variable as a secret or variable:

```yaml
env:
  ENABLE_SLACK_NOTIFICATIONS: ${{ secrets.ENABLE_SLACK_NOTIFICATIONS || 'true' }}
  SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Troubleshooting

### Notifications Not Sending

1. Check `ENABLE_SLACK_NOTIFICATIONS` is set to `true`
2. Verify `SLACK_WEBHOOK_URL` is correctly configured
3. Check console logs for "Slack notifications disabled" message
4. Verify webhook URL is valid and active

### Console Messages

When disabled:
```
Slack notifications disabled (ENABLE_SLACK_NOTIFICATIONS=false)
```

When webhook URL is missing:
```
(No message - silently skips)
```

When send fails:
```
Slack send failed (ignored): <error message>
```

## Best Practices

1. **Development**: Set to `false` to avoid spam during development
2. **CI/CD**: Set to `true` to get notifications for automated runs
3. **Local Testing**: Use command-line override for one-off runs
4. **Team Channels**: Use different webhooks for different environments

## Example Workflows

### Development Workflow
```bash
# .env file
ENABLE_SLACK_NOTIFICATIONS=false
```

### CI/CD Workflow
```bash
# GitHub Secrets
ENABLE_SLACK_NOTIFICATIONS=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/TEAM/CHANNEL/TOKEN
```

### Selective Notification
```bash
# Run without notifications
ENABLE_SLACK_NOTIFICATIONS=false npm run test:smoke

# Run with notifications
ENABLE_SLACK_NOTIFICATIONS=true npm run test:regression
```
