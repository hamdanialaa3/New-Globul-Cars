// Test script to verify production Firestore access from web client
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';

// Production Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAUYM_qygK5pUrlXtdDLmEi-_Kh9SyvRmk",
  authDomain: "fire-new-globul.firebaseapp.com",
  projectId: "fire-new-globul",
  storageBucket: "fire-new-globul.firebasestorage.app",
  messagingSenderId: "973379297533",
  appId: "1:973379297533:web:59c6534d61a29cae5d9e94",
  measurementId: "G-TDRZ4Z3D7Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testPublicAccess() {
  console.log('🔍 Testing public access to cars collection...\n');
  
  try {
    // Query for active cars (as an unauthenticated user would)
    const carsRef = collection(db, 'cars');
    const q = query(
      carsRef,
      where('isActive', '==', true),
      limit(5)
    );
    
    const snapshot = await getDocs(q);
    
    console.log(`✅ نجح الاتصال!`);
    console.log(`📊 عدد السيارات المسترجعة: ${snapshot.size}\n`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`🚗 ${data.title || `${data.make} ${data.model}`}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   isActive: ${data.isActive}`);
      console.log(`   isSold: ${data.isSold || false}`);
      console.log('---');
    });
    
    if (snapshot.size === 0) {
      console.log('⚠️ تحذير: لا توجد سيارات نشطة في قاعدة البيانات');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في الاتصال:');
    console.error('   الرسالة:', error.message);
    console.error('   الكود:', error.code);
    
    if (error.code === 'permission-denied') {
      console.error('\n🔒 قواعد Firestore لا تسمح بالقراءة العامة');
    }
    
    process.exit(1);
  }
}

testPublicAccess();
