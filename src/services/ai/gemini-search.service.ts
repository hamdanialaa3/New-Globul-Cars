
import { geminiChatService } from './gemini-chat.service';
import { logger } from '../logger-service';

export interface AISearchFilters {
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    fuelType?: string;
    transmission?: string;
    location?: string;
    color?: string;
    bodyType?: string;
    features?: string[];
}

export class GeminiSearchService {
    private static instance: GeminiSearchService;

    private constructor() { }

    static getInstance(): GeminiSearchService {
        if (!this.instance) {
            this.instance = new GeminiSearchService();
        }
        return this.instance;
    }

    /**
     * Translates a natural language query into structured search filters
     */
    async parseQuery(query: string, language: 'bg' | 'en' = 'bg'): Promise<AISearchFilters> {
        try {
            const prompt = `
        You are a search query parser for a car marketplace.
        Extract search filters from the user's query: "${query}"
        
        Return ONLY valid JSON with these optional fields:
        {
          "make": "string (Audi, BMW, etc)",
          "model": "string",
          "minPrice": number,
          "maxPrice": number,
          "minYear": number,
          "maxYear": number,
          "fuelType": "string (Diesel, Petrol, Electric, Hybrid)",
          "transmission": "string (Manual, Automatic)",
          "location": "string (City name)",
          "bodyType": "string (Sedan, SUV, Coupe, etc)"
        }
        
        Rules:
        - Map synonyms (e.g., "cheap" -> low maxPrice around 3000-5000 EUR if not specified)
        - "new" -> minYear: 2023
        - Ignore conversational filler.
        - If no clear value, omit the field.
      `;

            const response = await geminiChatService.chat(prompt, { page: 'search_parser', language }, 'system');

            // Clean up response if it contains markdown code blocks
            const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleanJson);

        } catch (error) {
            logger.error('Gemini Search Parse Error', error as Error);
            return {}; // Return empty filters on failure to allow generic search
        }
    }
}

export const geminiSearchService = GeminiSearchService.getInstance();
export default geminiSearchService;
