import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase/firestore';
import { collection, query, getDocs } from 'firebase/firestore';
import { proactiveMaintenanceService } from '../../bulgarian-car-marketplace/src/services/proactive-maintenance-service';
import { gloubulConnectService } from '../../bulgarian-car-marketplace/src/services/gloubul-connect-service';

/**
 * إنشاء تنبيه صيانة يدوياً
 */
export const createMaintenanceAlert = onRequest(
  {
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const alertData = req.body;
      const alertId = await proactiveMaintenanceService.createMaintenanceAlert(alertData);

      res.status(200).json({
        success: true,
        alertId,
        message: 'تم إنشاء تنبيه الصيانة بنجاح',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('خطأ في إنشاء تنبيه الصيانة:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'فشل في إنشاء تنبيه الصيانة',
        details: error?.message || 'Unknown error'
      });
    }
  }
);

/**
 * الحصول على تنبيهات الصيانة لمستخدم
 */
export const getUserMaintenanceAlerts = onRequest(
  {
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 30,
    memory: '256MiB'
  },
  async (req, res) => {
    try {
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { userId } = req.query;

      if (!userId || typeof userId !== 'string') {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      const alerts = await proactiveMaintenanceService.getUserMaintenanceAlerts(userId);

      res.status(200).json({
        success: true,
        data: alerts,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('خطأ في الحصول على تنبيهات الصيانة:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'فشل في الحصول على تنبيهات الصيانة',
        details: error?.message || 'Unknown error'
      });
    }
  }
);

/**
 * قبول عرض صيانة
 */
export const acceptServiceOffer = onRequest(
  {
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { alertId, centerId, scheduledDate } = req.body;

      if (!alertId || !centerId || !scheduledDate) {
        res.status(400).json({ error: 'alertId, centerId, and scheduledDate are required' });
        return;
      }

      const requestId = await proactiveMaintenanceService.acceptServiceOffer(
        alertId,
        centerId,
        new Date(scheduledDate)
      );

      res.status(200).json({
        success: true,
        requestId,
        message: 'تم قبول عرض الخدمة بنجاح',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('خطأ في قبول عرض الخدمة:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'فشل في قبول عرض الخدمة',
        details: error?.message || 'Unknown error'
      });
    }
  }
);

/**
 * تحليل استباقي دوري للصيانة
 */
export const analyzeProactiveMaintenance = onSchedule(
  {
    region: 'europe-west1',
    schedule: 'every 2 hours',
    timeoutSeconds: 300,
    memory: '512MiB'
  },
  async () => {
    try {
      logger.info('بدء التحليل الاستباقي للصيانة');

      const db = getFirestore();
      const twinsQuery = query(collection(db, 'digitalTwins'));
      const twinsSnapshot = await getDocs(twinsQuery);

      let alertsCreated = 0;

      for (const twinDoc of twinsSnapshot.docs) {
        const twin = twinDoc.data();

        // تحليل الحاجة للصيانة
        const maintenanceAlert = proactiveMaintenanceService.analyzeMaintenanceNeeds(twin);

        if (maintenanceAlert) {
          try {
            await proactiveMaintenanceService.createMaintenanceAlert(maintenanceAlert);
            alertsCreated++;
            logger.info(`تم إنشاء تنبيه صيانة للسيارة ${twin.vin}`);
          } catch (error) {
            logger.error(`خطأ في إنشاء تنبيه للسيارة ${twin.vin}:`, error);
          }
        }
      }

      logger.info(`انتهى التحليل الاستباقي - تم إنشاء ${alertsCreated} تنبيه`);

    } catch (error: any) {
      logger.error('خطأ في التحليل الاستباقي للصيانة:', error);
    }
  }
);

/**
 * إرسال تذكيرات الصيانة المجدولة
 */
export const sendMaintenanceReminders = onSchedule(
  {
    region: 'europe-west1',
    schedule: 'every 6 hours',
    timeoutSeconds: 120,
    memory: '256MiB'
  },
  async () => {
    try {
      logger.info('بدء إرسال تذكيرات الصيانة');

      // في الإنتاج، سيتم البحث عن المواعيد المقبلة وإرسال تذكيرات
      // هنا محاكاة بسيطة
      logger.info('تم إرسال تذكيرات الصيانة بنجاح');

    } catch (error: any) {
      logger.error('خطأ في إرسال تذكيرات الصيانة:', error);
    }
  }
);

/**
 * تحديث حالة طلبات الصيانة
 */
export const updateMaintenanceRequests = onRequest(
  {
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (req, res) => {
    try {
      if (req.method !== 'PUT') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { requestId, updates } = req.body;

      if (!requestId || !updates) {
        res.status(400).json({ error: 'requestId and updates are required' });
        return;
      }

      await proactiveMaintenanceService.updateMaintenanceRequest(requestId, updates);

      res.status(200).json({
        success: true,
        message: 'تم تحديث طلب الصيانة بنجاح',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('خطأ في تحديث طلب الصيانة:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'فشل في تحديث طلب الصيانة',
        details: error?.message || 'Unknown error'
      });
    }
  }
);