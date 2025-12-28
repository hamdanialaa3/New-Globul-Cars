// functions/src/services/ai-service.ts
import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';
import axios from 'axios';

export class AIService {
    private vertexAI: VertexAI;
    private geminiModel: GenerativeModel;
    private deepSeekApiKey: string;

    constructor() {
        // 1. Setup Gemini: Uses ADC (Application Default Credentials)
        // Ensure the region supports Generative AI (e.g., us-central1)
        this.vertexAI = new VertexAI({
            project: process.env.GCLOUD_PROJECT || process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG as string).projectId : undefined,
            location: 'us-central1'
        });

        // Use a fast, multimodal model
        this.geminiModel = this.vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });

        // 2. Setup DeepSeek Key from Env
        this.deepSeekApiKey = process.env.DEEPSEEK_API_KEY || '';
    }

    /**
     * Gemini Function: Visual Analysis
     */
    async analyzeImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<any> {
        try {
            const prompt = `
                You are a car expert. Analyze this image and extract the following details in JSON format only:
                - make (Manufacturer)
                - model (Model name)
                - year (Approximate year)
                - color (Color)
                - condition (Visual condition: Excellent, Good, Damaged)
                
                Return VALID JSON without Markdown formatting.
            `;

            const request = {
                contents: [{
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: mimeType, data: imageBase64 } }
                    ]
                }]
            };

            const result = await this.geminiModel.generateContent(request);
            const responseText = result.response.candidates?.[0].content.parts[0].text;

            // Clean response to get pure JSON
            const jsonStr = responseText?.replace(/```json|```/g, '').trim();
            return JSON.parse(jsonStr || '{}');

        } catch (error) {
            console.error('Error in Gemini Analysis:', error);
            // Non-blocking error: return partial info or simplified error
            return { error: 'Gemini analysis failed', raw_error: (error as Error).message };
        }
    }

    /**
     * DeepSeek Function: Logic & Pricing Analysis
     */
    async analyzeMarketLogic(carData: any, marketAvgPrice: number): Promise<any> {
        if (!this.deepSeekApiKey) {
            console.warn('DeepSeek API Key missing, skipping logic analysis.');
            return { error: 'DeepSeek key missing' };
        }

        try {
            const prompt = `
                Car: ${carData.make} ${carData.model} (${carData.year})
                Condition: ${carData.condition}
                Listed Price: ${carData.price}
                Market Average: ${marketAvgPrice}
                
                Task:
                1. Is the price fair? (Yes/No)
                2. Price deviation percentage.
                3. One sentence advice for the buyer.
                
                Answer in JSON format.
            `;

            const response = await axios.post('https://api.deepseek.com/chat/completions', {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are an expert financial analyst for the automotive market." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.deepSeekApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const content = response.data.choices[0].message.content;
            const jsonStr = content.replace(/```json|```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error) {
            console.error('Error in DeepSeek Analysis:', error);
            return { error: 'DeepSeek analysis unavailable' };
        }
    }
}
