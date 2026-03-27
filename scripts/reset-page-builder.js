const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('C:\\Users\\hamda\\Desktop\\Koli_One_Root\\functions\\service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function resetPageBuilderHome() {
  try {
    console.log('Resetting page_builder_home from Firestore to allow fallback to fixed defaults...');
    await db.collection('app_settings').doc('page_builder_home').delete();
    console.log('Successfully deleted page_builder_home. The UI will now use the updated DEFAULT_CONFIGS with all 22 sections!');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting doc:', error);
    process.exit(1);
  }
}

resetPageBuilderHome();
