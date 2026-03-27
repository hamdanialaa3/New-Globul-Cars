import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import axios from 'axios';
import * as cors from 'cors';

const corsHandler = cors({ origin: true });

// Initialize Firebase Admin lazily if needed
const getDb = () => {
    if (admin.apps.length === 0) admin.initializeApp();
    return admin.firestore();
};

/**
 * 🟢 WhatsApp Business Cloud API Endpoint
 * Handles sending messages (Text, Image, Buttons, Templates)
 * Requests come from the frontend WhatsAppBusinessService class.
 */
export const whatsappApi = functions
    .runWith({ memory: '256MB' })
    .https.onRequest((req, res) => {
        // Apply CORS middleware to allow frontend calls
        corsHandler(req, res, async () => {
            try {
                // Ensure only POST requests
                if (req.method !== 'POST') {
                    res.status(405).json({ success: false, error: 'Method Not Allowed' });
                    return;
                }

                // Check Environment Variables
                const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
                const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

                if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) {
                    functions.logger.error('WhatsApp Credentials Missing in Environment Variables');
                    res.status(500).json({ success: false, error: 'WhatsApp Configuration Error' });
                    return;
                }

                const { type, to, text, imageUrl, caption, bodyText, buttons, header, footer, templateName, language, components } = req.body;

                if (!to || !type) {
                    res.status(400).json({ success: false, error: 'Missing required parameters: to, type' });
                    return;
                }

                const fbGraphUrl = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`;
                
                let dataPayload: any = {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: to,
                    type: type // text, image, interactive, template
                };

                // 1. TEXT MESSAGE
                if (type === 'text') {
                    dataPayload.text = { preview_url: req.body.previewUrl || false, body: text };
                } 
                
                // 2. IMAGE MESSAGE
                else if (type === 'image') {
                    dataPayload.image = { link: imageUrl };
                    if (caption) {
                        dataPayload.image.caption = caption;
                    }
                } 
                
                // 3. INTERACTIVE BUTTONS
                else if (type === 'button') {
                    dataPayload.type = 'interactive';
                    dataPayload.interactive = {
                        type: 'button',
                        body: { text: bodyText },
                        action: {
                            buttons: buttons.map((btn: any) => ({
                                type: 'reply',
                                reply: { id: btn.id, title: btn.title }
                            }))
                        }
                    };
                    if (header) dataPayload.interactive.header = { type: 'text', text: header };
                    if (footer) dataPayload.interactive.footer = { text: footer };
                } 
                
                // 4. TEMPLATE MESSAGE (For initiating conversations outside 24h window)
                else if (type === 'template') {
                    dataPayload.template = {
                        name: templateName,
                        language: { code: language || 'bg' }
                    };
                    if (components && components.length > 0) {
                        dataPayload.template.components = components;
                    }
                } 
                
                else {
                    res.status(400).json({ success: false, error: 'Unsupported message type' });
                    return;
                }

                // Send to Meta Cloud API
                const response = await axios.post(fbGraphUrl, dataPayload, {
                    headers: {
                        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data && response.data.messages && response.data.messages.length > 0) {
                    res.status(200).json({ 
                        success: true, 
                        messageId: response.data.messages[0].id 
                    });
                } else {
                    res.status(500).json({ success: false, error: 'No message ID returned from Meta' });
                }

            } catch (error: any) {
                functions.logger.error('WhatsApp API Failure:', error?.response?.data || error.message);
                res.status(500).json({ 
                    success: false, 
                    error: error?.response?.data?.error?.message || 'Failed to send WhatsApp message' 
                });
            }
        });
    });

/**
 * 🟢 WhatsApp Webhook 
 * Receives messages from users interacting with Koli One Bot.
 */
export const whatsappWebhook = functions
    .runWith({ memory: '256MB' })
    .https.onRequest(async (req, res) => {
        // 1. Webhook Verification (Setup Phase)
        if (req.method === 'GET') {
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];
            const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

            if (mode && token) {
                if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
                    functions.logger.info('WhatsApp Webhook Verified!');
                    res.status(200).send(challenge);
                    return;
                } else {
                    res.sendStatus(403);
                    return;
                }
            }
            res.sendStatus(400);
            return;
        }

        // 2. Receiving Messages (Production Phase)
        if (req.method === 'POST') {
            const body = req.body;
            if (body.object) {
                if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
                    const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
                    const from = body.entry[0].changes[0].value.messages[0].from; // sender number
                    const msgBody = body.entry[0].changes[0].value.messages[0].text?.body; // message text
                    const interactiveReply = body.entry[0].changes[0].value.messages[0].interactive?.button_reply?.id; // if user clicked a button
                    
                    const db = getDb();
                    
                    // Log the incoming message to Firestore for customer support dashboard
                    await db.collection('whatsapp_inbox').add({
                        from,
                        phoneNumberId,
                        message: msgBody || interactiveReply || 'Media/Unsupported',
                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                        read: false
                    });

                    functions.logger.info(`Received WhatsApp message from ${from}: ${msgBody || interactiveReply}`);
                }
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        }
    });
