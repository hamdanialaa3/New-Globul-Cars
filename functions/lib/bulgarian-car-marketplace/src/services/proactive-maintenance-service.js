"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proactiveMaintenanceService = exports.ProactiveMaintenanceService = void 0;
const firestore_1 = require("firebase/firestore");
const firestore_2 = require("firebase/firestore");
class ProactiveMaintenanceService {
    constructor() {
        this.db = (0, firestore_2.getFirestore)();
        this.BULGARIAN_TIMEZONE = 'Europe/Sofia';
    }
    /**
     * إنشاء تنبيه صيانة استباقي
     */
    async createMaintenanceAlert(alertData) {
        try {
            const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const alertRef = (0, firestore_1.doc)(this.db, 'maintenanceAlerts', alertId);
            const alert = Object.assign(Object.assign({}, alertData), { id: alertId, createdAt: firestore_1.Timestamp.now(), expiresAt: firestore_1.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 أيام
             });
            await (0, firestore_1.setDoc)(alertRef, alert);
            // إرسال إشعارات لمراكز الخدمة المناسبة
            await this.notifyServiceCenters(alert);
            return alertId;
        }
        catch (error) {
            console.error('خطأ في إنشاء تنبيه الصيانة:', error);
            throw new Error('فشل في إنشاء تنبيه الصيانة');
        }
    }
    /**
     * الحصول على تنبيهات الصيانة لمستخدم
     */
    async getUserMaintenanceAlerts(userId) {
        try {
            const alertsQuery = (0, firestore_1.query)((0, firestore_1.collection)(this.db, 'maintenanceAlerts'), (0, firestore_1.where)('userId', '==', userId), (0, firestore_1.where)('status', '==', 'active'), (0, firestore_1.orderBy)('createdAt', 'desc'));
            const alertsSnapshot = await (0, firestore_1.getDocs)(alertsQuery);
            return alertsSnapshot.docs.map(doc => doc.data());
        }
        catch (error) {
            console.error('خطأ في الحصول على تنبيهات الصيانة:', error);
            return [];
        }
    }
    /**
     * إرسال عرض من مركز خدمة
     */
    async submitServiceOffer(alertId, offer) {
        try {
            const alertRef = (0, firestore_1.doc)(this.db, 'maintenanceAlerts', alertId);
            const alertDoc = await (0, firestore_1.getDoc)(alertRef);
            if (!alertDoc.exists()) {
                throw new Error('تنبيه الصيانة غير موجود');
            }
            const alert = alertDoc.data();
            // إضافة العرض إلى قائمة العروض
            const updatedOffers = [...alert.serviceCenters, offer];
            await (0, firestore_1.updateDoc)(alertRef, {
                serviceCenters: updatedOffers
            });
        }
        catch (error) {
            console.error('خطأ في إرسال عرض الخدمة:', error);
            throw new Error('فشل في إرسال عرض الخدمة');
        }
    }
    /**
     * قبول عرض صيانة وإنشاء طلب خدمة
     */
    async acceptServiceOffer(alertId, centerId, scheduledDate) {
        try {
            const alertRef = (0, firestore_1.doc)(this.db, 'maintenanceAlerts', alertId);
            const alertDoc = await (0, firestore_1.getDoc)(alertRef);
            if (!alertDoc.exists()) {
                throw new Error('تنبيه الصيانة غير موجود');
            }
            const alert = alertDoc.data();
            const selectedOffer = alert.serviceCenters.find(offer => offer.centerId === centerId);
            if (!selectedOffer) {
                throw new Error('عرض الخدمة غير موجود');
            }
            // إنشاء طلب الخدمة
            const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const requestRef = (0, firestore_1.doc)(this.db, 'maintenanceRequests', requestId);
            const request = {
                id: requestId,
                alertId,
                userId: alert.userId,
                vin: alert.vin,
                serviceCenterId: centerId,
                status: 'confirmed',
                scheduledDate: firestore_1.Timestamp.fromDate(scheduledDate),
                estimatedCompletion: firestore_1.Timestamp.fromDate(new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000)), // 2 ساعات
                actualCost: selectedOffer.price,
                currency: 'EUR',
                workDescription: alert.recommendedActions,
                parts: [],
                createdAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now()
            };
            await (0, firestore_1.setDoc)(requestRef, request);
            // تحديث حالة التنبيه
            await (0, firestore_1.updateDoc)(alertRef, {
                status: 'accepted'
            });
            return requestId;
        }
        catch (error) {
            console.error('خطأ في قبول عرض الخدمة:', error);
            throw new Error('فشل في قبول عرض الخدمة');
        }
    }
    /**
     * الحصول على طلبات الصيانة لمستخدم
     */
    async getUserMaintenanceRequests(userId) {
        try {
            const requestsQuery = (0, firestore_1.query)((0, firestore_1.collection)(this.db, 'maintenanceRequests'), (0, firestore_1.where)('userId', '==', userId), (0, firestore_1.orderBy)('createdAt', 'desc'));
            const requestsSnapshot = await (0, firestore_1.getDocs)(requestsQuery);
            return requestsSnapshot.docs.map(doc => doc.data());
        }
        catch (error) {
            console.error('خطأ في الحصول على طلبات الصيانة:', error);
            return [];
        }
    }
    /**
     * تحديث حالة طلب الصيانة
     */
    async updateMaintenanceRequest(requestId, updates) {
        try {
            const requestRef = (0, firestore_1.doc)(this.db, 'maintenanceRequests', requestId);
            await (0, firestore_1.updateDoc)(requestRef, Object.assign(Object.assign({}, updates), { updatedAt: firestore_1.Timestamp.now() }));
        }
        catch (error) {
            console.error('خطأ في تحديث طلب الصيانة:', error);
            throw new Error('فشل في تحديث طلب الصيانة');
        }
    }
    /**
     * إشعار مراكز الخدمة بتنبيه صيانة جديد
     */
    async notifyServiceCenters(alert) {
        try {
            // في الإنتاج، سيتم إرسال إشعارات لمراكز الخدمة عبر FCM أو Pub/Sub
            console.log(`إرسال إشعار صيانة لمراكز الخدمة بالقرب من ${alert.vin}`);
            // محاكاة إرسال إشعارات
            const mockCenters = await this.getNearbyServiceCenters(alert.vin);
            for (const center of mockCenters) {
                // إرسال إشعار لكل مركز خدمة
                console.log(`إرسال إشعار لمركز ${center.name}: ${alert.title}`);
            }
        }
        catch (error) {
            console.error('خطأ في إشعار مراكز الخدمة:', error);
        }
    }
    /**
     * الحصول على مراكز الخدمة القريبة (محاكاة)
     */
    async getNearbyServiceCenters(vin) {
        // في الإنتاج، سيتم البحث الفعلي بناءً على موقع السيارة
        return [
            {
                id: 'center_1',
                name: 'Gloubul Service Center Sofia',
                location: 'Sofia',
                distance: 5.2,
                rating: 4.8,
                reviewCount: 1250
            },
            {
                id: 'center_2',
                name: 'Auto Expert Plovdiv',
                location: 'Plovdiv',
                distance: 12.1,
                rating: 4.6,
                reviewCount: 890
            },
            {
                id: 'center_3',
                name: 'CarCare Varna',
                location: 'Varna',
                distance: 8.7,
                rating: 4.7,
                reviewCount: 654
            }
        ];
    }
    /**
     * تحليل البيانات للكشف عن الحاجة للصيانة
     */
    analyzeMaintenanceNeeds(digitalTwin) {
        const issues = [];
        const actions = [];
        // فحص مستوى الوقود
        if (digitalTwin.fuelLevelPercent < 15) {
            issues.push('مستوى الوقود منخفض');
            actions.push('تزويد الوقود');
        }
        // فحص حالة المحرك
        if (digitalTwin.engineHealth === 'critical') {
            issues.push('حالة المحرك حرجة - أكواد أعطال نشطة');
            actions.push('فحص تشخيصي شامل للمحرك');
            actions.push('إصلاح الأعطال المكتشفة');
        }
        else if (digitalTwin.engineHealth === 'warning') {
            issues.push('تحذير من حالة المحرك');
            actions.push('فحص وقائي للمحرك');
        }
        // فحص الصيانة الدورية
        if (digitalTwin.totalMileage >= digitalTwin.nextServiceDueKm) {
            issues.push('الصيانة الدورية مطلوبة');
            actions.push('تغيير زيت المحرك وفلاتر');
            actions.push('فحص المكابح والإطارات');
            actions.push('فحص السوائل والأنظمة الكهربائية');
        }
        // فحص البطارية
        if (digitalTwin.batteryLevel < 30) {
            issues.push('بطارية الجهاز ضعيفة');
            actions.push('فحص وشحن بطارية الجهاز');
        }
        if (issues.length === 0) {
            return null;
        }
        // تحديد الأولوية
        let priority = 'low';
        if (issues.some(issue => issue.includes('حرجة') || issue.includes('critical'))) {
            priority = 'critical';
        }
        else if (issues.some(issue => issue.includes('تحذير') || issue.includes('warning'))) {
            priority = 'high';
        }
        else if (issues.length > 1) {
            priority = 'medium';
        }
        return {
            id: '',
            vin: digitalTwin.vin,
            userId: digitalTwin.userId,
            type: 'proactive',
            priority,
            title: 'تنبيه صيانة استباقي',
            description: `تم اكتشاف ${issues.length} مشاكل محتملة في سيارتك`,
            issues,
            recommendedActions: actions,
            estimatedCost: {
                min: 50,
                max: 500,
                currency: 'EUR'
            },
            serviceCenters: [],
            status: 'active',
            createdAt: firestore_1.Timestamp.now(),
            expiresAt: firestore_1.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        };
    }
}
exports.ProactiveMaintenanceService = ProactiveMaintenanceService;
exports.proactiveMaintenanceService = new ProactiveMaintenanceService();
//# sourceMappingURL=proactive-maintenance-service.js.map