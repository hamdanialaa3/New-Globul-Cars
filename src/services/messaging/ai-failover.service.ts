import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { geminiChatService } from '@/services/ai/gemini-chat.service';
import { sentimentAnalysisService } from '@/services/ai/sentiment-analysis.service';
import { logger } from '@/services/logger-service';

const AI_TIMEOUT_MS = 10000;
const HANDOVER_COLLECTION = 'support_handoffs';

export interface AIHandoverResult {
  text: string;
  isHumanHandover: boolean;
}

export async function getAIReplyWithFailover(
  prompt: string,
  context: Record<string, unknown>,
  userId?: string,
  conversationId?: string
): Promise<AIHandoverResult> {
  try {
    const reply = await Promise.race([
      geminiChatService.chat(prompt, context, userId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), AI_TIMEOUT_MS))
    ]);

    await maybeEscalateBySentiment(prompt, userId, conversationId);

    return {
      text: (reply as string) || 'لم أستطع توليد رد الآن. سأحيلك إلى فريق الدعم عند الحاجة.',
      isHumanHandover: false
    };
  } catch (error) {
    const reason = (error as Error)?.message === 'AI_TIMEOUT' ? 'timeout' : 'error';
    await logHumanHandover(prompt, userId, conversationId, reason, error as Error);

    return {
      text: 'عذراً، هناك مشكلة في الذكاء الاصطناعي الآن. تم تحويلك إلى وكيل بشري وسيتم الرد قريباً.',
      isHumanHandover: true
    };
  }
}

async function maybeEscalateBySentiment(prompt: string, userId?: string, conversationId?: string) {
  try {
    const sentiment = await sentimentAnalysisService.analyzeSentiment(prompt, 'bg');
    const isNegative = sentiment.sentiment === 'negative' && sentiment.confidence >= 55;
    const isAngry = sentiment.emotion === 'angry' || sentiment.score < -0.4;

    if (isNegative || isAngry) {
      await logHumanHandover(prompt, userId, conversationId, 'sentiment', undefined, sentiment.summary);
    }
  } catch (analysisError) {
    logger.warn('[AI Failover] Sentiment analysis failed', analysisError as Error);
  }
}

async function logHumanHandover(
  prompt: string,
  userId?: string,
  conversationId?: string,
  reason: 'timeout' | 'error' | 'sentiment' = 'error',
  error?: Error,
  sentimentSummary?: string
) {
  try {
    await addDoc(collection(db, HANDOVER_COLLECTION), {
      userId: userId || null,
      conversationId: conversationId || null,
      reason,
      promptPreview: prompt.slice(0, 280),
      sentimentSummary: sentimentSummary || null,
      errorMessage: error?.message || null,
      createdAt: serverTimestamp()
    });
  } catch (handoverError) {
    logger.error('[AI Failover] Failed to log human handover', handoverError as Error, { reason });
  }
}
