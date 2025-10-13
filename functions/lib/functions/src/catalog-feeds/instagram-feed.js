"use strict";
// Instagram Shopping Feed Function
// Auto-generates CSV feed for Instagram Shopping
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
exports.instagramShoppingFeed = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.instagramShoppingFeed = functions.https.onRequest(async (req, res) => {
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
        const cars = carsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        let csv = 'retailer_id,name,description,url,image_url,brand,price,availability,condition,product_type\n';
        cars.forEach((car) => {
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
    }
    catch (error) {
        console.error('Error generating Instagram feed:', error);
        res.status(500).send('Error generating feed');
    }
});
function escapeCSV(str) {
    if (!str)
        return '';
    const stringValue = String(str);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}
//# sourceMappingURL=instagram-feed.js.map