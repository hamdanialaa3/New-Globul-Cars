/**
 * Secure Firebase Admin Initializer
 *
 * ⚠️ NEVER use require('serviceAccountKey.json') — keys must come from:
 *    1. FIREBASE_SERVICE_ACCOUNT_KEY environment variable
 *    2. .env.local file (git-ignored)
 *
 * Usage:
 *   const { db, auth, admin } = require('./lib/firebase-init');
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

function loadServiceAccount() {
    // Priority 1: Environment variable
    const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (envKey) {
        try {
            const sa = JSON.parse(envKey);
            if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            return sa;
        } catch (e) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY env var');
        }
    }

    // Priority 2: .env.local file
    const envPath = path.resolve(__dirname, '../../.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;
            const idx = line.indexOf('=');
            if (idx !== -1) {
                const key = line.substring(0, idx).trim();
                let val = line.substring(idx + 1).trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                env[key] = val;
            }
        });
        if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
            if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, '\n');
            return sa;
        }
    }

    console.error('');
    console.error('❌ Firebase service account not found!');
    console.error('');
    console.error('   Fix: Set FIREBASE_SERVICE_ACCOUNT_KEY in one of:');
    console.error('   1. Environment variable: export FIREBASE_SERVICE_ACCOUNT_KEY=\'{"type":"service_account",...}\'');
    console.error('   2. .env.local file: FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}');
    console.error('');
    console.error('   ⚠️  NEVER commit serviceAccountKey.json to git!');
    console.error('');
    process.exit(1);
}

const serviceAccount = loadServiceAccount();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // European region RTDB URL format — us-central1 would use .firebaseio.com
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.europe-west1.firebasedatabase.app`
    });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth, serviceAccount };
