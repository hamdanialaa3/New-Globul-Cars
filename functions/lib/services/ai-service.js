"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
// functions/src/services/ai-service.ts
const vertexai_1 = require("@google-cloud/vertexai");
const axios_1 = require("axios");
const functions = require("firebase-functions");
class AIService {
    constructor() {
        functions.logger.info('AIService initializing');
        // 1. Setup Gemini: Uses ADC (Application Default Credentials)
        // Ensure the region supports Generative AI (e.g., us-central1)
        this.vertexAI = new vertexai_1.VertexAI({
            project: process.env.GCLOUD_PROJECT || process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG).projectId : undefined,
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
    async analyzeImage(imageBase64, mimeType = 'image/jpeg') {
        var _a;
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
            const responseText = (_a = result.response.candidates) === null || _a === void 0 ? void 0 : _a[0].content.parts[0].text;
            // Clean response to get pure JSON
            const jsonStr = responseText === null || responseText === void 0 ? void 0 : responseText.replace(/```json|```/g, '').trim();
            return JSON.parse(jsonStr || '{}');
        }
        catch (error) {
            functions.logger.error('Error in Gemini Analysis:', error);
            // Non-blocking error: return partial info or simplified error
            return { error: 'Gemini analysis failed', raw_error: error.message };
        }
    }
    /**
     * DeepSeek Function: Logic & Pricing Analysis
     */
    async analyzeMarketLogic(carData, marketAvgPrice) {
        if (!this.deepSeekApiKey) {
            functions.logger.warn('DeepSeek API Key missing, skipping logic analysis.');
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
            const response = await axios_1.default.post('https://api.deepseek.com/chat/completions', {
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
        }
        catch (error) {
            functions.logger.error('Error in DeepSeek Analysis:', error);
            return { error: 'DeepSeek analysis unavailable' };
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai-service.js.map