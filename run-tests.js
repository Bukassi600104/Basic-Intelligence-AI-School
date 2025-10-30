#!/usr/bin/env node

/**
 * Playwright Test Runner Helper
 * Quick script to check setup and run tests
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎭 Playwright Test Runner\n');
console.log('=' .repeat(50));

// Check if .env.test.local exists
const envPath = path.join(__dirname, '.env.test.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env.test.local file not found!');
  console.log('\nPlease create .env.test.local with your credentials:');
  console.log('');
  console.log('ADMIN_EMAIL=your-email@basicai.fit');
  console.log('ADMIN_PASSWORD=your-password');
  console.log('BASE_URL=https://www.basicai.fit');
  console.log('');
  process.exit(1);
}

// Load and check credentials
const envContent = fs.readFileSync(envPath, 'utf8');
const hasEmail = /ADMIN_EMAIL=.+@.+/.test(envContent);
const hasPassword = /ADMIN_PASSWORD=.+/.test(envContent);
const hasDefaultPassword = /ADMIN_PASSWORD=YourActualPassword123/.test(envContent);

if (!hasEmail || !hasPassword) {
  console.error('❌ ERROR: Missing credentials in .env.test.local');
  console.log('\nPlease update .env.test.local with your actual credentials!');
  process.exit(1);
}

if (hasDefaultPassword) {
  console.error('❌ ERROR: Please update .env.test.local with your ACTUAL password');
  console.log('\nThe default password "YourActualPassword123" is still in the file.');
  console.log('Replace it with your real admin password.');
  process.exit(1);
}

console.log('✅ Credentials configured');
console.log('✅ Test environment ready');
console.log('=' .repeat(50));
console.log('');

// Get command line argument
const mode = process.argv[2] || 'ui';

console.log('🚀 Running Playwright tests...\n');

try {
  let command;
  switch(mode) {
    case 'ui':
      console.log('📱 Opening Playwright UI Mode (interactive)...');
      command = 'npx playwright test --ui';
      break;
    case 'headed':
      console.log('👁️  Running tests with visible browser...');
      command = 'npx playwright test --headed';
      break;
    case 'debug':
      console.log('🐛 Running tests in debug mode...');
      command = 'npx playwright test --debug';
      break;
    case 'report':
      console.log('📊 Opening test report...');
      command = 'npx playwright show-report';
      break;
    default:
      console.log('🏃 Running tests (headless)...');
      command = 'npx playwright test';
  }
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✅ Tests completed!');
  
} catch (error) {
  console.error('\n❌ Tests failed or were interrupted');
  process.exit(1);
}
