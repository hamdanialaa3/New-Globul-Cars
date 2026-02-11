const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

async function dumpCars() {
    const envPath = path.resolve(__dirname, '../.env.local');
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
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const db = admin.firestore();
    console.log('--- CAR LISTING DATA ---');

    // Query for user 1's cars (using numericId mapping if necessary, but we can just query by sellerNumericId)
    const carsSnapshot = await db.collection('cars')
        .where('sellerNumericId', '==', 1)
        .orderBy('carNumericId', 'desc')
        .limit(20)
        .get();

    if (carsSnapshot.empty) {
        console.log('No cars found for user 1');
    } else {
        carsSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`URL: /car/${data.sellerNumericId}/${data.carNumericId} | ID: ${doc.id}`);
            console.log(`   Make: ${data.make}, Model: ${data.model}, Price: ${data.price} ${data.currency || 'EUR'}`);
            console.log(`   Images: ${data.images ? data.images.length : 0}`);
            console.log(`   Created: ${data.createdAt ? data.createdAt.toDate().toISOString() : 'N/A'}`);
            console.log('------------------------');
        });
    }
}

dumpCars().catch(console.error);
