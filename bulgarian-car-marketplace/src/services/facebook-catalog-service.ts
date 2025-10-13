// src/services/facebook-catalog-service.ts
// Facebook Catalog Integration Service for Car Listings
// خدمة التكامل مع كاتالوج Facebook لإعلانات السيارات

import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { CarListing } from '../types/CarListing';

/**
 * Facebook Product Feed Item for Vehicles
 * صيغة منتج السيارة لكاتالوج Facebook
 */
export interface FacebookVehicleItem {
  // Required fields (مطلوبة)
  id: string;                          // معرف فريد
  title: string;                       // العنوان
  description: string;                 // الوصف
  availability: 'in stock' | 'out of stock';  // التوفر
  condition: 'new' | 'used' | 'refurbished';  // الحالة
  price: string;                       // السعر (مع العملة: "50000 EUR")
  link: string;                        // رابط المنتج
  image_link: string;                  // رابط الصورة الرئيسية
  brand: string;                       // الماركة
  
  // Recommended fields (موصى بها)
  additional_image_link?: string[];    // صور إضافية
  year?: number;                       // سنة الصنع
  make?: string;                       // الصانع
  model?: string;                      // الموديل
  mileage?: {
    value: number;
    unit: 'km' | 'mi';
  };
  vehicle_type?: string;               // نوع المركبة
  fuel_type?: string;                  // نوع الوقود
  transmission?: string;               // ناقل الحركة
  exterior_color?: string;             // لون خارجي
  interior_color?: string;             // لون داخلي
  drivetrain?: string;                 // نظام الدفع
  body_style?: string;                 // نمط الهيكل
  vin?: string;                        // رقم الشاصي
  state_of_vehicle?: string;           // حالة السيارة
  
  // Location (الموقع)
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    region?: string;
    postal_code?: string;
  };
  
  // Seller info (معلومات البائع)
  seller_name?: string;
  seller_phone?: string;
  seller_email?: string;
  
  // Additional data (بيانات إضافية)
  custom_label_0?: string;             // تصنيف مخصص 1
  custom_label_1?: string;             // تصنيف مخصص 2
  custom_label_2?: string;             // تصنيف مخصص 3
  custom_label_3?: string;             // تصنيف مخصص 4
  custom_label_4?: string;             // تصنيف مخصص 5
}

/**
 * Facebook Catalog Service
 * خدمة كاتالوج Facebook
 */
export class FacebookCatalogService {
  private static readonly CATALOG_ID = 'YOUR_CATALOG_ID'; // سيتم تحديثه
  private static readonly ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'; // سيتم تحديثه
  private static readonly BASE_URL = 'https://mobilebg.eu';
  
  /**
   * Convert CarListing to Facebook Vehicle Format
   * تحويل إعلان السيارة إلى صيغة Facebook
   */
  static convertToFacebookFormat(car: any): FacebookVehicleItem {
    const baseUrl = this.BASE_URL;
    
    // Handle images - could be File[] or string[] depending on source
    const imageUrls = car.imageUrls || car.images || [];
    const firstImage = Array.isArray(imageUrls) && imageUrls.length > 0 
      ? (typeof imageUrls[0] === 'string' ? imageUrls[0] : '')
      : '';
    const additionalImages = Array.isArray(imageUrls) && imageUrls.length > 1
      ? imageUrls.slice(1, 10).filter((img: any) => typeof img === 'string')
      : [];
    
    return {
      // Required fields
      id: car.id || '',
      title: `${car.make} ${car.model} ${car.year}`,
      description: car.description || `${car.make} ${car.model} ${car.year}, ${car.mileage} km, ${car.fuelType}, ${car.transmission}`,
      availability: car.status === 'active' ? 'in stock' : 'out of stock',
      condition: car.year >= new Date().getFullYear() - 1 ? 'new' : 'used',
      price: `${car.price} ${car.currency}`,
      link: `${baseUrl}/cars/${car.id}`,
      image_link: firstImage,
      brand: car.make,
      
      // Recommended fields
      additional_image_link: additionalImages.length > 0 ? additionalImages : undefined,
      year: car.year,
      make: car.make,
      model: car.model,
      mileage: {
        value: car.mileage,
        unit: 'km'
      },
      vehicle_type: car.vehicleType,
      fuel_type: car.fuelType,
      transmission: car.transmission,
      exterior_color: car.color,
      body_style: car.vehicleType,
      vin: car.vin || undefined,
      state_of_vehicle: car.accidentHistory ? 'accident_history' : 'no_accidents',
      
      // Location
      location: {
        city: car.city,
        region: car.region,
        postal_code: car.postalCode
      },
      
      // Seller info
      seller_name: car.sellerName,
      seller_phone: car.sellerPhone,
      seller_email: car.sellerEmail,
      
      // Custom labels for categorization
      custom_label_0: car.make,              // الماركة
      custom_label_1: car.vehicleType,       // نوع السيارة
      custom_label_2: car.fuelType,          // نوع الوقود
      custom_label_3: car.sellerType,        // نوع البائع
      custom_label_4: car.region             // المنطقة
    };
  }
  
  /**
   * Generate XML Product Feed for Facebook
   * إنشاء ملف XML للمنتجات لـ Facebook
   */
  static generateXMLFeed(cars: any[]): string {
    const items = cars.map(car => this.convertToFacebookFormat(car));
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
    xml += '  <channel>\n';
    xml += '    <title>Globul Cars - Bulgarian Car Marketplace</title>\n';
    xml += '    <link>https://mobilebg.eu</link>\n';
    xml += '    <description>Premium car listings from Bulgaria</description>\n';
    
    items.forEach(item => {
      xml += '    <item>\n';
      xml += `      <g:id>${this.escapeXML(item.id)}</g:id>\n`;
      xml += `      <g:title>${this.escapeXML(item.title)}</g:title>\n`;
      xml += `      <g:description>${this.escapeXML(item.description)}</g:description>\n`;
      xml += `      <g:link>${this.escapeXML(item.link)}</g:link>\n`;
      xml += `      <g:image_link>${this.escapeXML(item.image_link)}</g:image_link>\n`;
      
      // Additional images
      if (item.additional_image_link) {
        item.additional_image_link.forEach(img => {
          xml += `      <g:additional_image_link>${this.escapeXML(img)}</g:additional_image_link>\n`;
        });
      }
      
      xml += `      <g:availability>${item.availability}</g:availability>\n`;
      xml += `      <g:price>${item.price}</g:price>\n`;
      xml += `      <g:condition>${item.condition}</g:condition>\n`;
      xml += `      <g:brand>${this.escapeXML(item.brand)}</g:brand>\n`;
      
      // Vehicle-specific fields
      if (item.year) xml += `      <g:year>${item.year}</g:year>\n`;
      if (item.make) xml += `      <g:make>${this.escapeXML(item.make)}</g:make>\n`;
      if (item.model) xml += `      <g:model>${this.escapeXML(item.model)}</g:model>\n`;
      if (item.mileage) xml += `      <g:mileage>${item.mileage.value} ${item.mileage.unit}</g:mileage>\n`;
      if (item.vehicle_type) xml += `      <g:vehicle_type>${this.escapeXML(item.vehicle_type)}</g:vehicle_type>\n`;
      if (item.fuel_type) xml += `      <g:fuel_type>${this.escapeXML(item.fuel_type)}</g:fuel_type>\n`;
      if (item.transmission) xml += `      <g:transmission>${this.escapeXML(item.transmission)}</g:transmission>\n`;
      if (item.exterior_color) xml += `      <g:exterior_color>${this.escapeXML(item.exterior_color)}</g:exterior_color>\n`;
      if (item.vin) xml += `      <g:vin>${this.escapeXML(item.vin)}</g:vin>\n`;
      
      // Custom labels
      if (item.custom_label_0) xml += `      <g:custom_label_0>${this.escapeXML(item.custom_label_0)}</g:custom_label_0>\n`;
      if (item.custom_label_1) xml += `      <g:custom_label_1>${this.escapeXML(item.custom_label_1)}</g:custom_label_1>\n`;
      if (item.custom_label_2) xml += `      <g:custom_label_2>${this.escapeXML(item.custom_label_2)}</g:custom_label_2>\n`;
      if (item.custom_label_3) xml += `      <g:custom_label_3>${this.escapeXML(item.custom_label_3)}</g:custom_label_3>\n`;
      if (item.custom_label_4) xml += `      <g:custom_label_4>${this.escapeXML(item.custom_label_4)}</g:custom_label_4>\n`;
      
      xml += '    </item>\n';
    });
    
    xml += '  </channel>\n';
    xml += '</rss>';
    
    return xml;
  }
  
  /**
   * Generate CSV Product Feed for Facebook
   * إنشاء ملف CSV للمنتجات لـ Facebook
   */
  static generateCSVFeed(cars: any[]): string {
    const items = cars.map(car => this.convertToFacebookFormat(car));
    
    // CSV Header
    let csv = 'id,title,description,availability,condition,price,link,image_link,brand,year,make,model,mileage,vehicle_type,fuel_type,transmission,exterior_color,vin,city,region\n';
    
    // CSV Rows
    items.forEach(item => {
      csv += [
        this.escapeCSV(item.id),
        this.escapeCSV(item.title),
        this.escapeCSV(item.description),
        item.availability,
        item.condition,
        this.escapeCSV(item.price),
        this.escapeCSV(item.link),
        this.escapeCSV(item.image_link),
        this.escapeCSV(item.brand),
        item.year || '',
        this.escapeCSV(item.make || ''),
        this.escapeCSV(item.model || ''),
        item.mileage ? `${item.mileage.value} ${item.mileage.unit}` : '',
        this.escapeCSV(item.vehicle_type || ''),
        this.escapeCSV(item.fuel_type || ''),
        this.escapeCSV(item.transmission || ''),
        this.escapeCSV(item.exterior_color || ''),
        this.escapeCSV(item.vin || ''),
        this.escapeCSV(item.location?.city || ''),
        this.escapeCSV(item.location?.region || '')
      ].join(',') + '\n';
    });
    
    return csv;
  }
  
  /**
   * Get all active car listings from Firestore
   * الحصول على جميع إعلانات السيارات النشطة
   */
  static async getActiveCars(): Promise<any[]> {
    try {
      const carsQuery = query(
        collection(db, 'cars'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(1000) // Facebook Catalog limit
      );
      
      const snapshot = await getDocs(carsQuery);
      const cars: any[] = [];
      
      snapshot.forEach(doc => {
        const carData = doc.data();
        cars.push({ 
          id: doc.id, 
          ...carData,
          // Ensure images are URLs (convert if needed)
          imageUrls: carData.imageUrls || carData.images || []
        });
      });
      
      return cars;
    } catch (error) {
      console.error('Error fetching active cars:', error);
      throw error;
    }
  }
  
  /**
   * Generate and download Product Feed
   * إنشاء وتنزيل ملف المنتجات
   */
  static async generateAndDownloadFeed(format: 'xml' | 'csv' = 'xml'): Promise<void> {
    try {
      console.log('📦 Generating Facebook Product Feed...');
      
      // Get active cars
      const cars = await this.getActiveCars();
      console.log(`✅ Found ${cars.length} active cars`);
      
      // Generate feed
      const feed = format === 'xml' 
        ? this.generateXMLFeed(cars)
        : this.generateCSVFeed(cars);
      
      // Create download link
      const blob = new Blob([feed], { 
        type: format === 'xml' ? 'application/xml' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `globul-cars-catalog.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`✅ Feed downloaded: globul-cars-catalog.${format}`);
    } catch (error) {
      console.error('Error generating feed:', error);
      throw error;
    }
  }
  
  /**
   * Get feed URL for automatic updates
   * الحصول على رابط الـ feed للتحديثات التلقائية
   */
  static getFeedURL(format: 'xml' | 'csv' = 'xml'): string {
    return `${this.BASE_URL}/api/facebook-catalog.${format}`;
  }
  
  /**
   * Escape XML special characters
   */
  private static escapeXML(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
  
  /**
   * Escape CSV special characters
   */
  private static escapeCSV(str: string): string {
    if (!str) return '';
    const stringValue = String(str);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }
  
  /**
   * Get catalog statistics
   * إحصائيات الكاتالوج
   */
  static async getCatalogStats() {
    try {
      const cars = await this.getActiveCars();
      
      return {
        totalCars: cars.length,
        byMake: this.groupBy(cars, 'make'),
        byType: this.groupBy(cars, 'vehicleType'),
        byFuelType: this.groupBy(cars, 'fuelType'),
        byRegion: this.groupBy(cars, 'region'),
        averagePrice: this.calculateAverage(cars, 'price'),
        priceRange: {
          min: Math.min(...cars.map(c => c.price)),
          max: Math.max(...cars.map(c => c.price))
        }
      };
    } catch (error) {
      console.error('Error getting catalog stats:', error);
      throw error;
    }
  }
  
  /**
   * Group items by field
   */
  private static groupBy(items: any[], field: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = item[field] || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
  
  /**
   * Calculate average of a field
   */
  private static calculateAverage(items: any[], field: string): number {
    const sum = items.reduce((acc, item) => acc + (item[field] || 0), 0);
    return items.length > 0 ? Math.round(sum / items.length) : 0;
  }
}

export default FacebookCatalogService;

