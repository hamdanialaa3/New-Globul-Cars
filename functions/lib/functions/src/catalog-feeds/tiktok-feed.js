"use strict";
// TikTok Shopping Feed Function
// Auto-generates JSON feed for TikTok Shop
// Location: Bulgaria | Currency: EUR
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.tiktokShoppingFeed = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.tiktokShoppingFeed = functions.https.onRequest(async (req, res) => {
    try {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', 'application/json; charset=utf-8');
        const carsSnapshot = await admin.firestore()
            .collection('cars')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(5000)
            .get();
        const cars = carsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        const items = cars.map((car) => {
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
    }
    catch (error) {
        console.error('Error generating TikTok feed:', error);
        res.status(500).json({ error: 'Error generating feed' });
    }
});
//# sourceMappingURL=tiktok-feed.js.map