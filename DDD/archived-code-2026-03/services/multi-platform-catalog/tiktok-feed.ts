// TikTok Shopping Feed Generator
// Product feed for TikTok Shop - Bulgaria market
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { queryAllCollections, countAllVehicles, VEHICLE_COLLECTIONS } from '../search/multi-collection-helper';
import { db } from '../../firebase/firebase-config';

interface TikTokProductItem {
  id: string;
  title: string;
  description: string;
  availability: 'IN_STOCK' | 'OUT_OF_STOCK';
  condition: 'NEW' | 'USED' | 'REFURBISHED';
  price: number;
  currency: 'EUR';
  link: string;
  image_link: string;
  additional_image_link?: string[];
  brand: string;
  category: string;
  product_id: string;
  sku_id: string;
}

class TikTokFeedService {
  private static readonly BASE_URL = 'https://koli.one';
  
  static convertCarToTikTokProduct(car: any): TikTokProductItem {
    const baseUrl = this.BASE_URL;
    const imageUrls = car.imageUrls || [];
    
    return {
      id: car.id,
      title: `${car.make} ${car.model} ${car.year}`,
      description: car.description || 
        `${car.make} ${car.model} ${car.year}, ${car.mileage} km, ${car.fuelType}, ${car.transmission}`,
      availability: car.status === 'active' ? 'IN_STOCK' : 'OUT_OF_STOCK',
      condition: car.year >= new Date().getFullYear() - 1 ? 'NEW' : 'USED',
      price: car.price,
      currency: 'EUR',
      link: `${baseUrl}/cars/${car.id}`,
      image_link: imageUrls[0] || '',
      additional_image_link: imageUrls.slice(1, 9),
      brand: car.make,
      category: 'Vehicles & Parts',
      product_id: car.id,
      sku_id: `CAR-${car.id}`
    };
  }
  
  static generateJSONFeed(cars: unknown[]): string {
    const items = cars.map((car: any) => this.convertCarToTikTokProduct(car));
    
    return JSON.stringify({
      version: '1.0',
      feed_id: 'globul-cars-bulgaria',
      generated_time: new Date().toISOString(),
      items: items
    }, null, 2);
  }
  
  static async getActiveCars(): Promise<any[]> {
    const carsQuery = query(
      collection(db, 'cars'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(5000)
    );
    
    const snapshot = await getDocs(carsQuery);
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }
}

export default TikTokFeedService;

