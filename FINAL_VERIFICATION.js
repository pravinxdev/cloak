#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

const c = (str, color) => `${color}${str}${colors.reset}`;

function test(name, cmd) {
  try {
    console.log(`\n${c('Testing:', colors.blue)} ${name}`);
    const result = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`${c('✅ PASS', colors.green)} - ${name}`);
    return true;
  } catch (err) {
    console.log(`${c('❌ FAIL', colors.red)} - ${name}`);
    console.log(`   Error: ${err.message.slice(0, 100)}`);
    return false;
  }
}

async function runTests() {
  console.log(`\n${c('═══════════════════════════════════════════', colors.bold)}`);
  console.log(`${c('🧪 FINAL VERIFICATION TEST SUITE', colors.bold)}`);
  console.log(`${c('═══════════════════════════════════════════', colors.bold)}\n`);

  let passed = 0;
  let failed = 0;

  // 1. Version
  if (test('Version Check', 'cloakx --version')) passed++; else failed++;

  // 2. Help
  if (test('Help Command', 'cloakx help')) passed++; else failed++;

  // 3. Status
  if (test('Status Check', 'cloakx status')) passed++; else failed++;

  // 4. List
  if (test('List Secrets', 'cloakx list')) passed++; else failed++;

  // 5. Get Secret
  if (test('Get Single Secret', 'cloakx get db')) passed++; else failed++;

  // 6. Set Secret
  if (test('Set Secret', 'cloakx set TEST_VAR test_value')) passed++; else failed++;

  // 7. Update Secret
  if (test('Update Secret', 'cloakx upd TEST_VAR test_value_updated')) passed++; else failed++;

  // 8. List with filter
  if (test('List Specific Key', 'cloakx list')) passed++; else failed++;

  // 9. Encrypt
  if (test('Encrypt Text', 'cloakx encrypt "test message"')) passed++; else failed++;

  // 10. Export
  if (test('Export Secrets', 'cloakx export')) passed++; else failed++;

  // 11. Environment List
  if (test('Env List', 'cloakx env list')) passed++; else failed++;

  // 12. Environment Current
  if (test('Env Current', 'cloakx env current')) passed++; else failed++;

  // 13. Delete Secret
  if (test('Delete Secret', 'cloakx del TEST_VAR')) passed++; else failed++;

  // 14. Help for specific command
  if (test('Help Get Command', 'cloakx help get')) passed++; else failed++;

  // 15. Sync (basic check)
  if (test('Sync Command', 'cloakx sync')) passed++; else failed++;

  // Report
  console.log(`\n${c('═══════════════════════════════════════════', colors.bold)}`);
  console.log(`${c('📊 TEST RESULTS', colors.bold)}`);
  console.log(`${c('═══════════════════════════════════════════', colors.bold)}\n`);
  console.log(`${c(`✅ Passed: ${passed}`, colors.green)}`);
  console.log(`${c(`❌ Failed: ${failed}`, colors.red)}`);
  console.log(`${c(`📈 Total: ${passed + failed}`, colors.blue)}`);
  console.log(`${c(`✨ Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`, colors.yellow)}\n`);

  return failed === 0;
}

runTests().then(success => {
  process.exit(success ? 0 : 1);
});
