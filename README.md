# 🚗 Globul Cars - Bulgarian Car Marketplace

**Professional car marketplace platform for Bulgaria**

## 🎯 Project Overview

Globul Cars is a modern, high-performance car marketplace built with React, TypeScript, and Firebase. Optimized for the Bulgarian market with full localization support.

## 🚀 Features

- ✅ **Bilingual Support:** Bulgarian & English
- ✅ **Advanced Search:** Multi-parameter car search
- ✅ **Real-time Updates:** Live Firebase integration
- ✅ **Profile System:** Private, Dealer, and Company profiles
- ✅ **Secure Authentication:** Multi-provider social login
- ✅ **Performance Optimized:** Lazy loading, caching, and code splitting

## 📦 Tech Stack

- **Frontend:** React 19, TypeScript, Styled Components
- **Backend:** Firebase (Firestore, Auth, Storage, Functions)
- **Maps:** Google Maps API, Leaflet
- **State:** React Context API
- **Build:** React Scripts 5.0

## 🛠️ Installation

\`\`\`bash
# Clone repository
git clone https://github.com/hamdanialaa3/new-globul-cars

# Install dependencies
cd bulgarian-car-marketplace
npm install

# Start development server
npm start
\`\`\`

## 🌐 Environment Variables

Create `.env` file in `bulgarian-car-marketplace/`:

\`\`\`env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_key
\`\`\`

## 📁 Project Structure

\`\`\`
bulgarian-car-marketplace/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components
│   ├── contexts/       # React Context providers
│   ├── services/       # Business logic services
│   ├── hooks/          # Custom React hooks
│   ├── firebase/       # Firebase configuration
│   ├── utils/          # Utility functions
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
└── build/              # Production build
\`\`\`

## 🔥 Firebase Setup

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication, Firestore, Storage
3. Update `.env` with your credentials
4. Deploy rules: `firebase deploy --only firestore:rules,storage:rules`

## 📝 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run deploy` - Deploy to Firebase Hosting

## 🌍 Deployment

\`\`\`bash
# Build and deploy
npm run build
firebase deploy --only hosting
\`\`\`

## 📊 Performance

- **Build Size:** Optimized to < 5MB
- **Load Time:** < 2 seconds
- **Lighthouse Score:** 90+ across all metrics

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contact

- **Email:** alaa.hamdani@yahoo.com
- **Website:** [mobilebg.eu](https://mobilebg.eu)
- **Instagram:** [@globulnet](https://www.instagram.com/globulnet/)

---

## 📚 مراجع التطوير

للمطورين، يوجد ملفات توثيق مهمة في الجذر:
- `خطة البروفايل المحدثة - النسخة الكاملة.md` - خطة شاملة لنظام البروفايل
- `صفحات المشروع كافة.md` - قائمة كاملة بصفحات المشروع

---

**Last Updated:** October 18, 2025  
**Version:** 2.0.0 (Optimized)
