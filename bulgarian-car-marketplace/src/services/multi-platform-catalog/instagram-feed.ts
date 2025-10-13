// Instagram Shopping Feed Generator
// Product feed for Instagram Shopping - Bulgaria market
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';

interface InstagramProductItem {
  retailer_id: string;
  name: string;
  description: string;
  url: string;
  image_url: string;
  additional_image_url?: string[];
  brand: string;
  price: string;
  availability: 'in stock' | 'out of stock' | 'available for order';
  condition: 'new' | 'refurbished' | 'used';
  product_type: string;
  google_product_category?: string;
  custom_label_0?: string;
  custom_label_1?: string;
  custom_label_2?: string;
  custom_label_3?: string;
  custom_label_4?: string;
}

class InstagramFeedService {
  private static readonly BASE_URL = 'https://mobilebg.eu';
  
  static convertCarToInstagramProduct(car: any): InstagramProductItem {
    const baseUrl = this.BASE_URL;
    const imageUrls = car.imageUrls || [];
    
    return {
      retailer_id: car.id,
      name: `${car.make} ${car.model} ${car.year}`,
      description: car.description || 
        `${car.make} ${car.model} ${car.year}, ${car.mileage} km, ${car.fuelType}`,
      url: `${baseUrl}/cars/${car.id}`,
      image_url: imageUrls[0] || '',
      additional_image_url: imageUrls.slice(1, 10),
      brand: car.make,
      price: `${car.price} EUR`,
      availability: car.status === 'active' ? 'in stock' : 'out of stock',
      condition: car.year >= new Date().getFullYear() - 1 ? 'new' : 'used',
      product_type: `Vehicles/${car.vehicleType}/${car.make}`,
      google_product_category: '916',
      custom_label_0: car.make,
      custom_label_1: car.city,
      custom_label_2: car.fuelType,
      custom_label_3: car.transmission,
      custom_label_4: car.region
    };
  }
  
  static generateCSVFeed(cars: any[]): string {
    const items = cars.map(car => this.convertCarToInstagramProduct(car));
    
    let csv = 'retailer_id,name,description,url,image_url,brand,price,availability,condition,product_type\n';
    
    items.forEach(item => {
      csv += [
        escapeCSV(item.retailer_id),
        escapeCSV(item.name),
        escapeCSV(item.description),
        escapeCSV(item.url),
        escapeCSV(item.image_url),
        escapeCSV(item.brand),
        escapeCSV(item.price),
        item.availability,
        item.condition,
        escapeCSV(item.product_type)
      ].join(',') + '\n';
    });
    
    return csv;
  }
  
  static async getActiveCars(): Promise<any[]> {
    const carsQuery = query(
      collection(db, 'cars'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(5000)
    );
    
    const snapshot = await getDocs(carsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

function escapeCSV(str: string): string {
  if (!str) return '';
  const stringValue = String(str);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export default InstagramFeedService;

