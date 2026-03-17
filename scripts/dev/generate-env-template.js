/**
 * Environment Variables Template Generator
 * Creates .env.template with all required keys and their descriptions
 */
const fs = require('fs');
const path = require('path');

const requiredEnvVars = [
  {
    key: 'REACT_APP_FIREBASE_API_KEY',
    description: 'Firebase API Key - Get from Firebase Console',
    required: true,
    example: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  },
  {
    key: 'REACT_APP_FIREBASE_AUTH_DOMAIN',
    description: 'Firebase Auth Domain',
    required: true,
    example: 'your-project.firebaseapp.com'
  },
  {
    key: 'REACT_APP_FIREBASE_PROJECT_ID',
    description: 'Firebase Project ID',
    required: true,
    example: 'your-project-id'
  },
  {
    key: 'REACT_APP_FIREBASE_STORAGE_BUCKET',
    description: 'Firebase Storage Bucket',
    required: true,
    example: 'your-project.appspot.com'
  },
  {
    key: 'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    description: 'Firebase Messaging Sender ID',
    required: true,
    example: '123456789012'
  },
  {
    key: 'REACT_APP_FIREBASE_APP_ID',
    description: 'Firebase App ID',
    required: true,
    example: '1:123456789012:web:abcdef123456'
  },
  {
    key: 'REACT_APP_RECAPTCHA_SITE_KEY',
    description: 'Google reCAPTCHA Site Key - Get from https://www.google.com/recaptcha/admin',
    required: true,
    example: '6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  },
  {
    key: 'REACT_APP_GOOGLE_MAPS_API_KEY',
    description: 'Google Maps API Key - Required for maps, fallback to Leaflet if missing',
    required: true,
    example: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  },
  {
    key: 'REACT_APP_HCAPTCHA_SITE_KEY',
    description: 'hCaptcha Site Key - Alternative to reCAPTCHA',
    required: false,
    example: '10000000-ffff-ffff-ffff-000000000001'
  },
  {
    key: 'REACT_APP_SUPABASE_URL',
    description: 'Supabase URL - Optional supplementary storage',
    required: false,
    example: 'https://xxxxx.supabase.co'
  },
  {
    key: 'REACT_APP_SUPABASE_ANON_KEY',
    description: 'Supabase Anonymous Key',
    required: false,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  {
    key: 'REACT_APP_FACEBOOK_APP_ID',
    description: 'Facebook App ID - For OAuth and Pixel',
    required: false,
    example: '1234567890123456'
  },
  {
    key: 'REACT_APP_SOCKET_SERVER_URL',
    description: 'Socket.io Server URL - For real-time messaging',
    required: false,
    example: 'https://your-socket-server.com'
  }
];

function generateTemplate() {
  const appDir = path.join(__dirname, '..');
  const templatePath = path.join(appDir, '.env.template');
  const envPath = path.join(appDir, '.env');
  
  let template = `# Koli One - Environment Variables Template
# Generated: ${new Date().toISOString()}
# Copy this file to .env and fill in your actual values

# ==========================================
# REQUIRED VARIABLES (App won't start without these)
# ==========================================

`;

  // Add required variables
  requiredEnvVars
    .filter(v => v.required)
    .forEach(v => {
      template += `# ${v.description}\n`;
      template += `# Example: ${v.example}\n`;
      template += `${v.key}=\n\n`;
    });

  template += `# ==========================================
# OPTIONAL VARIABLES (App works without these but with reduced functionality)
# ==========================================

`;

  // Add optional variables
  requiredEnvVars
    .filter(v => !v.required)
    .forEach(v => {
      template += `# ${v.description}\n`;
      template += `# Example: ${v.example}\n`;
      template += `# ${v.key}=\n\n`;
    });

  // Write template
  fs.writeFileSync(templatePath, template, 'utf8');
  console.log(`✅ Template created: ${templatePath}`);
  
  // Check current .env
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const missing = [];
    const present = [];
    
    requiredEnvVars
      .filter(v => v.required)
      .forEach(v => {
        const regex = new RegExp(`^${v.key}=.+`, 'm');
        if (regex.test(envContent)) {
          present.push(v.key);
        } else {
          missing.push(v.key);
        }
      });
    
    console.log('\n📊 Current .env Status:');
    console.log(`✅ Present (${present.length}):`, present);
    console.log(`❌ Missing (${missing.length}):`, missing);
    
    if (missing.length > 0) {
      console.log('\n⚠️  WARNING: Missing required environment variables!');
      console.log('Add these keys to your .env file before running the app.');
    }
  } else {
    console.log('\n⚠️  No .env file found. Copy .env.template to .env and fill in values.');
  }
}

generateTemplate();
