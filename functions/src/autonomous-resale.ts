import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { logger } from 'firebase-functions';

const db = getFirestore();

/**
 * معالجة إنشاء استراتيجية بيع جديدة
 */
export const onSaleStrategyCreated = onDocumentCreated(
  'saleStrategies/{strategyId}',
  async (event) => {
    try {
      const strategy = event.data?.data();
      if (!strategy) return;

      logger.info(`استراتيجية بيع جديدة: ${strategy.strategyId}`);

      // إنشاء جدولة لمراقبة السوق
      await scheduleMarketMonitoring(strategy.strategyId);

      // تحليل السوق الأولي
      await performMarketAnalysis(strategy.vin);

    } catch (error) {
      logger.error('خطأ في معالجة إنشاء استراتيجية البيع:', error);
    }
  }
);

/**
 * معالجة عروض الشراء الجديدة
 */
export const onSaleOfferCreated = onDocumentCreated(
  'saleOffers/{offerId}',
  async (event) => {
    try {
      const offer = event.data?.data();
      if (!offer) return;

      logger.info(`عرض شراء جديد: ${offer.amount} EUR`);

      // العثور على الاستراتيجية المرتبطة
      const strategyQuery = query(
        collection(db, 'saleStrategies'),
        where('vin', '==', offer.vin || ''), // افتراض وجود vin في العرض
        where('status', '==', 'active')
      );

      const strategySnapshot = await getDocs(strategyQuery);
      if (strategySnapshot.empty) return;

      const strategy = strategySnapshot.docs[0].data();

      // تطبيق منطق الذكاء الاصطناعي
      await applyAIStrategyLogic(strategy.strategyId, offer);

    } catch (error) {
      logger.error('خطأ في معالجة عرض الشراء:', error);
    }
  }
);

/**
 * تحديث تحليل السوق اليومي
 */
export const dailyMarketAnalysis = onSchedule(
  {
    schedule: '0 6 * * *', // كل يوم الساعة 6 صباحاً
    timeZone: 'Europe/Sofia'
  },
  async () => {
    try {
      logger.info('بدء التحليل اليومي للسوق');

      // الحصول على جميع الاستراتيجيات النشطة
      const strategiesSnapshot = await getDocs(query(
        collection(db, 'saleStrategies'),
        where('status', '==', 'active')
      ));

      for (const strategyDoc of strategiesSnapshot.docs) {
        const strategy = strategyDoc.data();

        // تحديث تحليل السوق
        await performMarketAnalysis(strategy.vin);

        // التحقق من الحاجة لتعديل الاستراتيجية
        await checkStrategyAdjustment(strategy.strategyId);
      }

      logger.info('تم التحليل اليومي للسوق بنجاح');

    } catch (error) {
      logger.error('خطأ في التحليل اليومي للسوق:', error);
    }
  }
);

/**
 * تحسين الأسعار الأسبوعي
 */
export const weeklyPriceOptimization = onSchedule(
  {
    schedule: '0 7 * * 1', // كل يوم اثنين الساعة 7 صباحاً
    timeZone: 'Europe/Sofia'
  },
  async () => {
    try {
      logger.info('بدء تحسين الأسعار الأسبوعي');

      const strategiesSnapshot = await getDocs(query(
        collection(db, 'saleStrategies'),
        where('status', '==', 'active')
      ));

      for (const strategyDoc of strategiesSnapshot.docs) {
        const strategy = strategyDoc.data();

        // تحسين الأسعار بناءً على الأداء
        await optimizeStrategyPrices(strategy.strategyId);
      }

      logger.info('تم تحسين الأسعار الأسبوعي بنجاح');

    } catch (error) {
      logger.error('خطأ في تحسين الأسعار الأسبوعي:', error);
    }
  }
);

/**
 * تنظيف الاستراتيجيات المنتهية الصلاحية
 */
export const cleanupExpiredStrategies = onSchedule(
  {
    schedule: '0 3 * * *', // كل يوم الساعة 3 صباحاً
    timeZone: 'Europe/Sofia'
  },
  async () => {
    try {
      logger.info('بدء تنظيف الاستراتيجيات المنتهية');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const expiredStrategies = await getDocs(query(
        collection(db, 'saleStrategies'),
        where('status', '==', 'active'),
        where('startDate', '<', Timestamp.fromDate(thirtyDaysAgo))
      ));

      for (const strategyDoc of expiredStrategies.docs) {
        const strategy = strategyDoc.data();

        // إنهاء الاستراتيجية إذا لم تكن هناك عروض نشطة
        const activeOffers = strategy.currentOffers?.filter((offer: any) =>
          offer.status === 'pending' || offer.status === 'counter_offered'
        ) || [];

        if (activeOffers.length === 0) {
          await updateDoc(strategyDoc.ref, {
            status: 'completed',
            endDate: Timestamp.now()
          });

          // إشعار المستخدم
          await notifyStrategyCompletion(strategy.userId, strategy.strategyId);

          logger.info(`تم إنهاء استراتيجية البيع: ${strategy.strategyId}`);
        }
      }

      logger.info('تم تنظيف الاستراتيجيات المنتهية بنجاح');

    } catch (error) {
      logger.error('خطأ في تنظيف الاستراتيجيات المنتهية:', error);
    }
  }
);

/**
 * إجراء تحليل السوق لسيارة محددة
 */
async function performMarketAnalysis(vin: string): Promise<void> {
  try {
    // الحصول على بيانات السيارة
    const carDoc = await getDoc(doc(db, 'cars', vin));
    if (!carDoc.exists()) return;

    const car = carDoc.data();

    // البحث عن صفقات مشابهة
    const comparableSales = await findComparableSales(car);

    // حساب القيمة السوقية
    const marketValue = calculateMarketValue(car, comparableSales);

    // تحديث تحليل السوق
    const analysis = {
      vin,
      marketValue,
      comparableSales: comparableSales.slice(0, 5),
      confidence: calculateConfidence(comparableSales),
      lastUpdated: Timestamp.now(),
      trend: await analyzeMarketTrend(car.make, car.model)
    };

    await setDoc(doc(db, 'marketAnalysis', vin), analysis);

    logger.info(`تم تحديث تحليل السوق للسيارة ${vin}: ${marketValue} EUR`);

  } catch (error) {
    logger.error('خطأ في إجراء تحليل السوق:', error);
  }
}

/**
 * البحث عن صفقات مشابهة
 */
async function findComparableSales(car: any): Promise<any[]> {
  try {
    const comparableQuery = query(
      collection(db, 'soldCars'),
      where('make', '==', car.make),
      where('model', '==', car.model),
      orderBy('saleDate', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(comparableQuery);
    const comparables = [];

    snapshot.forEach((doc) => {
      const soldCar = doc.data();
      const similarity = calculateSimilarity(car, soldCar);

      if (similarity > 60) {
        comparables.push({
          ...soldCar,
          similarity,
          id: doc.id
        });
      }
    });

    return comparables.sort((a: any, b: any) => b.similarity - a.similarity);

  } catch (error) {
    logger.error('خطأ في البحث عن صفقات مشابهة:', error);
    return [];
  }
}

/**
 * حساب القيمة السوقية
 */
function calculateMarketValue(car: any, comparables: any[]): number {
  if (comparables.length === 0) {
    return calculateBaseValue(car);
  }

  // حساب متوسط مرجح
  let totalWeightedPrice = 0;
  let totalWeight = 0;

  comparables.slice(0, 5).forEach((comp: any) => {
    const weight = comp.similarity / 100;
    totalWeightedPrice += comp.salePrice * weight;
    totalWeight += weight;
  });

  const averagePrice = totalWeightedPrice / totalWeight;

  // تعديلات العمر والكيلومترات
  const ageAdjustment = calculateAgeAdjustment(car.year);
  const mileageAdjustment = calculateMileageAdjustment(car.mileage);

  return averagePrice * ageAdjustment * mileageAdjustment;
}

/**
 * حساب القيمة الأساسية
 */
function calculateBaseValue(car: any): number {
  const baseValues: { [key: string]: number } = {
    'VW Golf': 15000,
    'BMW 3 Series': 25000,
    'Mercedes C-Class': 28000,
    'Audi A4': 22000,
    'Skoda Octavia': 12000,
    'Opel Astra': 10000,
    'Ford Focus': 11000,
    'Toyota Corolla': 13000
  };

  const key = `${car.make} ${car.model}`;
  return baseValues[key] || 15000;
}

/**
 * حساب التشابه
 */
function calculateSimilarity(car1: any, car2: any): number {
  let similarity = 100;

  const yearDiff = Math.abs(car1.year - car2.year);
  similarity -= yearDiff * 10;

  const mileageDiff = Math.abs(car1.mileage - car2.mileage) / 10000;
  similarity -= mileageDiff * 5;

  return Math.max(0, Math.min(100, similarity));
}

/**
 * حساب الثقة
 */
function calculateConfidence(comparables: any[]): number {
  if (comparables.length === 0) return 30;
  if (comparables.length < 3) return 50;
  if (comparables.length < 5) return 70;
  return 85;
}

/**
 * تحليل اتجاه السوق
 */
async function analyzeMarketTrend(make: string, model: string): Promise<string> {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trendQuery = query(
      collection(db, 'soldCars'),
      where('make', '==', make),
      where('model', '==', model),
      where('saleDate', '>=', Timestamp.fromDate(sixMonthsAgo)),
      orderBy('saleDate', 'asc')
    );

    const snapshot = await getDocs(trendQuery);

    if (snapshot.size < 5) return 'stable';

    const prices = snapshot.docs.map(doc => doc.data().salePrice);
    const recentAvg = prices.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = prices.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.05) return 'increasing';
    if (change < -0.05) return 'decreasing';
    return 'stable';

  } catch (error) {
    logger.error('خطأ في تحليل اتجاه السوق:', error);
    return 'stable';
  }
}

/**
 * تعديلات العمر
 */
function calculateAgeAdjustment(year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  if (age <= 1) return 0.95;
  if (age <= 2) return 0.88;
  if (age <= 3) return 0.82;
  if (age <= 4) return 0.75;
  return 0.68;
}

/**
 * تعديلات الكيلومترات
 */
function calculateMileageAdjustment(mileage: number): number {
  if (mileage < 20000) return 1.05;
  if (mileage < 50000) return 1.00;
  if (mileage < 80000) return 0.95;
  if (mileage < 120000) return 0.90;
  return 0.85;
}

/**
 * تطبيق منطق الذكاء الاصطناعي للاستراتيجية
 */
async function applyAIStrategyLogic(strategyId: string, offer: any): Promise<void> {
  try {
    const strategyDoc = await getDoc(doc(db, 'saleStrategies', strategyId));
    if (!strategyDoc.exists()) return;

    const strategy = strategyDoc.data();

    // منطق الذكاء الاصطناعي البسيط
    let decision = 'pending';
    let counterOffer = null;

    if (offer.amount >= strategy.targetPrice * 0.95) {
      decision = 'accepted';
    } else if (offer.amount < strategy.minimumPrice) {
      decision = 'declined';
    } else if (strategy.strategy === 'aggressive' && strategy.performance.negotiationRounds < 5) {
      counterOffer = Math.min(strategy.targetPrice * 0.95, offer.amount * 1.08);
      decision = 'counter_offered';
    }

    // تحديث العرض
    await updateDoc(doc(db, 'saleOffers', offer.offerId), {
      status: decision,
      counterOffer,
      processedAt: Timestamp.now()
    });

    // تحديث إحصائيات الاستراتيجية
    const newPerformance = {
      ...strategy.performance,
      totalOffers: strategy.performance.totalOffers + 1,
      averageOffer: (strategy.performance.averageOffer * strategy.performance.totalOffers + offer.amount) /
                   (strategy.performance.totalOffers + 1),
      highestOffer: Math.max(strategy.performance.highestOffer, offer.amount)
    };

    if (decision === 'counter_offered') {
      newPerformance.negotiationRounds++;
    }

    await updateDoc(strategyDoc.ref, {
      performance: newPerformance,
      lastActivity: Timestamp.now()
    });

    // إشعار المستخدم
    if (decision === 'accepted' || offer.amount > strategy.targetPrice * 0.90) {
      await notifyUserOfOffer(strategy.userId, offer, decision);
    }

    logger.info(`تم تطبيق منطق الذكاء الاصطناعي على العرض ${offer.offerId}: ${decision}`);

  } catch (error) {
    logger.error('خطأ في تطبيق منطق الذكاء الاصطناعي:', error);
  }
}

/**
 * إنشاء جدولة لمراقبة السوق
 */
async function scheduleMarketMonitoring(strategyId: string): Promise<void> {
  try {
    // في الإنتاج، سيتم إنشاء وظائف مجدولة لمراقبة السوق
    logger.info(`تم إنشاء جدولة مراقبة السوق للاستراتيجية: ${strategyId}`);

  } catch (error) {
    logger.error('خطأ في إنشاء جدولة مراقبة السوق:', error);
  }
}

/**
 * التحقق من الحاجة لتعديل الاستراتيجية
 */
async function checkStrategyAdjustment(strategyId: string): Promise<void> {
  try {
    const strategyDoc = await getDoc(doc(db, 'saleStrategies', strategyId));
    if (!strategyDoc.exists()) return;

    const strategy = strategyDoc.data();

    // إذا لم تكن هناك عروض لأسبوعين، خفض السعر
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentOffers = strategy.currentOffers?.filter((offer: any) =>
      offer.timestamp.toDate() > twoWeeksAgo
    ) || [];

    if (recentOffers.length === 0 && strategy.strategy !== 'aggressive') {
      // خفض السعر بنسبة 5%
      const newTargetPrice = strategy.targetPrice * 0.95;
      const newMinimumPrice = strategy.minimumPrice * 0.95;

      await updateDoc(strategyDoc.ref, {
        targetPrice: newTargetPrice,
        minimumPrice: newMinimumPrice,
        rules: {
          ...strategy.rules,
          acceptOffersAbove: newTargetPrice * 0.95
        }
      });

      logger.info(`تم تعديل أسعار الاستراتيجية ${strategyId} بسبب عدم النشاط`);
    }

  } catch (error) {
    logger.error('خطأ في التحقق من تعديل الاستراتيجية:', error);
  }
}

/**
 * تحسين أسعار الاستراتيجية
 */
async function optimizeStrategyPrices(strategyId: string): Promise<void> {
  try {
    const strategyDoc = await getDoc(doc(db, 'saleStrategies', strategyId));
    if (!strategyDoc.exists()) return;

    const strategy = strategyDoc.data();

    // تحليل الأداء
    const performance = strategy.performance;
    const successRate = performance.totalOffers > 0 ?
      (strategy.currentOffers?.filter((o: any) => o.status === 'accepted').length || 0) / performance.totalOffers : 0;

    // تعديل الأسعار بناءً على الأداء
    let priceAdjustment = 1.0;

    if (successRate > 0.3) {
      // أداء جيد - زيادة الأسعار قليلاً
      priceAdjustment = 1.03;
    } else if (successRate < 0.1 && performance.totalOffers > 5) {
      // أداء ضعيف - خفض الأسعار
      priceAdjustment = 0.97;
    }

    if (priceAdjustment !== 1.0) {
      const newTargetPrice = strategy.targetPrice * priceAdjustment;
      const newMinimumPrice = strategy.minimumPrice * priceAdjustment;

      await updateDoc(strategyDoc.ref, {
        targetPrice: newTargetPrice,
        minimumPrice: newMinimumPrice,
        rules: {
          ...strategy.rules,
          acceptOffersAbove: newTargetPrice * 0.95
        },
        lastOptimization: Timestamp.now()
      });

      logger.info(`تم تحسين أسعار الاستراتيجية ${strategyId}: ${priceAdjustment}`);
    }

  } catch (error) {
    logger.error('خطأ في تحسين أسعار الاستراتيجية:', error);
  }
}

/**
 * إشعار المستخدم بالعرض
 */
async function notifyUserOfOffer(userId: string, offer: any, decision: string): Promise<void> {
  try {
    await setDoc(doc(collection(db, 'notifications')), {
      userId,
      type: 'sale_offer',
      title: decision === 'accepted' ? 'عرض شراء مقبول!' : 'عرض شراء جديد',
      message: `عرض شراء بقيمة ${offer.amount} EUR - ${decision}`,
      data: { offerId: offer.offerId },
      read: false,
      timestamp: Timestamp.now()
    });

  } catch (error) {
    logger.error('خطأ في إشعار المستخدم بالعرض:', error);
  }
}

/**
 * إشعار المستخدم بانتهاء الاستراتيجية
 */
async function notifyStrategyCompletion(userId: string, strategyId: string): Promise<void> {
  try {
    await setDoc(doc(collection(db, 'notifications')), {
      userId,
      type: 'strategy_completed',
      title: 'انتهت استراتيجية البيع التلقائي',
      message: 'لم يعد هناك نشاط في استراتيجية البيع التلقائي الخاصة بك',
      data: { strategyId },
      read: false,
      timestamp: Timestamp.now()
    });

  } catch (error) {
    logger.error('خطأ في إشعار انتهاء الاستراتيجية:', error);
  }
}