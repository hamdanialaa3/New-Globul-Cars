@echo off
REM Free Services Installation Script (Windows)
REM Installs required dependencies for Google Analytics 4 and Sentry

echo.
echo ========================================
echo    Free Services Installation
echo ========================================
echo.

cd bulgarian-car-marketplace

echo Installing Google Analytics 4...
call npm install react-ga4

echo.
echo Installing Sentry Error Monitoring...
call npm install @sentry/react @sentry/tracing

echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Add to .env:
echo    REACT_APP_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
echo    REACT_APP_SENTRY_DSN=https://key@sentry.io/project-id
echo    REACT_APP_VERSION=1.0.0
echo.
echo 2. Initialize in App.tsx:
echo    import { initGA, trackPageView } from './utils/google-analytics';
echo    useEffect(() => { initGA(); }, []);
echo.
echo 3. Initialize Sentry in index.tsx:
echo    import { initSentry, SentryErrorBoundary } from './utils/sentry';
echo    initSentry();
echo.
echo Full guide: Documentation\QUICK_START_FREE_SERVICES.md
echo.
pause
