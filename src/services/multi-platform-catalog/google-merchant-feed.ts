// Google Merchant Center Feed Generator
// Product feed for Google Shopping - Bulgaria market
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { queryAllCollections, countAllVehicles, VEHICLE_COLLECTIONS } from '../search/multi-collection-helper';
import { db } from '../../firebase/firebase-config';

interface GoogleProductItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  additional_image_link?: string[];
  condition: 'new' | 'used' | 'refurbished';
  availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  price: string;
  brand: string;
  google_product_category: string;
  product_type: string;
  item_group_id?: string;
  mpn?: string;
  gtin?: string;
  color?: string;
  size?: string;
  age_group?: 'adult';
  gender?: 'unisex';
  custom_label_0?: string;
  custom_label_1?: string;
  custom_label_2?: string;
  custom_label_3?: string;
  custom_label_4?: string;
}

class GoogleMerchantFeedService {
  private static readonly BASE_URL = 'https://koli.one';
  private static readonly PRODUCT_CATEGORY = '916';
  
  static convertCarToGoogleProduct(car: any): GoogleProductItem {
    const baseUrl = this.BASE_URL;
    const imageUrls = car.imageUrls || [];
    const firstImage = imageUrls[0] || '';
    const additionalImages = imageUrls.slice(1, 10);
    
    return {
      id: car.id,
      title: `${car.make} ${car.model} ${car.year}`,
      description: car.description || 
        `${car.make} ${car.model} ${car.year}, ${car.mileage} km, ${car.fuelType}, ${car.transmission}. Located in ${car.locationData?.cityName}, Bulgaria.`,
      link: `${baseUrl}/cars/${car.id}`,
      image_link: firstImage,
      additional_image_link: additionalImages.length > 0 ? additionalImages : undefined,
      condition: car.year >= new Date().getFullYear() - 1 ? 'new' : 'used',
      availability: car.status === 'active' ? 'in_stock' : 'out_of_stock',
      price: `${car.price} EUR`,
      brand: car.make,
      google_product_category: this.PRODUCT_CATEGORY,
      product_type: `Vehicles > Cars > ${car.make} > ${car.model}`,
      item_group_id: `${car.make}-${car.model}-${car.year}`,
      color: car.color,
      age_group: 'adult',
      gender: 'unisex',
      custom_label_0: car.make,
      custom_label_1: car.vehicleType,
      custom_label_2: car.fuelType,
      custom_label_3: car.locationData?.cityName,
      custom_label_4: car.region
    };
  }
  
  static generateXMLFeed(cars: unknown[]): string {
    const items = cars.map((car: any) => this.convertCarToGoogleProduct(car));
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
    xml += '  <channel>\n';
    xml += '    <title>Globul Cars - Koli One</title>\n';
    xml += '    <link>https://koli.one</link>\n';
    xml += '    <description>Premium used cars in Bulgaria</description>\n';
    
    items.forEach(item => {
      xml += '    <item>\n';
      xml += `      <g:id>${escapeXML(item.id)}</g:id>\n`;
      xml += `      <g:title>${escapeXML(item.title)}</g:title>\n`;
      xml += `      <g:description>${escapeXML(item.description)}</g:description>\n`;
      xml += `      <g:link>${escapeXML(item.link)}</g:link>\n`;
      xml += `      <g:image_link>${escapeXML(item.image_link)}</g:image_link>\n`;
      
      if (item.additional_image_link) {
        item.additional_image_link.forEach(img => {
          xml += `      <g:additional_image_link>${escapeXML(img)}</g:additional_image_link>\n`;
        });
      }
      
      xml += `      <g:condition>${item.condition}</g:condition>\n`;
      xml += `      <g:availability>${item.availability}</g:availability>\n`;
      xml += `      <g:price>${item.price}</g:price>\n`;
      xml += `      <g:brand>${escapeXML(item.brand)}</g:brand>\n`;
      xml += `      <g:google_product_category>${item.google_product_category}</g:google_product_category>\n`;
      xml += `      <g:product_type>${escapeXML(item.product_type)}</g:product_type>\n`;
      
      if (item.item_group_id) xml += `      <g:item_group_id>${escapeXML(item.item_group_id)}</g:item_group_id>\n`;
      if (item.color) xml += `      <g:color>${escapeXML(item.color)}</g:color>\n`;
      if (item.age_group) xml += `      <g:age_group>${item.age_group}</g:age_group>\n`;
      if (item.gender) xml += `      <g:gender>${item.gender}</g:gender>\n`;
      if (item.custom_label_0) xml += `      <g:custom_label_0>${escapeXML(item.custom_label_0)}</g:custom_label_0>\n`;
      if (item.custom_label_1) xml += `      <g:custom_label_1>${escapeXML(item.custom_label_1)}</g:custom_label_1>\n`;
      if (item.custom_label_2) xml += `      <g:custom_label_2>${escapeXML(item.custom_label_2)}</g:custom_label_2>\n`;
      if (item.custom_label_3) xml += `      <g:custom_label_3>${escapeXML(item.custom_label_3)}</g:custom_label_3>\n`;
      if (item.custom_label_4) xml += `      <g:custom_label_4>${escapeXML(item.custom_label_4)}</g:custom_label_4>\n`;
      
      xml += '    </item>\n';
    });
    
    xml += '  </channel>\n';
    xml += '</rss>';
    
    return xml;
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

function escapeXML(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default GoogleMerchantFeedService;

