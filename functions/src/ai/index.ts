// AI Functions Export
// تصدير دوال الذكاء الاصطناعي

export { getAIPriceValuation } from './price-valuation';
export { geminiChat } from './gemini-chat-endpoint';
export { onCarCreated, reprocessCar } from './data-ingestion';
export { optimizeImage, reoptimizeImage, cleanupImageVariants } from './image-optimization';
export { checkDuplicatesOnCreate, checkDuplicates, scanForDuplicatesBatch } from './duplicate-detection';
export { sendFraudAlert, sendQuotaWarning, sendErrorAlert, sendDailyDigest } from './email-alerts';
export { suggestPriceAI } from './price-suggestion-endpoint';
export { analyzeProfileAI } from './profile-analysis-endpoint';
