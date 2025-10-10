"use strict";
// Facebook Messenger Webhook Handler
// Processes incoming Messenger messages and provides auto-responses
// Bulgarian Car Marketplace integration
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
exports.messengerWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
/**
 * Send text message via Messenger
 */
async function sendMessage(recipientId, messageText, quickReplies) {
    try {
        const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
        if (!pageAccessToken) {
            console.error('FACEBOOK_PAGE_ACCESS_TOKEN not configured');
            return false;
        }
        const messageData = {
            recipient: { id: recipientId },
            message: { text: messageText }
        };
        if (quickReplies && quickReplies.length > 0) {
            messageData.message.quick_replies = quickReplies;
        }
        const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });
        if (!response.ok) {
            console.error('Failed to send message:', await response.text());
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
}
/**
 * Process incoming message and generate Bulgarian response
 */
async function processMessage(event) {
    var _a, _b, _c;
    const senderId = event.sender.id;
    const messageText = ((_b = (_a = event.message) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
    // Save message to Firestore
    await admin.firestore().collection('messenger_messages').add({
        senderId,
        text: (_c = event.message) === null || _c === void 0 ? void 0 : _c.text,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        processed: false
    });
    // Auto-response in Bulgarian
    let responseText = '';
    let quickReplies = [];
    // Keyword-based responses (Bulgarian)
    if (messageText.includes('здравей') || messageText.includes('hello') || messageText.includes('hi')) {
        responseText = 'Здравейте! Добре дошли в Globul Cars. Как мога да ви помогна? / Hello! Welcome to Globul Cars. How can I help you?';
        quickReplies = [
            { content_type: 'text', title: 'Търся кола', payload: 'SEARCH_CAR' },
            { content_type: 'text', title: 'Цени', payload: 'PRICE_INFO' },
            { content_type: 'text', title: 'Контакт', payload: 'CONTACT_INFO' }
        ];
    }
    else if (messageText.includes('цена') || messageText.includes('price')) {
        responseText = 'Цените на автомобилите варират според марката, модела и състоянието. Посетете https://globul.net/cars за да видите актуалните оферти.';
    }
    else if (messageText.includes('търся') || messageText.includes('search')) {
        responseText = 'Можете да търсите автомобили на https://globul.net/cars или да използвате нашето разширено търсене на https://globul.net/advanced-search';
    }
    else if (messageText.includes('контакт') || messageText.includes('contact')) {
        responseText = 'Свържете се с нас:\nТелефон: +359 2 123 4567\nИмейл: info@globulcars.bg\nАдрес: София, България';
    }
    else {
        responseText = 'Благодаря за съобщението! Нашият екип ще ви отговори скоро. Можете да разгледате автомобилите на https://globul.net';
    }
    // Send response
    await sendMessage(senderId, responseText, quickReplies);
}
/**
 * Process postback (button click)
 */
async function processPostback(event) {
    var _a;
    const senderId = event.sender.id;
    const payload = ((_a = event.postback) === null || _a === void 0 ? void 0 : _a.payload) || '';
    let responseText = '';
    switch (payload) {
        case 'SEARCH_CAR':
            responseText = 'Разгледайте нашите автомобили: https://globul.net/cars\nИли използвайте разширеното търсене: https://globul.net/advanced-search';
            break;
        case 'PRICE_INFO':
            responseText = 'Цените започват от 5,000 EUR. Посетете https://globul.net/cars за пълен списък с цени.';
            break;
        case 'CONTACT_INFO':
            responseText = 'Контакти:\nТелефон: +359 2 123 4567\nИмейл: info@globulcars.bg\nРаботно време: Пон-Пет 9:00-18:00';
            break;
        default:
            responseText = 'Благодаря! Посетете https://globul.net за повече информация.';
    }
    await sendMessage(senderId, responseText);
}
/**
 * Messenger Webhook Handler
 */
exports.messengerWebhook = (0, https_1.onRequest)({ cors: true }, async (request, response) => {
    try {
        // Webhook verification (GET request)
        if (request.method === 'GET') {
            const mode = request.query['hub.mode'];
            const token = request.query['hub.verify_token'];
            const challenge = request.query['hub.challenge'];
            const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || 'bulgarian_car_verify_2024';
            if (mode === 'subscribe' && token === verifyToken) {
                console.log('Webhook verified');
                response.status(200).send(challenge);
                return;
            }
            response.status(403).send('Forbidden');
            return;
        }
        // Process webhook event (POST request)
        if (request.method === 'POST') {
            const body = request.body;
            if (body.object === 'page') {
                // Process each entry
                const entries = body.entry;
                for (const entry of entries) {
                    for (const event of entry.messaging) {
                        if (event.message) {
                            await processMessage(event);
                        }
                        else if (event.postback) {
                            await processPostback(event);
                        }
                    }
                }
                response.status(200).send('EVENT_RECEIVED');
                return;
            }
            response.status(404).send('Not Found');
            return;
        }
        response.status(405).send('Method Not Allowed');
    }
    catch (error) {
        console.error('Messenger webhook error:', error);
        response.status(500).send('Internal Server Error');
    }
});
//# sourceMappingURL=messenger-webhook.js.map