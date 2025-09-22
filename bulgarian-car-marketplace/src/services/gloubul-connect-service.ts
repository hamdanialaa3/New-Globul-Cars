import { collection, doc, setDoc, updateDoc, getDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { GeoPoint } from 'firebase/firestore';

export interface GloubulConnectDevice {
  deviceId: string;
  vin: string;
  userId: string;
  imei: string;
  simCardNumber: string;
  firmwareVersion: string;
  lastSeen: Timestamp;
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  installationDate: Timestamp;
  batteryLevel: number;
  signalStrength: number;
}

export interface VehicleLiveData {
  deviceId: string;
  vin: string; // إضافة VIN للبيانات الحية
  timestamp: Timestamp;
  location: GeoPoint;
  speed: number;
  fuelLevelPercent: number;
  engineRPM: number;
  coolantTemp: number;
  batteryVoltage: number;
  odometer: number;
  activeErrorCodes: string[];
  tirePressure: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
}

export interface DigitalTwin {
  vin: string;
  userId: string;
  lastLocation: GeoPoint;
  fuelLevelPercent: number;
  engineHealth: 'good' | 'warning' | 'critical';
  activeErrorCodes: string[];
  nextServiceDueKm: number;
  lastServiceDate: Timestamp;
  lastSeen: Timestamp;
  batteryLevel: number;
  signalStrength: number;
  totalMileage: number;
  averageFuelConsumption: number;
  drivingScore: number;
  accidentHistory: number;
}

export class GloubulConnectService {
  private db = getFirestore();
  private readonly BULGARIAN_TIMEZONE = 'Europe/Sofia';

  /**
   * تسجيل جهاز جديد في النظام
   */
  async registerDevice(deviceData: Omit<GloubulConnectDevice, 'lastSeen' | 'status'>): Promise<void> {
    try {
      const deviceRef = doc(this.db, 'gloubulConnectDevices', deviceData.deviceId);
      const device: GloubulConnectDevice = {
        ...deviceData,
        lastSeen: Timestamp.now(),
        status: 'active'
      };

      await setDoc(deviceRef, device);

      // إنشاء التوأم الرقمي الأولي
      await this.initializeDigitalTwin(deviceData.vin, deviceData.userId);

    } catch (error) {
      console.error('خطأ في تسجيل الجهاز:', error);
      throw new Error('فشل في تسجيل جهاز Gloubul Connect');
    }
  }

  /**
   * تحديث بيانات حية من الجهاز
   */
  async updateLiveData(liveData: VehicleLiveData): Promise<void> {
    try {
      // حفظ البيانات الحية
      const liveDataRef = doc(collection(this.db, 'vehicleLiveData'));
      await setDoc(liveDataRef, liveData);

      // تحديث التوأم الرقمي
      await this.updateDigitalTwin(liveData);

      // تحديث حالة الجهاز
      await this.updateDeviceStatus(liveData.deviceId, 'active');

    } catch (error) {
      console.error('خطأ في تحديث البيانات الحية:', error);
      throw new Error('فشل في تحديث بيانات السيارة');
    }
  }

  /**
   * إنشاء التوأم الرقمي الأولي
   */
  private async initializeDigitalTwin(vin: string, userId: string): Promise<void> {
    const twinRef = doc(this.db, 'digitalTwins', vin);
    const initialTwin: DigitalTwin = {
      vin,
      userId,
      lastLocation: new GeoPoint(42.6977, 23.3219), // صوفيا كافتراضي
      fuelLevelPercent: 100,
      engineHealth: 'good',
      activeErrorCodes: [],
      nextServiceDueKm: 15000,
      lastServiceDate: Timestamp.now(),
      lastSeen: Timestamp.now(),
      batteryLevel: 100,
      signalStrength: 100,
      totalMileage: 0,
      averageFuelConsumption: 0,
      drivingScore: 100,
      accidentHistory: 0
    };

    await setDoc(twinRef, initialTwin);
  }

  /**
   * تحديث التوأم الرقمي بناءً على البيانات الحية (للاستخدام الداخلي والخارجي)
   */
  async updateDigitalTwinFromLiveData(liveData: VehicleLiveData): Promise<void> {
    await this.updateDigitalTwin(liveData);
  }

  /**
   * تحديث التوأم الرقمي بناءً على البيانات الحية
   */
  private async updateDigitalTwin(liveData: VehicleLiveData): Promise<void> {
    const twinRef = doc(this.db, 'digitalTwins', liveData.vin);
    const twinDoc = await getDoc(twinRef);

    if (!twinDoc.exists()) {
      throw new Error('التوأم الرقمي غير موجود');
    }

    const currentTwin = twinDoc.data() as DigitalTwin;

    // تحليل حالة المحرك
    const engineHealth = this.analyzeEngineHealth(liveData);

    // حساب متوسط استهلاك الوقود
    const avgFuelConsumption = this.calculateAverageFuelConsumption(currentTwin, liveData);

    // حساب نقاط القيادة
    const drivingScore = this.calculateDrivingScore(liveData);

    const updatedTwin: Partial<DigitalTwin> = {
      lastLocation: liveData.location,
      fuelLevelPercent: liveData.fuelLevelPercent,
      engineHealth,
      activeErrorCodes: liveData.activeErrorCodes,
      lastSeen: liveData.timestamp,
      totalMileage: liveData.odometer,
      averageFuelConsumption: avgFuelConsumption,
      drivingScore: drivingScore
    };

    await updateDoc(twinRef, updatedTwin);
  }

  /**
   * تحليل حالة المحرك
   */
  private analyzeEngineHealth(liveData: VehicleLiveData): 'good' | 'warning' | 'critical' {
    const errorCodes = liveData.activeErrorCodes;
    const coolantTemp = liveData.coolantTemp;
    const batteryVoltage = liveData.batteryVoltage;

    if (errorCodes.length > 0 || coolantTemp > 105 || batteryVoltage < 12) {
      return 'critical';
    }

    if (coolantTemp > 95 || batteryVoltage < 12.5) {
      return 'warning';
    }

    return 'good';
  }

  /**
   * حساب متوسط استهلاك الوقود
   */
  private calculateAverageFuelConsumption(currentTwin: DigitalTwin, liveData: VehicleLiveData): number {
    // منطق بسيط للحساب - في الإنتاج سيتم تحسينه
    const currentConsumption = (liveData.speed > 0) ? (liveData.fuelLevelPercent / liveData.speed) * 100 : 0;
    return (currentTwin.averageFuelConsumption + currentConsumption) / 2;
  }

  /**
   * حساب نقاط القيادة
   */
  private calculateDrivingScore(liveData: VehicleLiveData): number {
    let score = 100;

    // خصم النقاط بناءً على التسارع الحاد
    const harshAcceleration = Math.abs(liveData.acceleration.x) > 2 || Math.abs(liveData.acceleration.y) > 2;
    if (harshAcceleration) score -= 10;

    // خصم النقاط للسرعة العالية
    if (liveData.speed > 120) score -= 15;

    // خصم النقاط لضغط الإطارات المنخفض
    const lowTirePressure = Object.values(liveData.tirePressure).some(pressure => pressure < 2.0);
    if (lowTirePressure) score -= 5;

    return Math.max(0, score);
  }

  /**
   * تحديث حالة الجهاز
   */
  private async updateDeviceStatus(deviceId: string, status: GloubulConnectDevice['status']): Promise<void> {
    const deviceRef = doc(this.db, 'gloubulConnectDevices', deviceId);
    await updateDoc(deviceRef, {
      status,
      lastSeen: Timestamp.now()
    });
  }

  /**
   * الحصول على التوأم الرقمي لسيارة
   */
  async getDigitalTwin(vin: string): Promise<DigitalTwin | null> {
    try {
      const twinRef = doc(this.db, 'digitalTwins', vin);
      const twinDoc = await getDoc(twinRef);

      if (twinDoc.exists()) {
        return twinDoc.data() as DigitalTwin;
      }

      return null;
    } catch (error) {
      console.error('خطأ في الحصول على التوأم الرقمي:', error);
      return null;
    }
  }

  /**
   * الحصول على جميع الأجهزة لمستخدم
   */
  async getUserDevices(userId: string): Promise<GloubulConnectDevice[]> {
    try {
      const devicesQuery = query(
        collection(this.db, 'gloubulConnectDevices'),
        where('userId', '==', userId)
      );

      const devicesSnapshot = await getDocs(devicesQuery);
      return devicesSnapshot.docs.map(doc => doc.data() as GloubulConnectDevice);
    } catch (error) {
      console.error('خطأ في الحصول على أجهزة المستخدم:', error);
      return [];
    }
  }

  /**
   * كشف الحوادث بناءً على بيانات التسارع
   */
  detectAccident(liveData: VehicleLiveData): boolean {
    const { acceleration } = liveData;
    const totalAcceleration = Math.sqrt(
      acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
    );

    // كشف تصادم إذا كان التسارع أكبر من 3G
    return totalAcceleration > 29.4; // 3G في m/s²
  }

  /**
   * إرسال إشعار طوارئ للحوادث
   */
  async sendEmergencyAlert(vin: string, location: GeoPoint): Promise<void> {
    try {
      const alertRef = doc(collection(this.db, 'emergencyAlerts'));
      await setDoc(alertRef, {
        vin,
        location,
        timestamp: Timestamp.now(),
        status: 'active',
        emergencyServicesNotified: false
      });

      // هنا سيتم إرسال إشعار للطوارئ والمستخدم
      console.log(`تم كشف حادث للسيارة ${vin} في الموقع: ${location.latitude}, ${location.longitude}`);
    } catch (error) {
      console.error('خطأ في إرسال إشعار الطوارئ:', error);
    }
  }
}

export const gloubulConnectService = new GloubulConnectService();