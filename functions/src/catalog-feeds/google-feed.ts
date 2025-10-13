// Google Merchant Center Feed Function
// Auto-generates XML feed for Google Shopping
// Location: Bulgaria | Currency: EUR

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const googleMerchantFeed = functions.https.onRequest(async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'application/xml; charset=utf-8');
    
    const carsSnapshot = await admin.firestore()
      .collection('cars')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(5000)
      .get();
    
    const cars = carsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
    xml += '  <channel>\n';
    xml += '    <title>Globul Cars - Bulgarian Car Marketplace</title>\n';
    xml += '    <link>https://mobilebg.eu</link>\n';
    xml += '    <description>Premium used cars in Bulgaria</description>\n';
    
    cars.forEach((car: any) => {
      const imageUrls = car.imageUrls || car.images || [];
      const title = `${car.make || ''} ${car.model || ''} ${car.year || ''}`.trim();
      const description = car.description || 
        `${car.make} ${car.model} ${car.year}, ${car.mileage} km, ${car.fuelType}`;
      
      xml += '    <item>\n';
      xml += `      <g:id>${escapeXML(car.id)}</g:id>\n`;
      xml += `      <g:title>${escapeXML(title)}</g:title>\n`;
      xml += `      <g:description>${escapeXML(description)}</g:description>\n`;
      xml += `      <g:link>https://mobilebg.eu/cars/${car.id}</g:link>\n`;
      xml += `      <g:image_link>${escapeXML(imageUrls[0] || '')}</g:image_link>\n`;
      
      if (imageUrls.length > 1) {
        imageUrls.slice(1, 10).forEach((img: string) => {
          xml += `      <g:additional_image_link>${escapeXML(img)}</g:additional_image_link>\n`;
        });
      }
      
      xml += `      <g:condition>${car.year >= new Date().getFullYear() - 1 ? 'new' : 'used'}</g:condition>\n`;
      xml += `      <g:availability>in_stock</g:availability>\n`;
      xml += `      <g:price>${car.price} EUR</g:price>\n`;
      xml += `      <g:brand>${escapeXML(car.make || '')}</g:brand>\n`;
      xml += `      <g:google_product_category>916</g:google_product_category>\n`;
      xml += `      <g:product_type>Vehicles > Cars > ${escapeXML(car.make)}</g:product_type>\n`;
      
      if (car.color) xml += `      <g:color>${escapeXML(car.color)}</g:color>\n`;
      if (car.make) xml += `      <g:custom_label_0>${escapeXML(car.make)}</g:custom_label_0>\n`;
      if (car.city) xml += `      <g:custom_label_1>${escapeXML(car.city)}</g:custom_label_1>\n`;
      
      xml += '    </item>\n';
    });
    
    xml += '  </channel>\n';
    xml += '</rss>';
    
    res.send(xml);
  } catch (error) {
    console.error('Error generating Google feed:', error);
    res.status(500).send('Error generating feed');
  }
});

function escapeXML(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

