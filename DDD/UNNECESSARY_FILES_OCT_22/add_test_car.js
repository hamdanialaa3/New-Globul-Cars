// add_test_car.js
// سكريبت لإضافة سيارة تجريبية إلى مجموعة cars في Firestore
// يجب أن يكون لديك ملف serviceAccountKey.json في نفس المجلد (يمكنك تحميله من إعدادات Firebase)

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addTestCar() {
  const carData = {
    title: 'Test Car',
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    price: 15000,
    mileage: 10000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    description: 'سيارة تجريبية لاختبار الربط مع Algolia',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    // يمكنك إضافة المزيد من الحقول حسب الحاجة
  };

  try {
    const docRef = await db.collection('cars').add(carData);
    console.log('تمت إضافة السيارة بنجاح:', docRef.id);
  } catch (error) {
    console.error('خطأ أثناء الإضافة:', error);
  }
}

addTestCar();

// لتشغيل السكريبت، استخدم الأمر التالي في الطرفية:
// node add_test_car.js
