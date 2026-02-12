/**
 * Detailed API Key Verification
 * Tests the exact API key from Firebase config
 */

const https = require('https');

const API_KEY = '***REMOVED_GEMINI_KEY***';

console.log('🔍 Detailed API Key Verification');
console.log('================================\n');

console.log('API Key Details:');
console.log('  Full Key:', API_KEY);
console.log('  Length:', API_KEY.length, 'characters');
console.log('  First 10 chars:', API_KEY.substring(0, 10));
console.log('  Last 10 chars:', API_KEY.substring(API_KEY.length - 10));
console.log('  Contains spaces?', API_KEY.includes(' ') ? 'YES ❌' : 'NO ✅');
console.log('  Contains newlines?', API_KEY.includes('\n') ? 'YES ❌' : 'NO ✅');
console.log('  Contains tabs?', API_KEY.includes('\t') ? 'YES ❌' : 'NO ✅');
console.log('\n');

// Test 1: List models (basic auth test)
console.log('Test 1: Listing Models (Basic Auth)');
console.log('─────────────────────────────────');

const listModelsOptions = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${API_KEY}`,
  method: 'GET'
};

https.get(listModelsOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS - API key can list models\n');
      
      // Test 2: Generate content with gemini-2.5-flash
      console.log('Test 2: Generate Content (gemini-2.5-flash)');
      console.log('────────────────────────────────────────');
      
      const requestBody = JSON.stringify({
        contents: [{
          parts: [{ text: 'Say hello in exactly 5 words.' }]
        }]
      });

      const generateOptions = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };

      const req = https.request(generateOptions, (genRes) => {
        let genData = '';
        genRes.on('data', chunk => genData += chunk);
        genRes.on('end', () => {
          console.log(`Status: ${genRes.statusCode} ${genRes.statusMessage}\n`);
          
          if (genRes.statusCode === 200) {
            console.log('✅ SUCCESS - gemini-2.5-flash is working!');
            const response = JSON.parse(genData);
            console.log('\nGemini Response:');
            console.log(response.candidates[0].content.parts[0].text);
            console.log('\n🎉 ALL TESTS PASSED - API Key is fully functional!');
          } else {
            console.log('❌ FAILED - gemini-2.5-flash returned error');
            console.log('\nError Response:');
            try {
              const error = JSON.parse(genData);
              console.log(JSON.stringify(error, null, 2));
            } catch {
              console.log(genData);
            }
            
            console.log('\n🔧 Possible Issues:');
            console.log('1. API key might not have access to gemini-2.5-flash');
            console.log('2. Project might need billing enabled');
            console.log('3. Generative Language API might need enabling in Cloud Console');
          }
        });
      });

      req.on('error', err => console.error('Request Error:', err.message));
      req.write(requestBody);
      req.end();
      
    } else {
      console.log('❌ FAILED - Cannot list models');
      console.log(`Status: ${res.statusCode} ${res.statusMessage}\n`);
      console.log('Error Response:');
      try {
        const error = JSON.parse(data);
        console.log(JSON.stringify(error, null, 2));
      } catch {
        console.log(data);
      }
    }
  });
}).on('error', err => console.error('Request Error:', err.message));
