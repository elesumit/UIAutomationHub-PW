const report = require('multiple-cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

// Read the JSON report
const jsonReportPath = path.join(__dirname, '../test-results/cucumber-report.json');

if (!fs.existsSync(jsonReportPath)) {
  console.error('❌ JSON report not found. Please run tests first.');
  process.exit(1);
}

// Validate and preprocess JSON to ensure it's in the correct format
try {
  const jsonContent = fs.readFileSync(jsonReportPath, 'utf8');
  let parsedData = JSON.parse(jsonContent);
  
  // Check if data is wrapped in an object (some Cucumber versions do this)
  if (!Array.isArray(parsedData)) {
    // If it's an object with a features or elements property, extract it
    if (parsedData.features) {
      parsedData = parsedData.features;
    } else if (parsedData.elements) {
      parsedData = [parsedData]; // Wrap single feature in array
    } else {
      console.error('❌ Invalid JSON format: Expected an array or object with features');
      console.error('Received:', typeof parsedData);
      process.exit(1);
    }
  }
  
  // Ensure each item in the array is a valid feature object
  if (!parsedData.every(item => item && typeof item === 'object')) {
    console.error('❌ Invalid JSON format: Array contains non-object items');
    process.exit(1);
  }
  
  // Write back the validated JSON
  fs.writeFileSync(jsonReportPath, JSON.stringify(parsedData, null, 2));
  console.log('✅ JSON report validated and preprocessed');
  console.log(`📄 Found ${parsedData.length} feature(s)`);
} catch (error) {
  console.error('❌ Error processing JSON report:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Clean up old report directory to avoid conflicts
const reportDir = path.join(__dirname, '../test-results/enhanced-report');
if (fs.existsSync(reportDir)) {
  fs.rmSync(reportDir, { recursive: true, force: true });
  console.log('🧹 Cleaned old report directory');
}

// Generate enhanced HTML report with charts
// Note: We need to copy the JSON to a temp directory because multiple-cucumber-html-reporter
// scans the entire directory and fails on non-Cucumber JSON files
const tempDir = path.join(__dirname, '../test-results/temp-cucumber-json');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Copy only the cucumber-report.json to temp directory
fs.copyFileSync(jsonReportPath, path.join(tempDir, 'cucumber-report.json'));

report.generate({
  jsonDir: tempDir,
  reportPath: 'test-results/enhanced-report/',
  ignoreBadJsonFile: true,
  metadata: {
    browser: {
      name: process.env.BROWSER || 'chromium',
      version: 'Latest'
    },
    device: 'Local Machine',
    platform: {
      name: process.platform,
      version: process.version
    }
  },
  customData: {
    title: 'Veradigm Playwright Test Report',
    data: [
      { label: 'Project', value: 'Veradigm Framework' },
      { label: 'Release', value: '1.0.0' },
      { label: 'Execution Time', value: new Date().toLocaleString() },
      { label: 'Environment', value: process.env.NODE_ENV || 'Test' }
    ]
  },
  displayDuration: true,
  displayReportTime: true,
  pageTitle: 'Veradigm Test Report',
  reportName: 'Veradigm Automation Test Results',
  pageFooter: '<div style="text-align:center"><p>Veradigm Playwright Framework - Powered by LocatorPro</p></div>',
  customStyle: path.join(__dirname, 'custom-report-style.css'),
  openReportInBrowser: false,
  saveCollectedJSON: true,
  disableLog: false,
  
  // Chart configuration
  chartConfig: {
    style: {
      backgroundColor: '#f5f5f5',
      borderColor: '#ddd',
      borderWidth: 1
    }
  }
});

// Clean up temp directory
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('🧹 Cleaned temp directory');
}

console.log('✅ Enhanced HTML report with pie charts generated successfully!');
console.log('📊 Report location: test-results/enhanced-report/index.html');
console.log('🎯 Features: Pie charts, bar charts, scenario details, screenshots embedded');
