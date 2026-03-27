import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

/**
 * Facebook Automotive Inventory Catalog Feed (XML Format)
 * This creates a dynamic URL that Meta Business Manager can scrape on a schedule.
 * Automatically keeps all cars synced, adds new ones, updates prices, and removes sold/deleted ones.
 */
export const facebookCatalogFeed = functions
    .runWith({ memory: '1GB', timeoutSeconds: 120 })
    .https.onRequest(async (req, res) => {
        try {
            const db = admin.firestore();
            
            // Only fetch active cars. Price filtering is done in JS to avoid composite index limits.
            const carsSnapshot = await db.collection('cars')
                .where('status', '==', 'active')
                .get();

            let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
            xml += `<listings>\n`;
            xml += `  <title>Koli One - Automotive Inventory Catalog</title>\n`;
            xml += `  <link>https://koli.one</link>\n`;
            xml += `  <description>Official Koli One Data Feed for Meta Commerce</description>\n`;

            carsSnapshot.docs.forEach(doc => {
                const car = doc.data();
                
                // Skip invalid records to prevent Meta catalog errors
                if (!car.sellerNumericId || !car.carNumericId || !car.make || !car.model || !car.price || car.price <= 0) return;

                const vehicleId = `${car.sellerNumericId}-${car.carNumericId}`;
                const carUrl = `https://koli.one/car/${car.sellerNumericId}/${car.carNumericId}`;
                const title = `${car.year} ${car.make} ${car.model} ${car.trim || ''}`.trim().substring(0, 100);
                const description = car.description ? car.description.substring(0, 5000).replace(/[<>&'"]/g, '') : `للبيع: ${title}`;
                const primaryImage = Array.isArray(car.images) && car.images.length > 0 ? car.images[0] : 'https://koli.one/placeholder.jpg';
                const priceStr = `${Number(car.price).toFixed(2)} EUR`; // Facebook expects Currency Code
                
                // Map condition to Meta's strict values (new, used, cpo)
                let stateOfVehicle = 'used';
                if (car.condition === 'new') stateOfVehicle = 'new';
                else if (car.condition === 'damaged' || car.condition === 'parts') return; // Skip broken cars for marketplace ads generally

                xml += `  <listing>\n`;
                xml += `    <vehicle_id>${vehicleId}</vehicle_id>\n`;
                xml += `    <title><![CDATA[${title}]]></title>\n`;
                xml += `    <description><![CDATA[${description}]]></description>\n`;
                xml += `    <url><![CDATA[${carUrl}]]></url>\n`;
                xml += `    <make><![CDATA[${car.make}]]></make>\n`;
                xml += `    <model><![CDATA[${car.model}]]></model>\n`;
                xml += `    <year>${car.year}</year>\n`;
                xml += `    <mileage><value>${car.mileage || 0}</value><unit>KM</unit></mileage>\n`;
                // To prevent FB syntax issues, output image array
                if (Array.isArray(car.images)) {
                    car.images.slice(0, 10).forEach((imgUrl: string, idx: number) => {
                        xml += `    <image><url><![CDATA[${imgUrl}]]></url></image>\n`;
                    });
                } else {
                    xml += `    <image><url><![CDATA[${primaryImage}]]></url></image>\n`;
                }
                xml += `    <price>${priceStr}</price>\n`;
                xml += `    <state_of_vehicle>${stateOfVehicle}</state_of_vehicle>\n`;
                xml += `    <availability>in stock</availability>\n`;
                
                // Required Meta Automotive fields (Must have fallback if empty)
                const bodyStyle = car.bodyType || 'Sedan';
                const transmission = car.transmission || 'Manual';
                const fuelType = car.fuelType || 'Petrol';
                const color = car.color || 'Black';
                
                xml += `    <body_style><![CDATA[${bodyStyle}]]></body_style>\n`;
                xml += `    <transmission><![CDATA[${transmission}]]></transmission>\n`;
                xml += `    <fuel_type><![CDATA[${fuelType}]]></fuel_type>\n`;
                xml += `    <exterior_color><![CDATA[${color}]]></exterior_color>\n`;
                
                // Meta strictly requires Region, Street Address, City, Country, and Postal Code for Vehicles
                const cityName = car.city || 'Sofia';
                xml += `    <address format="simple">\n`;
                xml += `      <component name="addr1"><![CDATA[${cityName} Auto]]></component>\n`;
                xml += `      <component name="city"><![CDATA[${cityName}]]></component>\n`;
                xml += `      <component name="region">BG</component>\n`;
                xml += `      <component name="country">BG</component>\n`;
                xml += `      <component name="postal_code">1000</component>\n`;
                xml += `    </address>\n`;
                
                xml += `  </listing>\n`;
            });

            xml += `</listings>`;

            // Send standard XML response
            res.set('Content-Type', 'text/xml; charset=utf-8');
            res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
            res.status(200).send(xml);

        } catch (error) {
            functions.logger.error('Failed to generate Facebook Catalog Feed:', error);
            res.status(500).send('Internal Server Error');
        }
    });

