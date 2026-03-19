import * as functions from 'firebase-functions/v1';
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
    if (!car) return;

    const usersSnapshot = await db.collection('savedSearches')
      .where('brand', '==', car.brand)
      .get();

    const notifications = usersSnapshot.docs.map(async (doc) => {
      const userId = doc.data().userId;
      if (!userId) return null;

      const tokenDoc = await db.collection('userTokens').doc(userId).get();
      if (tokenDoc.exists) {
        const tokenData = tokenDoc.data();
        if (tokenData && tokenData.token) {
          return messaging.send({
            token: tokenData.token,
            notification: {
              title: '🚗 سيارة جديدة!',
              body: `${car.brand} ${car.model} - ${car.price}€`
            }
          });
        }
      }
      return null;
    });

    await Promise.all(notifications);
  });

// 2. انخفاض السعر
export const onPriceUpdate = functions.firestore
  .document('cars/{carId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before || !after) return;

    if (after.price < before.price) {
      const favoritesSnapshot = await db.collection('favorites')
        .where('carId', '==', context.params.carId)
        .get();

      const notifications = favoritesSnapshot.docs.map(async (doc) => {
        const userId = doc.data().userId;
        if (!userId) return null;

        const tokenDoc = await db.collection('userTokens').doc(userId).get();
        if (tokenDoc.exists) {
          const tokenData = tokenDoc.data();
          if (tokenData && tokenData.token) {
            return messaging.send({
              token: tokenData.token,
              notification: {
                title: '💰 السعر انخفض!',
                body: `${after.brand} من ${before.price}€ إلى ${after.price}€`
              }
            });
          }
        }
        return null;
      });

      await Promise.all(notifications);
    }
  });

// 3. رسالة جديدة
export const onNewMessage = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap) => {
    const message = snap.data();
    if (!message) return;

    const tokenDoc = await db.collection('userTokens').doc(message.recipientId).get();

    if (tokenDoc.exists) {
      const tokenData = tokenDoc.data();
      if (tokenData && tokenData.token) {
        await messaging.send({
          token: tokenData.token,
          notification: {
            title: '💬 رسالة جديدة',
            body: message.text.substring(0, 100)
          }
        });
      }
    }
  });

// 4. مشاهدات
export const onCarViewed = functions.firestore
  .document('carViews/{viewId}')
  .onCreate(async (snap) => {
    const view = snap.data();
    if (!view) return;

    const carDoc = await db.collection('cars').doc(view.carId).get();

    if (carDoc.exists) {
      const car = carDoc.data();
      if (!car) return;

      const viewCount = (car.viewCount || 0) + 1;

      if ([10, 50, 100].includes(viewCount)) {
        const tokenDoc = await db.collection('userTokens').doc(car.sellerId).get();
        if (tokenDoc.exists) {
          const tokenData = tokenDoc.data();
          if (tokenData && tokenData.token) {
            await messaging.send({
              token: tokenData.token,
              notification: {
                title: '👀 مبروك!',
                body: `إعلانك وصل لـ ${viewCount} مشاهدة`
              }
            });
          }
        }
      }
    }
  });

// 5. استفسار
export const onNewInquiry = functions.firestore
  .document('inquiries/{inquiryId}')
  .onCreate(async (snap) => {
    const inquiry = snap.data();
    if (!inquiry) return;

    const carDoc = await db.collection('cars').doc(inquiry.carId).get();

    if (carDoc.exists) {
      const car = carDoc.data();
      if (!car) return;

      const tokenDoc = await db.collection('userTokens').doc(car.sellerId).get();
      if (tokenDoc.exists) {
        const tokenData = tokenDoc.data();
        if (tokenData && tokenData.token) {
          await messaging.send({
            token: tokenData.token,
            notification: {
              title: '❓ استفسار جديد',
              body: `شخص مهتم بسيارتك`
            }
          });
        }
      }
    }
  });

// 6. عرض سعر
export const onNewOffer = functions.firestore
  .document('offers/{offerId}')
  .onCreate(async (snap) => {
    const offer = snap.data();
    if (!offer) return;

    const carDoc = await db.collection('cars').doc(offer.carId).get();

    if (carDoc.exists) {
      const car = carDoc.data();
      if (!car) return;

      const tokenDoc = await db.collection('userTokens').doc(car.sellerId).get();
      if (tokenDoc.exists) {
        const tokenData = tokenDoc.data();
        if (tokenData && tokenData.token) {
          await messaging.send({
            token: tokenData.token,
            notification: {
              title: '💵 عرض سعر',
              body: `عرض ${offer.price}€`
            }
          });
        }
      }
    }
  });

// 7. تحقق
export const onVerificationUpdate = functions.firestore
  .document('verifications/{userId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    if (!after) return;

    const tokenDoc = await db.collection('userTokens').doc(context.params.userId).get();

    if (tokenDoc.exists) {
      const tokenData = tokenDoc.data();
      if (tokenData && tokenData.token) {
        await messaging.send({
          token: tokenData.token,
          notification: {
            title: after.status === 'approved' ? '✅ تم التحقق' : '❌ رفض',
            body: after.status === 'approved' ? 'حسابك تم التحقق منه' : 'يرجى المحاولة مرة أخرى'
          }
        });
      }
    }
  });

// 8. تذكير يومي
export const dailyReminder = functions.pubsub
  .schedule('0 10 * * *')
  .onRun(async () => {
    const usersSnapshot = await db.collection('userTokens').get();

    const notifications = usersSnapshot.docs.map(doc => {
      const tokenData = doc.data();
      if (tokenData && tokenData.token) {
        return messaging.send({
          token: tokenData.token,
          notification: {
            title: '🚗 سيارات جديدة',
            body: 'تحقق من أحدث السيارات'
          }
        });
      }
      return null;
    });

    await Promise.all(notifications);
  });

// 9. New Review — notify the seller when they receive a review
export const onNewReview = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap) => {
    const review = snap.data();
    if (!review || !review.sellerId) return;

    const tokenDoc = await db.collection('userTokens').doc(review.sellerId).get();
    if (tokenDoc.exists) {
      const tokenData = tokenDoc.data();
      if (tokenData && tokenData.token) {
        const stars = '⭐'.repeat(Math.min(review.rating || 0, 5));
        await messaging.send({
          token: tokenData.token,
          notification: {
            title: `${stars} Нова рецензия`,
            body: review.comment ? review.comment.substring(0, 100) : 'Получихте нова оценка!'
          }
        });
      }
    }
  });

// 10. New Favorite — notify seller when someone favorites their car
export const onNewFavorite = functions.firestore
  .document('favorites/{favoriteId}')
  .onCreate(async (snap) => {
    const fav = snap.data();
    if (!fav || !fav.carId) return;

    const carDoc = await db.collection('cars').doc(fav.carId).get();
    if (!carDoc.exists) return;

    const car = carDoc.data();
    if (!car || !car.sellerId) return;

    const tokenDoc = await db.collection('userTokens').doc(car.sellerId).get();
    if (tokenDoc.exists) {
      const tokenData = tokenDoc.data();
      if (tokenData && tokenData.token) {
        await messaging.send({
          token: tokenData.token,
          notification: {
            title: '❤️ Нов харесан автомобил',
            body: `Някой хареса ${car.brand || ''} ${car.model || ''}`
          }
        });
      }
    }
  });
