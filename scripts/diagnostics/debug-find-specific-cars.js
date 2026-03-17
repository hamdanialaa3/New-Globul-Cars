const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const envPath = path.resolve(__dirname, '../../.env.local');
const env = {};
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
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
}

const serviceAccountKey = env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey) {
    console.error("❌ FIREBASE_SERVICE_ACCOUNT_KEY missing");
    process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountKey);
// Key fix
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const collections = ['cars', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses', 'listings', 'adverts'];
const makesToFind = ['mercedes', 'audi', 'bmw', 'toyota']; // Lowercase for comparison

async function search() {
    console.log("🔍 Searching for Mercedes and Audi...");

    for (const col of collections) {
        const snapshot = await db.collection(col).get();
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const make = (data.make || '').toLowerCase();
            // Flexible match
            const matched = makesToFind.some(m => make.includes(m.toLowerCase()));

            if (matched) {
                console.log(`\n📄 Found in [${col}]: ${doc.id}`);
                console.log(`   Make: ${data.make}, Model: ${data.model}, Year: ${data.year}`);
                console.log(`   Status: ${data.status} (isActive: ${data.isActive}, isSold: ${data.isSold})`);
                console.log(`   Images: ${data.images ? data.images.length : 0}`);
                console.log(`   CreatedAt: ${data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : 'MISSING'}`);
                // Check for validity
                if (data.isActive === false) console.log("   ⚠️  HIDDEN: isActive is false");
                if (data.isSold === true) console.log("   ⚠️  HIDDEN: isSold is true");
                if (!data.images || data.images.length === 0) console.log("   ⚠️  WARNING: No images");
            }
        });
    }
}

search().catch(console.error);
