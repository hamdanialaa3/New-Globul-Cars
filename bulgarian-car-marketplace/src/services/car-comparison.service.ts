// Car Comparison Service
// خدمة مقارنة السيارات - مقارنة تفصيلية بين 2-4 سيارات
// Inspired by: Mobile.de Comparison Feature

import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { CarListing } from '../types/CarListing';
import { logger } from './logger-service';

/**
 * نتيجة المقارنة
 */
export interface ComparisonResult {
  id: string;
  cars: CarListing[];
  createdAt: Date;
  userId?: string;
  shareUrl?: string;
  analysis: ComparisonAnalysis;
}

/**
 * تحليل المقارنة
 */
export interface ComparisonAnalysis {
  bestPrice: string; // car ID
  bestValue: string; // أفضل قيمة مقابل السعر
  newestCar: string;
  lowestMileage: string;
  mostFeatures: string;
  recommendations: string[];
}

/**
 * معايير المقارنة
 */
export interface ComparisonCriteria {
  price: boolean;
  year: boolean;
  mileage: boolean;
  fuelType: boolean;
  transmission: boolean;
  power: boolean;
  features: boolean;
  condition: boolean;
}

class CarComparisonService {
  private static instance: CarComparisonService;
  private readonly MAX_CARS = 4;
  private readonly MIN_CARS = 2;

  private constructor() {}

  static getInstance(): CarComparisonService {
    if (!CarComparisonService.instance) {
      CarComparisonService.instance = new CarComparisonService();
    }
    return CarComparisonService.instance;
  }

  /**
   * مقارنة السيارات
   */
  async compareCars(carIds: string[], userId?: string): Promise<ComparisonResult> {
    try {
      // التحقق من عدد السيارات
      if (carIds.length < this.MIN_CARS) {
        throw new Error(`يجب اختيار ${this.MIN_CARS} سيارات على الأقل للمقارنة`);
      }

      if (carIds.length > this.MAX_CARS) {
        throw new Error(`لا يمكن مقارنة أكثر من ${this.MAX_CARS} سيارات في وقت واحد`);
      }

      logger.info('🔍 Comparing cars', { carIds, userId });

      // جلب بيانات السيارات
      const cars = await this.fetchCars(carIds);

      // تحليل المقارنة
      const analysis = this.analyzeCars(cars);

      // إنشاء نتيجة المقارنة
      const comparisonId = this.generateId();
      const result: ComparisonResult = {
        id: comparisonId,
        cars,
        createdAt: new Date(),
        userId,
        analysis
      };

      // حفظ المقارنة (اختياري للمستخدمين المسجلين)
      if (userId) {
        await this.saveComparison(result);
      }

      logger.info('✅ Comparison completed', { id: comparisonId, carCount: cars.length });

      return result;

    } catch (error) {
      logger.error('❌ Error comparing cars', error as Error, { carIds });
      throw error;
    }
  }

  /**
   * جلب بيانات السيارات
   */
  private async fetchCars(carIds: string[]): Promise<CarListing[]> {
    const cars: CarListing[] = [];

    for (const carId of carIds) {
      try {
        // البحث في جميع الـ collections
        const collections = ['cars', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
        
        let found = false;
        for (const collectionName of collections) {
          const carDoc = await getDoc(doc(db, collectionName, carId));
          if (carDoc.exists()) {
            cars.push({ id: carDoc.id, ...carDoc.data() } as CarListing);
            found = true;
            break;
          }
        }

        if (!found) {
          logger.warn('⚠️ Car not found', { carId });
        }

      } catch (error) {
        logger.error('Error fetching car', error as Error, { carId });
      }
    }

    if (cars.length < this.MIN_CARS) {
      throw new Error('لم يتم العثور على عدد كافٍ من السيارات للمقارنة');
    }

    return cars;
  }

  /**
   * تحليل السيارات وإيجاد الأفضل في كل فئة
   */
  private analyzeCars(cars: CarListing[]): ComparisonAnalysis {
    // أفضل سعر (الأقل)
    const bestPrice = cars.reduce((prev, curr) => 
      curr.price < prev.price ? curr : prev
    ).id;

    // أفضل قيمة (نسبة السعر إلى المواصفات)
    const bestValue = this.calculateBestValue(cars);

    // الأحدث
    const newestCar = cars.reduce((prev, curr) => 
      (curr.year || 0) > (prev.year || 0) ? curr : prev
    ).id;

    // أقل كيلومترات
    const lowestMileage = cars.reduce((prev, curr) => 
      (curr.mileage || Infinity) < (prev.mileage || Infinity) ? curr : prev
    ).id;

    // الأكثر تجهيزات
    const mostFeatures = this.calculateMostFeatures(cars);

    // التوصيات
    const recommendations = this.generateRecommendations(cars);

    return {
      bestPrice,
      bestValue,
      newestCar,
      lowestMileage,
      mostFeatures,
      recommendations
    };
  }

  /**
   * حساب أفضل قيمة مقابل السعر
   */
  private calculateBestValue(cars: CarListing[]): string {
    const scores = cars.map(car => ({
      id: car.id,
      score: this.calculateValueScore(car)
    }));

    return scores.reduce((prev, curr) => 
      curr.score > prev.score ? curr : prev
    ).id;
  }

  /**
   * حساب نقاط القيمة للسيارة
   */
  private calculateValueScore(car: CarListing): number {
    let score = 0;

    // الحداثة (40%)
    const currentYear = new Date().getFullYear();
    const age = currentYear - (car.year || currentYear - 10);
    score += Math.max(0, (10 - age) / 10) * 40;

    // الكيلومترات (30%)
    const maxMileage = 300000;
    const mileageScore = Math.max(0, (maxMileage - (car.mileage || maxMileage)) / maxMileage);
    score += mileageScore * 30;

    // التجهيزات (20%)
    const featuresCount = this.countFeatures(car);
    score += (featuresCount / 20) * 20;

    // الحالة (10%)
    score += this.getConditionScore(car) * 10;

    // تقسيم على السعر للحصول على القيمة
    return car.price > 0 ? (score / car.price) * 100000 : 0;
  }

  /**
   * حساب عدد التجهيزات
   */
  private countFeatures(car: CarListing): number {
    let count = 0;
    const features = [
      'airConditioning', 'navigationSystem', 'bluetooth', 'parkingSensors',
      'cruiseControl', 'leatherSeats', 'sunroof', 'heatedSeats',
      'electricWindows', 'abs', 'airbags', 'esp'
    ];

    features.forEach(feature => {
      if ((car as any)[feature] === true || (car as any)[feature] === 'yes') {
        count++;
      }
    });

    return count;
  }

  /**
   * نقاط الحالة
   */
  private getConditionScore(car: CarListing): number {
    const condition = car.condition?.toLowerCase();
    switch (condition) {
      case 'new': return 1.0;
      case 'excellent': return 0.9;
      case 'good': return 0.7;
      case 'fair': return 0.5;
      default: return 0.3;
    }
  }

  /**
   * إيجاد السيارة الأكثر تجهيزات
   */
  private calculateMostFeatures(cars: CarListing[]): string {
    const scores = cars.map(car => ({
      id: car.id,
      count: this.countFeatures(car)
    }));

    return scores.reduce((prev, curr) => 
      curr.count > prev.count ? curr : prev
    ).id;
  }

  /**
   * توليد التوصيات
   */
  private generateRecommendations(cars: CarListing[]): string[] {
    const recommendations: string[] = [];

    // أرخص سيارة
    const cheapest = cars.reduce((prev, curr) => curr.price < prev.price ? curr : prev);
    recommendations.push(
      `💰 ${cheapest.make} ${cheapest.model} - الخيار الأرخص (${cheapest.price.toLocaleString()} лв)`
    );

    // أحدث سيارة
    const newest = cars.reduce((prev, curr) => (curr.year || 0) > (prev.year || 0) ? curr : prev);
    if (newest.id !== cheapest.id) {
      recommendations.push(
        `🆕 ${newest.make} ${newest.model} - الأحدث (${newest.year})`
      );
    }

    // أقل كيلومترات
    const lowestMileage = cars.reduce((prev, curr) => 
      (curr.mileage || Infinity) < (prev.mileage || Infinity) ? curr : prev
    );
    if (lowestMileage.id !== cheapest.id && lowestMileage.id !== newest.id) {
      recommendations.push(
        `🚗 ${lowestMileage.make} ${lowestMileage.model} - أقل كيلومترات (${lowestMileage.mileage?.toLocaleString()} كم)`
      );
    }

    // أفضل قيمة
    const bestValueId = this.calculateBestValue(cars);
    const bestValueCar = cars.find(c => c.id === bestValueId);
    if (bestValueCar && bestValueCar.id !== cheapest.id) {
      recommendations.push(
        `⭐ ${bestValueCar.make} ${bestValueCar.model} - أفضل قيمة مقابل السعر`
      );
    }

    return recommendations;
  }

  /**
   * حفظ المقارنة للمستخدم
   */
  private async saveComparison(result: ComparisonResult): Promise<void> {
    try {
      if (!result.userId) return;

      const comparisonRef = doc(db, 'comparisons', result.id);
      await setDoc(comparisonRef, {
        carIds: result.cars.map(c => c.id),
        userId: result.userId,
        createdAt: result.createdAt,
        analysis: result.analysis
      });

      logger.info('✅ Comparison saved', { id: result.id });

    } catch (error) {
      logger.error('Error saving comparison', error as Error);
    }
  }

  /**
   * الحصول على مقارنات المستخدم المحفوظة
   */
  async getUserComparisons(userId: string): Promise<ComparisonResult[]> {
    try {
      const q = query(
        collection(db, 'comparisons'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const comparisons: ComparisonResult[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const cars = await this.fetchCars(data.carIds);
        
        comparisons.push({
          id: docSnap.id,
          cars,
          createdAt: data.createdAt.toDate(),
          userId: data.userId,
          analysis: data.analysis
        });
      }

      return comparisons.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    } catch (error) {
      logger.error('Error getting user comparisons', error as Error, { userId });
      return [];
    }
  }

  /**
   * حذف مقارنة
   */
  async deleteComparison(comparisonId: string, userId: string): Promise<void> {
    try {
      const comparisonRef = doc(db, 'comparisons', comparisonId);
      const comparisonDoc = await getDoc(comparisonRef);

      if (!comparisonDoc.exists()) {
        throw new Error('المقارنة غير موجودة');
      }

      if (comparisonDoc.data().userId !== userId) {
        throw new Error('غير مصرح بحذف هذه المقارنة');
      }

      await setDoc(comparisonRef, { deleted: true }, { merge: true });
      logger.info('✅ Comparison deleted', { id: comparisonId });

    } catch (error) {
      logger.error('Error deleting comparison', error as Error, { comparisonId });
      throw error;
    }
  }

  /**
   * مشاركة المقارنة (إنشاء رابط)
   */
  async shareComparison(comparisonId: string): Promise<string> {
    try {
      const shareId = this.generateId();
      const shareUrl = `${window.location.origin}/compare/share/${shareId}`;

      const comparisonRef = doc(db, 'comparisons', comparisonId);
      await setDoc(comparisonRef, { shareId, shareUrl }, { merge: true });

      logger.info('✅ Comparison shared', { id: comparisonId, shareUrl });

      return shareUrl;

    } catch (error) {
      logger.error('Error sharing comparison', error as Error, { comparisonId });
      throw error;
    }
  }

  /**
   * الحصول على مقارنة مشتركة
   */
  async getSharedComparison(shareId: string): Promise<ComparisonResult | null> {
    try {
      const q = query(
        collection(db, 'comparisons'),
        where('shareId', '==', shareId)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      const cars = await this.fetchCars(data.carIds);

      return {
        id: docSnap.id,
        cars,
        createdAt: data.createdAt.toDate(),
        userId: data.userId,
        shareUrl: data.shareUrl,
        analysis: data.analysis
      };

    } catch (error) {
      logger.error('Error getting shared comparison', error as Error, { shareId });
      return null;
    }
  }

  /**
   * توليد معرف فريد
   */
  private generateId(): string {
    return `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * تصدير المقارنة كـ JSON
   */
  exportAsJSON(comparison: ComparisonResult): string {
    return JSON.stringify(comparison, null, 2);
  }

  /**
   * تصدير المقارنة كـ CSV
   */
  exportAsCSV(comparison: ComparisonResult): string {
    const headers = [
      'Make', 'Model', 'Year', 'Price', 'Mileage', 'Fuel Type', 
      'Transmission', 'Condition', 'Features Count'
    ];

    const rows = comparison.cars.map(car => [
      car.make,
      car.model,
      car.year,
      car.price,
      car.mileage || 'N/A',
      car.fuelType || 'N/A',
      car.transmission || 'N/A',
      car.condition || 'N/A',
      this.countFeatures(car)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csv;
  }
}

export const carComparisonService = CarComparisonService.getInstance();
export default carComparisonService;
