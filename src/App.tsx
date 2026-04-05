// src/App.tsx
// Main App Component for Koli One
// Refactored to use AppProviders and AppRoutes for reduced complexity
// Enhanced with Professional Page Loader and Scroll Management

import React from 'react';
import styled from 'styled-components';
import { AppProviders } from './providers';
import AppRoutes from './AppRoutes';
import IndexedDBActivityTracker from './services/indexeddb-activity-tracker';
import { logger } from './services/logger-service';
import { InstallPrompt } from './components/PWA/InstallPrompt';
import GuestExpirationModal from './components/auth/GuestExpirationModal';
import ConsentBanner from './components/ConsentBanner';
import PendingFavoriteHandler from './components/PendingFavoriteHandler';
import ScrollToTop from './components/Navigation/ScrollToTop';
import ProgressBar from './components/ProgressBar';
// 🔴 CRITICAL: Global ErrorBoundary to prevent white screen of death
import { ErrorBoundary } from './components/ErrorBoundary';
// NEW: Hook for robust loading state
import { useInitialLoad } from './hooks/useInitialLoad';

// ♿ Accessibility: Skip-to-content link for keyboard users
const SkipToContent = styled.a`
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  padding: 0.75rem 1.5rem;
  background: #2563EB;
  color: #fff;
  font-weight: 600;
  border-radius: 0 0 8px 8px;
  text-decoration: none;
  transition: top 0.2s ease;

  &:focus {
    top: 0;
  }
`;

// 🔧 Dev utilities (available in console)
if (process.env.NODE_ENV === 'development') {
  import('./utils/checkCarsStatus').then(module => {
    (window as any).checkCarsStatus = module.checkAllCarsStatus;
    (window as any).fixCarsStatus = module.fixAllCarsStatus;
    // Development helper functions registered
  });
}

/**
 * AppContent - Inner component with access to AuthProvider
 * This component is wrapped by AppProviders, so it can use useAuth safely
 */
const AppContent: React.FC = () => {
  // ✅ useInitialLoad waits for Auth + ProfileType before showing UI
  const { isReady, progress } = useInitialLoad();

  // Effect to handle the loader DOM element + progress display
  React.useEffect(() => {
    const loader = document.getElementById('loader-container');
    if (!loader) return;

    // Update progress percentage in the loader
    const progressEl = document.getElementById('loader-progress');
    if (progressEl) {
      progressEl.textContent = `${progress}%`;
    }
    const barEl = document.getElementById('loader-bar-fill');
    if (barEl) {
      barEl.style.width = `${progress}%`;
    }

    if (isReady) {
      // Final 100% flash, then fade out
      if (progressEl) progressEl.textContent = '100%';
      if (barEl) barEl.style.width = '100%';

      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.remove();
          logger.info('[App] Loader removed - App Ready');
        }, 500);
      }, 300); // Brief pause at 100% so user sees completion
    }
  }, [isReady, progress]);

  // Don't render the component tree until auth + profile are ready
  // This prevents hooks violations in child components that depend on permissions
  if (!isReady) {
    return null;
  }

  return (
    <>
      <AppRoutes />
      <InstallPrompt />
      <GuestExpirationModal />
      <ConsentBanner />
      <PendingFavoriteHandler />
      <ScrollToTop />
      <ProgressBar />
    </>
  );
};

const App: React.FC = () => {
  // Initialize activity tracker on mount
  React.useEffect(() => {
    IndexedDBActivityTracker.initialize();
  }, []);

  return (
    <ErrorBoundary>
      <SkipToContent href="#main-content" aria-label="Skip to main content">
        Преминете към съдържанието / Skip to content
      </SkipToContent>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
