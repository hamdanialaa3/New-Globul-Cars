/**
 * List Available Gemini Models
 */

const https = require('https');

const API_KEY = '***REMOVED_GEMINI_KEY***';

console.log('📋 Listing available Gemini models...');
console.log('');

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${API_KEY}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Response Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('');

    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      console.log('✅ Available Models:');
      console.log('');
      
      if (response.models && response.models.length > 0) {
        response.models.forEach((model, index) => {
          console.log(`${index + 1}. ${model.name}`);
          console.log(`   Display Name: ${model.displayName}`);
          console.log(`   Description: ${model.description || 'N/A'}`);
          console.log(`   Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('No models found.');
      }
    } else {
      console.log('❌ Error fetching models:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});

req.end();
