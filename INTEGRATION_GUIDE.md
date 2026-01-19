# AI Car Analysis - Quick Integration Guide

## ✅ What's Ready

All components are created and ready to use:
- `src/components/AICarAnalysis/` - Complete wizard system
- 1,692 lines of production-ready code
- Full TypeScript support
- Bilingual (bg/en)
- Mobile responsive
- Complete documentation

## 🚀 How to Use

### 1. Import the Modal

```tsx
import { AIAnalysisModal, AIAnalysisCompleteData } from '@/components/AICarAnalysis';
```

### 2. Add State Management

```tsx
function YourComponent() {
  const [showAIModal, setShowAIModal] = useState(false);
  
  const handleAIComplete = (data: AIAnalysisCompleteData) => {
    // data.analysisResult - AI extracted car data
    // data.priceEstimates - Price ranges
    // data.equipmentSuggestions - Equipment lists
    // data.uploadedImages - Original images
    
    // Pre-fill your form
    setFormData({
      brand: data.analysisResult.brand.value,
      model: data.analysisResult.model.value,
      year: data.analysisResult.yearRange.value,
      color: data.analysisResult.color.value,
      bodyType: data.analysisResult.bodyType.value,
      // ... more fields
    });
    
    // Set price
    if (data.priceEstimates.length > 0) {
      setPrice(data.priceEstimates[0].avgPrice);
    }
  };
  
  return (
    <>
      <button onClick={() => setShowAIModal(true)}>
        Analyze with AI
      </button>
      
      <AIAnalysisModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onComplete={handleAIComplete}
      />
    </>
  );
}
```

### 3. Set API Key

Add to `.env` file:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Or use existing:
```env
REACT_APP_GEMINI_API_KEY=your_key
REACT_APP_GOOGLE_GENERATIVE_AI_KEY=your_key
```

## 📦 What You Get

### Analysis Result Structure

```typescript
{
  analysisResult: {
    brand: { value: "BMW", confidence: 0.95 },
    model: { value: "X5", confidence: 0.92 },
    yearRange: { value: "2018-2020", confidence: 0.85 },
    bodyType: { value: "SUV", confidence: 0.98 },
    color: { value: "Black", confidence: 0.90 },
    trim: { value: "M Sport", confidence: 0.65 },
    damage: { value: "none", confidence: 0.88 },
    reasoning: "AI explanation..."
  },
  
  priceEstimates: [
    {
      source: "mobile.bg typical",
      minPrice: 35000,
      maxPrice: 42000,
      avgPrice: 38500,
      currency: "EUR",
      reasoning: "Based on similar listings..."
    }
  ],
  
  equipmentSuggestions: {
    safety: ["ABS", "Airbags", "ESP", "Parking Sensors"],
    comfort: ["Climate Control", "Leather Seats", "Electric Windows"],
    infotainment: ["Navigation", "Bluetooth", "Premium Sound"]
  },
  
  uploadedImages: [File, File, File] // Original uploaded files
}
```

## 🎯 Suggested Integration Points

### Sell Workflow
Add AI button to `/sell` flow:
- Location: `src/pages/02_selling-management/SellPage.tsx`
- When: Before user fills form manually
- Result: Pre-populate form with AI data

### Car Listing Creation
Add to listing creation flow:
- Auto-fill basic info
- Set initial price
- Pre-select equipment
- Upload images automatically

### Edit Listing
Add to edit flow:
- Re-analyze existing images
- Update pricing
- Suggest missing equipment

## 📝 Example: Sell Page Integration

```tsx
// src/pages/02_selling-management/SellPage.tsx

import { useState } from 'react';
import { AIAnalysisModal, AIAnalysisCompleteData } from '@/components/AICarAnalysis';
import { GlassButton } from '@/components/ui/GlassButton';
import { Sparkles } from 'lucide-react';

export const SellPage = () => {
  const [showAI, setShowAI] = useState(false);
  const [formData, setFormData] = useState({});
  
  const handleAIComplete = (data: AIAnalysisCompleteData) => {
    // Auto-fill form
    setFormData({
      brand: data.analysisResult.brand.value,
      model: data.analysisResult.model.value,
      year: parseInt(data.analysisResult.yearRange.value.split('-')[0]),
      color: data.analysisResult.color.value,
      bodyType: data.analysisResult.bodyType.value,
      condition: mapDamageToCondition(data.analysisResult.damage.value),
      price: data.priceEstimates[0]?.avgPrice || 0,
      
      // Equipment
      safety: data.equipmentSuggestions.safety,
      comfort: data.equipmentSuggestions.comfort,
      infotainment: data.equipmentSuggestions.infotainment,
    });
    
    // Handle images
    handleImagesUpload(data.uploadedImages);
    
    // Close modal and show success message
    setShowAI(false);
    showSuccessToast('Car analysis completed! Form pre-filled with AI data.');
  };
  
  return (
    <div>
      <GlassButton
        variant="premium"
        icon={<Sparkles />}
        onClick={() => setShowAI(true)}
      >
        Analyze with AI
      </GlassButton>
      
      {/* Your existing form */}
      <SellForm initialData={formData} />
      
      {/* AI Modal */}
      <AIAnalysisModal
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        onComplete={handleAIComplete}
      />
    </div>
  );
};

// Helper function
function mapDamageToCondition(damage: string): string {
  const map = {
    'none': 'excellent',
    'minor': 'good',
    'moderate': 'fair',
    'severe': 'poor'
  };
  return map[damage] || 'good';
}
```

## 🧪 Testing

Before production:
1. ✅ Test with various car images
2. ✅ Test error handling (no API key, bad images)
3. ✅ Test all 4 steps
4. ✅ Test edit functionality
5. ✅ Test both languages (bg/en)
6. ✅ Test mobile responsive
7. ✅ Test dark/light theme

## 📚 Full Documentation

- **Component README**: `src/components/AICarAnalysis/README.md`
- **Implementation Summary**: `AI_ANALYSIS_COMPONENTS_SUMMARY.md`
- **Type Definitions**: `src/types/ai-analysis.types.ts`
- **Service Code**: `src/services/ai/gemini-analysis.service.ts`

## 🎨 UI Preview

The wizard has 4 steps:
1. **Upload** - Modern drag & drop with previews
2. **Analyzing** - Animated loading with progress text
3. **Review** - Confidence bars, editable fields
4. **Pricing** - Price cards + equipment suggestions

All styled with glassmorphism design matching your existing UI.

## 🚀 Ready to Go!

Just add the modal to your sell workflow and you're done!
