// Comprehensive API test with authentication
const password = 'pravin';

async function testWebAPI() {
  const baseURL = 'http://localhost:8080';
  console.log('\n╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(18) + '🌐 WEB API COMPREHENSIVE TEST 🌐' + ' '.repeat(8) + '║');
  console.log('╚' + '═'.repeat(58) + '╝\n');

  try {
    // Test 1: Login
    console.log('🔑 Test 1: API Login');
    let res = await fetch(`${baseURL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    console.log(`   Status: ${res.status}`);
    let data = await res.json();
    console.log(`   Success: ${data.success ? '✅' : '❌'}`);

    // Test 2: Get secrets
    console.log('\n📋 Test 2: Get All Secrets');
    res = await fetch(`${baseURL}/api/secrets`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Secrets count: ${Array.isArray(data) ? data.length : 0}`);
    if (Array.isArray(data) && data.length > 0) {
      console.log(`   First secret key: ${data[0].key}`);
      console.log(`   Has metadata: ${data[0].tags ? '✅' : '❌'}`);
    }

    // Test 3: Create secret
    console.log('\n➕ Test 3: Create Secret via API');
    res = await fetch(`${baseURL}/api/secrets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'API_TEST_SECRET',
        value: 'test-value-123',
        tags: ['api-test'],
        environment: 'default'
      })
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Result: ${data.success ? '✅' : '❌'}`);

    // Test 4: Get specific secret
    console.log('\n🔍 Test 4: Get Specific Secret');
    res = await fetch(`${baseURL}/api/secrets`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    const apiTest = data.find(s => s.key === 'API_TEST_SECRET');
    console.log(`   Found secret: ${apiTest ? '✅' : '❌'}`);
    if (apiTest) {
      console.log(`   Value encrypted: ${apiTest.value.includes(':') ? '✅' : '❌'}`);
      console.log(`   Has tags: ${apiTest.tags ? '✅' : '❌'}`);
    }

    // Test 5: Update secret
    console.log('\n♻️  Test 5: Update Secret');
    res = await fetch(`${baseURL}/api/secrets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'API_TEST_SECRET',
        value: 'updated-value-456',
        tags: ['api-test', 'updated']
      })
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Result: ${data.success ? '✅' : '❌'}`);

    // Test 6: Delete secret
    console.log('\n🗑️  Test 6: Delete Secret');
    res = await fetch(`${baseURL}/api/secrets/API_TEST_SECRET`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Result: ${data.success ? '✅' : '❌'}`);

    // Test 7: Verify deletion
    console.log('\n✔️  Test 7: Verify Deletion');
    res = await fetch(`${baseURL}/api/secrets`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    data = await res.json();
    const deleted = data.find(s => s.key === 'API_TEST_SECRET');
    console.log(`   Secret deleted: ${!deleted ? '✅' : '❌'}`);

    // Test 8: Export
    console.log('\n📤 Test 8: Export Secrets');
    res = await fetch(`${baseURL}/api/export`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Has export data: ${data ? '✅' : '❌'}`);

    // Test 9: Get environments
    console.log('\n🌍 Test 9: Get Environments');
    res = await fetch(`${baseURL}/api/environments`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Environments: ${Array.isArray(data) ? data.length : 0}`);
    if (Array.isArray(data)) {
      const active = data.find(e => e.active);
      console.log(`   Active env: ${active?.name || 'unknown'}`);
    }

    // Test 10: Content-Type validation
    console.log('\n🔒 Test 10: Content-Type Validation');
    res = await fetch(`${baseURL}/api/secrets`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // Wrong type
      body: JSON.stringify({ key: 'TEST', value: 'test' })
    });
    console.log(`   Status: ${res.status} (should be 415)`);
    data = await res.json();
    console.log(`   Error message: ${data.error ? '✅' : '❌'}`);

    // Test 11: Missing password
    console.log('\n🔐 Test 11: Missing Auth');
    res = await fetch(`${baseURL}/api/secrets`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Requires auth: ${res.status === 401 ? '✅' : '❌'}`);

    // Test 12: Logout
    console.log('\n🚪 Test 12: Logout');
    res = await fetch(`${baseURL}/api/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Result: ${data.success ? '✅' : '❌'}`);

    console.log('\n' + '═'.repeat(60));
    console.log('✅ API Tests Completed!');
    console.log('═'.repeat(60));

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testWebAPI();
