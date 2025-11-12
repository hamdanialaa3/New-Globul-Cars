import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { getFirestore } from 'firebase/firestore';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { gloubulConnectService, VehicleLiveData } from '../../bulgarian-car-marketplace/src/services/gloubul-connect-service';

/**
 * استقبال بيانات IoT من أجهزة Gloubul Connect عبر HTTP endpoint
 * يستخدم هذا عندما ترسل الأجهزة البيانات مباشرة عبر HTTP بدلاً من MQTT
 */
export const receiveIoTData = onRequest(
  {
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (req, res) => {
    try {
      // التحقق من صحة الطلب
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const deviceToken = authHeader.substring(7);

      // التحقق من صحة البيانات
      const liveData: VehicleLiveData = req.body;

      if (!liveData.deviceId || !liveData.vin) {
        res.status(400).json({ error: 'Invalid data: deviceId and vin are required' });
        return;
      }

      // التحقق من صحة الجهاز
      const isValidDevice = await validateDevice(deviceToken, liveData.deviceId);
      if (!isValidDevice) {
        res.status(403).json({ error: 'Invalid device or token' });
        return;
      }

      // حفظ البيانات وتحديث التوأم الرقمي
      await gloubulConnectService.updateLiveData(liveData);

      // كشف الحوادث
      if (gloubulConnectService.detectAccident(liveData)) {
        await gloubulConnectService.sendEmergencyAlert(liveData.vin, liveData.location);
        logger.warn(`تم كشف حادث للسيارة ${liveData.vin}`);
      }

      res.status(200).json({
        success: true,
        message: 'Data received successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('خطأ في استقبال بيانات IoT:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process IoT data'
      });
    }
  }
);

/**
 * مراقبة إنشاء تنبيهات الطوارئ وإرسال الإشعارات
 */
export const onEmergencyAlertCreated = onDocumentCreated(
  {
    region: 'europe-west1',
    document: 'emergencyAlerts/{alertId}'
  },
  async (event) => {
    try {
      const alertData = event.data?.data();
      if (!alertData) return;

      const { vin, location } = alertData;

      // إرسال إشعار للمستخدم
      await sendEmergencyNotification(vin, location);

      // إخطار خدمات الطوارئ (محاكاة)
      await notifyEmergencyServices(vin, location);

      logger.info(`تم إرسال إشعار طوارئ للسيارة ${vin}`);

    } catch (error) {
      logger.error('خطأ في معالجة تنبيه الطوارئ:', error);
    }
  }
);

/**
 * تحليل دوري للبيانات وكشف الحاجة للصيانة
 */
export const analyzeMaintenanceNeeds = onSchedule(
  {
    region: 'europe-west1',
    schedule: 'every 1 hours',
    timeoutSeconds: 300,
    memory: '512MiB'
  },
  async () => {
    try {
      logger.info('بدء تحليل الصيانة الدوري');

      const db = getFirestore();

      // الحصول على جميع التوائم الرقمية النشطة
      const twinsQuery = query(
        collection(db, 'digitalTwins'),
        where('lastSeen', '>', Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000))) // آخر 24 ساعة
      );

      const twinsSnapshot = await getDocs(twinsQuery);

      for (const twinDoc of twinsSnapshot.docs) {
        const twin = twinDoc.data();
        const { vin, engineHealth, activeErrorCodes, nextServiceDueKm, totalMileage } = twin;

        // كشف الحاجة للصيانة
        if (engineHealth === 'critical' || activeErrorCodes.length > 0 || totalMileage >= nextServiceDueKm) {
          await triggerMaintenanceAlert(vin, {
            engineHealth,
            activeErrorCodes,
            nextServiceDueKm,
            totalMileage
          });
        }
      }

      logger.info('انتهى تحليل الصيانة الدوري');

    } catch (error) {
      logger.error('خطأ في تحليل الصيانة:', error);
    }
  }
);

/**
 * التحقق من صحة الجهاز والرمز المميز
 */
async function validateDevice(token: string, deviceId: string): Promise<boolean> {
  try {
    const db = getFirestore();
    const deviceRef = doc(db, 'gloubulConnectDevices', deviceId);
    const deviceDoc = await getDoc(deviceRef);

    if (!deviceDoc.exists()) return false;

    const device = deviceDoc.data();
    // في الإنتاج، يجب التحقق من الرمز المميز بشكل صحيح
    return device.status === 'active';

  } catch (error) {
    logger.error('خطأ في التحقق من الجهاز:', error);
    return false;
  }
}

// ==================== TYPES ====================
interface EmergencyLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface MaintenanceData {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedCost?: number;
  recommendedAction?: string;
  dueDate?: Date;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * إرسال إشعار طوارئ للمستخدم
 */
async function sendEmergencyNotification(vin: string, location: EmergencyLocation) {
  // محاكاة إرسال إشعار - في الإنتاج سيتم ربطه بخدمة FCM
  logger.info(`إرسال إشعار طوارئ للسيارة ${vin} في الموقع: ${location.latitude}, ${location.longitude}`);
}

/**
 * إخطار خدمات الطوارئ
 */
async function notifyEmergencyServices(vin: string, location: EmergencyLocation) {
  // محاكاة إخطار خدمات الطوارئ - في الإنتاج سيتم ربطه بـ API الطوارئ البلغاري
  logger.warn(`إخطار خدمات الطوارئ البلغارية: حادث للسيارة ${vin}`);
}

/**
 * إطلاق تنبيه صيانة
 */
async function triggerMaintenanceAlert(vin: string, maintenanceData: MaintenanceData) {
  try {
    const db = getFirestore();
    const alertRef = doc(collection(db, 'maintenanceAlerts'));

    await updateDoc(alertRef, {
      vin,
      ...maintenanceData,
      timestamp: Timestamp.now(),
      status: 'pending',
      type: 'proactive'
    });

    logger.info(`تم إطلاق تنبيه صيانة للسيارة ${vin}`);

  } catch (error) {
    logger.error('خطأ في إطلاق تنبيه الصيانة:', error);
  }
}