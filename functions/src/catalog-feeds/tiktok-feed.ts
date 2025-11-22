// TikTok Shopping Feed Function
// Auto-generates JSON feed for TikTok Shop
// Location: Bulgaria | Currency: EUR

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const tiktokShoppingFeed = functions.https.onRequest(async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', 'application/json; charset=utf-8');
    
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
    
    const items = cars.map((car: any) => {
      const imageUrls = car.imageUrls || car.images || [];
      const title = `${car.make || ''} ${car.model || ''} ${car.year || ''}`.trim();
      
      return {
        id: car.id,
        title: title,
        description: car.description || `${car.make} ${car.model}, ${car.mileage} km`,
        availability: car.status === 'active' ? 'IN_STOCK' : 'OUT_OF_STOCK',
        condition: car.year >= new Date().getFullYear() - 1 ? 'NEW' : 'USED',
        price: car.price,
        currency: 'EUR',
        link: `https://mobilebg.eu/cars/${car.id}`,
        image_link: imageUrls[0] || '',
        additional_image_link: imageUrls.slice(1, 9),
        brand: car.make,
        category: 'Vehicles & Parts',
        product_id: car.id,
        sku_id: `CAR-${car.id}`
      };
    });
    
    const feed = {
      version: '1.0',
      feed_id: 'globul-cars-bulgaria',
      generated_time: new Date().toISOString(),
      total_items: items.length,
      items: items
    };
    
    res.json(feed);
  } catch (error) {
    console.error('Error generating TikTok feed:', error);
    res.status(500).json({ error: 'Error generating feed' });
  }
});

