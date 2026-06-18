#!/usr/bin/env node

/**
 * Wrapper script to run tests and always upload to Xray (even on failure)
 * Usage: node scripts/run-with-xray.js <test-command>
 * Example: node scripts/run-with-xray.js "npm run test:smoke"
 */

const { spawn } = require('child_process');

const testCommand = process.argv[2];

if (!testCommand) {
  console.error('❌ Error: No test command provided');
  console.log('Usage: node scripts/run-with-xray.js <test-command>');
  process.exit(1);
}

console.log(`🚀 Running: ${testCommand}`);

// Parse command and args
const [cmd, ...args] = testCommand.split(' ');

// Run the test command
const testProcess = spawn(cmd, args, {
  stdio: 'inherit',
  shell: true,
});

testProcess.on('close', (code) => {
  console.log(`\n📊 Tests completed with exit code: ${code}`);
  console.log('📤 Uploading results to Xray...\n');

  // Always run xray upload regardless of test result
  const xrayProcess = spawn('npm', ['run', 'xray:upload'], {
    stdio: 'inherit',
    shell: true,
  });

  xrayProcess.on('close', (xrayCode) => {
    if (xrayCode === 0) {
      console.log('\n✅ Xray upload completed successfully');
    } else {
      console.log('\n⚠️ Xray upload failed');
    }
    
    // Exit with original test exit code
    process.exit(code);
  });

  xrayProcess.on('error', (err) => {
    console.error('❌ Failed to run xray upload:', err);
    process.exit(code);
  });
});

testProcess.on('error', (err) => {
  console.error('❌ Failed to run test command:', err);
  process.exit(1);
});
