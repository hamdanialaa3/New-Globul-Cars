"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monthlyInsuranceAnalysis = exports.onInsuranceClaimUpdated = exports.onInsuranceClaimSubmitted = exports.dailyRiskScoreUpdate = exports.onDrivingBehaviorRecorded = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_2 = require("firebase/firestore");
const firebase_functions_1 = require("firebase-functions");
const db = (0, firestore_2.getFirestore)();
/**
 * معالجة تسجيل سلوك القيادة الجديد وتحديث نقاط المخاطر
 */
exports.onDrivingBehaviorRecorded = (0, firestore_1.onDocumentCreated)('drivingBehavior/{behaviorId}', async (event) => {
    var _a;
    try {
        const behavior = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        if (!behavior)
            return;
        firebase_functions_1.logger.info(`تسجيل سلوك قيادة جديد للمستخدم ${behavior.userId}`);
        // تحديث نقاط المخاطر
        await updateRiskScore(behavior.userId, behavior.vin);
        // التحقق من الحاجة لتعديل التأمين
        await checkInsuranceAdjustment(behavior.userId, behavior.vin);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في معالجة سلوك القيادة:', error);
    }
});
/**
 * تحديث دوري لنقاط المخاطر (يومياً)
 */
exports.dailyRiskScoreUpdate = (0, scheduler_1.onSchedule)({
    schedule: '0 2 * * *', // كل يوم الساعة 2 صباحاً
    timeZone: 'Europe/Sofia'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء التحديث اليومي لنقاط المخاطر');
        // الحصول على جميع المستخدمين النشطين
        const usersSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.collection)(db, 'users'));
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            // الحصول على سيارات المستخدم
            const carsSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'cars'), (0, firestore_2.where)('userId', '==', userId), (0, firestore_2.where)('status', '==', 'active')));
            for (const carDoc of carsSnapshot.docs) {
                const vin = carDoc.data().vin;
                // تحديث نقاط المخاطر
                await updateRiskScore(userId, vin);
                // التحقق من التأمين
                await checkInsuranceAdjustment(userId, vin);
            }
        }
        firebase_functions_1.logger.info('تم التحديث اليومي لنقاط المخاطر بنجاح');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في التحديث اليومي لنقاط المخاطر:', error);
    }
});
/**
 * معالجة مطالبات التأمين الجديدة
 */
exports.onInsuranceClaimSubmitted = (0, firestore_1.onDocumentCreated)('insuranceClaims/{claimId}', async (event) => {
    var _a;
    try {
        const claim = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
        if (!claim)
            return;
        firebase_functions_1.logger.info(`مطالبة تأمين جديدة: ${claim.claimId}`);
        // إشعار شركة التأمين
        await notifyInsuranceProvider(claim);
        // تحديث تاريخ الحوادث للسيارة
        await updateAccidentHistory(claim.userId, claim.vin);
        // إعادة تقييم نقاط المخاطر
        await updateRiskScore(claim.userId, claim.vin);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في معالجة مطالبة التأمين:', error);
    }
});
/**
 * معالجة تحديثات حالة المطالبات
 */
exports.onInsuranceClaimUpdated = (0, firestore_1.onDocumentUpdated)('insuranceClaims/{claimId}', async (event) => {
    var _a, _b;
    try {
        const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
        const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
        if (!before || !after)
            return;
        // إشعار المستخدم عند تغيير الحالة
        if (before.status !== after.status) {
            await notifyUserOfClaimUpdate(after);
        }
        // إذا تمت الموافقة على المطالبة، تحديث نقاط المخاطر
        if (after.status === 'approved' && before.status !== 'approved') {
            await updateRiskScore(after.userId, after.vin);
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في معالجة تحديث المطالبة:', error);
    }
});
/**
 * تحليل شهري لأنماط التأمين (شهرياً)
 */
exports.monthlyInsuranceAnalysis = (0, scheduler_1.onSchedule)({
    schedule: '0 3 1 * *', // أول يوم من كل شهر الساعة 3 صباحاً
    timeZone: 'Europe/Sofia'
}, async () => {
    try {
        firebase_functions_1.logger.info('بدء التحليل الشهري للتأمين');
        // تحليل أنماط المطالبات
        await analyzeClaimPatterns();
        // تحديث أسعار التأمين الأساسية
        await updateBasePremiums();
        // إنشاء تقارير لشركات التأمين
        await generateInsuranceReports();
        firebase_functions_1.logger.info('تم التحليل الشهري للتأمين بنجاح');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في التحليل الشهري للتأمين:', error);
    }
});
/**
 * تحديث نقاط المخاطر لمستخدم وسيارة محددة
 */
async function updateRiskScore(userId, vin) {
    try {
        // الحصول على سلوك القيادة للأشهر الثلاثة الماضية
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const behaviorSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'drivingBehavior'), (0, firestore_2.where)('userId', '==', userId), (0, firestore_2.where)('vin', '==', vin), (0, firestore_2.where)('date', '>=', firestore_2.Timestamp.fromDate(threeMonthsAgo))));
        if (behaviorSnapshot.empty)
            return;
        const behaviors = behaviorSnapshot.docs.map((doc) => doc.data());
        // حساب متوسط السلوك
        const avgBehavior = calculateAverageBehavior(behaviors);
        // حساب نقاط المخاطر
        const riskScore = calculateRiskScore(avgBehavior);
        // حفظ نقاط المخاطر
        await (0, firestore_2.setDoc)((0, firestore_2.doc)((0, firestore_2.collection)(db, 'riskScores'), `${userId}_${vin}`), Object.assign(Object.assign({}, riskScore), { userId,
            vin, lastUpdated: firestore_2.Timestamp.now() }));
        firebase_functions_1.logger.info(`تم تحديث نقاط المخاطر للمستخدم ${userId}: ${riskScore.overallScore}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تحديث نقاط المخاطر:', error);
    }
}
/**
 * حساب متوسط سلوك القيادة
 */
function calculateAverageBehavior(behaviors) {
    var _a;
    const total = behaviors.length;
    return {
        totalDistance: behaviors.reduce((sum, b) => sum + b.totalDistance, 0) / total,
        averageSpeed: behaviors.reduce((sum, b) => sum + b.averageSpeed, 0) / total,
        maxSpeed: Math.max(...behaviors.map((b) => b.maxSpeed)),
        harshAcceleration: behaviors.reduce((sum, b) => sum + b.harshAcceleration, 0) / total,
        harshBraking: behaviors.reduce((sum, b) => sum + b.harshBraking, 0) / total,
        speedingEvents: behaviors.reduce((sum, b) => sum + b.speedingEvents, 0) / total,
        nightDriving: behaviors.reduce((sum, b) => sum + b.nightDriving, 0) / total,
        cityDriving: behaviors.reduce((sum, b) => sum + b.cityDriving, 0) / total,
        highwayDriving: behaviors.reduce((sum, b) => sum + b.highwayDriving, 0) / total,
        idleTime: behaviors.reduce((sum, b) => sum + b.idleTime, 0) / total,
        fuelEfficiency: behaviors.reduce((sum, b) => sum + b.fuelEfficiency, 0) / total,
        accidentHistory: ((_a = behaviors[behaviors.length - 1]) === null || _a === void 0 ? void 0 : _a.accidentHistory) || 0
    };
}
/**
 * حساب نقاط المخاطر
 */
function calculateRiskScore(behavior) {
    let speedRisk = 0;
    if (behavior.maxSpeed > 120)
        speedRisk = 30;
    else if (behavior.maxSpeed > 100)
        speedRisk = 15;
    let accelerationRisk = (behavior.harshAcceleration + behavior.harshBraking) * 5;
    accelerationRisk = Math.min(accelerationRisk, 40);
    let distanceRisk = 0;
    if (behavior.totalDistance > 2000)
        distanceRisk = -10;
    else if (behavior.totalDistance < 500)
        distanceRisk = 10;
    let timeRisk = 0;
    if (behavior.nightDriving > 30)
        timeRisk = 20;
    if (behavior.idleTime > 60)
        timeRisk += 10;
    let accidentRisk = behavior.accidentHistory * 25;
    const overallScore = Math.max(0, Math.min(100, 20 + speedRisk + accelerationRisk + distanceRisk + timeRisk + accidentRisk));
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
async function checkInsuranceAdjustment(userId, vin) {
    try {
        const riskDoc = await (0, firestore_2.getDoc)((0, firestore_2.doc)((0, firestore_2.collection)(db, 'riskScores'), `${userId}_${vin}`));
        if (!riskDoc.exists)
            return;
        const riskScore = riskDoc.data();
        if (!riskScore)
            return;
        const policySnapshot = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'insurancePolicies'), (0, firestore_2.where)('userId', '==', userId), (0, firestore_2.where)('vin', '==', vin), (0, firestore_2.where)('status', '==', 'active')));
        if (policySnapshot.empty)
            return;
        const policyDoc = policySnapshot.docs[0];
        const policy = policyDoc.data();
        // حساب التعديل
        let riskAdjustment = 0;
        if (riskScore.overallScore < 20)
            riskAdjustment = -15;
        else if (riskScore.overallScore < 40)
            riskAdjustment = -5;
        else if (riskScore.overallScore > 70)
            riskAdjustment = 25;
        else if (riskScore.overallScore > 50)
            riskAdjustment = 10;
        const newPremium = policy.basePremium * (1 + riskAdjustment / 100);
        await (0, firestore_2.updateDoc)(policyDoc.ref, {
            currentPremium: newPremium,
            riskAdjustment,
            lastRiskAssessment: firestore_2.Timestamp.now()
        });
        firebase_functions_1.logger.info(`تم تحديث قسط التأمين للسيارة ${vin}: ${policy.currentPremium} → ${newPremium} EUR`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في التحقق من تعديل التأمين:', error);
    }
}
/**
 * إشعار شركة التأمين بمطالبة جديدة
 */
async function notifyInsuranceProvider(claim) {
    try {
        // في الإنتاج، سيتم إرسال إشعار لشركة التأمين عبر API أو Pub/Sub
        firebase_functions_1.logger.info(`إرسال إشعار مطالبة تأمين لشركة التأمين: ${claim.claimId}`);
        // محاكاة إرسال إشعار
        await (0, firestore_2.addDoc)((0, firestore_2.collection)(db, 'insuranceNotifications'), {
            claimId: claim.claimId,
            provider: claim.policyId ? 'provider_api' : 'unknown',
            message: `مطالبة تأمين جديدة: ${claim.description}`,
            timestamp: firestore_2.Timestamp.now(),
            status: 'sent'
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إشعار شركة التأمين:', error);
    }
}
/**
 * تحديث تاريخ الحوادث
 */
async function updateAccidentHistory(userId, vin) {
    try {
        const claimsSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'insuranceClaims'), (0, firestore_2.where)('userId', '==', userId), (0, firestore_2.where)('vin', '==', vin), (0, firestore_2.where)('status', '!=', 'denied')));
        const accidentCount = claimsSnapshot.size;
        // تحديث سجل سلوك القيادة الأخير
        const behaviorQuery = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'drivingBehavior'), (0, firestore_2.where)('userId', '==', userId), (0, firestore_2.where)('vin', '==', vin), (0, firestore_2.orderBy)('date', 'desc'), (0, firestore_2.limit)(1)));
        if (!behaviorQuery.empty) {
            const behaviorDoc = behaviorQuery.docs[0];
            await (0, firestore_2.updateDoc)(behaviorDoc.ref, {
                accidentHistory: accidentCount
            });
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تحديث تاريخ الحوادث:', error);
    }
}
/**
 * إشعار المستخدم بتحديث المطالبة
 */
async function notifyUserOfClaimUpdate(claim) {
    try {
        // إضافة إشعار للمستخدم
        await (0, firestore_2.addDoc)((0, firestore_2.collection)(db, 'notifications'), {
            userId: claim.userId,
            type: 'insurance_claim_update',
            title: 'تحديث مطالبة التأمين',
            message: `تم تحديث حالة مطالبة التأمين ${claim.claimId} إلى: ${claim.status}`,
            data: { claimId: claim.claimId },
            read: false,
            timestamp: firestore_2.Timestamp.now()
        });
        firebase_functions_1.logger.info(`تم إرسال إشعار تحديث المطالبة للمستخدم ${claim.userId}`);
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إشعار المستخدم:', error);
    }
}
/**
 * تحليل أنماط المطالبات
 */
async function analyzeClaimPatterns() {
    try {
        // تحليل المطالبات للشهر الماضي
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const claimsSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'insuranceClaims'), (0, firestore_2.where)('reportDate', '>=', firestore_2.Timestamp.fromDate(lastMonth))));
        const claims = claimsSnapshot.docs.map((doc) => doc.data());
        // تحليل أنواع المطالبات
        const claimTypes = claims.reduce((acc, claim) => {
            acc[claim.type] = (acc[claim.type] || 0) + 1;
            return acc;
        }, {});
        // حفظ نتائج التحليل
        await (0, firestore_2.setDoc)((0, firestore_2.doc)((0, firestore_2.collection)(db, 'insuranceAnalytics'), 'monthly_patterns'), {
            month: lastMonth.toISOString().substring(0, 7),
            totalClaims: claims.length,
            claimTypes,
            averageDamage: claims.reduce((sum, c) => sum + c.estimatedDamage, 0) / claims.length || 0,
            timestamp: firestore_2.Timestamp.now()
        });
        firebase_functions_1.logger.info('تم تحليل أنماط المطالبات الشهرية');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تحليل أنماط المطالبات:', error);
    }
}
/**
 * تحديث الأسعار الأساسية
 */
async function updateBasePremiums() {
    try {
        // تحديث الأسعار الأساسية بناءً على متوسط السوق
        // في الإنتاج، سيتم استخدام بيانات السوق الحقيقية
        const marketAverage = 85; // يورو شهرياً (محاكاة)
        await (0, firestore_2.setDoc)((0, firestore_2.doc)((0, firestore_2.collection)(db, 'insuranceAnalytics'), 'market_rates'), {
            averagePremium: marketAverage,
            lastUpdated: firestore_2.Timestamp.now()
        });
        firebase_functions_1.logger.info('تم تحديث الأسعار الأساسية للتأمين');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في تحديث الأسعار الأساسية:', error);
    }
}
/**
 * إنشاء تقارير التأمين
 */
async function generateInsuranceReports() {
    try {
        // إنشاء تقرير شهري لشركات التأمين
        const report = {
            month: new Date().toISOString().substring(0, 7),
            totalPolicies: 0,
            totalPremiums: 0,
            totalClaims: 0,
            totalPayouts: 0,
            riskDistribution: {},
            timestamp: firestore_2.Timestamp.now()
        };
        // حساب إحصائيات السياسات
        const policiesSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.query)((0, firestore_2.collection)(db, 'insurancePolicies'), (0, firestore_2.where)('status', '==', 'active')));
        report.totalPolicies = policiesSnapshot.size;
        report.totalPremiums = policiesSnapshot.docs.reduce((sum, doc) => sum + doc.data().currentPremium, 0);
        // حساب إحصائيات المطالبات
        const claimsSnapshot = await (0, firestore_2.getDocs)((0, firestore_2.collection)(db, 'insuranceClaims'));
        report.totalClaims = claimsSnapshot.size;
        report.totalPayouts = claimsSnapshot.docs
            .filter((doc) => doc.data().status === 'paid')
            .reduce((sum, doc) => sum + doc.data().approvedAmount, 0);
        // حفظ التقرير
        await (0, firestore_2.addDoc)((0, firestore_2.collection)(db, 'insuranceReports'), report);
        firebase_functions_1.logger.info('تم إنشاء تقرير التأمين الشهري');
    }
    catch (error) {
        firebase_functions_1.logger.error('خطأ في إنشاء تقارير التأمين:', error);
    }
}
//# sourceMappingURL=dynamic-insurance.js.map