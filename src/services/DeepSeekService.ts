import axios from 'axios';
import { logger } from './logger-service';

// Note: In a production environment, you should route these requests through a backend proxy
// (e.g., Firebase Functions) to avoid exposing your API Key in the client-side bundle.
// Since this is currently using REACT_APP_ prefix which exposes it to the client, be aware of the security risk.

const DEEPSEEK_API_KEY = process.env.REACT_APP_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

export interface DeepSeekMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface DeepSeekResponse {
    id: string;
    choices: {
        index: number;
        message: DeepSeekMessage;
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * Service to interact with DeepSeek API
 */
export const DeepSeekService = {
    /**
     * Send a chat completion request to DeepSeek
     * @param messages Array of message objects
     * @param model Model name (default: deepseek-chat)
     * @returns Promise with the API response
     */
    chatCompletion: async (
        messages: DeepSeekMessage[],
        model: 'deepseek-chat' | 'deepseek-coder' = 'deepseek-chat'
    ): Promise<string> => {
        if (!DEEPSEEK_API_KEY) {
            logger.error('DeepSeek API Key missing', new Error('.env.local'));
            throw new Error('DeepSeek API Key is not configured.');
        }

        try {
            const response = await axios.post<DeepSeekResponse>(
                DEEPSEEK_API_URL,
                {
                    model: model,
                    messages: messages,
                    temperature: 0.7, // Adjust creativity
                    max_tokens: 2000,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                    },
                }
            );

            return response.data.choices[0].message.content;
        } catch (error) {
            logger.error('Error calling DeepSeek API', error as Error);
            throw error;
        }
    },

    /**
     * Simple helper to get a one-off response
     * @param prompt User prompt string
     * @returns String response from AI
     */
    ask: async (prompt: string): Promise<string> => {
        const messages: DeepSeekMessage[] = [{ role: 'user', content: prompt }];
        return DeepSeekService.chatCompletion(messages);
    },
};
