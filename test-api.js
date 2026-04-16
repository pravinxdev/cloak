// Quick API test script

async function testAPI() {
  const baseURL = 'http://localhost:8080';
  let sessionKey = null;

  try {
    // Test 1: Login
    console.log('🔑 Test 1: Login');
    let res = await fetch(`${baseURL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'testpass123' })
    });
    console.log(`   Status: ${res.status}`);
    let data = await res.json();
    console.log(`   Response: ${JSON.stringify(data)}`);
    
    if (!res.ok) {
      console.log('   ❌ Login failed\n');
      return;
    }
    console.log('   ✅ Login successful\n');

    // Test 2: Get secrets (should fail - need session)
    console.log('🔍 Test 2: Get secrets');
    res = await fetch(`${baseURL}/api/secrets`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Response: ${JSON.stringify(data)}\n`);

    // Test 3: Create a secret
    console.log('➕ Test 3: Create secret');
    res = await fetch(`${baseURL}/api/secrets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        key: 'TEST_SECRET',
        value: 'my-secret-value-123'
      })
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Response: ${JSON.stringify(data)}\n`);

    // Test 4: List secrets
    console.log('📋 Test 4: List secrets');
    res = await fetch(`${baseURL}/api/secrets`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Response: ${JSON.stringify(data, null, 2)}\n`);

    // Test 5: Get specific secret
    console.log('🔓 Test 5: Get secret');
    res = await fetch(`${baseURL}/api/secrets/TEST_SECRET`, {
      method: 'GET'
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Response: ${JSON.stringify(data)}\n`);

    // Test 6: Delete secret
    console.log('🗑️  Test 6: Delete secret');
    res = await fetch(`${baseURL}/api/secrets/TEST_SECRET`, {
      method: 'DELETE'
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Response: ${JSON.stringify(data)}\n`);

    // Test 7: Logout
    console.log('🚪 Test 7: Logout');
    res = await fetch(`${baseURL}/api/logout`, {
      method: 'POST'
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Response: ${JSON.stringify(data)}\n`);

    console.log('✅ All tests completed!');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testAPI();
