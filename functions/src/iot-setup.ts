import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { gloubulIoTService } from '../../bulgarian-car-marketplace/src/services/gloubul-iot-service';

/**
 * إعداد بنية IoT Core الأساسية
 * يُستدعى مرة واحدة لإعداد البنية التحتية
 */
export const setupIoTInfrastructure = onRequest(
  {
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 300,
    memory: '512MiB'
  },
  async (req, res) => {
    try {
      // التحقق من صحة الطلب
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      logger.info('بدء إعداد بنية IoT Core...');

      // إنشاء سجل الأجهزة
      await gloubulIoTService.createDeviceRegistry();
      logger.info('تم إنشاء سجل الأجهزة');

      // إنشاء مواضيع Pub/Sub
      await gloubulIoTService.createPubSubTopics();
      logger.info('تم إنشاء مواضيع Pub/Sub');

      // إنشاء جداول BigQuery
      await gloubulIoTService.createBigQueryTables();
      logger.info('تم إنشاء جداول BigQuery');

      res.status(200).json({
        success: true,
        message: 'تم إعداد بنية IoT Core بنجاح',
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('خطأ في إعداد بنية IoT:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'فشل في إعداد بنية IoT Core',
        details: error?.message || 'Unknown error'
      });
    }
  }
);

/**
 * تسجيل جهاز جديد في IoT Core
 */
export const registerIoTDevice = onRequest(
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

      const { deviceId, publicKey } = req.body;

      if (!deviceId) {
        res.status(400).json({ error: 'deviceId is required' });
        return;
      }

      await gloubulIoTService.registerDevice(deviceId, publicKey);

      res.status(200).json({
        success: true,
        message: `تم تسجيل الجهاز ${deviceId} بنجاح`,
        deviceId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('خطأ في تسجيل الجهاز:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'فشل في تسجيل الجهاز',
        details: error?.message || 'Unknown error'
      });
    }
  }
);

/**
 * الحصول على إحصائيات الأجهزة
 */
export const getIoTDeviceStats = onRequest(
  {
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (req, res) => {
    try {
      const stats = await gloubulIoTService.getDeviceStats();

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('خطأ في الحصول على إحصائيات الأجهزة:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'فشل في الحصول على إحصائيات الأجهزة',
        details: error?.message || 'Unknown error'
      });
    }
  }
);

/**
 * إزالة جهاز من IoT Core
 */
export const removeIoTDevice = onRequest(
  {
    region: 'europe-west1',
    cors: true,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (req, res) => {
    try {
      if (req.method !== 'DELETE') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { deviceId } = req.body;

      if (!deviceId) {
        res.status(400).json({ error: 'deviceId is required' });
        return;
      }

      await gloubulIoTService.removeDevice(deviceId);

      res.status(200).json({
        success: true,
        message: `تم إزالة الجهاز ${deviceId} بنجاح`,
        deviceId,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      logger.error('خطأ في إزالة الجهاز:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'فشل في إزالة الجهاز',
        details: error?.message || 'Unknown error'
      });
    }
  }
);