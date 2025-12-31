# 🚗 Bulgarski Mobili (Bulgarian Car Marketplace)

[![Deploy to Firebase Hosting](https://github.com/hamdanialaa3/New-Globul-Cars/workflows/Deploy%20to%20Firebase%20Hosting/badge.svg)](https://github.com/hamdanialaa3/New-Globul-Cars/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.3.0-orange.svg)](https://firebase.google.com/)

A premium Bulgarian automotive marketplace built with React 18, TypeScript, and Firebase. Designed as a high-quality alternative to mobile.de and mobile.bg with advanced features for Bulgarian users.

## 🌟 Features

### Core Functionality
- **Advanced Search**: Hybrid search system combining Firestore + Algolia with 50+ filters
- **Multi-Collection Storage**: Optimized storage across 6 vehicle categories (passenger cars, SUVs, vans, motorcycles, trucks, buses)
- **Numeric ID System**: SEO-friendly URLs (`/car/80/5`, `/profile/18`)
- **Real-Time Messaging**: Instant chat with typing indicators and FCM notifications
- **Favorites System**: Save and manage favorite listings with real-time sync

### User Types & Plans
- **Private Users**: Free plan with up to 3 listings for personal vehicle sales
- **Dealers**: Paid plan with up to 10 listings, business profile, and quick replies
- **Companies**: Unlimited listings, team management, analytics, and API access

### Authentication
Multi-provider authentication system:
- Google Sign-In
- Facebook Login
- Apple Sign-In
- Email/Password
- Phone Number

### Advanced Features
- **AI Integration**: Gemini AI for car descriptions, price suggestions, and profile analysis
- **B2B Tools**: CSV import, bulk upload wizard, team management, and analytics dashboard
- **Image Optimization**: WebP format with client-side compression
- **Multi-Language**: Bulgarian (Cyrillic) and English support
- **Compliance**: EGN verification for private users, EIK verification for companies

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Firebase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/hamdanialaa3/New-Globul-Cars.git
cd New-Globul-Cars
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase and API credentials:
```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Stripe (for payments)
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...

# Google Maps API
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Algolia (for search)
REACT_APP_ALGOLIA_APP_ID=your_app_id
REACT_APP_ALGOLIA_API_KEY=your_search_key
REACT_APP_ALGOLIA_INDEX_NAME=your_index_name
```

4. **Start the development server**
```bash
npm start
```

The app will be available at `http://localhost:3000`

### Windows Quick Start
For Windows users, use the provided batch script:
```cmd
START_SERVER.bat
```

## 📁 Project Structure

```
New-Globul-Cars/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Full page components
│   │   ├── 01_main-pages/
│   │   ├── 02_authentication/
│   │   └── ...
│   ├── features/        # Complex features
│   │   ├── car-listing/
│   │   ├── analytics/
│   │   ├── verification/
│   │   ├── billing/
│   │   ├── team/
│   │   └── ...
│   ├── services/        # Business logic layer
│   ├── contexts/        # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── routes/         # Route configurations
│   └── firebase/       # Firebase configuration
├── functions/          # Firebase Cloud Functions
├── public/            # Static assets
├── scripts/           # Build and utility scripts
└── docs/             # Documentation

```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm start              # Start dev server
npm run start:dev      # Start with increased memory
npm run dev:vite       # Alternative Vite dev server

# Building
npm run build          # Production build
npm run build:analyze  # Build with bundle analysis
npm run build:optimized # Build with image optimization

# Testing
npm test               # Run tests in watch mode
npm run test:ci        # Run tests with coverage

# Type Checking
npm run type-check     # TypeScript type checking

# Linting & Formatting
npm run lint           # Lint code (note: currently disabled)

# Deployment
npm run deploy         # Full deployment to Firebase
npm run deploy:hosting # Deploy hosting only
npm run deploy:functions # Deploy functions only

# Firebase Emulators
npm run emulate        # Start Firebase emulators
npm run serve          # Serve built app locally

# Utilities
npm run clean          # Clean build artifacts
npm run clean:cache    # Clear all caches
npm run clean:3000     # Kill processes on port 3000
```

### Code Style

This project uses:
- **ESLint** for code quality (.eslintrc.json)
- **Prettier** for code formatting (.prettierrc)
- **TypeScript** for type safety (strict mode)
- **Husky** for pre-commit hooks
- **lint-staged** for staged file linting

### Path Aliases

TypeScript path aliases are configured for cleaner imports:

```typescript
import { useAuth } from '@/contexts/AuthProvider';
import { logger } from '@/services/logger-service';
import type { BulgarianUser } from '@/types/user/bulgarian-user.types';
```

Available aliases:
- `@/services/*` → `src/services/*`
- `@/components/*` → `src/components/*`
- `@/contexts/*` → `src/contexts/*`
- `@/utils/*` → `src/utils/*`
- `@/types/*` → `src/types/*`
- `@/hooks/*` → `src/hooks/*`
- `@/pages/*` → `src/pages/*`
- `@/firebase/*` → `src/firebase/*`
- `@/features/*` → `src/features/*`
- `@/assets/*` → `src/assets/*`

## 🧪 Testing

The project uses Jest and React Testing Library for testing:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:ci

# Run specific test
npm test -- --testPathPattern=service-name
```

Test files are located alongside source files:
- `src/**/__tests__/**/*.test.{ts,tsx}`
- `src/**/*.test.{ts,tsx}`
- `src/**/*.spec.{ts,tsx}`

## 🔒 Security

### Environment Variables
- Never commit `.env`, `.env.local`, or any file containing real API keys
- Use `.env.example` as a template
- All sensitive files are protected in `.gitignore`

### Security Features
- Firebase Authentication with multiple providers
- Firestore security rules for data access control
- Input sanitization to prevent XSS attacks
- EGN/EIK verification for user compliance
- HTTPS-only in production

### Reporting Security Issues
Please report security vulnerabilities to the maintainers privately. Do not open public issues for security concerns.

## 🌍 Localization

The app supports:
- **Bulgarian (bg)**: Primary language with Cyrillic support
- **English (en)**: Secondary language

Translation files are located in `src/locales/{bg,en}/`

## 📚 Documentation

Additional documentation can be found in:
- `PROJECT_CONSTITUTION.md` - Core principles and development rules
- `PROJECT_MASTER_Plan.md` - Strategic development roadmap
- `docs/` - Detailed technical documentation
- `.github/copilot-instructions.md` - AI assistant guidelines

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Algolia for search functionality
- Stripe for payment processing
- Google Gemini AI for AI features
- React community for excellent libraries

## 📞 Support

For support, please:
- Open an issue on GitHub
- Check existing documentation in the `docs/` folder
- Review the troubleshooting guides in project documentation

## 🗺️ Roadmap

See the [PROJECT_MASTER_Plan.md](PROJECT_MASTER_Plan.md) for the full development roadmap and feature status.

---

**Built with ❤️ for the Bulgarian automotive community**
