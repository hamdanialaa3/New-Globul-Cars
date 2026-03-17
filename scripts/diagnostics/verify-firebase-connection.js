const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
const env = {};

if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;

        // Find first '='
        const idx = line.indexOf('=');
        if (idx !== -1) {
            const key = line.substring(0, idx).trim();
            let val = line.substring(idx + 1).trim();

            // Remove surrounding quotes if present
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            env[key] = val;
        }
    });

    // Assign to process.env
    for (const k in env) {
        if (!process.env[k]) {
            process.env[k] = env[k];
        }
    }
} else {
    console.error("❌ .env.local file not found!");
    process.exit(1);
}

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

console.log("\n🔍 Checking Firebase Configuration...\n");

// Check 1: Frontend API Key Mismatch
const frontendConfigFile = path.resolve(__dirname, '../../src/firebase/firebase-config.ts');
let frontendKeyInCode = null;
if (fs.existsSync(frontendConfigFile)) {
    const content = fs.readFileSync(frontendConfigFile, 'utf8');
    const match = content.match(/apiKey:\s*["']([^"']+)["']/);
    if (match) {
        frontendKeyInCode = match[1];
    }
}

const frontendKeyInEnv = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (frontendKeyInCode && frontendKeyInEnv) {
    if (frontendKeyInCode !== frontendKeyInEnv) {
        console.warn("⚠️  WARNING: Mismatch in Frontend API Keys!");
        console.warn(`   - In .env.local: ${frontendKeyInEnv}`);
        console.warn(`   - In source code: ${frontendKeyInCode}`);
        console.warn("   The code is using a HARDCODED key which differs from your .env file.");
    } else {
        console.log("✅ Frontend API Key matches in code and .env");
    }
} else {
    console.warn("⚠️  Could not compare API keys (file or env var missing).");
}


// Check 2: Service Account Validity
if (!serviceAccountKey) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT_KEY is missing in .env.local");
} else {
    try {
        let serviceAccount;
        // Handle if it's a stringified JSON or just the JSON object
        try {
            serviceAccount = JSON.parse(serviceAccountKey);
        } catch (e) {
            // Maybe it's already an object if dotenv parsed it oddly? Unlikely with simple dotenv.
            console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON.");
            throw e;
        }

        console.log(`ℹ️  Service Account Email: ${serviceAccount.client_email}`);

        // Initialize Admin SDK
        if (!admin.apps.length) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            } catch (certError) {
                if (certError.message.includes('Invalid PEM') && serviceAccount.private_key) {
                    console.log("⚠️  PEM Error detected. Attempting to fix newlines in private_key...");
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                    console.log("✅ Fix successful: Private key format corrected in memory.");
                } else {
                    throw certError;
                }
            }
        }

        console.log("⏳ Testing connection to Firebase Auth...");
        // Try to list users (limit 1) to verify permissions
        admin.auth().listUsers(1)
            .then((listUsersResult) => {
                console.log("✅ SUCCESS: Connected to Firebase Auth!");
                console.log(`   - Found ${listUsersResult.users.length} users (sample).`);

                // Try Firestore
                console.log("⏳ Testing connection to Firestore...");
                return admin.firestore().listCollections();
            })
            .then((collections) => {
                console.log("✅ SUCCESS: Connected to Firestore!");
                console.log(`   - Found ${collections.length} root collections.`);
                console.log("\n🎉 YOUR FIREBASE CONFIGURATION IS VALID!");
            })
            .catch((error) => {
                console.error("❌ ERROR Connecting to Firebase:", error.message);
                if (error.code === 'auth/invalid-credential') {
                    console.error("   >>> The Service Account Key in .env.local is INVALID or EXPIRED.");
                }
            });

    } catch (error) {
        console.error("❌ Error initializing admin SDK:", error.message);
    }
}
