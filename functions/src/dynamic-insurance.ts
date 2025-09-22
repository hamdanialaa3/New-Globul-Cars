import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, addDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { logger } from 'firebase-functions';

const db = getFirestore();

/**
 * معالجة تسجيل سلوك القيادة الجديد وتحديث نقاط المخاطر
 */
export const onDrivingBehaviorRecorded = onDocumentCreated(
  'drivingBehavior/{behaviorId}',
  async (event) => {
    try {
      const behavior = event.data?.data();
      if (!behavior) return;

      logger.info(`تسجيل سلوك قيادة جديد للمستخدم ${behavior.userId}`);

      // تحديث نقاط المخاطر
      await updateRiskScore(behavior.userId, behavior.vin);

      // التحقق من الحاجة لتعديل التأمين
      await checkInsuranceAdjustment(behavior.userId, behavior.vin);

    } catch (error) {
      logger.error('خطأ في معالجة سلوك القيادة:', error);
    }
  }
);

/**
 * تحديث دوري لنقاط المخاطر (يومياً)
 */
export const dailyRiskScoreUpdate = onSchedule(
  {
    schedule: '0 2 * * *', // كل يوم الساعة 2 صباحاً
    timeZone: 'Europe/Sofia'
  },
  async () => {
    try {
      logger.info('بدء التحديث اليومي لنقاط المخاطر');

      // الحصول على جميع المستخدمين النشطين
      const usersSnapshot = await getDocs(collection(db, 'users'));

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        // الحصول على سيارات المستخدم
        const carsSnapshot = await getDocs(query(
          collection(db, 'cars'),
          where('userId', '==', userId),
          where('status', '==', 'active')
        ));

        for (const carDoc of carsSnapshot.docs) {
          const vin = carDoc.data().vin;

          // تحديث نقاط المخاطر
          await updateRiskScore(userId, vin);

          // التحقق من التأمين
          await checkInsuranceAdjustment(userId, vin);
        }
      }

      logger.info('تم التحديث اليومي لنقاط المخاطر بنجاح');

    } catch (error) {
      logger.error('خطأ في التحديث اليومي لنقاط المخاطر:', error);
    }
  }
);

/**
 * معالجة مطالبات التأمين الجديدة
 */
export const onInsuranceClaimSubmitted = onDocumentCreated(
  'insuranceClaims/{claimId}',
  async (event) => {
    try {
      const claim = event.data?.data();
      if (!claim) return;

      logger.info(`مطالبة تأمين جديدة: ${claim.claimId}`);

      // إشعار شركة التأمين
      await notifyInsuranceProvider(claim);

      // تحديث تاريخ الحوادث للسيارة
      await updateAccidentHistory(claim.userId, claim.vin);

      // إعادة تقييم نقاط المخاطر
      await updateRiskScore(claim.userId, claim.vin);

    } catch (error) {
      logger.error('خطأ في معالجة مطالبة التأمين:', error);
    }
  }
);

/**
 * معالجة تحديثات حالة المطالبات
 */
export const onInsuranceClaimUpdated = onDocumentUpdated(
  'insuranceClaims/{claimId}',
  async (event) => {
    try {
      const before = event.data?.before.data();
      const after = event.data?.after.data();

      if (!before || !after) return;

      // إشعار المستخدم عند تغيير الحالة
      if (before.status !== after.status) {
        await notifyUserOfClaimUpdate(after);
      }

      // إذا تمت الموافقة على المطالبة، تحديث نقاط المخاطر
      if (after.status === 'approved' && before.status !== 'approved') {
        await updateRiskScore(after.userId, after.vin);
      }

    } catch (error) {
      logger.error('خطأ في معالجة تحديث المطالبة:', error);
    }
  }
);

/**
 * تحليل شهري لأنماط التأمين (شهرياً)
 */
export const monthlyInsuranceAnalysis = onSchedule(
  {
    schedule: '0 3 1 * *', // أول يوم من كل شهر الساعة 3 صباحاً
    timeZone: 'Europe/Sofia'
  },
  async () => {
    try {
      logger.info('بدء التحليل الشهري للتأمين');

      // تحليل أنماط المطالبات
      await analyzeClaimPatterns();

      // تحديث أسعار التأمين الأساسية
      await updateBasePremiums();

      // إنشاء تقارير لشركات التأمين
      await generateInsuranceReports();

      logger.info('تم التحليل الشهري للتأمين بنجاح');

    } catch (error) {
      logger.error('خطأ في التحليل الشهري للتأمين:', error);
    }
  }
);

/**
 * تحديث نقاط المخاطر لمستخدم وسيارة محددة
 */
async function updateRiskScore(userId: string, vin: string): Promise<void> {
  try {
    // الحصول على سلوك القيادة للأشهر الثلاثة الماضية
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const behaviorSnapshot = await getDocs(query(
      collection(db, 'drivingBehavior'),
      where('userId', '==', userId),
      where('vin', '==', vin),
      where('date', '>=', Timestamp.fromDate(threeMonthsAgo))
    ));

    if (behaviorSnapshot.empty) return;

    const behaviors = behaviorSnapshot.docs.map((doc: any) => doc.data());

    // حساب متوسط السلوك
    const avgBehavior = calculateAverageBehavior(behaviors);

    // حساب نقاط المخاطر
    const riskScore = calculateRiskScore(avgBehavior);

    // حفظ نقاط المخاطر
    await setDoc(doc(collection(db, 'riskScores'), `${userId}_${vin}`), {
      ...riskScore,
      userId,
      vin,
      lastUpdated: Timestamp.now()
    });

    logger.info(`تم تحديث نقاط المخاطر للمستخدم ${userId}: ${riskScore.overallScore}`);

  } catch (error) {
    logger.error('خطأ في تحديث نقاط المخاطر:', error);
  }
}

/**
 * حساب متوسط سلوك القيادة
 */
function calculateAverageBehavior(behaviors: any[]): any {
  const total = behaviors.length;

  return {
    totalDistance: behaviors.reduce((sum: number, b: any) => sum + b.totalDistance, 0) / total,
    averageSpeed: behaviors.reduce((sum: number, b: any) => sum + b.averageSpeed, 0) / total,
    maxSpeed: Math.max(...behaviors.map((b: any) => b.maxSpeed)),
    harshAcceleration: behaviors.reduce((sum: number, b: any) => sum + b.harshAcceleration, 0) / total,
    harshBraking: behaviors.reduce((sum: number, b: any) => sum + b.harshBraking, 0) / total,
    speedingEvents: behaviors.reduce((sum: number, b: any) => sum + b.speedingEvents, 0) / total,
    nightDriving: behaviors.reduce((sum: number, b: any) => sum + b.nightDriving, 0) / total,
    cityDriving: behaviors.reduce((sum: number, b: any) => sum + b.cityDriving, 0) / total,
    highwayDriving: behaviors.reduce((sum: number, b: any) => sum + b.highwayDriving, 0) / total,
    idleTime: behaviors.reduce((sum: number, b: any) => sum + b.idleTime, 0) / total,
    fuelEfficiency: behaviors.reduce((sum: number, b: any) => sum + b.fuelEfficiency, 0) / total,
    accidentHistory: behaviors[behaviors.length - 1]?.accidentHistory || 0
  };
}

/**
 * حساب نقاط المخاطر
 */
function calculateRiskScore(behavior: any): any {
  let speedRisk = 0;
  if (behavior.maxSpeed > 120) speedRisk = 30;
  else if (behavior.maxSpeed > 100) speedRisk = 15;

  let accelerationRisk = (behavior.harshAcceleration + behavior.harshBraking) * 5;
  accelerationRisk = Math.min(accelerationRisk, 40);

  let distanceRisk = 0;
  if (behavior.totalDistance > 2000) distanceRisk = -10;
  else if (behavior.totalDistance < 500) distanceRisk = 10;

  let timeRisk = 0;
  if (behavior.nightDriving > 30) timeRisk = 20;
  if (behavior.idleTime > 60) timeRisk += 10;

  let accidentRisk = behavior.accidentHistory * 25;

  const overallScore = Math.max(0, Math.min(100,
    20 + speedRisk + accelerationRisk + distanceRisk + timeRisk + accidentRisk
  ));

  return {
    overallScore,
    speedRisk,
    accelerationRisk,
    distanceRisk,
    timeRisk,
    accidentRisk,
    trend: 'stable'
  };
}

/**
 * التحقق من الحاجة لتعديل التأمين
 */
async function checkInsuranceAdjustment(userId: string, vin: string): Promise<void> {
  try {
    const riskDoc = await getDoc(doc(collection(db, 'riskScores'), `${userId}_${vin}`));
    if (!riskDoc.exists) return;

    const riskScore = riskDoc.data();
    if (!riskScore) return;

    const policySnapshot = await getDocs(query(
      collection(db, 'insurancePolicies'),
      where('userId', '==', userId),
      where('vin', '==', vin),
      where('status', '==', 'active')
    ));

    if (policySnapshot.empty) return;

    const policyDoc = policySnapshot.docs[0];
    const policy = policyDoc.data();

    // حساب التعديل
    let riskAdjustment = 0;
    if (riskScore.overallScore < 20) riskAdjustment = -15;
    else if (riskScore.overallScore < 40) riskAdjustment = -5;
    else if (riskScore.overallScore > 70) riskAdjustment = 25;
    else if (riskScore.overallScore > 50) riskAdjustment = 10;

    const newPremium = policy.basePremium * (1 + riskAdjustment / 100);

    await updateDoc(policyDoc.ref, {
      currentPremium: newPremium,
      riskAdjustment,
      lastRiskAssessment: Timestamp.now()
    });

    logger.info(`تم تحديث قسط التأمين للسيارة ${vin}: ${policy.currentPremium} → ${newPremium} EUR`);

  } catch (error) {
    logger.error('خطأ في التحقق من تعديل التأمين:', error);
  }
}

/**
 * إشعار شركة التأمين بمطالبة جديدة
 */
async function notifyInsuranceProvider(claim: any): Promise<void> {
  try {
    // في الإنتاج، سيتم إرسال إشعار لشركة التأمين عبر API أو Pub/Sub
    logger.info(`إرسال إشعار مطالبة تأمين لشركة التأمين: ${claim.claimId}`);

    // محاكاة إرسال إشعار
    await addDoc(collection(db, 'insuranceNotifications'), {
      claimId: claim.claimId,
      provider: claim.policyId ? 'provider_api' : 'unknown',
      message: `مطالبة تأمين جديدة: ${claim.description}`,
      timestamp: Timestamp.now(),
      status: 'sent'
    });

  } catch (error) {
    logger.error('خطأ في إشعار شركة التأمين:', error);
  }
}

/**
 * تحديث تاريخ الحوادث
 */
async function updateAccidentHistory(userId: string, vin: string): Promise<void> {
  try {
    const claimsSnapshot = await getDocs(query(
      collection(db, 'insuranceClaims'),
      where('userId', '==', userId),
      where('vin', '==', vin),
      where('status', '!=', 'denied')
    ));

    const accidentCount = claimsSnapshot.size;

    // تحديث سجل سلوك القيادة الأخير
    const behaviorQuery = await getDocs(query(
      collection(db, 'drivingBehavior'),
      where('userId', '==', userId),
      where('vin', '==', vin),
      orderBy('date', 'desc'),
      limit(1)
    ));

    if (!behaviorQuery.empty) {
      const behaviorDoc = behaviorQuery.docs[0];
      await updateDoc(behaviorDoc.ref, {
        accidentHistory: accidentCount
      });
    }

  } catch (error) {
    logger.error('خطأ في تحديث تاريخ الحوادث:', error);
  }
}

/**
 * إشعار المستخدم بتحديث المطالبة
 */
async function notifyUserOfClaimUpdate(claim: any): Promise<void> {
  try {
    // إضافة إشعار للمستخدم
    await addDoc(collection(db, 'notifications'), {
      userId: claim.userId,
      type: 'insurance_claim_update',
      title: 'تحديث مطالبة التأمين',
      message: `تم تحديث حالة مطالبة التأمين ${claim.claimId} إلى: ${claim.status}`,
      data: { claimId: claim.claimId },
      read: false,
      timestamp: Timestamp.now()
    });

    logger.info(`تم إرسال إشعار تحديث المطالبة للمستخدم ${claim.userId}`);

  } catch (error) {
    logger.error('خطأ في إشعار المستخدم:', error);
  }
}

/**
 * تحليل أنماط المطالبات
 */
async function analyzeClaimPatterns(): Promise<void> {
  try {
    // تحليل المطالبات للشهر الماضي
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const claimsSnapshot = await getDocs(query(
      collection(db, 'insuranceClaims'),
      where('reportDate', '>=', Timestamp.fromDate(lastMonth))
    ));

    const claims = claimsSnapshot.docs.map((doc: any) => doc.data());

    // تحليل أنواع المطالبات
    const claimTypes = claims.reduce((acc: any, claim: any) => {
      acc[claim.type] = (acc[claim.type] || 0) + 1;
      return acc;
    }, {});

    // حفظ نتائج التحليل
    await setDoc(doc(collection(db, 'insuranceAnalytics'), 'monthly_patterns'), {
      month: lastMonth.toISOString().substring(0, 7),
      totalClaims: claims.length,
      claimTypes,
      averageDamage: claims.reduce((sum: number, c: any) => sum + c.estimatedDamage, 0) / claims.length || 0,
      timestamp: Timestamp.now()
    });

    logger.info('تم تحليل أنماط المطالبات الشهرية');

  } catch (error) {
    logger.error('خطأ في تحليل أنماط المطالبات:', error);
  }
}

/**
 * تحديث الأسعار الأساسية
 */
async function updateBasePremiums(): Promise<void> {
  try {
    // تحديث الأسعار الأساسية بناءً على متوسط السوق
    // في الإنتاج، سيتم استخدام بيانات السوق الحقيقية

    const marketAverage = 85; // يورو شهرياً (محاكاة)

    await setDoc(doc(collection(db, 'insuranceAnalytics'), 'market_rates'), {
      averagePremium: marketAverage,
      lastUpdated: Timestamp.now()
    });

    logger.info('تم تحديث الأسعار الأساسية للتأمين');

  } catch (error) {
    logger.error('خطأ في تحديث الأسعار الأساسية:', error);
  }
}

/**
 * إنشاء تقارير التأمين
 */
async function generateInsuranceReports(): Promise<void> {
  try {
    // إنشاء تقرير شهري لشركات التأمين
    const report = {
      month: new Date().toISOString().substring(0, 7),
      totalPolicies: 0,
      totalPremiums: 0,
      totalClaims: 0,
      totalPayouts: 0,
      riskDistribution: {},
      timestamp: Timestamp.now()
    };

    // حساب إحصائيات السياسات
    const policiesSnapshot = await getDocs(query(
      collection(db, 'insurancePolicies'),
      where('status', '==', 'active')
    ));

    report.totalPolicies = policiesSnapshot.size;
    report.totalPremiums = policiesSnapshot.docs.reduce((sum: number, doc: any) =>
      sum + doc.data().currentPremium, 0);

    // حساب إحصائيات المطالبات
    const claimsSnapshot = await getDocs(collection(db, 'insuranceClaims'));
    report.totalClaims = claimsSnapshot.size;
    report.totalPayouts = claimsSnapshot.docs
      .filter((doc: any) => doc.data().status === 'paid')
      .reduce((sum: number, doc: any) => sum + doc.data().approvedAmount, 0);

    // حفظ التقرير
    await addDoc(collection(db, 'insuranceReports'), report);

    logger.info('تم إنشاء تقرير التأمين الشهري');

  } catch (error) {
    logger.error('خطأ في إنشاء تقارير التأمين:', error);
  }
}