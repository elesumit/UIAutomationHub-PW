
import * as dotenv from 'dotenv';
dotenv.config(); // existing env vars take priority over .env file

// Helper to get env-specific values
// Helper to get Salesforce env config
function getSalesforceEnvConfig(env: string) {
  switch (env) {
    case 'QA':
      return {
        baseUrl: process.env.SF_QA_URL || '',
        username: process.env.SF_QA_USERNAME || '',
        password: process.env.SF_QA_PASSWORD || '',
      };
    case 'UAT':
      return {
        baseUrl: process.env.SF_UAT_URL || '',
        username: process.env.SF_UAT_USERNAME || '',
        password: process.env.SF_UAT_PASSWORD || '',
      };
    case 'DEV':
      return {
        baseUrl: process.env.SF_DEV_URL || '',
        username: process.env.SF_DEV_USERNAME || '',
        password: process.env.SF_DEV_PASSWORD || '',
      };
    default:
      return {
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        username: process.env.SF_USERNAME || '',
        password: process.env.SF_PASSWORD || '',
      };
  }
}



// Helper to get CE Portal env config
function getCEPortalEnvConfig(env: string) {
  switch (env) {
    case 'QA':
      return {
        baseUrl: process.env.CE_QA_URL || '',
        username: process.env.CE_QA_USERNAME || '',
        password: process.env.CE_QA_PASSWORD || '',
      };
    case 'UAT':
      return {
        baseUrl: process.env.CE_UAT_URL || '',
        username: process.env.CE_UAT_USERNAME || '',
        password: process.env.CE_UAT_PASSWORD || '',
      };
    case 'DEV':
      return {
        baseUrl: process.env.CE_DEV_URL || '',
        username: process.env.CE_DEV_USERNAME || '',
        password: process.env.CE_DEV_PASSWORD || '',
      };
    default:
      return {
        baseUrl: '',
        username: '',
        password: '',
      };
  }
}

// Use SF_EXECUTION_ENV and CE_Portal_Execution_Env from .env
const SF_ENV = (process.env.SF_EXECUTION_ENV || 'QA').trim().toUpperCase();
const CE_ENV = (process.env.CE_Portal_Execution_Env || 'QA').trim().toUpperCase();


export const config = {
  salesforce: getSalesforceEnvConfig(SF_ENV),
  cePortal: getCEPortalEnvConfig(CE_ENV),
  headless: process.env.HEADLESS !== 'false',
  browser: process.env.BROWSER || 'chromium',
  timeout: parseInt(process.env.TIMEOUT || '30000', 10),
  viewport: {
    width: 1920,
    height: 1080,
  },
  slowMo: parseInt(process.env.SLOW_MO || '0', 10),
  video: process.env.VIDEO === 'true',
  screenshot: process.env.SCREENSHOT || 'only-on-failure',
  trace: process.env.TRACE || 'on-first-retry',
  SF_ENV,
  CE_ENV,
};

export default config;
