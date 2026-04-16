// Comprehensive test suite with authentication
// Password: pravin

const readline = require('readline');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const tests = [];
let loginSession = null;

async function runTest(name, command, description = '') {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 TEST: ${name}`);
  if (description) console.log(`   ${description}`);
  console.log(`⚙️  Command: ${command}`);
  console.log('-'.repeat(60));

  try {
    const { stdout, stderr } = await execAsync(command, { 
      timeout: 10000,
      shell: 'powershell.exe'
    });
    
    if (stderr && !stderr.includes('Warning')) {
      console.log(`❌ ERROR: ${stderr}`);
      tests.push({ name, status: 'FAILED', error: stderr });
    } else {
      console.log(`✅ OUTPUT:\n${stdout}`);
      tests.push({ name, status: 'PASSED' });
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    tests.push({ name, status: 'FAILED', error: error.message });
  }
}

async function testLoginFlow() {
  console.log('\n' + '█'.repeat(60));
  console.log('🔑 PHASE 1: AUTHENTICATION & SESSION');
  console.log('█'.repeat(60));

  // Test status before login
  await runTest(
    'Status Before Login',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js status',
    'Should show "Not logged in"'
  );

  console.log('\n⏳ Testing auto-login with password...\n');
  
  // Test login - we need to pass password via environment or stdin
  try {
    const { stdout, stderr } = await execAsync(
      'echo pravin | node d:\\projects\\npm\\cloak\\dist\\src\\index.js login',
      { 
        timeout: 10000,
        shell: 'powershell.exe'
      }
    );
    console.log('✅ Login attempt output:');
    console.log(stdout);
    if (stderr) console.log('Warnings:', stderr);
    tests.push({ name: 'Login Flow', status: 'PASSED' });
  } catch (error) {
    console.log(`⚠️  Login requires interactive input: ${error.message}`);
  }

  // Test status after login setup
  await runTest(
    'Status After Setup',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js status',
    'Should show session info'
  );
}

async function testSecretOperations() {
  console.log('\n' + '█'.repeat(60));
  console.log('🔐 PHASE 2: SECRET MANAGEMENT OPERATIONS');
  console.log('█'.repeat(60));

  // Test SET command with various inputs
  await runTest(
    'Set Secret - Simple',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js set DB_PASSWORD mysecretpass',
    'Store a simple secret'
  );

  await runTest(
    'Set Secret - With Special Chars',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js set API_KEY "sk-proj-abc123!@#$%^&*()"',
    'Test special characters in value'
  );

  await runTest(
    'Set Secret - Long Value',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js set LONG_KEY "' + 'x'.repeat(100) + '"',
    'Test long string handling'
  );

  await runTest(
    'Set Secret - With Tags',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js set JWT_SECRET secret123 --tags production,auth',
    'Store with tags'
  );

  await runTest(
    'Set Secret - With Expiration',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js set TEMP_TOKEN token123 --expires 7d',
    'Store with expiration'
  );

  // Test GET command
  await runTest(
    'Get Secret - Existing',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js get DB_PASSWORD',
    'Retrieve stored secret'
  );

  await runTest(
    'Get Secret - Non-existent',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js get NON_EXISTENT_KEY',
    'Should return error'
  );

  // Test LIST command
  await runTest(
    'List Secrets - All',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js list',
    'Show all stored secrets'
  );

  await runTest(
    'List Secrets - With Filter',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js list --filter PASS',
    'Filter by keyword'
  );

  // Test UPDATE command
  await runTest(
    'Update Secret - Change Value',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js update DB_PASSWORD newpassword123',
    'Modify existing secret'
  );

  // Test DELETE command
  await runTest(
    'Delete Secret - Existing',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js del TEMP_TOKEN',
    'Remove a secret'
  );

  await runTest(
    'Delete Secret - Non-existent',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js del NON_EXISTENT_KEY',
    'Should handle gracefully'
  );
}

async function testExportImport() {
  console.log('\n' + '█'.repeat(60));
  console.log('📤 PHASE 3: EXPORT & IMPORT');
  console.log('█'.repeat(60));

  await runTest(
    'Export All Secrets',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js export',
    'Export all as .env format'
  );

  await runTest(
    'Export Specific Secret',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js export DB_PASSWORD',
    'Export single secret'
  );

  // Create test file for import
  const fs = require('fs');
  const testImportFile = 'd:\\projects\\npm\\cloak\\test-import.env';
  fs.writeFileSync(testImportFile, 'TEST_VAR=testvalue123\nANOTHER_VAR=value456');

  await runTest(
    'Import From File',
    `node d:\\projects\\npm\\cloak\\dist\\src\\index.js import ${testImportFile}`,
    'Import secrets from .env file'
  );
}

async function testEnvironments() {
  console.log('\n' + '█'.repeat(60));
  console.log('🌍 PHASE 4: ENVIRONMENT MANAGEMENT');
  console.log('█'.repeat(60));

  await runTest(
    'List Environments',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js env list',
    'Show all environments'
  );

  await runTest(
    'Create Environment',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js env create staging',
    'Create new environment'
  );

  await runTest(
    'Switch Environment',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js env switch staging',
    'Switch to staging'
  );

  await runTest(
    'Switch Back to Default',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js env switch default',
    'Switch back to default'
  );
}

async function testUtilityCommands() {
  console.log('\n' + '█'.repeat(60));
  console.log('🛠️  PHASE 5: UTILITY COMMANDS');
  console.log('█'.repeat(60));

  await runTest(
    'Encrypt Text',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js encrypt "hello world"',
    'Encrypt plain text'
  );

  await runTest(
    'Decrypt Text',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js decrypt "some-encrypted-string"',
    'Attempt decrypt (may fail without valid encrypted text)'
  );

  await runTest(
    'Check Status',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js status',
    'Show current login status'
  );

  await runTest(
    'Help Command',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js help',
    'Show all available commands'
  );
}

async function testEdgeCases() {
  console.log('\n' + '█'.repeat(60));
  console.log('⚠️  PHASE 6: EDGE CASES & ERROR HANDLING');
  console.log('█'.repeat(60));

  await runTest(
    'Empty Key Name',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js set "" value',
    'Should reject empty key'
  );

  await runTest(
    'Special Characters in Key',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js set "KEY-WITH_SPECIAL.CHARS" value',
    'Should handle special chars'
  );

  await runTest(
    'Very Long Key Name',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js set "' + 'A'.repeat(300) + '" value',
    'Should handle or reject length'
  );

  await runTest(
    'Empty Value',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js set EMPTY_KEY ""',
    'Should allow empty value'
  );

  await runTest(
    'Duplicate Key',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js set DB_PASSWORD newvalue',
    'Should update existing key'
  );

  await runTest(
    'Invalid Expiration Format',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js set KEY value --expires xyz',
    'Should reject invalid expiration'
  );

  await runTest(
    'Case Sensitivity',
    'node d:\\projects\\npm\\cloak\\dist\\src\\index.js get db_password',
    'Check if keys are case-sensitive'
  );
}

async function runAllTests() {
  console.log('\n\n');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(15) + '🧪 COMPREHENSIVE BUG TEST SUITE 🧪' + ' '.repeat(9) + '║');
  console.log('║' + ' '.repeat(20) + 'Password: pravin' + ' '.repeat(22) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  await testLoginFlow();
  await testSecretOperations();
  await testExportImport();
  await testEnvironments();
  await testUtilityCommands();
  await testEdgeCases();

  // Generate report
  console.log('\n\n');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(20) + '📊 TEST RESULTS SUMMARY' + ' '.repeat(15) + '║');
  console.log('╚' + '═'.repeat(58) + '╝\n');

  const passed = tests.filter(t => t.status === 'PASSED').length;
  const failed = tests.filter(t => t.status === 'FAILED').length;
  const total = tests.length;

  console.log(`✅ PASSED: ${passed}/${total}`);
  console.log(`❌ FAILED: ${failed}/${total}`);
  console.log(`📊 Success Rate: ${((passed/total)*100).toFixed(1)}%\n`);

  console.log('Detailed Results:');
  console.log('-'.repeat(60));
  tests.forEach((test, i) => {
    const icon = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${i+1}. ${test.name}`);
    if (test.error) {
      console.log(`   Error: ${test.error.substring(0, 100)}`);
    }
  });

  console.log('\n' + '═'.repeat(60));
  console.log('🎯 COMMON BUGS TO CHECK:');
  console.log('═'.repeat(60));
  console.log(`
1. ❓ Key validation - Do special characters work?
2. ❓ Value escaping - Do quotes and backslashes work?
3. ❓ Empty values - Can you store empty strings?
4. ❓ Case sensitivity - Are keys case-sensitive?
5. ❓ Length limits - Any size restrictions?
6. ❓ Expiration - Does --expires flag work?
7. ❓ Tags - Are tags properly stored/retrieved?
8. ❓ Filter - Does list --filter work?
9. ❓ Overwrite - Does update replace values?
10. ❓ Error messages - Are errors clear and helpful?
  `);
}

// Run all tests
runAllTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
