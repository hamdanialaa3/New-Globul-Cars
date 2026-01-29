/**
 * Direct Gemini API Key Test
 * Tests if the Gemini API key is valid by making a direct HTTP request
 */

const https = require('https');

const API_KEY = 'AIzaSyBJWvA2rRN6-7emL4DL9jp6SVRuKDYwvCU';
const MODEL = 'gemini-2.5-flash';

const testApiKey = () => {
  console.log('🔑 Testing Gemini API Key...');
  console.log(`Key: ${API_KEY.substring(0, 20)}...`);
  console.log('');

  const requestBody = JSON.stringify({
    contents: [{
      parts: [{
        text: 'Hello, this is a test message.'
      }]
    }]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`\n📊 Response Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('');

      if (res.statusCode === 200) {
        console.log('✅ SUCCESS! API Key is VALID and working!');
        console.log('');
        const response = JSON.parse(data);
        if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
          console.log('📝 Gemini Response:');
          console.log(response.candidates[0].content.parts[0].text);
        }
      } else {
        console.log('❌ FAILED! API Key is INVALID or restricted.');
        console.log('');
        console.log('📋 Error Details:');
        try {
          const error = JSON.parse(data);
          console.log(JSON.stringify(error, null, 2));
        } catch {
          console.log(data);
        }
        console.log('');
        console.log('🔧 Possible Solutions:');
        console.log('1. Check if the API key is correct in Google AI Studio');
        console.log('2. Verify the Generative Language API is enabled in Google Cloud Console');
        console.log('3. Check if billing is enabled for your Google Cloud project');
        console.log('4. Make sure the API key has proper permissions');
        console.log('');
        console.log('🌐 Links:');
        console.log('• Google AI Studio: https://aistudio.google.com/apikey');
        console.log('• Enable API: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
        console.log('• Billing: https://console.cloud.google.com/billing');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
  });

  req.write(requestBody);
  req.end();
};

// Run the test
testApiKey();
