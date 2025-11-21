// AI Services - Firebase Cloud Functions Integration
// خدمات الذكاء الاصطناعي - تكامل Firebase Cloud Functions
// Server-side secure AI integration for production

export { geminiVisionService } from './gemini-vision.service';
export { geminiChatService } from './gemini-chat.service';
export { aiQuotaService } from './ai-quota.service';

// New: Firebase Callable Service (Recommended for production)
export { firebaseAIService } from './firebase-ai-callable.service';
export default firebaseAIService;
