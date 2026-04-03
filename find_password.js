const http = require('http');

const passwords = ['test', 'password', '123456', 'admin', 'user', 'default', '', 'cloakx'];

async function tryPassword(password) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const setCookie = res.headers['set-cookie'];
        resolve({
          password,
          statusCode: res.statusCode,
          success: res.statusCode === 200,
          cookie: setCookie ? setCookie[0] : null,
          body: data
        });
      });
    });

    req.on('error', () => resolve({ password, error: true }));
    req.write(JSON.stringify({ password }));
    req.end();
  });
}

async function test() {
  console.log('🔍 Testing passwords...\n');
  
  for (const pwd of passwords) {
    const result = await tryPassword(pwd);
    const status = result.success ? '✅' : '❌';
    console.log(`${status} Password: "${pwd}" → Status ${result.statusCode}`);
    
    if (result.success) {
      console.log(`\n   🎉 FOUND! Use password: "${pwd}"\n`);
      break;
    }
  }
}

test();
