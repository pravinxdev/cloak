// Simple API test
const password = 'pravin';

async function test() {
  console.log('Testing API...\n');
  
  try {
    // Test 1: Login
    console.log('1️⃣ Login Test:');
    let res = await fetch('http://localhost:8080/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    console.log(`   Status: ${res.status}`);
    let data = await res.json();
    console.log(`   Response: ${JSON.stringify(data)}\n`);

    // Test 2: Get secrets (with auth from login)
    console.log('2️⃣ Get Secrets Test:');
    res = await fetch('http://localhost:8080/api/secrets', {
      method: 'GET',
      credentials: 'include'
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Count: ${Array.isArray(data) ? data.length : 0}`);
    if (Array.isArray(data) && data.length > 0) {
      console.log(`   First secret: ${data[0].key}`);
    }
    console.log();

    // Test 3: Create secret
    console.log('3️⃣ Create Secret Test:');
    res = await fetch('http://localhost:8080/api/secrets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'BUGTEST_' + Date.now(),
        value: 'test123',
        tags: ['test']
      })
    });
    console.log(`   Status: ${res.status}`);
    data = await res.json();
    console.log(`   Response: ${JSON.stringify(data)}\n`);

    console.log('✅ API Tests Complete');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
