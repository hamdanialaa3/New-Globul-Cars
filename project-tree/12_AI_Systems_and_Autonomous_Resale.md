# 🤖 AI Systems & Autonomous Resale Documentation
## أنظمة الذكاء الاصطناعي ومحرك إعادة البيع الذاتي - "الصلصة السرية" للمنصة

> **Last Updated:** January 23, 2026  
> **Version:** 0.4.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Autonomous Resale Engine](#resale-engine)
3. [Computer Vision & Gemini Integration](#vision)
4. [AI Router & Multi-LLM Orchestration](#ai-router)
5. [Automated Content Generation](#content-gen)
6. [Voice & Natural Language (Whisper/NLU)](#nlu)

---

## 🎯 Overview

Koli One integrates a sophisticated AI stack designed to automate the car selling and buying journey. Move beyond simple listings into a high-tech ecosystem where AI handles price optimization, feature detection, and professional copywriting.

### Core AI Capabilities
- **Intelligence**: Market-aware resale strategies.
- **Vision**: Automatic extraction of car features from photos.
- **Creativity**: Human-like professional vehicle descriptions.
- **Adaptability**: Multi-model routing (Gemini, GPT-4, DeepSeek).

---

## 📈 Autonomous Resale Engine {#resale-engine}

The `AutonomousResaleEngine` is the platform's crown jewel. It doesn't just list cars; it manages their lifecycle.

### Key Logic Flow
1. **Market Analysis**: Performs a real-time fetch of comparable listings via `findComparableSales`.
2. **Strategy Selection**: Users can choose between `Aggressive`, `Conservative`, or `Balanced` selling strategies.
3. **Price Optimization**: The AI predicts the optimal selling price based on demand levels and market trends.
4. **Offer Processing**: Automatically evaluates incoming offers against the chosen strategy.

**Service Location**: `src/services/autonomous-resale-engine.ts`

---

## 👁️ Computer Vision & Gemini Integration {#vision}

Using Google’s **Gemini Vision PRO**, the platform "sees" the car during the upload process.

### Features
- **Auto-Fill Details**: Automatically identifies Make, Model, Color, and Body Type from uploaded images.
- **Condition Assessment**: Detects visible damage or exceptional maintenance levels.
- **Quality Enhancement**: Identifies if a photo needs to be retaken for better conversion.

**Service Location**: `src/services/ai/gemini-vision.service.ts`

---

## 🚦 AI Router & Multi-LLM Orchestration {#ai-router}

To ensure cost-efficiency and performance, the `AIRouterService` dynamically selects the best AI model for each specific task.

| Task | Target Model | Rationale |
|------|--------------|-----------|
| **Vision/Image Analysis** | Gemini Pro Vision | Best integrated multimodal performance |
| **Complex Reasoning** | GPT-4o / DeepSeek | High logic accuracy for resale strategies |
| **Simple Translation** | Gemini Flash | High speed and low cost |
| **Voice Transcription** | Whisper Large v3 | Industry standard for speech accuracy |

**Service Location**: `src/services/ai/ai-router.service.ts`

---

## ✍️ Automated Content Generation {#content-gen}

The `VehicleDescriptionGeneratorService` creates professional, SEO-optimized advertisements in seconds.

### Inputs
- Technical specs (Make, Model, Year).
- Feature list (ABS, Leather, Sunroof).
- AI feature detection from Vision.

### Outputs
- **Narrative Description**: A compelling story about the vehicle.
- **SEO Keywords**: Embedded keywords based on Bulgarian search trends.
- **Tone Adjustment**: Professional, friendly, or "urgent sale" tone options.

---

## 🗣️ Voice & Natural Language (NLU) {#nlu}

### 🎤 Voice Search
Powered by `WhisperService`, users can simply speak their search query (e.g., "Find me a red SUV under 20 thousand levs").
- Supports deep Bulgarian accents and automotive terminology.

### 🧠 NLU Parser
The `NLUMultilingualService` converts raw text into structured Firestore queries.
- "BMW under 10k" → `{ make: 'BMW', priceTo: 10000 }`

---

## 🔗 Related Documentation

- [03_Car_Listing_Creation.md](./03_Car_Listing_Creation.md) - How AI assists in the listing workflow.
- [07_Search_and_Filtering.md](./07_Search_and_Filtering.md) - How voice search integrates with Algolia.

---

**Last Updated:** January 23, 2026  
**Maintained By:** AI & Data Science Team  
**Status:** ✅ Active Documentation
