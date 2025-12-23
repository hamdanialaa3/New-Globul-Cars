// AI Services Index
// فهرس خدمات الذكاء الاصطناعي

// Core Services (Existing)
export { geminiVisionService } from './gemini-vision.service';
export { geminiChatService } from './gemini-chat.service';
export { aiQuotaService } from './ai-quota.service';
export { projectKnowledgeService } from './project-knowledge.service';
export { firebaseAIService } from './firebase-ai-callable.service';

// New Services (AI Completion)
export { openAIService } from './openai.service';
export { whisperService } from './whisper.service';
export { sentimentAnalysisService } from './sentiment-analysis.service';
export { computerVisionService } from './vision-advanced.service';
export { recommendationEngine } from './recommendation-advanced.service';
export { multiLanguageNLU } from './nlu-multilingual.service';

// Type Exports
export type { 
  GeminiVisionResponse,
  ImageAnalysisResult,
  QualityScore
} from './gemini-vision.service';

export type {
  ChatMessage,
  ChatResponse,
  ProfileAnalysisResult
} from './gemini-chat.service';

export type {
  QuotaStatus,
  QuotaTier,
  QuotaUsage
} from './ai-quota.service';

export type {
  GPT4Response,
  PriceEstimate,
  CarAnalysis
} from './openai.service';

export type {
  TranscriptionResult,
  VoiceCommandResult
} from './whisper.service';

export type {
  SentimentScore,
  DetailedSentimentAnalysis,
  UserInteractionSentiment
} from './sentiment-analysis.service';

export type {
  ObjectDetectionResult,
  CarDamageAssessment,
  PlateNumberDetection,
  CarModelDetection,
  ImageQualityAssessment
} from './vision-advanced.service';

export type {
  UserPreferences,
  CarRecommendation,
  UserBehavior,
  CollaborativeFilteringResult
} from './recommendation-advanced.service';

export type {
  LanguageDetectionResult,
  TranslationResult,
  IntentAnalysis,
  SentenceSimplification
} from './nlu-multilingual.service';

/**
 * AI Services Status
 * Check which AI services are available
 */
export function getAIServicesStatus(): Record<string, { available: boolean; status: string }> {
  return {
    geminiVision: {
      available: !!process.env.REACT_APP_GEMINI_API_KEY,
      status: process.env.REACT_APP_GEMINI_API_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    geminiChat: {
      available: !!process.env.REACT_APP_GEMINI_API_KEY,
      status: process.env.REACT_APP_GEMINI_API_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    openAI_GPT4: {
      available: !!process.env.REACT_APP_OPENAI_API_KEY,
      status: process.env.REACT_APP_OPENAI_API_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    whisper_VoiceAI: {
      available: !!process.env.REACT_APP_OPENAI_API_KEY,
      status: process.env.REACT_APP_OPENAI_API_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    sentimentAnalysis: {
      available: true,
      status: '✅ Ready (Local)'
    },
    computerVision_Advanced: {
      available: !!process.env.REACT_APP_GOOGLE_GENERATIVE_AI_KEY,
      status: process.env.REACT_APP_GOOGLE_GENERATIVE_AI_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    recommendations: {
      available: true,
      status: '✅ Ready (Local)'
    },
    multiLanguageNLU: {
      available: !!process.env.REACT_APP_GOOGLE_GENERATIVE_AI_KEY,
      status: process.env.REACT_APP_GOOGLE_GENERATIVE_AI_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    projectKnowledge: {
      available: true,
      status: '✅ Ready (RAG System)'
    },
    firebaseFunctions: {
      available: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
      status: process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✅ Ready' : '⚠️ Not configured'
    }
  };
}
