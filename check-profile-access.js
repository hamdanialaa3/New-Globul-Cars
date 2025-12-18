// Minimal script to check profile access by numericId and optionally fix visibility
// Usage:
//   node check-profile-access.js --numericId 18 [--fix]
//   With emulator: set FIRESTORE_EMULATOR_HOST=localhost:8081
//   With service account: set GOOGLE_APPLICATION_CREDENTIALS=path/to/sa.json

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1) {
    const next = process.argv[idx + 1];
    if (next && !next.startsWith('--')) return next;
    return true; // flag-only
  }
  return undefined;
}

(async () => {
  try {
    const numericIdArg = getArg('numericId');
    const fix = !!getArg('fix');
    if (!numericIdArg) {
      console.error('Missing --numericId');
      process.exit(1);
    }
    const numericId = Number(numericIdArg);
    if (Number.isNaN(numericId)) {
      console.error('numericId must be a number');
      process.exit(1);
    }

    initializeApp({
      credential: process.env.GOOGLE_APPLICATION_CREDENTIALS ? cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)) : applicationDefault(),
    });
    const db = getFirestore();

    console.log(`Querying users by numericId=${numericId}...`);
    const snap = await db.collection('users').where('numericId', '==', numericId).limit(1).get();
    if (snap.empty) {
      console.error('No user found with this numericId');
      process.exit(2);
    }
    const doc = snap.docs[0];
    const data = doc.data();
    const uid = doc.id;

    console.log('User document:', { uid, numericId: data.numericId, status: data.status, isPublic: data.isPublic, profileVisibility: data.profileVisibility });

    // Attempt to read a related profile doc if you store profiles separately
    let profileDocId = uid;
    let profileRef = db.collection('profiles').doc(profileDocId);
    const profileSnap = await profileRef.get();
    if (profileSnap.exists) {
      const p = profileSnap.data();
      console.log('Profile document:', { uid: profileDocId, status: p.status, isPublic: p.isPublic, profileVisibility: p.profileVisibility });
    } else {
      console.log('No separate profile doc; using users doc as source.');
    }

    // If fix flag, set profileVisibility to public on users doc
    if (fix) {
      console.log('Applying visibility fix: profileVisibility=public, isPublic=true');
      await db.collection('users').doc(uid).set({ profileVisibility: 'public', isPublic: true }, { merge: true });
      console.log('Fix applied. Re-reading...');
      const updated = await db.collection('users').doc(uid).get();
      console.log('Updated user document:', updated.data());
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(99);
  }
})();
