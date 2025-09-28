"use strict";
// IoT Service for Bulgarian Car Marketplace
// خدمة IoT لسوق السيارات البلغاري
Object.defineProperty(exports, "__esModule", { value: true });
exports.gloubulIoTService = exports.GloubulIoTService = void 0;
const pubsub_1 = require("@google-cloud/pubsub");
// import { IoTClient } from '@google-cloud/iot'; // Not available in this environment
const bigquery_1 = require("@google-cloud/bigquery");
// import { logger } from 'firebase-functions'; // Not available in client-side code
// Mock logger for client-side
const logger = {
    info: (message) => console.log(`[INFO] ${message}`),
    error: (message, error) => console.error(`[ERROR] ${message}`, error),
    warn: (message) => console.warn(`[WARN] ${message}`)
};
// Mock IoTClient for client-side environment
class IoTClient {
    registryPath(projectId, region, registryId) {
        return `projects/${projectId}/locations/${region}/registries/${registryId}`;
    }
    locationPath(projectId, region) {
        return `projects/${projectId}/locations/${region}`;
    }
    devicePath(projectId, region, registryId, deviceId) {
        return `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${deviceId}`;
    }
    async createDeviceRegistry(options) {
        logger.info('Mock: Creating device registry');
        return {};
    }
    async createDevice(options) {
        logger.info('Mock: Creating device');
        return {};
    }
    async listDevices(options) {
        logger.info('Mock: Listing devices');
        return [[]];
    }
    async deleteDevice(options) {
        logger.info('Mock: Deleting device');
        return {};
    }
}
class GloubulIoTService {
    constructor(projectId) {
        this.region = 'europe-west1';
        this.registryId = 'gloubul-connect-registry';
        this.projectId = projectId;
        this.iotClient = new IoTClient();
        this.pubsubClient = new pubsub_1.PubSub({ projectId });
        this.bigqueryClient = new bigquery_1.BigQuery({ projectId });
    }
    /**
     * إنشاء سجل أجهزة IoT جديد
     */
    async createDeviceRegistry() {
        try {
            const registryPath = this.iotClient.registryPath(this.projectId, this.region, this.registryId);
            const registry = {
                name: registryPath,
                eventNotificationConfigs: [{
                        pubsubTopicName: `projects/${this.projectId}/topics/gloubul-iot-events`,
                        subfolderMatches: ''
                    }],
                mqttConfig: {
                    mqttEnabledState: 'MQTT_ENABLED'
                },
                httpConfig: {
                    httpEnabledState: 'HTTP_ENABLED'
                }
            };
            await this.iotClient.createDeviceRegistry({
                parent: this.iotClient.locationPath(this.projectId, this.region),
                deviceRegistry: registry,
                deviceRegistryId: this.registryId
            });
            logger.info(`تم إنشاء سجل الأجهزة: ${this.registryId}`);
        }
        catch (error) {
            if (error.code === 6) { // ALREADY_EXISTS
                logger.info(`سجل الأجهزة موجود مسبقاً: ${this.registryId}`);
            }
            else {
                logger.error('خطأ في إنشاء سجل الأجهزة:', error);
                throw error;
            }
        }
    }
    /**
     * تسجيل جهاز جديد في IoT Core
     */
    async registerDevice(deviceId, publicKey) {
        try {
            const devicePath = this.iotClient.devicePath(this.projectId, this.region, this.registryId, deviceId);
            const device = {
                name: devicePath,
                id: deviceId,
                credentials: publicKey ? [{
                        publicKey: {
                            format: 'RSA_PEM',
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
        }
        catch (error) {
            if (error.code === 6) { // ALREADY_EXISTS
                logger.info(`الجهاز موجود مسبقاً: ${deviceId}`);
            }
            else {
                logger.error(`خطأ في تسجيل الجهاز ${deviceId}:`, error);
                throw error;
            }
        }
    }
    /**
     * إنشاء مواضيع Pub/Sub للأحداث
     */
    async createPubSubTopics() {
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
                }
                else {
                    logger.info(`الموضوع موجود مسبقاً: ${topicName}`);
                }
            }
        }
        catch (error) {
            logger.error('خطأ في إنشاء مواضيع Pub/Sub:', error);
            throw error;
        }
    }
    /**
     * إنشاء جداول BigQuery للبيانات
     */
    async createBigQueryTables() {
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
        }
        catch (error) {
            if (error.code === 409) { // Table already exists
                logger.info('جداول BigQuery موجودة مسبقاً');
            }
            else {
                logger.error('خطأ في إنشاء جداول BigQuery:', error);
                throw error;
            }
        }
    }
    /**
     * إرسال بيانات إلى BigQuery
     */
    async insertDataToBigQuery(tableName, data) {
        try {
            const dataset = this.bigqueryClient.dataset('gloubul_iot_data');
            const table = dataset.table(tableName);
            await table.insert(data);
            logger.info(`تم إدراج ${data.length} صف في جدول ${tableName}`);
        }
        catch (error) {
            logger.error(`خطأ في إدراج البيانات في ${tableName}:`, error);
            throw error;
        }
    }
    /**
     * نشر حدث إلى Pub/Sub
     */
    async publishEvent(topicName, data, attributes) {
        try {
            const topic = this.pubsubClient.topic(topicName);
            const message = {
                data: Buffer.from(JSON.stringify(data)),
                attributes: attributes || {}
            };
            await topic.publishMessage(message);
            logger.info(`تم نشر حدث إلى ${topicName}`);
        }
        catch (error) {
            logger.error(`خطأ في نشر الحدث إلى ${topicName}:`, error);
            throw error;
        }
    }
    /**
     * الحصول على إحصائيات الأجهزة
     */
    async getDeviceStats() {
        try {
            const [devices] = await this.iotClient.listDevices({
                parent: this.iotClient.registryPath(this.projectId, this.region, this.registryId)
            });
            const stats = {
                totalDevices: devices.length,
                activeDevices: devices.filter((d) => d.blocked === false).length,
                blockedDevices: devices.filter((d) => d.blocked === true).length,
                lastUpdated: new Date().toISOString()
            };
            return stats;
        }
        catch (error) {
            logger.error('خطأ في الحصول على إحصائيات الأجهزة:', error);
            throw error;
        }
    }
    /**
     * إزالة جهاز من IoT Core
     */
    async removeDevice(deviceId) {
        try {
            const devicePath = this.iotClient.devicePath(this.projectId, this.region, this.registryId, deviceId);
            await this.iotClient.deleteDevice({ name: devicePath });
            logger.info(`تم إزالة الجهاز: ${deviceId}`);
        }
        catch (error) {
            logger.error(`خطأ في إزالة الجهاز ${deviceId}:`, error);
            throw error;
        }
    }
}
exports.GloubulIoTService = GloubulIoTService;
exports.gloubulIoTService = new GloubulIoTService('globul-cars');
//# sourceMappingURL=gloubul-iot-service.js.map