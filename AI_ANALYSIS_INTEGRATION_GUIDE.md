# 🤖 AI-Powered Car Analysis Integration Guide

## Overview

This document describes the integration of Gemini AI-powered car analysis into the Koli.one sell workflow.

## Features

### 1. AI Smart Sell Button
- **Location**: Home page, directly below the hero section
- **Design**: Prominent glassmorphism button with animated sparkles
- **Action**: Opens AI Analysis Modal

### 2. AI Analysis Modal
A 4-step wizard for AI-powered car listing:

#### Step 1: Upload
- Drag & drop image upload
- Supports JPEG, PNG, WebP
- Max 5 images, 10MB each
- Preview thumbnails

#### Step 2: Analyzing
- Gemini AI analyzes first uploaded image
- Extracts: brand, model, year, color, body type, trim, damage
- Confidence scores for each field
- Auto-advances on completion

#### Step 3: Review
- Display AI results with confidence bars
- Edit capability for all fields
- Low-confidence fields highlighted
- AI reasoning display

#### Step 4: Pricing
- AI price estimation from multiple sources
- Equipment suggestions (safety, comfort, infotainment)
- Complete button to proceed to sell workflow

### 3. Workflow Integration
- AI data automatically pre-fills sell form
- Equipment options auto-selected
- Jumps to Step 2 (basic info) with pre-filled data
- Success toast shows detected vehicle

## File Structure

```
src/
├── types/
│   └── ai-analysis.types.ts           # TypeScript interfaces
├── services/
│   └── ai/
│       └── gemini-analysis.service.ts # Gemini AI integration
├── components/
│   ├── ui/
│   │   ├── GlassButton.tsx            # Glassmorphism button
│   │   └── GlassCard.tsx              # Glassmorphism card
│   └── AICarAnalysis/
│       ├── AIAnalysisModal.tsx        # Main modal orchestrator
│       └── steps/
│           ├── AIUploadStep.tsx       # Image upload
│           ├── AIAnalyzingStep.tsx    # Analysis animation
│           ├── AIReviewStep.tsx       # Review results
│           └── AIPricingStep.tsx      # Price estimation
└── pages/
    └── 01_main-pages/
        └── home/
            └── HomePage/
                ├── AISmartSellButton.tsx  # Smart CTA button
                └── HomePageComposer.tsx   # Homepage layout

Modified:
src/components/SellWorkflow/WizardOrchestrator.tsx  # AI mode support
```

## Configuration

### Environment Variables

Add to `.env` or `.env.local`:

```bash
# Gemini AI Configuration
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
REACT_APP_GOOGLE_GENERATIVE_AI_KEY=your_gemini_api_key_here

# Enable AI Features (optional)
VITE_ENABLE_AI_ANALYSIS=true
```

### Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste into your `.env` file

**Note**: Gemini API has a free tier with generous limits.

## Usage

### For Users

1. Click "Add Listing with AI" button on homepage
2. Upload car images (1-5 images)
3. Wait for AI analysis (5-10 seconds)
4. Review and edit AI-detected information
5. View price estimates
6. Click "Complete" to continue with listing

### For Developers

#### Import AI Modal

```typescript
import AIAnalysisModal from '@/components/AICarAnalysis/AIAnalysisModal';

const MyComponent = () => {
  const [showModal, setShowModal] = useState(false);

  const handleComplete = (data) => {
    // Access AI analysis results
    console.log(data.analysisResult);
    console.log(data.priceEstimates);
    console.log(data.equipmentSuggestions);
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Analyze Car
      </button>
      
      <AIAnalysisModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onComplete={handleComplete}
      />
    </>
  );
};
```

#### Use Gemini Service Directly

```typescript
import { geminiAnalysisService } from '@/services/ai/gemini-analysis.service';

// Analyze car image
const result = await geminiAnalysisService.analyzeCarImage(base64Image);
// Returns: { brand, model, yearRange, color, bodyType, trim, damage, reasoning }

// Estimate price
const prices = await geminiAnalysisService.estimatePrice({
  brand: 'BMW',
  model: '320i',
  year: '2020',
  mileage: 50000
});

// Suggest equipment
const equipment = await geminiAnalysisService.suggestOptions({
  brand: 'BMW',
  model: '320i',
  year: '2020'
});
```

## Architecture

### Data Flow

```
HomePage
  ↓ (Click AI Button)
AIAnalysisModal
  ↓ (Upload Images)
AIUploadStep
  ↓ (Process)
AIAnalyzingStep → Gemini API
  ↓ (Results)
AIReviewStep
  ↓ (Confirm)
AIPricingStep → Gemini API
  ↓ (Complete)
WizardOrchestrator
  ↓ (Pre-filled Data)
Sell Workflow Steps
```

### State Management

- Modal state: Local React state
- AI results: Passed via props
- Workflow data: React Router state
- Form pre-fill: useWizardState hook

## Testing

### Manual Testing

1. **Upload Test**:
   - Upload various car images
   - Test drag & drop
   - Test file validation

2. **Analysis Test**:
   - Verify Gemini API connection
   - Check confidence scores
   - Test error handling

3. **Review Test**:
   - Edit AI results
   - Verify field updates
   - Test validation

4. **Workflow Test**:
   - Complete full flow
   - Verify data pre-fill
   - Check equipment auto-selection

### TypeScript

```bash
npm run type-check
```

### Build

```bash
npm run build
```

## Error Handling

### API Key Missing
- Service logs warning
- AI features disabled
- Fallback to manual entry

### Network Errors
- Retry mechanism (3 attempts)
- User-friendly error messages
- Option to continue manually

### Low Confidence Results
- Fields highlighted in UI
- Manual edit encouraged
- Reasoning displayed

## Performance

- **Modal**: Lazy-loaded on demand
- **Images**: Client-side compression before upload
- **API Calls**: Debounced and cached
- **Animations**: GPU-accelerated with Framer Motion

## Security

- API key stored in environment variables (never in code)
- Image validation before upload
- File size limits enforced
- Sanitized API responses

## Limitations

- Gemini API rate limits (free tier: 60 requests/minute)
- Analysis accuracy depends on image quality
- Bulgarian market focus for pricing
- European car brands prioritized

## Future Enhancements

- [ ] Multi-image analysis (analyze all uploaded images)
- [ ] Damage detection with image annotations
- [ ] Market trends integration
- [ ] Price history tracking
- [ ] Comparative market analysis
- [ ] VIN decoding integration

## Troubleshooting

### "API key not found" error
- Check `.env` file exists
- Verify REACT_APP_GEMINI_API_KEY is set
- Restart development server

### "Failed to analyze image" error
- Check internet connection
- Verify Gemini API key is valid
- Try with different image
- Check image format (JPEG/PNG/WebP)

### TypeScript errors
- Run `npm install --legacy-peer-deps`
- Run `npm run type-check`
- Check import paths use `@/` aliases

### Build errors
- Clear cache: `npm run clean:all`
- Reinstall: `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps`
- Check console ban: `scripts/ban-console.js`

## Support

For issues or questions:
- Check existing documentation in `DOCUMENTATION_INDEX.md`
- Review `PROJECT_CONSTITUTION.md` for code standards
- Contact: support@koli.one

## License

Proprietary - Koli.one / Globul Cars
