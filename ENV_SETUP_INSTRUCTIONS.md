# 🔐 تعليمات إعداد Environment Variables
## Environment Setup Instructions

**ملاحظة:** نظراً لأن `.env.example` محظور، إليك المحتوى لإنشائه يدوياً.

---

## الخطوات

### 1. إنشاء الملف

```bash
# في bulgarian-car-marketplace/
touch .env.example
```

### 2. نسخ المحتوى

```env
# Firebase Configuration
# Get these from Firebase Console: https://console.firebase.google.com
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Maps API
# Get from: https://console.cloud.google.com/apis/credentials
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Facebook Integration
# Get from: https://developers.facebook.com
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
REACT_APP_FACEBOOK_PIXEL_ID=your_facebook_pixel_id

# N8N Integration (Optional)
# Your N8N webhook URLs
REACT_APP_N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook

# Environment
# development | staging | production
REACT_APP_ENV=development

# Error Tracking (Optional)
# Sentry DSN - Get from: https://sentry.io
REACT_APP_SENTRY_DSN=your_sentry_dsn_here

# Analytics (Optional)
# Google Analytics 4
REACT_APP_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags (Optional)
REACT_APP_ENABLE_DRAFTS=true
REACT_APP_ENABLE_ADVANCED_SEARCH=true
REACT_APP_ENABLE_ANALYTICS=true

# API Keys (Optional)
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Development Only
# Set to 'true' to enable debug mode
REACT_APP_DEBUG_MODE=false

# ==================================================
# INSTRUCTIONS:
# ==================================================
# 1. Copy this file to .env.local
# 2. Fill in your actual values
# 3. NEVER commit .env.local to git
# 4. For production, set these in your hosting environment
# ==================================================
```

### 3. إنشاء .env.local

```bash
# انسخ من example
cp .env.example .env.local

# عدّل بقيمك الفعلية
nano .env.local  # أو أي محرر نصوص
```

### 4. تحديث .gitignore

```bash
# تأكد من وجود هذا السطر في .gitignore
.env.local
.env.*.local
```

---

## ✅ تم!

الآن لديك environment variables محمية! 🔐

