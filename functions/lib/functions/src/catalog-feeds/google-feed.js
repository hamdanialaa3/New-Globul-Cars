"use strict";
// Google Merchant Center Feed Function
// Auto-generates XML feed for Google Shopping
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
exports.googleMerchantFeed = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.googleMerchantFeed = functions.https.onRequest(async (req, res) => {
    try {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Content-Type', 'application/xml; charset=utf-8');
        const carsSnapshot = await admin.firestore()
            .collection('cars')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .limit(5000)
            .get();
        const cars = carsSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
        xml += '  <channel>\n';
        xml += '    <title>Globul Cars - Bulgarian Car Marketplace</title>\n';
        xml += '    <link>https://mobilebg.eu</link>\n';
        xml += '    <description>Premium used cars in Bulgaria</description>\n';
        cars.forEach((car) => {
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
                imageUrls.slice(1, 10).forEach((img) => {
                    xml += `      <g:additional_image_link>${escapeXML(img)}</g:additional_image_link>\n`;
                });
            }
            xml += `      <g:condition>${car.year >= new Date().getFullYear() - 1 ? 'new' : 'used'}</g:condition>\n`;
            xml += `      <g:availability>in_stock</g:availability>\n`;
            xml += `      <g:price>${car.price} EUR</g:price>\n`;
            xml += `      <g:brand>${escapeXML(car.make || '')}</g:brand>\n`;
            xml += `      <g:google_product_category>916</g:google_product_category>\n`;
            xml += `      <g:product_type>Vehicles > Cars > ${escapeXML(car.make)}</g:product_type>\n`;
            if (car.color)
                xml += `      <g:color>${escapeXML(car.color)}</g:color>\n`;
            if (car.make)
                xml += `      <g:custom_label_0>${escapeXML(car.make)}</g:custom_label_0>\n`;
            if (car.city)
                xml += `      <g:custom_label_1>${escapeXML(car.city)}</g:custom_label_1>\n`;
            xml += '    </item>\n';
        });
        xml += '  </channel>\n';
        xml += '</rss>';
        res.send(xml);
    }
    catch (error) {
        console.error('Error generating Google feed:', error);
        res.status(500).send('Error generating feed');
    }
});
function escapeXML(str) {
    if (!str)
        return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
//# sourceMappingURL=google-feed.js.map