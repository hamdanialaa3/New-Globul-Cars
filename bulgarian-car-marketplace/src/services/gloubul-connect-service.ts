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
   * (Comment removed - was in Arabic)
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

      // (Comment removed - was in Arabic)
      await this.initializeDigitalTwin(deviceData.vin, deviceData.userId);

    } catch (error) {
      console.error('[SERVICE] :', error);
      throw new Error('فشل في تسجيل جهاز Gloubul Connect');
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  async updateLiveData(liveData: VehicleLiveData): Promise<void> {
    try {
      // (Comment removed - was in Arabic)
      const liveDataRef = doc(collection(this.db, 'vehicleLiveData'));
      await setDoc(liveDataRef, liveData);

      // (Comment removed - was in Arabic)
      await this.updateDigitalTwin(liveData);

      // (Comment removed - was in Arabic)
      await this.updateDeviceStatus(liveData.deviceId, 'active');

    } catch (error) {
      console.error('[SERVICE] :', error);
      throw new Error('فشل في تحديث بيانات السيارة');
    }
  }

  /**
   * (Comment removed - was in Arabic)
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
   * (Comment removed - was in Arabic)
   */
  async updateDigitalTwinFromLiveData(liveData: VehicleLiveData): Promise<void> {
    await this.updateDigitalTwin(liveData);
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async updateDigitalTwin(liveData: VehicleLiveData): Promise<void> {
    const twinRef = doc(this.db, 'digitalTwins', liveData.vin);
    const twinDoc = await getDoc(twinRef);

    if (!twinDoc.exists()) {
      throw new Error('التوأم الرقمي غير موجود');
    }

    const currentTwin = twinDoc.data() as DigitalTwin;

    // (Comment removed - was in Arabic)
    const engineHealth = this.analyzeEngineHealth(liveData);

    // (Comment removed - was in Arabic)
    const avgFuelConsumption = this.calculateAverageFuelConsumption(currentTwin, liveData);

    // (Comment removed - was in Arabic)
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
   * (Comment removed - was in Arabic)
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
   * (Comment removed - was in Arabic)
   */
  private calculateAverageFuelConsumption(currentTwin: DigitalTwin, liveData: VehicleLiveData): number {
    // (Comment removed - was in Arabic)
    const currentConsumption = (liveData.speed > 0) ? (liveData.fuelLevelPercent / liveData.speed) * 100 : 0;
    return (currentTwin.averageFuelConsumption + currentConsumption) / 2;
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private calculateDrivingScore(liveData: VehicleLiveData): number {
    let score = 100;

    // (Comment removed - was in Arabic)
    const harshAcceleration = Math.abs(liveData.acceleration.x) > 2 || Math.abs(liveData.acceleration.y) > 2;
    if (harshAcceleration) score -= 10;

    // (Comment removed - was in Arabic)
    if (liveData.speed > 120) score -= 15;

    // (Comment removed - was in Arabic)
    const lowTirePressure = Object.values(liveData.tirePressure).some(pressure => pressure < 2.0);
    if (lowTirePressure) score -= 5;

    return Math.max(0, score);
  }

  /**
   * (Comment removed - was in Arabic)
   */
  private async updateDeviceStatus(deviceId: string, status: GloubulConnectDevice['status']): Promise<void> {
    const deviceRef = doc(this.db, 'gloubulConnectDevices', deviceId);
    await updateDoc(deviceRef, {
      status,
      lastSeen: Timestamp.now()
    });
  }

  /**
   * (Comment removed - was in Arabic)
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
      console.error('[SERVICE] :', error);
      return null;
    }
  }

  /**
   * (Comment removed - was in Arabic)
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
      console.error('[SERVICE] :', error);
      return [];
    }
  }

  /**
   * (Comment removed - was in Arabic)
   */
  detectAccident(liveData: VehicleLiveData): boolean {
    const { acceleration } = liveData;
    const totalAcceleration = Math.sqrt(
      acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2
    );

    // (Comment removed - was in Arabic)
    return totalAcceleration > 29.4; // 3G في m/s²
  }

  /**
   * (Comment removed - was in Arabic)
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

      // (Comment removed - was in Arabic)
} catch (error) {
      console.error('[SERVICE] :', error);
    }
  }
}

export const gloubulConnectService = new GloubulConnectService();