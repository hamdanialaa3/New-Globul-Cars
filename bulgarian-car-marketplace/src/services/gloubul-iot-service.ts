import { PubSub } from '@google-cloud/pubsub';
import { IoTClient } from '@google-cloud/iot';
import { BigQuery } from '@google-cloud/bigquery';
import { logger } from 'firebase-functions';

export interface IoTDeviceConfig {
  deviceId: string;
  registryId: string;
  region: string;
  projectId: string;
}

export interface IoTMessage {
  deviceId: string;
  timestamp: Date;
  data: any;
  attributes?: Record<string, string>;
}

export class GloubulIoTService {
  private iotClient: IoTClient;
  private pubsubClient: PubSub;
  private bigqueryClient: BigQuery;
  private readonly projectId: string;
  private readonly region: string = 'europe-west1';
  private readonly registryId: string = 'gloubul-connect-registry';

  constructor(projectId: string) {
    this.projectId = projectId;
    this.iotClient = new IoTClient();
    this.pubsubClient = new PubSub({ projectId });
    this.bigqueryClient = new BigQuery({ projectId });
  }

  /**
   * إنشاء سجل أجهزة IoT جديد
   */
  async createDeviceRegistry(): Promise<void> {
    try {
      const registryPath = this.iotClient.registryPath(this.projectId, this.region, this.registryId);

      const registry = {
        name: registryPath,
        eventNotificationConfigs: [{
          pubsubTopicName: `projects/${this.projectId}/topics/gloubul-iot-events`,
          subfolderMatches: ''
        }],
        mqttConfig: {
          mqttEnabledState: 'MQTT_ENABLED' as const
        },
        httpConfig: {
          httpEnabledState: 'HTTP_ENABLED' as const
        }
      };

      await this.iotClient.createDeviceRegistry({
        parent: this.iotClient.locationPath(this.projectId, this.region),
        deviceRegistry: registry,
        deviceRegistryId: this.registryId
      });

      logger.info(`تم إنشاء سجل الأجهزة: ${this.registryId}`);

    } catch (error) {
      if (error.code === 6) { // ALREADY_EXISTS
        logger.info(`سجل الأجهزة موجود مسبقاً: ${this.registryId}`);
      } else {
        logger.error('خطأ في إنشاء سجل الأجهزة:', error);
        throw error;
      }
    }
  }

  /**
   * تسجيل جهاز جديد في IoT Core
   */
  async registerDevice(deviceId: string, publicKey?: string): Promise<void> {
    try {
      const devicePath = this.iotClient.devicePath(this.projectId, this.region, this.registryId, deviceId);

      const device = {
        name: devicePath,
        id: deviceId,
        credentials: publicKey ? [{
          publicKey: {
            format: 'RSA_PEM' as const,
            key: publicKey
          }
        }] : [],
        metadata: {
          registrationDate: new Date().toISOString(),
          firmwareVersion: '1.0.0'
        }
      };

      await this.iotClient.createDevice({
        parent: this.iotClient.registryPath(this.projectId, this.region, this.registryId),
        device,
        deviceId
      });

      logger.info(`تم تسجيل الجهاز: ${deviceId}`);

    } catch (error) {
      if (error.code === 6) { // ALREADY_EXISTS
        logger.info(`الجهاز موجود مسبقاً: ${deviceId}`);
      } else {
        logger.error(`خطأ في تسجيل الجهاز ${deviceId}:`, error);
        throw error;
      }
    }
  }

  /**
   * إنشاء مواضيع Pub/Sub للأحداث
   */
  async createPubSubTopics(): Promise<void> {
    try {
      const topics = [
        'gloubul-iot-events',
        'gloubul-maintenance-alerts',
        'gloubul-emergency-alerts',
        'gloubul-data-processing'
      ];

      for (const topicName of topics) {
        const topic = this.pubsubClient.topic(topicName);
        const [exists] = await topic.exists();

        if (!exists) {
          await topic.create();
          logger.info(`تم إنشاء الموضوع: ${topicName}`);
        } else {
          logger.info(`الموضوع موجود مسبقاً: ${topicName}`);
        }
      }

    } catch (error) {
      logger.error('خطأ في إنشاء مواضيع Pub/Sub:', error);
      throw error;
    }
  }

  /**
   * إنشاء جداول BigQuery للبيانات
   */
  async createBigQueryTables(): Promise<void> {
    try {
      const datasetId = 'gloubul_iot_data';
      const dataset = this.bigqueryClient.dataset(datasetId);

      // إنشاء Dataset إذا لم يكن موجوداً
      const [datasetExists] = await dataset.exists();
      if (!datasetExists) {
        await this.bigqueryClient.createDataset(datasetId);
        logger.info(`تم إنشاء مجموعة البيانات: ${datasetId}`);
      }

      // إنشاء جدول البيانات الحية
      const liveDataSchema = [
        { name: 'deviceId', type: 'STRING', mode: 'REQUIRED' },
        { name: 'vin', type: 'STRING', mode: 'REQUIRED' },
        { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'location', type: 'GEOGRAPHY', mode: 'NULLABLE' },
        { name: 'speed', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'fuelLevelPercent', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'engineRPM', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'coolantTemp', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'batteryVoltage', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'odometer', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'activeErrorCodes', type: 'STRING', mode: 'REPEATED' },
        { name: 'tirePressureFrontLeft', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'tirePressureFrontRight', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'tirePressureRearLeft', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'tirePressureRearRight', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'accelerationX', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'accelerationY', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'accelerationZ', type: 'FLOAT', mode: 'NULLABLE' }
      ];

      await dataset.createTable('live_vehicle_data', { schema: liveDataSchema });

      // إنشاء جدول التوأم الرقمي
      const twinSchema = [
        { name: 'vin', type: 'STRING', mode: 'REQUIRED' },
        { name: 'userId', type: 'STRING', mode: 'REQUIRED' },
        { name: 'lastLocation', type: 'GEOGRAPHY', mode: 'NULLABLE' },
        { name: 'fuelLevelPercent', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'engineHealth', type: 'STRING', mode: 'REQUIRED' },
        { name: 'activeErrorCodes', type: 'STRING', mode: 'REPEATED' },
        { name: 'nextServiceDueKm', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'lastServiceDate', type: 'TIMESTAMP', mode: 'NULLABLE' },
        { name: 'lastSeen', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'batteryLevel', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'signalStrength', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'totalMileage', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'averageFuelConsumption', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'drivingScore', type: 'FLOAT', mode: 'NULLABLE' },
        { name: 'accidentHistory', type: 'INTEGER', mode: 'NULLABLE' }
      ];

      await dataset.createTable('digital_twins', { schema: twinSchema });

      logger.info('تم إنشاء جداول BigQuery بنجاح');

    } catch (error) {
      if (error.code === 409) { // Table already exists
        logger.info('جداول BigQuery موجودة مسبقاً');
      } else {
        logger.error('خطأ في إنشاء جداول BigQuery:', error);
        throw error;
      }
    }
  }

  /**
   * إرسال بيانات إلى BigQuery
   */
  async insertDataToBigQuery(tableName: string, data: any[]): Promise<void> {
    try {
      const dataset = this.bigqueryClient.dataset('gloubul_iot_data');
      const table = dataset.table(tableName);

      await table.insert(data);
      logger.info(`تم إدراج ${data.length} صف في جدول ${tableName}`);

    } catch (error) {
      logger.error(`خطأ في إدراج البيانات في ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * نشر حدث إلى Pub/Sub
   */
  async publishEvent(topicName: string, data: any, attributes?: Record<string, string>): Promise<void> {
    try {
      const topic = this.pubsubClient.topic(topicName);
      const message = {
        data: Buffer.from(JSON.stringify(data)),
        attributes: attributes || {}
      };

      await topic.publishMessage(message);
      logger.info(`تم نشر حدث إلى ${topicName}`);

    } catch (error) {
      logger.error(`خطأ في نشر الحدث إلى ${topicName}:`, error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات الأجهزة
   */
  async getDeviceStats(): Promise<any> {
    try {
      const [devices] = await this.iotClient.listDevices({
        parent: this.iotClient.registryPath(this.projectId, this.region, this.registryId)
      });

      const stats = {
        totalDevices: devices.length,
        activeDevices: devices.filter(d => d.blocked === false).length,
        blockedDevices: devices.filter(d => d.blocked === true).length,
        lastUpdated: new Date().toISOString()
      };

      return stats;

    } catch (error) {
      logger.error('خطأ في الحصول على إحصائيات الأجهزة:', error);
      throw error;
    }
  }

  /**
   * إزالة جهاز من IoT Core
   */
  async removeDevice(deviceId: string): Promise<void> {
    try {
      const devicePath = this.iotClient.devicePath(this.projectId, this.region, this.registryId, deviceId);
      await this.iotClient.deleteDevice({ name: devicePath });

      logger.info(`تم إزالة الجهاز: ${deviceId}`);

    } catch (error) {
      logger.error(`خطأ في إزالة الجهاز ${deviceId}:`, error);
      throw error;
    }
  }
}

export const gloubulIoTService = new GloubulIoTService('globul-cars');