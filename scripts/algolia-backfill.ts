/**
 * Algolia Backfill Script
 * Reindexes all active cars from Firestore into Algolia (cars_bg)
 *
 * Usage (PowerShell on Windows):
 *   $env:ALGOLIA_APP_ID="RTGDK12KTJ"; $env:ALGOLIA_ADMIN_API_KEY="<ADMIN_KEY>"; $env:ALGOLIA_INDEX_NAME="cars_bg"; npm run algolia:backfill
 *
 * Requirements:
 *   - Root dependencies: firebase-admin, algoliasearch, ts-node (already configured)
 *   - serviceAccountKey.json at repository root
 */

import 'dotenv/config';
import algoliasearch from 'algoliasearch';
import admin from 'firebase-admin';
import path from 'node:path';
import fs from 'node:fs';

const APP_ID = process.env.ALGOLIA_APP_ID || process.env.ALGOLIA_APPID || '';
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_API_KEY || '';
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || 'cars_bg';

if (!APP_ID || !ADMIN_KEY) {
  console.error('Missing Algolia credentials. Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY before running.');
  process.exit(1);
}

// Initialize Firebase Admin using local service account
const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`serviceAccountKey.json not found at: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any)
  });
}

const db = admin.firestore();

// Create Algolia client
const client = (algoliasearch as any)(APP_ID, ADMIN_KEY);
const index = client.initIndex(INDEX_NAME);

interface CarIndexObject {
  objectID: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  vehicleType: string;
  bodyType: string;
  color: string;
  city: string;
  region: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  description: string;
  features: string[];
  condition: string;
  status: string;
  views: number;
  createdAt: number;
  updatedAt: number;
}

async function backfill() {
  console.log(`Starting Algolia backfill → index: ${INDEX_NAME}`);

  // Fetch active cars
  const snapshot = await db.collection('cars').where('status', '==', 'active').get();
  console.log(`Found ${snapshot.size} active cars to index.`);

  if (snapshot.empty) {
    console.log('No active cars found. Exiting.');
    return;
  }

  const BATCH_SIZE = 1000;
  const objects: CarIndexObject[] = [];

  // Pre-fetch seller info cache to minimize reads per doc
  const sellerCache = new Map<string, { name: string; rating: number }>();

  for (const doc of snapshot.docs) {
    const data = doc.data() as any;

    let sellerName = 'Unknown';
    let sellerRating = 0;

    if (data.sellerId) {
      if (!sellerCache.has(data.sellerId)) {
        try {
          const sellerDoc = await db.collection('users').doc(data.sellerId).get();
          if (sellerDoc.exists) {
            const s = sellerDoc.data() || {};
            sellerName = (s.displayName || s.businessName || 'Unknown') as string;
          }
          const statsDoc = await db.collection('sellers').doc(data.sellerId).get();
          if (statsDoc.exists) {
            sellerRating = (statsDoc.data()?.averageRating || 0) as number;
          }
          sellerCache.set(data.sellerId, { name: sellerName, rating: sellerRating });
        } catch (e) {
          // ignore seller fetch errors for backfill
        }
      } else {
        const cached = sellerCache.get(data.sellerId)!;
        sellerName = cached.name;
        sellerRating = cached.rating;
      }
    }

    const obj: CarIndexObject = {
      objectID: doc.id,
      make: data.make || '',
      model: data.model || '',
      year: data.year || 0,
      price: data.price || 0,
      mileage: data.mileage || 0,
      fuelType: data.fuelType || '',
      transmission: data.transmission || '',
      vehicleType: data.vehicleType || '',
      bodyType: data.bodyType || '',
      color: data.color || '',
      city: data.location?.city || data.city || '',
      region: data.location?.region || data.region || '',
      sellerId: data.sellerId || '',
      sellerName,
      sellerRating,
      description: data.description || '',
      features: data.features || [],
      condition: data.condition || '',
      status: data.status || '',
      views: data.views || 0,
      createdAt: data.createdAt?.toMillis?.() || Date.now(),
      updatedAt: data.updatedAt?.toMillis?.() || Date.now()
    };

    objects.push(obj);

    // Flush in chunks
    if (objects.length >= BATCH_SIZE) {
      await index.saveObjects(objects);
      console.log(`Indexed ${objects.length} records...`);
      objects.length = 0; // reset
    }
  }

  // Flush remaining
  if (objects.length > 0) {
    await index.saveObjects(objects);
    console.log(`Indexed remaining ${objects.length} records.`);
  }

  console.log('✅ Backfill completed successfully.');
}

backfill()
  .catch((err) => {
    console.error('❌ Backfill failed:', err);
    process.exit(1);
  });
