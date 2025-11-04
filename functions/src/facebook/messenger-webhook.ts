// Facebook Messenger Webhook Handler
// Processes incoming Messenger messages and provides auto-responses
// Bulgarian Car Marketplace integration

import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

interface MessengerWebhookEntry {
  id: string;
  time: number;
  messaging: MessengerEvent[];
}

interface MessengerEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    quick_reply?: { payload: string };
  };
  postback?: {
    payload: string;
    title: string;
  };
}

interface QuickReply {
  content_type: 'text';
  title: string;
  payload: string;
}

/**
 * Send text message via Messenger
 */
async function sendMessage(
  recipientId: string,
  messageText: string,
  quickReplies?: QuickReply[]
): Promise<boolean> {
  try {
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    if (!pageAccessToken) {
      console.error('FACEBOOK_PAGE_ACCESS_TOKEN not configured');
      return false;
    }
    
    const messageData: any = {
      recipient: { id: recipientId },
      message: { text: messageText }
    };
    
    if (quickReplies && quickReplies.length > 0) {
      messageData.message.quick_replies = quickReplies;
    }
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      }
    );
    
    if (!response.ok) {
      console.error('Failed to send message:', await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

/**
 * Process incoming message and generate Bulgarian response
 */
async function processMessage(event: MessengerEvent): Promise<void> {
  const senderId = event.sender.id;
  const messageText = event.message?.text?.toLowerCase() || '';
  
  // Save message to Firestore
  await admin.firestore().collection('messenger_messages').add({
    senderId,
    text: event.message?.text,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    processed: false
  });
  
  // Auto-response in Bulgarian
  let responseText = '';
  let quickReplies: QuickReply[] = [];
  
  // Keyword-based responses (Bulgarian)
  if (messageText.includes('здравей') || messageText.includes('hello') || messageText.includes('hi')) {
    responseText = 'Здравейте! Добре дошли в Globul Cars. Как мога да ви помогна? / Hello! Welcome to Globul Cars. How can I help you?';
    quickReplies = [
      { content_type: 'text', title: 'Търся кола', payload: 'SEARCH_CAR' },
      { content_type: 'text', title: 'Цени', payload: 'PRICE_INFO' },
      { content_type: 'text', title: 'Контакт', payload: 'CONTACT_INFO' }
    ];
  } else if (messageText.includes('цена') || messageText.includes('price')) {
      responseText = 'Цените на автомобилите варират според марката, модела и състоянието. Посетете https://mobilebg.eu/cars за да видите актуалните оферти.';
  } else if (messageText.includes('търся') || messageText.includes('search')) {
      responseText = 'Можете да търсите автомобили на https://mobilebg.eu/cars или да използвате нашето разширено търсене на https://mobilebg.eu/advanced-search';
  } else if (messageText.includes('контакт') || messageText.includes('contact')) {
    responseText = 'Свържете се с нас:\nТелефон: +359 2 123 4567\nИмейл: info@globulcars.bg\nАдрес: София, България';
  } else {
      responseText = 'Благодаря за съобщението! Нашият екип ще ви отговори скоро. Можете да разгледате автомобилите на https://mobilebg.eu';
  }
  
  // Send response
  await sendMessage(senderId, responseText, quickReplies);
}

/**
 * Process postback (button click)
 */
async function processPostback(event: MessengerEvent): Promise<void> {
  const senderId = event.sender.id;
  const payload = event.postback?.payload || '';
  
  let responseText = '';
  
  switch (payload) {
    case 'SEARCH_CAR':
        responseText = 'Разгледайте нашите автомобили: https://mobilebg.eu/cars\nИли използвайте разширеното търсене: https://mobilebg.eu/advanced-search';
      break;
    case 'PRICE_INFO':
        responseText = 'Цените започват от 5,000 EUR. Посетете https://mobilebg.eu/cars за пълен списък с цени.';
      break;
    case 'CONTACT_INFO':
      responseText = 'Контакти:\nТелефон: +359 2 123 4567\nИмейл: info@globulcars.bg\nРаботно време: Пон-Пет 9:00-18:00';
      break;
    default:
        responseText = 'Благодаря! Посетете https://mobilebg.eu за повече информация.';
  }
  
  await sendMessage(senderId, responseText);
}

/**
 * Messenger Webhook Handler
 */
export const messengerWebhook = onRequest(
  { cors: true, region: 'europe-west1' },
  async (request, response) => {
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
          const entries = body.entry as MessengerWebhookEntry[];
          
          for (const entry of entries) {
            for (const event of entry.messaging) {
              if (event.message) {
                await processMessage(event);
              } else if (event.postback) {
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
    } catch (error) {
      console.error('Messenger webhook error:', error);
      response.status(500).send('Internal Server Error');
    }
  }
);

