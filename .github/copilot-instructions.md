# Copilot Instructions for AI Agents

## Project Overview
This is a comprehensive Bulgarian car marketplace built with Firebase and Google Cloud services. The project follows a multi-tier architecture with deep Bulgarian localization and extensive Google Cloud Platform integrations.

## Architecture Overview

### **Multi-Tier Structure**
- **Root Services** (`/`): Core Firebase services and Google Cloud integrations
- **Frontend** (`bulgarian-car-marketplace/`): React-based marketplace interface
- **Admin Dashboard** (`admin-dashboard/`): Administrative management interface
- **Firebase Functions** (`functions/`): Serverless backend functions
- **Data Connect** (`src/dataconnect-generated/`): Firebase Data Connect integration

### **Service Boundaries**
- **Authentication**: Firebase Auth with Bulgarian user profiles and social login
- **Database**: Firestore for real-time car listings, users, and messaging
- **Storage**: Firebase Storage for car images and documents
- **Messaging**: Real-time chat system for car inquiries and negotiations
- **Analytics**: User behavior tracking and marketplace insights

## Key Components

### **Core Firebase Services**
- **`firebase-config.ts`**: Central Firebase initialization with Bulgarian localization (EUR currency, Europe/Sofia timezone, bg-BG locale)
- **`auth-service.ts`**: BulgarianAuthService class with Google/Facebook login and BulgarianUser interface
- **`messaging-service.ts`**: BulgarianMessagingService for car-centric chat with CarMessage and ChatRoom interfaces
- **`index.ts`**: Main service exports and Firebase SDK re-exports

### **Google Cloud Integrations**
- **BigQuery** (`bigquery-service.ts`): Analytics and reporting
- **Vision AI** (`vision-service.ts`): Image analysis for car photos
- **Speech Services** (`speech-service.ts`): Voice interactions
- **Translation** (`translation-service.ts`): Multi-language support
- **Maps** (`maps-service.ts`): Location services
- **Dialogflow** (`dialogflow-service.ts`): Chatbot integration
- **Recaptcha** (`recaptcha-service.ts`): Bot protection
- **KMS** (`kms-service.ts`): Key management
- **Pub/Sub** (`pubsub-service.ts`): Event messaging
- **Cloud Tasks** (`cloudtasks-service.ts`): Background job processing

## Developer Workflows

### **Local Development Setup**
```bash
# Install dependencies
npm install

# Start Firebase emulators
npm run dev
# or
firebase emulators:start

# Build project
npm run build

# Run comprehensive tests
npm run test:services
# or
node services-test.ts

# Deploy to production
firebase deploy
```

### **Frontend Development**
```bash
cd bulgarian-car-marketplace

# Start development server
npm start

# Build for production
npm run build

# Quick serve built files
npm run start:python  # Uses Python HTTP server on port 3001
```

### **Testing Strategy**
- **Service Tests**: Run `services-test.ts` for comprehensive Firebase service testing
- **Firebase Emulators**: Use `firebase emulators:exec` for integration tests
- **Unit Tests**: Standard React testing with Jest
- **Bulgarian Localization**: Test with Bulgarian test data and EUR currency

## Patterns & Conventions

### **Bulgarian Localization Patterns**
- All service classes prefixed with `Bulgarian` (e.g., `BulgarianAuthService`, `BulgarianMessagingService`)
- User objects extend `BulgarianUser` interface with Bulgarian-specific fields
- Currency formatting uses EUR with Bulgarian number formatting (comma decimal separator)
- Phone numbers validated with +359 prefix
- UI text supports Bulgarian (`bg`) and English (`en`) languages

### **Configuration Management**
- **Environment Variables**: All secrets and config in `.env` files
- **Centralized Config**: `BULGARIAN_CONFIG` object for Bulgarian-specific settings
- **Firebase Config**: `firebase-config.ts` initializes all services with Bulgarian localization

### **Data Modeling**
```typescript
// Bulgarian User with marketplace-specific fields
interface BulgarianUser {
  uid: string;
  email: string;
  displayName: string;
  location: string;  // Bulgarian cities
  preferredLanguage: 'bg' | 'en';
  currency: 'EUR';
  // ... marketplace preferences
}

// Car Message with Bulgarian context
interface CarMessage {
  carId: string;
  text: string;
  language: 'bg' | 'en';
  type: 'comment' | 'question' | 'offer' | 'review';
  // ... Bulgarian-specific fields
}
```

### **Error Handling**
- Localized error messages in Bulgarian and English
- Firebase error codes mapped to user-friendly Bulgarian messages
- Comprehensive validation with Bulgarian business rules

## Integration Points

### **Firebase Ecosystem**
- **Authentication**: Social login with Bulgarian user onboarding
- **Firestore**: Real-time car listings with Bulgarian location data
- **Storage**: Image optimization and Bulgarian filename handling
- **Functions**: Serverless processing with Bulgarian timezone handling
- **Analytics**: Bulgarian user behavior tracking

### **Google Cloud Platform**
- **BigQuery**: Marketplace analytics and reporting
- **Vision AI**: Automatic car photo analysis and tagging
- **Translation API**: Real-time Bulgarian/English translation
- **Maps API**: Bulgarian location services and geocoding
- **Dialogflow**: Bulgarian language chatbot for car inquiries

### **External Services**
- **hCaptcha**: Bot protection for Bulgarian users
- **Socket.IO**: Real-time messaging fallback
- **Supabase**: Alternative database for specific features

## Example Usage

### **Authentication**
```typescript
import { BulgarianAuthService } from './auth-service';

const authService = new BulgarianAuthService();
await authService.signUp('user@example.com', 'password', {
  displayName: 'Иван Иванов',
  preferredLanguage: 'bg',
  location: 'София'
});
```

### **Car Messaging**
```typescript
import { BulgarianMessagingService } from './messaging-service';

const messagingService = new BulgarianMessagingService();
await messagingService.sendCarMessage({
  carId: '123',
  text: 'Колата изглежда страхотно!',
  language: 'bg',
  type: 'offer',
  price: 25000
});
```

### **Google Cloud Integration**
```typescript
import { BulgarianVisionService } from './vision-service';

const visionService = new BulgarianVisionService();
const analysis = await visionService.analyzeCarImage(imageFile);
// Returns Bulgarian car attributes and condition assessment
```

## Development Environment

### **Required Setup**
1. **Node.js** >= 18.0.0 with npm >= 8.0.0
2. **Firebase CLI** for deployment and emulators
3. **Google Cloud SDK** for GCP services
4. **Python** for local HTTP server (port 3001)

### **Environment Variables**
```env
# Firebase
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=globul-cars

# Google Cloud
GCLOUD_PROJECT_ID=globul-cars
GOOGLE_MAPS_API_KEY=your_maps_key

# Bulgarian Config
VITE_DEFAULT_LANGUAGE=bg
VITE_DEFAULT_CURRENCY=EUR
```

## References

- **Main README**: `README.md` - Project overview and setup
- **Development Guide**: `DEVELOPMENT_SEQUENCE.md` - Phased development approach
- **Setup Guide**: `SETUP_GUIDE.md` - Environment configuration
- **Implementation Plan**: `IMPLEMENTATION_PLAN.md` - Architecture decisions
- **Service Tests**: `services-test.ts` - Testing examples and patterns

---
If any section is unclear or incomplete, please provide feedback to improve these instructions.