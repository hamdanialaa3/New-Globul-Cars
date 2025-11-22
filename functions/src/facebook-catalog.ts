// functions/src/facebook-catalog.ts
// Firebase Function to generate Facebook Product Feed
// دالة Firebase لإنشاء Product Feed لـ Facebook تلقائياً

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Generate Facebook Product Feed (XML)
 * إنشاء ملف XML للمنتجات
 * 
 * URL: https://mobilebg.eu/api/facebook-catalog.xml
 */
export const facebookCatalogXML = functions.https.onRequest(async (req, res) => {
  try {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'application/xml; charset=utf-8');
    
    // Get active cars from Firestore
    const carsSnapshot = await admin.firestore()
      .collection('cars')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(1000)
      .get();
    
    const cars = carsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
    xml += '  <channel>\n';
    xml += '    <title>Globul Cars - Bulgarian Car Marketplace</title>\n';
    xml += '    <link>https://mobilebg.eu</link>\n';
    xml += '    <description>Premium car listings from Bulgaria</description>\n';
    
    cars.forEach((car: any) => {
      const title = `${car.make || ''} ${car.model || ''} ${car.year || ''}`.trim();
      const description = car.description || `${car.make} ${car.model}, ${car.mileage} km, ${car.fuelType}`;
      const price = `${car.price} ${car.currency || 'EUR'}`;
      const link = `https://mobilebg.eu/cars/${car.id}`;
      const image = car.images?.[0] || '';
      
      xml += '    <item>\n';
      xml += `      <g:id>${escapeXML(car.id)}</g:id>\n`;
      xml += `      <g:title>${escapeXML(title)}</g:title>\n`;
      xml += `      <g:description>${escapeXML(description)}</g:description>\n`;
      xml += `      <g:link>${escapeXML(link)}</g:link>\n`;
      xml += `      <g:image_link>${escapeXML(image)}</g:image_link>\n`;
      
      // Additional images
      if (car.images && car.images.length > 1) {
        car.images.slice(1, 10).forEach((img: string) => {
          xml += `      <g:additional_image_link>${escapeXML(img)}</g:additional_image_link>\n`;
        });
      }
      
      xml += `      <g:availability>in stock</g:availability>\n`;
      xml += `      <g:price>${price}</g:price>\n`;
      xml += `      <g:condition>${car.year >= new Date().getFullYear() - 1 ? 'new' : 'used'}</g:condition>\n`;
      xml += `      <g:brand>${escapeXML(car.make || '')}</g:brand>\n`;
      
      // Vehicle-specific
      if (car.year) xml += `      <g:year>${car.year}</g:year>\n`;
      if (car.make) xml += `      <g:make>${escapeXML(car.make)}</g:make>\n`;
      if (car.model) xml += `      <g:model>${escapeXML(car.model)}</g:model>\n`;
      if (car.mileage) xml += `      <g:mileage>${car.mileage} km</g:mileage>\n`;
      if (car.vehicleType) xml += `      <g:vehicle_type>${escapeXML(car.vehicleType)}</g:vehicle_type>\n`;
      if (car.fuelType) xml += `      <g:fuel_type>${escapeXML(car.fuelType)}</g:fuel_type>\n`;
      if (car.transmission) xml += `      <g:transmission>${escapeXML(car.transmission)}</g:transmission>\n`;
      if (car.color) xml += `      <g:exterior_color>${escapeXML(car.color)}</g:exterior_color>\n`;
      
      // Location
      if (car.city) xml += `      <g:location>${escapeXML(car.city)}, ${escapeXML(car.region || 'Bulgaria')}</g:location>\n`;
      
      xml += '    </item>\n';
    });
    
    xml += '  </channel>\n';
    xml += '</rss>';
    
    res.send(xml);
  } catch (error) {
    console.error('Error generating Facebook catalog XML:', error);
    res.status(500).send('Error generating catalog');
  }
});

/**
 * Generate Facebook Product Feed (CSV)
 * إنشاء ملف CSV للمنتجات
 * 
 * URL: https://mobilebg.eu/api/facebook-catalog.csv
 */
export const facebookCatalogCSV = functions.https.onRequest(async (req, res) => {
  try {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="globul-cars-catalog.csv"');
    
    // Get active cars from Firestore
    const carsSnapshot = await admin.firestore()
      .collection('cars')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(1000)
      .get();
    
    const cars = carsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // CSV Header
    let csv = 'id,title,description,availability,condition,price,link,image_link,brand,year,make,model,mileage,vehicle_type,fuel_type,transmission,exterior_color,city,region\n';
    
    // CSV Rows
    cars.forEach((car: any) => {
      const title = `${car.make || ''} ${car.model || ''} ${car.year || ''}`.trim();
      const description = car.description || `${car.make} ${car.model}, ${car.mileage} km`;
      const price = `${car.price} ${car.currency || 'EUR'}`;
      const link = `https://mobilebg.eu/cars/${car.id}`;
      const image = car.images?.[0] || '';
      
      csv += [
        escapeCSV(car.id),
        escapeCSV(title),
        escapeCSV(description),
        'in stock',
        car.year >= new Date().getFullYear() - 1 ? 'new' : 'used',
        escapeCSV(price),
        escapeCSV(link),
        escapeCSV(image),
        escapeCSV(car.make || ''),
        car.year || '',
        escapeCSV(car.make || ''),
        escapeCSV(car.model || ''),
        car.mileage ? `${car.mileage} km` : '',
        escapeCSV(car.vehicleType || ''),
        escapeCSV(car.fuelType || ''),
        escapeCSV(car.transmission || ''),
        escapeCSV(car.color || ''),
        escapeCSV(car.city || ''),
        escapeCSV(car.region || '')
      ].join(',') + '\n';
    });
    
    res.send(csv);
  } catch (error) {
    console.error('Error generating Facebook catalog CSV:', error);
    res.status(500).send('Error generating catalog');
  }
});

/**
 * Helper: Escape XML special characters
 */
function escapeXML(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Helper: Escape CSV special characters
 */
function escapeCSV(str: string | number): string {
  if (!str) return '';
  const stringValue = String(str);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

