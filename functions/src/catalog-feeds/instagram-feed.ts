// Instagram Shopping Feed Function
// Auto-generates CSV feed for Instagram Shopping
// Location: Bulgaria | Currency: EUR

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const instagramShoppingFeed = functions.https.onRequest(async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="instagram-feed.csv"');
    
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
    
    let csv = 'retailer_id,name,description,url,image_url,brand,price,availability,condition,product_type\n';
    
    cars.forEach((car: any) => {
      const imageUrls = car.imageUrls || car.images || [];
      const name = `${car.make || ''} ${car.model || ''} ${car.year || ''}`.trim();
      const description = car.description || 
        `${car.make} ${car.model} ${car.year}, ${car.mileage} km`;
      
      csv += [
        escapeCSV(car.id),
        escapeCSV(name),
        escapeCSV(description),
        `https://mobilebg.eu/cars/${car.id}`,
        escapeCSV(imageUrls[0] || ''),
        escapeCSV(car.make || ''),
        `${car.price} EUR`,
        'in stock',
        car.year >= new Date().getFullYear() - 1 ? 'new' : 'used',
        escapeCSV(`Vehicles/${car.vehicleType}`)
      ].join(',') + '\n';
    });
    
    res.send(csv);
  } catch (error) {
    console.error('Error generating Instagram feed:', error);
    res.status(500).send('Error generating feed');
  }
});

function escapeCSV(str: string): string {
  if (!str) return '';
  const stringValue = String(str);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

