
const fs = require('fs');
const path = require('path');

const googleServicesPath = path.join(__dirname, 'mobile_new', 'google-services.json');
const envPath = path.join(__dirname, 'mobile_new', '.env');

try {
    if (!fs.existsSync(googleServicesPath)) {
        console.error('❌ google-services.json not found at:', googleServicesPath);
        process.exit(1);
    }

    const content = fs.readFileSync(googleServicesPath, 'utf8');
    const json = JSON.parse(content);

    // Extract API Key
    // Usually in client[0].api_key[0].current_key
    const apiKey = json.client?.[0]?.api_key?.[0]?.current_key;

    if (!apiKey) {
        console.error('❌ Could not find API Key in google-services.json structure.');
        console.log(JSON.stringify(json, null, 2));
        process.exit(1);
    }

    console.log('✅ Found Firebase API Key!');

    // Prepare .env content
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or append FIREBASE_API_KEY
    if (envContent.includes('FIREBASE_API_KEY=')) {
        envContent = envContent.replace(/FIREBASE_API_KEY=.*/, `FIREBASE_API_KEY=${apiKey}`);
    } else {
        envContent += `\nFIREBASE_API_KEY=${apiKey}\n`;
    }

    // Also add to process.env compatible format if needed
    envContent += `\n# Auto-generated from google-services.json\n`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Written FIREBASE_API_KEY to mobile_new/.env');

} catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
}
