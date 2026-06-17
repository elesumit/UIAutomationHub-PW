import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from a .env file if present
dotenv.config();

console.log('Initializing nodemailer transporter...');

// Store execution start time
let executionStartTime: Date | null = null;

// Configure your email transport options
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com', // SMTP server
  port: parseInt(process.env.SMTP_PORT || '587'), // SMTP port
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // SMTP username
    pass: process.env.SMTP_PASS, // SMTP password or app-specific password
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS is set:', !!process.env.SMTP_PASS);
console.log('EMAIL_RECIPIENTS:', process.env.EMAIL_RECIPIENTS);
console.log('Nodemailer transporter initialized.');

// Function to send an email
export const sendEmail = async (subject: string, text: string): Promise<void> => {
  try {
    // Check if required environment variables are set
    if (!process.env.EMAIL_RECIPIENTS || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email configuration not complete. Skipping email notification.');
      return;
    }

    const recipients = process.env.EMAIL_RECIPIENTS.split(',');

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipients,
      subject: subject,
      html: text, // Use HTML instead of plain text
      text: text.replace(/<[^>]*>/g, ''), // Fallback plain text
    };

    console.log(`Sending email: ${subject}`);

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.log(`Email error: ${error}`);
  }
};

// Function to send test start notification
export const sendTestStartNotification = async (): Promise<void> => {
  const currentTime = new Date();
  executionStartTime = currentTime; // Store start time
  const currentTimeString = currentTime.toLocaleString();
  const environment = process.env.SUITE_NAME || 'QA';
  const viewportSetting = process.env.VIEWPORT_SETTING || 'Desktop';
  const formattedViewport = viewportSetting.charAt(0).toUpperCase() + viewportSetting.slice(1).toLowerCase();
  
  const subject = `Automation Test Execution Started on ${environment} in: ${formattedViewport} view`;
  const text = `
  <html>
  <body style="font-family: Arial, sans-serif; margin: 20px;">
    <h2 style="color: #333;">Test Execution Started</h2>
    
    <p>Test execution has started with the following configuration:</p>
    
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li><strong>Environment:</strong> ${environment}</li>
      <li><strong>Viewport:</strong> ${formattedViewport} view</li>
      <li><strong>Started at:</strong> ${currentTimeString}</li>
      <li><strong>Project:</strong> NWIE Automation Playwright</li>
    </ul>
    
    <p style="margin-top: 20px;">This is an automated notification from your test suite.</p>
    
    <p style="margin-top: 20px;">
      Regards,<br/>
      <strong>Automation Team</strong>
    </p>
  </body>
  </html>
  `;

  await sendEmail(subject, text);
};

// Interface for feature-level test results
interface FeatureStats {
  name: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

// Function to send test completion notification
export const sendTestCompletionNotification = async (
  featureResults: FeatureStats[]
): Promise<void> => {
  const currentTime = new Date();
  const currentTimeString = currentTime.toLocaleString();
  const environment = process.env.SUITE_NAME || 'UAT';
  const viewportSetting = process.env.VIEWPORT_SETTING || 'Desktop';
  const formattedViewport = viewportSetting.charAt(0).toUpperCase() + viewportSetting.slice(1).toLowerCase();
  
  // Calculate execution duration
  let executionDuration = 'N/A';
  let executionStartTimeString = 'N/A';
  
  if (executionStartTime) {
    const durationMs = currentTime.getTime() - executionStartTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    executionDuration = `${hours}h ${minutes}m ${seconds}s`;
    executionStartTimeString = executionStartTime.toLocaleString();
  }
  
  // Calculate totals across all features
  const totals = featureResults.reduce((acc, feature) => ({
    total: acc.total + feature.total,
    passed: acc.passed + feature.passed,
    failed: acc.failed + feature.failed,
    skipped: acc.skipped + feature.skipped
  }), { total: 0, passed: 0, failed: 0, skipped: 0 });
  
  const subject = `Automation Test Execution Completed on ${environment} in: ${formattedViewport} view`;
  
  // Generate feature rows for HTML table
  const featureRows = featureResults.map(feature => {
    return `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${feature.name}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${feature.total}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${feature.passed}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${feature.failed}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${feature.skipped}</td>
    </tr>`;
  }).join('');
  
  const text = `
  <html>
  <body style="font-family: Arial, sans-serif; margin: 20px;">
    <h2 style="color: #333;">Automation Test Execution Summary Report</h2>
    
    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Feature Name</th>
          <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Total Test</th>
          <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Passed</th>
          <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Failed</th>
          <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Skipped</th>
        </tr>
      </thead>
      <tbody>
        ${featureRows}
        <tr style="background-color: #e8f4f8; font-weight: bold;">
          <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">TOTAL</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${totals.total}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${totals.passed}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${totals.failed}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${totals.skipped}</td>
        </tr>
      </tbody>
    </table>
    
    <h3 style="color: #333;">Execution Information:</h3>
    <ul style="margin: 10px 0;">
      <li><strong>Environment:</strong> ${environment}</li>
      <li><strong>Viewport:</strong> ${formattedViewport} view</li>
      <li><strong>Started at:</strong> ${executionStartTimeString}</li>
      <li><strong>Completed at:</strong> ${currentTimeString}</li>
      <li><strong>Total Execution Time:</strong> ${executionDuration}</li>
    </ul>
    
    <p style="margin-top: 20px;"><strong>Note:</strong> Please refer the results for detailed analysis.</p>
    
    <p style="margin-top: 20px;">
      Regards,<br/>
      <strong>Automation Team</strong>
    </p>
  </body>
  </html>
  `;

  await sendEmail(subject, text);
};