// src/App.tsx
// Main App Component for Bulgarian Car Marketplace with Global Translation System

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './context/AuthProvider';
import { ToastProvider } from './components/Toast';
import { bulgarianTheme, GlobalStyles } from './styles/theme';
import ErrorBoundary from './components/ErrorBoundary';
import { SkipNavigation } from './components/Accessibility';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AuthGuard from './components/AuthGuard';
import NotificationHandler from './components/NotificationHandler';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
// import AnalyticsTracker from './components/AnalyticsTracker';
import PerformanceMonitor from './components/PerformanceMonitor';
import BundleAnalyzer from './components/BundleAnalyzer';
import NotFoundPage from './components/NotFoundPage';
import FacebookPixel from './components/FacebookPixel';
import FacebookMessengerWidget from './components/FacebookMessengerWidget';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const CarsPage = React.lazy(() => import('./pages/CarsPage'));
const CarDetailsPage = React.lazy(() => import('./pages/CarDetailsPage'));
const SellPage = React.lazy(() => import('./pages/SellPageNew'));

// Mobile.de-style sell workflow pages (الوحيد المستخدم)
const VehicleStartPage = React.lazy(() => import('./pages/sell/VehicleStartPageNew'));
const SellerTypePageNew = React.lazy(() => import('./pages/sell/SellerTypePageNew'));
const VehicleDataPageNew = React.lazy(() => import('./pages/sell/VehicleData'));
const EquipmentMainPage = React.lazy(() => import('./pages/sell/EquipmentMainPage'));
const SafetyEquipmentPage = React.lazy(() => import('./pages/sell/Equipment/SafetyPage'));
const ComfortEquipmentPage = React.lazy(() => import('./pages/sell/Equipment/ComfortPage'));
const InfotainmentEquipmentPage = React.lazy(() => import('./pages/sell/Equipment/InfotainmentPage'));
const ExtrasEquipmentPage = React.lazy(() => import('./pages/sell/Equipment/ExtrasPage'));
const ImagesPage = React.lazy(() => import('./pages/sell/Images'));
const PricingPage = React.lazy(() => import('./pages/sell/Pricing'));
const ContactNamePage = React.lazy(() => import('./pages/sell/ContactNamePage'));
const ContactAddressPage = React.lazy(() => import('./pages/sell/ContactAddressPage'));
const ContactPhonePage = React.lazy(() => import('./pages/sell/ContactPhonePage'));
const MessagingPage = React.lazy(() => import('./pages/MessagingPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const AdminLoginPage = React.lazy(() => import('./pages/AdminLoginPage'));
const SuperAdminLogin = React.lazy(() => import('./pages/SuperAdminLogin'));
const SuperAdminDashboard = React.lazy(() => import('./pages/SuperAdminDashboardNew'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
// Auth Pages (using original working version)
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const EmailVerificationPage = React.lazy(() => import('./pages/EmailVerificationPage'));
const GoogleAuthTest = React.lazy(() => import('./pages/GoogleAuthTest'));
// const SimpleGoogleTest = React.lazy(() => import('./pages/SimpleGoogleTest')); // Moved to DDD/
// const MessagesPage = React.lazy(() => import('./pages/MessagesPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const ThemeTest = React.lazy(() => import('./components/ThemeTest'));
const BackgroundTest = React.lazy(() => import('./components/BackgroundTest'));
const FullThemeDemo = React.lazy(() => import('./components/FullThemeDemo'));
const EffectsTest = React.lazy(() => import('./components/EffectsTest'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = React.lazy(() => import('./pages/TermsOfServicePage'));
const DataDeletionPage = React.lazy(() => import('./pages/DataDeletionPage'));
const AdvancedSearchPage = React.lazy(() => import('./pages/AdvancedSearchPage'));
const CleanGoogleAuthTest = React.lazy(() => import('./components/CleanGoogleAuthTest'));
const MyListingsPage = React.lazy(() => import('./pages/MyListingsPage'));
const B2BAnalyticsPortal = React.lazy(() => import('./pages/B2BAnalyticsPortal'));
const DigitalTwinPage = React.lazy(() => import('./pages/DigitalTwinPage'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const BrandGalleryPage = React.lazy(() => import('./pages/BrandGalleryPage'));
const TopBrandsPage = React.lazy(() => import('./pages/TopBrandsPage'));
const DealersPage = React.lazy(() => import('./pages/DealersPage'));
const FinancePage = React.lazy(() => import('./pages/FinancePage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const HelpPage = React.lazy(() => import('./pages/HelpPage'));
const CookiePolicyPage = React.lazy(() => import('./pages/CookiePolicyPage'));
const SitemapPage = React.lazy(() => import('./pages/SitemapPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const SavedSearchesPage = React.lazy(() => import('./pages/SavedSearchesPage'));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'));

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f8fafc'
    }}>
      <header role="banner">
        <Header />
      </header>
      <main
        id="main-content"
        role="main"
        style={{
          flex: 1,
          padding: '0 1rem'
        }}
        tabIndex={-1}
      >
        <div className="page-container">
          {children}
        </div>
      </main>
      <footer role="contentinfo">
        <Footer />
      </footer>
    </div>
  );
};

// Full-screen pages (no header/footer)
const FullScreenLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <main
        id="main-content"
        role="main"
        style={{ minHeight: '100vh' }}
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
};

// Loading component for lazy loaded pages
const PageLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div className="loading-spinner" />
    <p>Loading...</p>
  </div>
);

// App Component
const App: React.FC = () => {
  const recaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  if (!recaptchaKey) {
    // In a real app, you might want to show an error page or have a fallback.
    console.error("reCAPTCHA Site Key is not defined in environment variables.");
    // For this example, we'll render the app without reCAPTCHA protection.
    // A better approach would be to prevent the app from running without it.
  }

  return (
    <ThemeProvider theme={bulgarianTheme}>
      <GlobalStyles />
      <ErrorBoundary>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey || "dummy-key"}>
                <Router>
                  <FacebookPixel />
                  {/* <FacebookMessengerWidget /> - Temporarily disabled */}
                  <SkipNavigation />
                  <NotificationHandler />
                  <Suspense fallback={<div className="loading-spinner"></div>}>
                    <Routes>
                      {/* Auth Routes - Full Screen (no header/footer) */}
                      <Route path="/login" element={
                        <FullScreenLayout>
                          <LoginPage />
                        </FullScreenLayout>
                      } />
                      <Route path="/register" element={
                        <FullScreenLayout>
                          <RegisterPage />
                        </FullScreenLayout>
                      } />
                      <Route path="/verification" element={
                        <FullScreenLayout>
                          <EmailVerificationPage />
                        </FullScreenLayout>
                      } />
                      
                      {/* Super Admin Routes - Full Screen (no header/footer) */}
                      <Route path="/super-admin-login" element={
                        <FullScreenLayout>
                          <SuperAdminLogin />
                        </FullScreenLayout>
                      } />
                      <Route path="/super-admin" element={
                        <FullScreenLayout>
                          <SuperAdminDashboard />
                        </FullScreenLayout>
                      } />
                      
                      {/* All other routes with header/footer */}
                      <Route path="/*" element={<MainLayout />} />
                    </Routes>
                  </Suspense>
                </Router>
              </GoogleReCaptchaProvider>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

const MainLayout: React.FC = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cars" element={<CarsPage />} />
      <Route path="/cars/:id" element={<CarDetailsPage />} />
      {/* Unified Sell System - Mobile.de Style Only */}
      <Route path="/sell" element={<SellPage />} />
      {/* Redirect old routes to new system */}
      <Route path="/sell-car" element={<SellPage />} />
      <Route path="/add-car" element={<SellPage />} />
      {/* Mobile.de-style sell workflow */}
      <Route
        path="/sell/auto"
        element={
          <AuthGuard requireAuth={true}>
            <VehicleStartPage />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/verkaeufertyp"
        element={
          <AuthGuard requireAuth={true}>
            <SellerTypePageNew />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/fahrzeugdaten/antrieb-und-umwelt"
        element={
          <AuthGuard requireAuth={true}>
            <VehicleDataPageNew />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/ausstattung"
        element={
          <AuthGuard requireAuth={true}>
            <EquipmentMainPage />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/ausstattung/sicherheit"
        element={
          <AuthGuard requireAuth={true}>
            <SafetyEquipmentPage />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/ausstattung/komfort"
        element={
          <AuthGuard requireAuth={true}>
            <ComfortEquipmentPage />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/ausstattung/infotainment"
        element={
          <AuthGuard requireAuth={true}>
            <InfotainmentEquipmentPage />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/ausstattung/extras"
        element={
          <AuthGuard requireAuth={true}>
            <ExtrasEquipmentPage />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/details/bilder"
        element={
          <AuthGuard requireAuth={true}>
            <ImagesPage />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/details/preis"
        element={
          <AuthGuard requireAuth={true}>
            <PricingPage />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/kontakt/name"
        element={
          <AuthGuard requireAuth={true}>
            <ContactNamePage />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/kontakt/adresse"
        element={
          <AuthGuard requireAuth={true}>
            <ContactAddressPage />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/kontakt/telefonnummer"
        element={
          <AuthGuard requireAuth={true}>
            <ContactPhonePage />
          </AuthGuard>
        }
      />
      <Route path="/profile" element={<ProfilePage />} />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagingPage />
          </ProtectedRoute>
        }
      />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-searches"
        element={
          <ProtectedRoute>
            <SavedSearchesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Theme Test Page */}
      <Route path="/theme-test" element={<ThemeTest />} />

      {/* Background Test Page */}
      <Route path="/background-test" element={<BackgroundTest />} />

      {/* Full Theme Demo Page */}
      <Route path="/full-demo" element={<FullThemeDemo />} />

      {/* Effects Test Page */}
      <Route path="/effects-test" element={<EffectsTest />} />

      {/* Advanced Features */}
      <Route
        path="/advanced-search"
        element={
          <AuthGuard requireAuth={true}>
            <AdvancedSearchPage />
          </AuthGuard>
        }
      />
      {/* New Car Listing System */}
      <Route
        path="/my-listings"
        element={
          <ProtectedRoute>
            <MyListingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <B2BAnalyticsPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/digital-twin"
        element={
          <ProtectedRoute>
            <DigitalTwinPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        }
      />

      {/* Legal Pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/data-deletion" element={<DataDeletionPage />} />

      {/* Additional Pages */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/top-brands" element={<TopBrandsPage />} />
      <Route
        path="/brand-gallery"
        element={
          <AuthGuard requireAuth={true}>
            <BrandGalleryPage />
          </AuthGuard>
        }
      />
      <Route
        path="/dealers"
        element={
          <AuthGuard requireAuth={true}>
            <DealersPage />
          </AuthGuard>
        }
      />
      <Route
        path="/finance"
        element={
          <AuthGuard requireAuth={true}>
            <FinancePage />
          </AuthGuard>
        }
      />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/support" element={<HelpPage />} /> {/* Support redirects to Help */}
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />
      <Route path="/sitemap" element={<SitemapPage />} />

      {/* 404 Page - Already wrapped in Layout by MainLayout */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Layout>
);

export default App;
