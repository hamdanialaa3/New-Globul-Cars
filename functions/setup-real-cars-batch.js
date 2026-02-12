const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Real Data Generation - 41 High Quality Cars - WITH LOCAL IMAGES
const CAR_MODELS = [
    { make: 'BMW', model: 'X5 M50d', year: 2021, price: 85000, body: 'SUV', fuel: 'Diesel', image: '/assets/images/cars/bmw_x5.jpg' },
    { make: 'Mercedes-Benz', model: 'S 500 4Matic', year: 2022, price: 115000, body: 'Sedan', fuel: 'Hybrid', image: '/assets/images/cars/mercedes_s_class.jpg' },
    { make: 'Audi', model: 'RS6 Avant', year: 2023, price: 145000, body: 'Wagon', fuel: 'Petrol', image: '/assets/images/cars/audi_rs6.jpg' },
    { make: 'Porsche', model: '911 Carrera 4S', year: 2020, price: 135000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/porsche_911.jpg' },
    { make: 'Toyota', model: 'RAV4 Hybrid', year: 2022, price: 38000, body: 'SUV', fuel: 'Hybrid', image: '/assets/images/cars/toyota_rav4.jpg' },
    { make: 'Volkswagen', model: 'Golf 8 R', year: 2022, price: 42000, body: 'Hatchback', fuel: 'Petrol', image: '/assets/images/cars/vw_golf.jpg' },
    { make: 'Tesla', model: 'Model 3 Performance', year: 2023, price: 55000, body: 'Sedan', fuel: 'Electric', image: '/assets/images/cars/tesla_model_3.jpg' },
    { make: 'BMW', model: 'M3 Competition', year: 2023, price: 98000, body: 'Sedan', fuel: 'Petrol', image: '/assets/images/cars/bmw_m3.jpg' },
    { make: 'Mercedes-Benz', model: 'G 63 AMG', year: 2021, price: 185000, body: 'SUV', fuel: 'Petrol', image: '/assets/images/cars/mercedes_g_class.jpg' },
    { make: 'Audi', model: 'Q8 S-Line', year: 2022, price: 75000, body: 'SUV', fuel: 'Diesel', image: '/assets/images/cars/audi_q8.jpg' },
    { make: 'Ford', model: 'Mustang GT', year: 2020, price: 45000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/ford_mustang.jpg' },
    { make: 'Land Rover', model: 'Range Rover Sport', year: 2023, price: 110000, body: 'SUV', fuel: 'Hybrid', image: '/assets/images/cars/range_rover.jpg' },
    { make: 'Porsche', model: 'Cayenne Turbo', year: 2021, price: 125000, body: 'SUV', fuel: 'Petrol', image: '/assets/images/cars/porsche_cayenne.jpg' },
    { make: 'Honda', model: 'Civic Type R', year: 2024, price: 48000, body: 'Hatchback', fuel: 'Petrol', image: '/assets/images/cars/honda_civic_type_r.jpg' },
    { make: 'Lexus', model: 'RX 450h', year: 2021, price: 52000, body: 'SUV', fuel: 'Hybrid', image: '/assets/images/cars/lexus_rx.jpg' },
    { make: 'Nissan', model: 'GT-R Nismo', year: 2019, price: 140000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/nissan_gtr.jpg' },
    { make: 'Volvo', model: 'XC90 T8', year: 2022, price: 68000, body: 'SUV', fuel: 'Hybrid', image: '/assets/images/cars/volvo_xc90.jpg' },
    { make: 'BMW', model: 'i4 M50', year: 2024, price: 72000, body: 'Sedan', fuel: 'Electric', image: '/assets/images/cars/bmw_i4.jpg' },
    { make: 'Mercedes-Benz', model: 'EQS 580', year: 2023, price: 130000, body: 'Sedan', fuel: 'Electric', image: '/assets/images/cars/mercedes_eqs.jpg' },
    { make: 'Audi', model: 'e-tron GT', year: 2023, price: 105000, body: 'Sedan', fuel: 'Electric', image: '/assets/images/cars/audi_etron_gt.jpg' },
    { make: 'Volkswagen', model: 'Arteon R-Line', year: 2021, price: 35000, body: 'Sedan', fuel: 'Petrol', image: '/assets/images/cars/vw_arteon.jpg' },
    { make: 'Skoda', model: 'Superb Laurin & Klement', year: 2020, price: 28000, body: 'Wagon', fuel: 'Diesel', image: '/assets/images/cars/skoda_superb.jpg' },
    { make: 'Peugeot', model: '508 PSE', year: 2022, price: 46000, body: 'Sedan', fuel: 'Hybrid', image: '/assets/images/cars/peugeot_508.jpg' },
    { make: 'Alfa Romeo', model: 'Giulia Quadrifoglio', year: 2019, price: 58000, body: 'Sedan', fuel: 'Petrol', image: '/assets/images/cars/alfa_romeo_giulia.jpg' },
    { make: 'Jaguar', model: 'F-Type R', year: 2021, price: 82000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/jaguar_ftype.jpg' },
    { make: 'Mazda', model: 'MX-5 RF', year: 2022, price: 32000, body: 'Convertible', fuel: 'Petrol', image: '/assets/images/cars/mazda_mx5.jpg' },
    { make: 'Subaru', model: 'WRX STI', year: 2020, price: 38000, body: 'Sedan', fuel: 'Petrol', image: '/assets/images/cars/subaru_wrx.jpg' },
    { make: 'Toyota', model: 'Supra GR', year: 2021, price: 56000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/toyota_supra.jpg' },
    { make: 'Ferrari', model: 'F8 Tributo', year: 2022, price: 320000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/ferrari_f8.jpg' },
    { make: 'Lamborghini', model: 'Urus', year: 2021, price: 280000, body: 'SUV', fuel: 'Petrol', image: '/assets/images/cars/lamborghini_urus.jpg' },
    { make: 'Rolls-Royce', model: 'Cullinan', year: 2023, price: 450000, body: 'SUV', fuel: 'Petrol', image: '/assets/images/cars/rolls_royce_cullinan.jpg' },
    { make: 'Bentley', model: 'Continental GT', year: 2022, price: 240000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/bentley_continental.jpg' },
    { make: 'Aston Martin', model: 'DBX 707', year: 2023, price: 260000, body: 'SUV', fuel: 'Petrol', image: '/assets/images/cars/aston_martin_dbx.jpg' },
    { make: 'McLaren', model: '720S Spider', year: 2021, price: 310000, body: 'Convertible', fuel: 'Petrol', image: '/assets/images/cars/mclaren_720s.jpg' },
    { make: 'Maserati', model: 'MC20', year: 2023, price: 220000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/maserati_mc20.jpg' },
    { make: 'Bugatti', model: 'Chiron', year: 2018, price: 3200000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/bugatti_chiron.jpg' },
    { make: 'Koenigsegg', model: 'Jesko', year: 2022, price: 2800000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/koenigsegg_jesko.jpg' },
    { make: 'Pagani', model: 'Huayra Roadster', year: 2019, price: 2400000, body: 'Convertible', fuel: 'Petrol', image: '/assets/images/cars/pagani_huayra.jpg' },
    { make: 'Rimac', model: 'Nevera', year: 2023, price: 2200000, body: 'Coupe', fuel: 'Electric', image: '/assets/images/cars/rimac_nevera.jpg' },
    { make: 'Lotus', model: 'Emira', year: 2023, price: 85000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/lotus_emira.jpg' },
    { make: 'Alpine', model: 'A110 S', year: 2022, price: 72000, body: 'Coupe', fuel: 'Petrol', image: '/assets/images/cars/alpine_a110.jpg' }
];

async function setupRealCars() {
    const serviceAccountPath = path.resolve(__dirname, '../configs/firebase-service-account.json');
    if (!fs.existsSync(serviceAccountPath)) {
        console.error(`❌ Service account file not found at ${serviceAccountPath}`);
        process.exit(1);
    }

    const serviceAccount = require(serviceAccountPath);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }

    const db = admin.firestore();

    // 1. Get User ID for numericId 1
    const mappingDoc = await db.collection('numeric_ids').doc('1').get();
    if (!mappingDoc.exists) {
        console.error('❌ User ID 1 not found!');
        process.exit(1);
    }
    const sellerId = mappingDoc.data().uid;
    const sellerNumericId = 1;

    console.log(`👤 Seller: ID 1 (${sellerId})`);

    // 2. Prepare Data & Clean Up
    console.log('🧹 Cleaning up existing cars for User 1 from ALL collections...');

    const VEHICLE_COLLECTIONS = ['cars', 'passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
    const batchDelete = db.batch();
    let deleteCount = 0;

    for (const collectionName of VEHICLE_COLLECTIONS) {
        const snapshot = await db.collection(collectionName).where('sellerId', '==', sellerId).get();
        snapshot.docs.forEach(doc => {
            batchDelete.delete(doc.ref);
            deleteCount++;
        });

        // Also cleanup by numeric ID just in case
        const snapshotNum = await db.collection(collectionName).where('sellerNumericId', '==', 1).get();
        snapshotNum.docs.forEach(doc => {
            batchDelete.delete(doc.ref); // Firestore de-dupes deletes on same ref automatically in SDK usually, or it's fine
            deleteCount++;
        });
    }

    if (deleteCount > 0) {
        await batchDelete.commit();
    }
    console.log(`✅ Deleted ${deleteCount} existing/fake car listings from all collections.`);

    // We need items from 500 to 540 inclusive.
    if (CAR_MODELS.length !== 41) {
        console.warn(`⚠️ Warning: Expected 41 car models, got ${CAR_MODELS.length}.`);
    }

    // 3. Insert listings
    const chunkSize = 20;
    let currentBatch = db.batch();
    let opCount = 0;
    let createdCount = 0;

    for (let i = 0; i <= 40; i++) {
        const numericId = 500 + i;
        const modelData = CAR_MODELS[i % CAR_MODELS.length];

        // Create Document ID
        const docId = `real_car_${sellerId}_${numericId}`;
        const docRef = db.collection('cars').doc(docId);

        const carData = {
            id: docId,
            numericId: numericId,
            carNumericId: numericId,
            sellerNumericId: sellerNumericId,
            sellerId: sellerId,

            make: modelData.make,
            model: modelData.model,
            year: modelData.year,
            price: modelData.price,
            currency: 'EUR',

            mileage: Math.floor(Math.random() * 50000) + 1000,
            fuelType: modelData.fuel,
            transmission: 'Automatic', // Luxury cars are mostly Auto
            bodyType: modelData.body,
            condition: 'Used',

            // Use the local image 3 times for the gallery
            images: [modelData.image, modelData.image, modelData.image],
            featuredImageIndex: 0,

            description: `Premium ${modelData.make} ${modelData.model} available now at Ibrahim Motors. Fully serviced, excellent condition. Contact us for a test drive.`,

            location: {
                city: 'Sofia',
                country: 'Bulgaria',
                address: 'бул. "Цариградско шосе" 115'
            },

            status: 'active',
            isActive: true,
            isSold: false,
            isPromoted: i < 5,

            views: Math.floor(Math.random() * 500) + 50,

            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        };

        currentBatch.set(docRef, carData);
        opCount++;
        createdCount++;

        if (opCount >= chunkSize) {
            await currentBatch.commit();
            currentBatch = db.batch();
            opCount = 0;
            console.log(`✅ Committed batch up to ID ${numericId}`);
        }
    }

    if (opCount > 0) {
        await currentBatch.commit();
        console.log(`✅ Committed final batch.`);
    }

    console.log(`\n🎉 Success! Updated ${createdCount} real car listings with LOCAL images.`);
    console.log(`🔗 Verify at: http://localhost:3000/profile/1/my-ads`);
}

setupRealCars().catch(console.error);
