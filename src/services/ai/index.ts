// AI Services Index
// فهرس خدمات الذكاء الاصطناعي

// ============================================
// NEW: AI Pipeline System (Feb 2026)
// نظام خط الأنابيب الذكي - إصلاح جذري
// ============================================
export { 
  runAdGenerationPipeline, 
  validateExistingOutput,
  getPipelineHealth 
} from './ai-pipeline.service';

export { 
  validateAdOutput, 
  validateAndFix, 
  isValidAdOutput 
} from './validators/ad-schema.validator';

export { 
  preCheckAllMedia, 
  checkMedia, 
  hasValidMedia, 
  filterValidMedia 
} from './media-precheck.service';

export { 
  withSmartRetry, 
  retry, 
  classifyError, 
  isRetryableError, 
  shouldEscalate,
  createCircuitBreaker 
} from './smart-retry.service';

export { 
  buildCompletePrompt, 
  buildAdGenerationPrompt, 
  SYSTEM_PROMPTS,
  REFERENCE_DOCS,
  estimateTokens,
  validatePromptSize 
} from './prompt-templates.service';

export { aiMetrics, printMetricsReport } from './ai-metrics.service';

// ============================================
// Core Services (Existing)
// ============================================
export { geminiVisionService } from './gemini-vision.service';
export { geminiChatService } from './gemini-chat.service';
export { aiQuotaService } from './ai-quota.service';
export { projectKnowledgeService } from './project-knowledge.service';
export { firebaseAIService } from './firebase-ai-callable.service';

// Hybrid AI System (Phase 4.1 - NEW)
export { aiRouterService } from './ai-router.service';
export { aiCostOptimizerService } from './ai-cost-optimizer.service';
export { deepSeekEnhancedService } from './deepseek-enhanced.service';

// New Services (AI Completion)
export { openAIService } from './openai.service';
export { whisperService } from './whisper.service';
export { sentimentAnalysisService } from './sentiment-analysis.service';
export { computerVisionService } from './vision-advanced.service';
export { recommendationEngine } from './recommendation-advanced.service';
export { multiLanguageNLU } from './nlu-multilingual.service';
export { vehicleDescriptionGenerator } from './vehicle-description-generator.service';

// Deep Plan 100% Completion Services (NEW - Dec 28, 2025)
export { aiLearningSystem } from './learning-system';
export { aiBillingSystem } from './billing-system';
export { aiSecurityMonitor } from './security-monitor';
export { marketDataFetcher } from './market-data-fetcher';

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
      available: !!import.meta.env.VITE_GEMINI_API_KEY,
      status: import.meta.env.VITE_GEMINI_API_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    geminiChat: {
      available: !!import.meta.env.VITE_GEMINI_API_KEY,
      status: import.meta.env.VITE_GEMINI_API_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    openAI_GPT4: {
      available: !!import.meta.env.VITE_OPENAI_API_KEY,
      status: import.meta.env.VITE_OPENAI_API_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    whisper_VoiceAI: {
      available: !!import.meta.env.VITE_OPENAI_API_KEY,
      status: import.meta.env.VITE_OPENAI_API_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    sentimentAnalysis: {
      available: true,
      status: '✅ Ready (Local)'
    },
    computerVision_Advanced: {
      available: !!import.meta.env.VITE_GOOGLE_GENERATIVE_AI_KEY,
      status: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    recommendations: {
      available: true,
      status: '✅ Ready (Local)'
    },
    multiLanguageNLU: {
      available: !!import.meta.env.VITE_GOOGLE_GENERATIVE_AI_KEY,
      status: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_KEY ? '✅ Ready' : '⚠️ Not configured'
    },
    projectKnowledge: {
      available: true,
      status: '✅ Ready (RAG System)'
    },
    firebaseFunctions: {
      available: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      status: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Ready' : '⚠️ Not configured'
    }
  };
}
