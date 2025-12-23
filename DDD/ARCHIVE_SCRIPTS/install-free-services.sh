#!/bin/bash
# Free Services Installation Script
# Installs required dependencies for Google Analytics 4 and Sentry

echo "🚀 Installing Free Services Dependencies..."
echo ""

cd bulgarian-car-marketplace

echo "📦 Installing Google Analytics 4..."
npm install react-ga4

echo "📦 Installing Sentry Error Monitoring..."
npm install @sentry/react @sentry/tracing

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add to .env:"
echo "   REACT_APP_GA4_MEASUREMENT_ID=G-XXXXXXXXXX"
echo "   REACT_APP_SENTRY_DSN=https://key@sentry.io/project-id"
echo "   REACT_APP_VERSION=1.0.0"
echo ""
echo "2. Initialize in App.tsx:"
echo "   import { initGA, trackPageView } from './utils/google-analytics';"
echo "   useEffect(() => { initGA(); }, []);"
echo ""
echo "3. Initialize Sentry in index.tsx:"
echo "   import { initSentry, SentryErrorBoundary } from './utils/sentry';"
echo "   initSentry();"
echo ""
echo "📖 Full guide: 📚 DOCUMENTATION/QUICK_START_FREE_SERVICES.md"
