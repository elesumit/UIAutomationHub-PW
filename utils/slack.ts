import axios from "axios";

export async function sendSlack(text: string) {
  // Check if Slack notifications are enabled
  const isEnabled = process.env.ENABLE_SLACK_NOTIFICATIONS !== 'false';
  if (!isEnabled) {
    console.log("Slack notifications disabled (ENABLE_SLACK_NOTIFICATIONS=false)");
    return;
  }

  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return; // don't fail local runs if missing

  try {
    await axios.post(url, { text }, { timeout: 15000 });
  } catch (e) {
    console.log("Slack send failed (ignored):", (e as any)?.message ?? e);
  }
}

export async function sendSlackStartNotification(profile: string, triggeredBy: string, branch: string, workflowRun: string) {
  const message = `🚀 *Test Execution Started*
━━━━━━━━━━━━━━━━━━━━━━━━
*Profile:* ${profile}
*Triggered by:* @${triggeredBy}
*Branch:* ${branch}
*Workflow:* #${workflowRun}
*Environment:* ${process.env.ENV ?? "LOCAL"}
━━━━━━━━━━━━━━━━━━━━━━━━`;

  await sendSlack(message);
}

export async function sendSlackCompletionNotification(
  total: number,
  passed: number,
  failed: number,
  duration: string,
  reportUrl?: string,
  jiraUrl?: string
) {
  const status = failed > 0 ? "❌" : "✅";
  const statusText = failed > 0 ? "Test Execution Completed with Failures" : "Test Execution Completed Successfully";
  
  let message = `${status} *${statusText}*
━━━━━━━━━━━━━━━━━━━━━━━━
*Total:* ${total} | *Passed:* ${passed} ✅ | *Failed:* ${failed} ❌
*Duration:* ${duration}
*Environment:* ${process.env.ENV ?? "LOCAL"}
━━━━━━━━━━━━━━━━━━━━━━━━`;

  if (reportUrl || jiraUrl) {
    const links = [];
    if (reportUrl) links.push(`<${reportUrl}|View Report>`);
    if (jiraUrl) links.push(`<${jiraUrl}|Jira Execution>`);
    message += `\n${links.join(" | ")}`;
  }

  await sendSlack(message);
}
