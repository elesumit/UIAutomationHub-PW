# ScriptlessIQ Test Automation Framework - Architecture

## 🏗️ Framework Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TEST AUTOMATION FRAMEWORK                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           FEATURE LAYER (BDD)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  • Gherkin Feature Files (.feature)                                     │
│  • Scenario Outlines with Data Tables                                   │
│  • Tags: @smoke, @regression, @XSP-XX                                   │
│  • Business-Readable Test Cases                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         STEP DEFINITIONS LAYER                           │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │ Navigation   │  │ Form Steps   │  │ Verification │  │   Hooks     ││
│  │   Steps      │  │              │  │    Steps     │  │             ││
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├─────────────┤│
│  │ • Click      │  │ • Enter Text │  │ • Assert     │  │ • Before    ││
│  │ • Navigate   │  │ • Select     │  │ • Verify     │  │ • After     ││
│  │ • Wait       │  │ • Upload     │  │ • Capture    │  │ • Screenshot││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        PAGE OBJECT MODEL (POM)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  CE Portal   │  │  Salesforce  │  │   Common     │                 │
│  │    Pages     │  │    Pages     │  │   Elements   │                 │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤                 │
│  │ • LoginPage  │  │ • LoginPage  │  │ • Buttons    │                 │
│  │ • CasePage   │  │ • CasePage   │  │ • Inputs     │                 │
│  │ • SupportPg  │  │ • SearchPage │  │ • Dropdowns  │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                           UTILITIES LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │ LocatorPro   │  │ ReportLogger │  │ ConfigMgr    │  │ DataHelper  ││
│  │   Wrapper    │  │              │  │              │  │             ││
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├─────────────┤│
│  │ • Smart      │  │ • Console    │  │ • Env Vars   │  │ • CSV       ││
│  │   Locators   │  │ • File Logs  │  │ • Profiles   │  │ • JSON      ││
│  │ • Fallbacks  │  │ • HTML       │  │ • Secrets    │  │ • Excel     ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        PLAYWRIGHT TEST RUNNER                            │
├─────────────────────────────────────────────────────────────────────────┤
│  • Browser Automation (Chromium, Firefox, WebKit)                       │
│  • Parallel Execution                                                    │
│  • Auto-waiting & Retry Logic                                           │
│  • Screenshot & Video Recording                                         │
│  • Network Interception                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                          REPORTING & CI/CD                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │   HTML       │  │    JUnit     │  │  Cucumber    │  │   GitHub    ││
│  │   Report     │  │    XML       │  │    JSON      │  │  Artifacts  ││
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├─────────────┤│
│  │ • Visual     │  │ • Xray       │  │ • Detailed   │  │ • Reports   ││
│  │ • Interactive│  │   Integration│  │   Steps      │  │ • Logs      ││
│  │ • Screenshots│  │ • Jira Sync  │  │ • Metrics    │  │ • Videos    ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

## 🔑 Key Features

### **1. BDD Framework (Cucumber + Playwright)**
- Gherkin syntax for business-readable tests
- Reusable step definitions
- Data-driven testing with Scenario Outlines

### **2. Smart Locator Strategy (LocatorPro)**
- Intelligent element detection
- Multiple fallback strategies
- Text-based, role-based, and attribute-based locators

### **3. Robust Reporting**
- HTML reports with screenshots
- JUnit XML for CI/CD integration
- Xray integration for Jira test management

### **4. Environment Management**
- Multiple environment support (QA, UAT, Prod)
- Secure credential management
- Profile-based execution (smoke, regression)

### **5. CI/CD Ready**
- GitHub Actions integration
- Slack notifications
- Automated test execution on PR/merge
