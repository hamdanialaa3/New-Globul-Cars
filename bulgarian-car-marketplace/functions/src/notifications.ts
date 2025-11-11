import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const messaging = admin.messaging();

// 1. سيارة جديدة
export const onNewCarPosted = functions.firestore
  .document('cars/{carId}')
  .onCreate(async (snap, context) => {
    const car = snap.data();
    const usersSnapshot = await db.collection('savedSearches')
      .where('brand', '==', car.brand)
      .get();

    const notifications = usersSnapshot.docs.map(async (doc) => {
      const tokenDoc = await db.collection('userTokens').doc(doc.data().userId).get();
      if (tokenDoc.exists) {
        return messaging.send({
          token: tokenDoc.data().token,
          notification: {
            title: '🚗 سيارة جديدة!',
            body: `${car.brand} ${car.model} - ${car.price}€`
          }
        });
      }
    });

    await Promise.all(notifications);
  });

// 2. انخفاض السعر
export const onPriceUpdate = functions.firestore
  .document('cars/{carId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    if (after.price < before.price) {
      const favoritesSnapshot = await db.collection('favorites')
        .where('carId', '==', context.params.carId)
        .get();

      const notifications = favoritesSnapshot.docs.map(async (doc) => {
        const tokenDoc = await db.collection('userTokens').doc(doc.data().userId).get();
        if (tokenDoc.exists) {
          return messaging.send({
            token: tokenDoc.data().token,
            notification: {
              title: '💰 السعر انخفض!',
              body: `${after.brand} من ${before.price}€ إلى ${after.price}€`
            }
          });
        }
      });

      await Promise.all(notifications);
    }
  });

// 3. رسالة جديدة
export const onNewMessage = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap) => {
    const message = snap.data();
    const tokenDoc = await db.collection('userTokens').doc(message.recipientId).get();
    
    if (tokenDoc.exists) {
      await messaging.send({
        token: tokenDoc.data().token,
        notification: {
          title: '💬 رسالة جديدة',
          body: message.text.substring(0, 100)
        }
      });
    }
  });

// 4. مشاهدات
export const onCarViewed = functions.firestore
  .document('carViews/{viewId}')
  .onCreate(async (snap) => {
    const view = snap.data();
    const carDoc = await db.collection('cars').doc(view.carId).get();
    
    if (carDoc.exists) {
      const car = carDoc.data();
      const viewCount = (car?.viewCount || 0) + 1;
      
      if ([10, 50, 100].includes(viewCount)) {
        const tokenDoc = await db.collection('userTokens').doc(car.sellerId).get();
        if (tokenDoc.exists) {
          await messaging.send({
            token: tokenDoc.data().token,
            notification: {
              title: '👀 مبروك!',
              body: `إعلانك وصل لـ ${viewCount} مشاهدة`
            }
          });
        }
      }
    }
  });

// 5. استفسار
export const onNewInquiry = functions.firestore
  .document('inquiries/{inquiryId}')
  .onCreate(async (snap) => {
    const inquiry = snap.data();
    const carDoc = await db.collection('cars').doc(inquiry.carId).get();
    
    if (carDoc.exists) {
      const car = carDoc.data();
      const tokenDoc = await db.collection('userTokens').doc(car.sellerId).get();
      if (tokenDoc.exists) {
        await messaging.send({
          token: tokenDoc.data().token,
          notification: {
            title: '❓ استفسار جديد',
            body: `شخص مهتم بسيارتك`
          }
        });
      }
    }
  });

// 6. عرض سعر
export const onNewOffer = functions.firestore
  .document('offers/{offerId}')
  .onCreate(async (snap) => {
    const offer = snap.data();
    const carDoc = await db.collection('cars').doc(offer.carId).get();
    
    if (carDoc.exists) {
      const car = carDoc.data();
      const tokenDoc = await db.collection('userTokens').doc(car.sellerId).get();
      if (tokenDoc.exists) {
        await messaging.send({
          token: tokenDoc.data().token,
          notification: {
            title: '💵 عرض سعر',
            body: `عرض ${offer.price}€`
          }
        });
      }
    }
  });

// 7. تحقق
export const onVerificationUpdate = functions.firestore
  .document('verifications/{userId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const tokenDoc = await db.collection('userTokens').doc(context.params.userId).get();
    
    if (tokenDoc.exists) {
      await messaging.send({
        token: tokenDoc.data().token,
        notification: {
          title: after.status === 'approved' ? '✅ تم التحقق' : '❌ رفض',
          body: after.status === 'approved' ? 'حسابك تم التحقق منه' : 'يرجى المحاولة مرة أخرى'
        }
      });
    }
  });

// 8. تذكير يومي
export const dailyReminder = functions.pubsub
  .schedule('0 10 * * *')
  .onRun(async () => {
    const usersSnapshot = await db.collection('userTokens').get();
    
    const notifications = usersSnapshot.docs.map(doc => {
      return messaging.send({
        token: doc.data().token,
        notification: {
          title: '🚗 سيارات جديدة',
          body: 'تحقق من أحدث السيارات'
        }
      });
    });

    await Promise.all(notifications);
  });
