const http = require('http');

async function testLocal(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        // Since it checks Supabase auth, we'd need a cookie or JWT. But wait, does it require auth?
        // Yes, createClient() checks supabase auth.
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Path ${path} - Status: ${res.statusCode}`);
        console.log('Response:', data.slice(0, 300));
        resolve(res.statusCode);
      });
    });
    
    req.on('error', err => {
      console.log(`Path ${path} - Error: ${err.message}`);
      resolve(null);
    });
    
    req.end();
  });
}

async function main() {
  await testLocal('/');
  await testLocal('/api/rmm');
}

main();
