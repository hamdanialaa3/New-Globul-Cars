const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

async function cleanupAndSetup() {
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
    const auth = admin.auth();

    const targetEmail = 'hamdanialaa@gmail.com';
    const targetNumericId = 1;
    const oldNumericId = 170;

    console.log(`🧹 Processing cleanup for Numeric ID: ${oldNumericId}`);

    // 1. Check and delete mapping for 170
    const oldMappingDoc = await db.collection('numeric_ids').doc(oldNumericId.toString()).get();
    if (oldMappingDoc.exists) {
        const oldUid = oldMappingDoc.data().uid;
        console.log(`🗑️ Deleting numeric mapping for 170 (UID: ${oldUid})`);
        await db.collection('numeric_ids').doc(oldNumericId.toString()).delete();
    }

    // 2. Delete cars belonging to numeric ID 170
    const vehicleCollections = [
        'cars', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'
    ];

    for (const coll of vehicleCollections) {
        const snapshot = await db.collection(coll).where('sellerNumericId', '==', oldNumericId).get();
        if (!snapshot.empty) {
            console.log(`🗑️ Deleting ${snapshot.size} cars from ${coll} for ID 170`);
            const batch = db.batch();
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
    }

    console.log(`✨ Cleanup for 170 complete.`);

    console.log(`🚀 Setting up account for ${targetEmail} as Numeric ID 1...`);

    let userRecord;
    try {
        userRecord = await auth.getUserByEmail(targetEmail);
        console.log(`✅ User found in Auth: ${userRecord.uid}`);
    } catch (error) {
        console.log(`⚠️ User not found, creating new account...`);
        userRecord = await auth.createUser({
            email: targetEmail,
            password: 'Alaa1983',
            displayName: 'Ибрахим Моторс'
        });
        console.log(`✅ New user created: ${userRecord.uid}`);
    }

    const uid = userRecord.uid;

    // 3. Update Firestore user document
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    const userData = {
        uid,
        email: targetEmail,
        displayName: 'Ибрахим Моторс',
        numericId: targetNumericId,
        profileType: 'dealer',
        role: 'admin',
        status: 'active',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (!userDoc.exists) {
        userData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        await userDocRef.set(userData);
        console.log(`✅ Firestore user document created.`);
    } else {
        await userDocRef.update(userData);
        console.log(`✅ Firestore user document updated.`);
    }

    // 4. Force Mapping in numeric_ids
    // Map 1 -> UID
    await db.collection('numeric_ids').doc(targetNumericId.toString()).set({
        uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Also map UID -> 1 (if the system uses a reverse mapping or field)
    // Some systems use a reverse mapping collection or just the field in user doc.
    // Let's check for a reverse mapping like 'uid_to_numeric'
    const reverseMappingColl = db.collection('uid_to_numeric');
    await reverseMappingColl.doc(uid).set({
        numericId: targetNumericId
    });

    console.log(`✅ Numeric mapping set: 1 <-> ${uid}`);

    // 5. Ensure counters are consistent (optional but good)
    const counterDoc = await db.collection('counters').doc('users').get();
    if (counterDoc.exists) {
        const currentCount = counterDoc.data().count || 0;
        if (currentCount < targetNumericId) {
            await db.collection('counters').doc('users').update({ count: targetNumericId });
        }
    } else {
        await db.collection('counters').doc('users').set({ count: targetNumericId });
    }

    console.log(`\n🎉 Process Success!`);
    console.log(`📧 Email: ${targetEmail}`);
    console.log(`🔐 Password: Alaa1983`);
    console.log(`🔗 Profile URL: http://localhost:3000/profile/1`);
}

// Running with dynamic require check for firebase-admin
try {
    const admin = require('firebase-admin');
    cleanupAndSetup().catch(err => {
        console.error("❌ Execution error:", err);
        process.exit(1);
    });
} catch (e) {
    console.error("❌ Error: firebase-admin not found. Please ensure you are running this from a directory with node_modules or use a tool that can locate it.");
    process.exit(1);
}
