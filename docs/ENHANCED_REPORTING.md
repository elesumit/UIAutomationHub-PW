# Enhanced HTML Reporting with Pie Charts

## Overview

The Everest Framework now includes **enhanced HTML reporting** with visual analytics similar to Allure and Extent reports. The reports feature:

- 📊 **Pie charts** for test status distribution
- 📈 **Bar charts** for feature-level statistics
- 🎨 **Beautiful gradient UI** with modern design
- 📸 **Embedded screenshots** for visual verification
- ⏱️ **Execution time tracking** and performance metrics
- 📱 **Responsive design** for mobile and desktop viewing

---

## 🚀 Quick Start

### Generate Enhanced Report

```bash
# Run tests and generate enhanced report
npm run test:report:headed

# Or run tests first, then generate report
npm run test:with-screenshots:headed
npm run generate-report
```

### View Report

```bash
# Report location
test-results/enhanced-report/index.html

# Open in browser (Windows)
start test-results/enhanced-report/index.html

# Open in browser (Mac)
open test-results/enhanced-report/index.html

# Open in browser (Linux)
xdg-open test-results/enhanced-report/index.html
```

---

## 📊 Report Features

### 1. **Pie Chart - Test Status Distribution**

Visual breakdown of test results:
- ✅ **Passed** (Green) - Successful scenarios
- ❌ **Failed** (Red) - Failed scenarios
- ⏭️ **Skipped** (Yellow) - Skipped scenarios
- ⏸️ **Pending** (Gray) - Pending scenarios

### 2. **Bar Charts - Feature Statistics**

- Scenarios per feature
- Steps per feature
- Pass/fail ratio per feature
- Execution time per feature

### 3. **Summary Cards**

Gradient cards showing:
- Total scenarios
- Total steps
- Pass percentage
- Execution time
- Browser information
- Platform details

### 4. **Scenario Details**

Each scenario shows:
- Status badge (Passed/Failed/Skipped)
- Execution time
- All steps with individual status
- Embedded screenshots
- Error messages (for failures)
- Stack traces (for debugging)

### 5. **Metadata Section**

- Project information
- Release version
- Execution timestamp
- Environment details
- Browser version
- Platform information

---

## 🎨 Visual Design

### Color Scheme

**Gradients:**
- Primary: Purple to Blue (`#667eea` → `#764ba2`)
- Success: Teal to Green (`#11998e` → `#38ef7d`)
- Error: Red gradient (`#eb3349` → `#f45c43`)
- Warning: Orange to Yellow (`#f2994a` → `#f2c94c`)

**Features:**
- Modern card-based layout
- Smooth animations and transitions
- Hover effects on interactive elements
- Responsive grid system
- Shadow effects for depth
- Rounded corners for modern look

---

## 📝 NPM Scripts

### Run Tests with Report Generation

```bash
# Run all tests with screenshots and generate report
npm run test:report:headed

# Run smoke tests with report
npm run test:smoke:with-screenshots
npm run generate-report

# Run regression tests with report
npm run test:regression
npm run generate-report
```

### Generate Report Only

```bash
# Generate report from existing JSON
npm run generate-report
```

---

## 🔧 Configuration

### Report Metadata

Edit `scripts/generate-report.js` to customize:

```javascript
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
}
```

### Custom Data

Add custom information to the report:

```javascript
customData: {
  title: 'Everest Playwright Test Report',
  data: [
    { label: 'Project', value: 'Everest Framework' },
    { label: 'Release', value: '1.0.0' },
    { label: 'Sprint', value: 'Sprint 23' },
    { label: 'Team', value: 'QA Automation' }
  ]
}
```

### Styling

Customize appearance in `scripts/custom-report-style.css`:

```css
/* Change primary gradient */
.page-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Customize chart colors */
.chart-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
```

---

## 📸 Screenshot Integration

Screenshots are automatically embedded when:

1. **Test fails** - Failure screenshot embedded
2. **Manual screenshot step** - `Then I take a screenshot named "name"`
3. **EMBED_SCREENSHOTS=true** - All scenarios get screenshots

### Example with Screenshots

```gherkin
@visual @report
Feature: Login with Visual Verification

  Scenario: Login flow with screenshots
    Given I navigate to "https://example.com/login"
    And I take a screenshot named "login-page"
    When I enter "user@example.com" in "Email"
    And I take a screenshot named "filled-form"
    When I click on "Login"
    Then I should see "Welcome"
    And I take a screenshot named "dashboard"
```

**Run with report:**
```bash
npm run test:report:headed
```

---

## 📊 Report Structure

```
test-results/
├── enhanced-report/
│   ├── index.html              # Main report page
│   ├── features/               # Feature-specific pages
│   ├── screenshots/            # Embedded screenshots
│   ├── assets/
│   │   ├── css/               # Report styles
│   │   ├── js/                # Chart.js and scripts
│   │   └── images/            # Icons and logos
│   └── data/
│       └── aggregated.json    # Aggregated test data
├── cucumber-report.json        # Source JSON data
├── cucumber-report.html        # Standard Cucumber report
└── screenshots/                # Screenshot files
```

---

## 🎯 Example Output

### Summary Section
```
┌─────────────────────────────────────┐
│  Everest Playwright Test Report    │
│  ─────────────────────────────────  │
│  Total Scenarios: 25                │
│  Passed: 23 (92%)                   │
│  Failed: 2 (8%)                     │
│  Execution Time: 2m 34s             │
└─────────────────────────────────────┘
```

### Pie Chart
```
     Passed (92%)
    ╱────────────╲
   │              │
   │   ✅ 23      │
   │   ❌ 2       │
   │              │
    ╲────────────╱
     Failed (8%)
```

### Feature Breakdown
```
Login Feature          ████████████ 100% (5/5)
Registration Feature   ██████████░░  83% (5/6)
Dashboard Feature      ████████████ 100% (8/8)
Profile Feature        ██████████░░  83% (5/6)
```

---

## 🔍 Comparison with Other Reporters

| Feature | Standard Cucumber | Allure | Extent | **Everest Enhanced** |
|---------|------------------|--------|--------|---------------------|
| Pie Charts | ❌ | ✅ | ✅ | ✅ |
| Bar Charts | ❌ | ✅ | ✅ | ✅ |
| Screenshots | ⚠️ Basic | ✅ | ✅ | ✅ |
| Custom Styling | ❌ | ✅ | ✅ | ✅ |
| Metadata | ⚠️ Limited | ✅ | ✅ | ✅ |
| Execution Time | ✅ | ✅ | ✅ | ✅ |
| Responsive Design | ⚠️ Basic | ✅ | ✅ | ✅ |
| Easy Setup | ✅ | ⚠️ Complex | ⚠️ Complex | ✅ |

---

## 🚀 CI/CD Integration

### Azure DevOps

```yaml
- script: |
    npm run test:report
  displayName: 'Run Tests and Generate Report'

- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'test-results/junit-report.xml'

- task: PublishBuildArtifacts@1
  inputs:
    PathtoPublish: 'test-results/enhanced-report'
    ArtifactName: 'test-report'
```

### GitHub Actions

```yaml
- name: Run tests and generate report
  run: npm run test:report

- name: Upload test report
  uses: actions/upload-artifact@v3
  with:
    name: test-report
    path: test-results/enhanced-report/
```

### Jenkins

```groovy
stage('Test and Report') {
  steps {
    sh 'npm run test:report'
    publishHTML([
      reportDir: 'test-results/enhanced-report',
      reportFiles: 'index.html',
      reportName: 'Test Report'
    ])
  }
}
```

---

## 🎨 Customization Examples

### Add Company Logo

Edit `scripts/generate-report.js`:

```javascript
customData: {
  title: 'Everest Playwright Test Report',
  data: [
    { label: 'Project', value: 'Everest Framework' },
    { label: 'Company', value: 'Your Company Name' }
  ]
},
logo: 'path/to/your/logo.png'
```

### Change Color Scheme

Edit `scripts/custom-report-style.css`:

```css
/* Blue theme */
.page-title {
  background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
}

/* Green theme */
.summary-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}
```

---

## 📚 Related Documentation

- `SCREENSHOT_EMBEDDING.md` - Screenshot configuration
- `GENERIC_STEPS_REFERENCE.md` - All available test steps
- `RUNNING_TESTS.md` - How to run tests
- `AZURE_DEVOPS_INTEGRATION.md` - CI/CD setup

---

## 🐛 Troubleshooting

### Report Not Generated

**Check:**
1. JSON report exists: `test-results/cucumber-report.json`
2. Run tests first: `npm run test:with-screenshots:headed`
3. Check for errors: `npm run generate-report`

### Charts Not Showing

**Solution:**
1. Ensure `multiple-cucumber-html-reporter` is installed
2. Clear browser cache
3. Check console for JavaScript errors

### Screenshots Missing

**Solution:**
1. Set `EMBED_SCREENSHOTS=true`
2. Ensure screenshots are taken during test
3. Check `test-results/screenshots/` directory

---

## 💡 Best Practices

### ✅ DO:
- Generate reports after every test run
- Use screenshots for visual verification
- Customize metadata for your project
- Archive reports in CI/CD
- Share reports with stakeholders

### ❌ DON'T:
- Generate reports without JSON data
- Modify report files manually
- Commit generated reports to Git
- Run report generation in parallel with tests

---

**Framework Version:** 1.0.0  
**Last Updated:** February 2026  
**Report Generator:** multiple-cucumber-html-reporter
