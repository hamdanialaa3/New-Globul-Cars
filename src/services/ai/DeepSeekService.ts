import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

export interface AIRequestOptions {
    prompt: string;
    model?: 'deepseek-chat';
    temperature?: number;
    maxTokens?: number;
    systemMessage?: string;
    language?: 'bg' | 'en';
}

export interface AIResponse {
    success: boolean;
    content: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    remainingQuota?: number;
}

export interface CarData {
    make: string;
    model: string;
    year: number;
    fuelType: string;
    mileage: number;
    price: number;
    currency: string;
    city: string;
    equipment?: string[];
}

export class DeepSeekService {
    private static instance: DeepSeekService;

    static getInstance(): DeepSeekService {
        if (!DeepSeekService.instance) {
            DeepSeekService.instance = new DeepSeekService();
        }
        return DeepSeekService.instance;
    }

    private constructor() { }

    async generateText(options: AIRequestOptions): Promise<AIResponse> {
        try {
            const aiGenerateText = httpsCallable(functions, 'aiGenerateText');
            const result = await aiGenerateText(options);
            return result.data as AIResponse;
        } catch (error: any) {
            logger.error('AI Service Error', error as Error);
            throw this.handleError(error);
        }
    }

    async generateCarDescription(carData: CarData, style: 'professional' | 'friendly' = 'professional', language: 'bg' | 'en' = 'bg'): Promise<string> {
        try {
            const aiGenerateCarDescription = httpsCallable(functions, 'aiGenerateCarDescription');
            const result = await aiGenerateCarDescription({
                ...carData,
                style,
                language
            });
            return (result.data as any).content;
        } catch (error: any) {
            logger.error('AI Description Error', error as Error);
            throw this.handleError(error);
        }
    }

    private handleError(error: any): Error {
        const code = error.code;
        const message = error.message;

        if (code === 'resource-exhausted') {
            return new Error('Monthly AI quota exceeded. Please upgrade your plan.');
        }
        if (code === 'invalid-argument') {
            return new Error('Invalid request or sensitive content detected.');
        }

        return new Error(message || 'An error occurred with the AI service.');
    }
}

export const deepSeekService = DeepSeekService.getInstance();
