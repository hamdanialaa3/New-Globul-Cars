# AI Car Analysis Components

AI-powered car analysis wizard with 4-step flow for intelligent car listing creation.

## Overview

This module provides a complete AI-driven car analysis workflow using Google Gemini 2.0 Flash:

1. **Upload** - Upload car images with drag & drop
2. **Analyzing** - AI analyzes images to extract car data
3. **Review** - Review and edit AI-extracted data
4. **Pricing** - Get price estimates and equipment suggestions

## Components

### AIAnalysisModal (Main Orchestrator)
Main modal component that coordinates the entire wizard flow.

```tsx
import { AIAnalysisModal } from '@/components/AICarAnalysis';

<AIAnalysisModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onComplete={(data) => {
    // data contains:
    // - analysisResult: GeminiCarAnalysisResult
    // - priceEstimates: PriceEstimate[]
    // - equipmentSuggestions: EquipmentSuggestions
    // - uploadedImages: File[]
  }}
/>
```

### Step Components

#### 1. AIUploadStep
- Drag & drop image upload
- File validation (JPEG/PNG/WebP, max 10MB, max 5 images)
- Preview thumbnails
- Remove uploaded images

#### 2. AIAnalyzingStep
- Loading animation with progress stages
- Calls `geminiAnalysisService.analyzeCarImage()`
- Auto-advances on completion
- Error handling with retry option

#### 3. AIReviewStep
- Display AI analysis results (brand, model, year, color, bodyType, trim, damage)
- Confidence bars for each field
- Edit capability for all fields
- AI reasoning display
- Low-confidence fields highlighted

#### 4. AIPricingStep
- Calls `geminiAnalysisService.estimatePrice()` and `suggestOptions()`
- Display price ranges from different sources
- Show equipment suggestions by category:
  - Safety (ABS, Airbags, ESP)
  - Comfort (Climate Control, Leather Seats)
  - Infotainment (Navigation, Bluetooth)

## Features

### Bilingual Support
All components support Bulgarian (bg) and English (en) via `useLanguage()` hook.

### Glassmorphism Design
- Uses GlassCard and GlassButton components
- Frosted glass effects with backdrop blur
- Smooth animations with Framer Motion
- Responsive design (mobile-first)

### Error Handling
- User-friendly error messages
- Retry mechanism for failed AI calls
- Fallback to manual entry
- No console.log (uses logger-service)

### TypeScript
- Strict type checking
- All types defined in `@/types/ai-analysis.types`
- Props interfaces for all components

## Dependencies

### Required Services
- `geminiAnalysisService` - AI analysis backend
- `logger-service` - Logging (no console.log)
- `useLanguage()` - Internationalization

### UI Components
- `GlassCard` - Glassmorphism card container
- `GlassButton` - Glassmorphism button

### Icons (lucide-react)
- Camera, Upload, X, Sparkles, Loader2
- TrendingUp, Shield, CheckCircle2, AlertTriangle, Edit2

## File Structure

```
src/components/AICarAnalysis/
├── AIAnalysisModal.tsx          # Main orchestrator (388 lines)
├── index.ts                     # Exports
└── steps/
    ├── AIUploadStep.tsx         # Step 1: Upload images (437 lines)
    ├── AIAnalyzingStep.tsx      # Step 2: AI analysis (357 lines)
    ├── AIReviewStep.tsx         # Step 3: Review results (399 lines)
    └── AIPricingStep.tsx        # Step 4: Pricing (487 lines)
```

Total: 1,692 lines across 6 files

## Usage Example

```tsx
import { useState } from 'react';
import { AIAnalysisModal, AIAnalysisCompleteData } from '@/components/AICarAnalysis';

function SellCarPage() {
  const [showAIModal, setShowAIModal] = useState(false);
  
  const handleAIComplete = (data: AIAnalysisCompleteData) => {
    // Pre-fill form with AI-extracted data
    setFormData({
      brand: data.analysisResult.brand.value,
      model: data.analysisResult.model.value,
      year: data.analysisResult.yearRange.value,
      color: data.analysisResult.color.value,
      bodyType: data.analysisResult.bodyType.value,
      // ... other fields
    });
    
    // Set suggested price
    if (data.priceEstimates.length > 0) {
      setPrice(data.priceEstimates[0].avgPrice);
    }
    
    // Add equipment suggestions
    setEquipment([
      ...data.equipmentSuggestions.safety,
      ...data.equipmentSuggestions.comfort,
      ...data.equipmentSuggestions.infotainment
    ]);
    
    // Upload images
    uploadImages(data.uploadedImages);
  };
  
  return (
    <>
      <button onClick={() => setShowAIModal(true)}>
        Use AI to Analyze Car
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

## Configuration

### Environment Variables
Ensure Gemini API key is configured:
```env
VITE_GEMINI_API_KEY=your_api_key
# or
REACT_APP_GEMINI_API_KEY=your_api_key
# or
REACT_APP_GOOGLE_GENERATIVE_AI_KEY=your_api_key
```

### Validation Limits
Defined in `AIUploadStep.tsx`:
- `MAX_FILE_SIZE`: 10MB per image
- `MAX_FILES`: 5 images
- `ACCEPTED_TYPES`: ['image/jpeg', 'image/png', 'image/webp']

## Architecture

### State Management
Modal maintains state for entire wizard:
- `currentStep`: Current wizard step
- `uploadedImages`: Uploaded image files
- `analysisResult`: AI analysis result
- `priceEstimates`: Price estimates
- `equipmentSuggestions`: Equipment suggestions

### Progress Flow
```
Upload → Analyzing → Review → Pricing → Complete
  ↑         ↓          ↓         ↓
  └─────────┴──────────┴─────────┘
       (Error handling returns to Upload)
```

### API Calls
1. **Analyzing Step**: `geminiAnalysisService.analyzeCarImage(base64)`
2. **Pricing Step**: 
   - `geminiAnalysisService.estimatePrice(carData)`
   - `geminiAnalysisService.suggestOptions(carInfo)`

## Styling

All components use:
- Styled-components for CSS-in-JS
- Framer Motion for animations
- Theme-aware colors (dark/light mode)
- Responsive breakpoints (@media queries)
- Glassmorphism design system

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast text (WCAG AAA)

## Performance

- Lazy loading modal content
- Optimized re-renders with React.memo patterns
- Efficient state updates
- Image preview optimization
- Progressive loading stages

## Browser Support

- Modern browsers with ES2017+ support
- Requires `backdrop-filter` CSS support
- Falls back gracefully for older browsers

## License

Part of Koli.one platform - see project root LICENSE
