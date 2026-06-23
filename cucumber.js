module.exports = {
  default: {
    require: ['steps/**/*.ts', 'utils/world.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'junit:test-results/junit-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['features/**/*.feature'],
    tags: 'not @manual',
    parallel: 1,
    timeout: 60000
  },
  smoke: {
    require: ['steps/**/*.ts', 'utils/world.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'junit:test-results/junit-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['features/**/*.feature'],
    tags: '@smoke and not @manual',
    parallel: 1,
    timeout: 60000
  },
  regression: {
    require: ['steps/**/*.ts', 'utils/world.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'junit:test-results/junit-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['features/**/*.feature'],
    tags: '@regression and not @manual',
    parallel: 1,
    timeout: 60000
  },
  poc: {
    require: ['steps/**/*.ts', 'utils/world.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'junit:test-results/junit-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['features/**/*.feature'],
    tags: '@CaseCreation and not @manual',
    parallel: 1,
    timeout: 60000
  },
  critical: {
    require: ['steps/**/*.ts', 'utils/world.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'junit:test-results/junit-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['features/**/*.feature'],
    tags: '@critical and not @manual',
    parallel: 1,
    timeout: 60000
  },
  // Runs BTC-340 and BTC-341 — preprocess excel features first with: npm run preprocess:features
  btc: {
    require: ['steps/**/*.ts', 'utils/world.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'junit:test-results/junit-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['.features-generated/**/*.feature'],
    tags: '@BTC-340 or @BTC-341 or @BTC-370 or @BTC-371',
    parallel: 1,
    timeout: 120000
  },
  // Runs feature files that use "Examples: excel:..." — preprocess first with: npm run preprocess:features
  excel: {
    require: ['steps/**/*.ts', 'utils/world.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'junit:test-results/junit-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['.features-generated/**/*.feature'],
    tags: 'not @manual',
    parallel: 1,
    timeout: 60000
  }
};
