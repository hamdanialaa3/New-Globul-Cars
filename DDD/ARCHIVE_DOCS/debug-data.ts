
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, limit } from "firebase/firestore";
import { firebaseConfig } from "./src/firebase/firebase-config";

// Need to mock the config if importing fails or just copy it here to be safe
// assuming standard config structure. 
// Actually, better to import if environment allows.
// I'll try to use the existing firebase instance if I can run this in the context of the app?
// No, 'run_command' runs in terminal. I need a standalone script.
// I'll assume I can import from the source if `ts-node` is available or similar.
// But `firebase-config` might rely on env vars.

// Simplified approach: Search for user 80 and print their cars.
console.log("Starting debug script...");

// Re-create simple firebase init for script usage
// (Using placeholders for sensitive values, but since this is 'run_command' on user machine, strict env vars might be needed.
//  Actually, the user has 'npm start' running, so the env is likely set up.)
// I'll try to import the app's firebase instance.

async function debug() {
    try {
        const { db } = await import('./src/firebase/firebase-config');
        const { collection, query, where, getDocs } = await import('firebase/firestore');

        console.log("Searching for User numericId: 80");
        const usersRef = collection(db, 'users');
        const qUser = query(usersRef, where('numericId', '==', 80));
        const userSnap = await getDocs(qUser);

        if (userSnap.empty) {
            console.log("❌ User 80 NOT FOUND!");
            return;
        }

        const userDoc = userSnap.docs[0];
        const userData = userDoc.data();
        console.log(`✅ User Found! ID: ${userDoc.id}, Email: ${userData.email}`);

        console.log("Searching for Cars with sellerNumericId: 80 OR sellerId: " + userDoc.id);

        const carsRef = collection(db, 'cars');
        // Query by sellerNumericId
        const qCarsNum = query(carsRef, where('sellerNumericId', '==', 80));
        const carsNumSnap = await getDocs(qCarsNum);
        console.log(`Found ${carsNumSnap.size} cars by sellerNumericId=80`);
        carsNumSnap.forEach(d => console.log(` - Car [${d.id}]: numericId=${d.data().numericId}, carNumericId=${d.data().carNumericId}`));

        // Query by sellerId
        const qCarsUid = query(carsRef, where('sellerId', '==', userDoc.id));
        const carsUidSnap = await getDocs(qCarsUid);
        console.log(`Found ${carsUidSnap.size} cars by sellerId=${userDoc.id}`);
        carsUidSnap.forEach(d => {
            const data = d.data();
            console.log(` - Car [${d.id}]: numericId=${data.numericId}, carNumericId=${data.carNumericId}, sellerNumericId=${data.sellerNumericId}`);
            if (data.numericId == 2 || data.carNumericId == 2) {
                console.log("   🌟 THIS IS THE TARGET CAR!");
            }
        });

    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}

debug();
