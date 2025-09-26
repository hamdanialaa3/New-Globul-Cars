// src/App.tsx
// Main App Component for Bulgarian Car Marketplace

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { TranslationProvider } from './hooks/useTranslation';
import { AuthProvider } from './context/AuthProvider';
import { bulgarianTheme, GlobalStyles } from './styles/theme';
import ErrorBoundary from './components/ErrorBoundary';
import { SkipNavigation } from './components/Accessibility';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
// import AnalyticsTracker from './components/AnalyticsTracker';
import PerformanceMonitor from './components/PerformanceMonitor';
import BundleAnalyzer from './components/BundleAnalyzer';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const CarsPage = React.lazy(() => import('./pages/CarsPage'));
const CarDetailsPage = React.lazy(() => import('./pages/CarDetailsPage'));
const SellCarPage = React.lazy(() => import('./pages/SellCarPage'));
const SellPage = React.lazy(() => import('./pages/SellPage'));
const VehicleSelectionPage = React.lazy(() => import('./pages/VehicleSelectionPage'));
const SellerTypePage = React.lazy(() => import('./pages/SellerTypePage'));
const VehicleDataPage = React.lazy(() => import('./pages/VehicleDataPage'));

// Mobile.de-style sell workflow pages
const VehicleStartPage = React.lazy(() => import('./pages/sell/VehicleStartPage'));
const SellerTypePageNew = React.lazy(() => import('./pages/sell/SellerTypePage'));
const VehicleDataPageNew = React.lazy(() => import('./pages/sell/VehicleDataPage'));
const EquipmentMainPage = React.lazy(() => import('./pages/sell/EquipmentMainPage'));
const SafetyEquipmentPage = React.lazy(() => import('./pages/sell/SafetyEquipmentPage'));
const ComfortEquipmentPage = React.lazy(() => import('./pages/sell/ComfortEquipmentPage'));
const InfotainmentEquipmentPage = React.lazy(() => import('./pages/sell/InfotainmentEquipmentPage'));
const ExtrasEquipmentPage = React.lazy(() => import('./pages/sell/ExtrasEquipmentPage'));
const ImagesPage = React.lazy(() => import('./pages/sell/ImagesPage'));
const PricingPage = React.lazy(() => import('./pages/sell/PricingPage'));
const ContactNamePage = React.lazy(() => import('./pages/sell/ContactNamePage'));
const ContactAddressPage = React.lazy(() => import('./pages/sell/ContactAddressPage'));
const ContactPhonePage = React.lazy(() => import('./pages/sell/ContactPhonePage'));
const MessagingPage = React.lazy(() => import('./pages/MessagingPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
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
const B2BAnalyticsPortal = React.lazy(() => import('./pages/B2BAnalyticsPortal'));
const DigitalTwinPage = React.lazy(() => import('./pages/DigitalTwinPage'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const HelpPage = React.lazy(() => import('./pages/HelpPage'));
const CookiePolicyPage = React.lazy(() => import('./pages/CookiePolicyPage'));
const SitemapPage = React.lazy(() => import('./pages/SitemapPage'));

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
        style={{ flex: 1 }}
        tabIndex={-1}
      >
        {children}
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
  return (
    <ThemeProvider theme={bulgarianTheme}>
      {/* Router must wrap ErrorBoundary to ensure any Link in fallback has Router context */}
      <Router>
        <ErrorBoundary>
          <AuthProvider>
            <TranslationProvider>
              <SkipNavigation />
              <GlobalStyles />
              <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Full-screen pages */}
              <Route
                path="/login"
                element={
                  <FullScreenLayout>
                    <LoginPage />
                  </FullScreenLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <FullScreenLayout>
                    <RegisterPage />
                  </FullScreenLayout>
                }
              />

              {/* Pages with header/footer */}
              <Route
                path="/"
                element={
                  <Layout>
                    <HomePage />
                  </Layout>
                }
              />
              <Route
                path="/cars"
                element={
                  <Layout>
                    <CarsPage />
                  </Layout>
                }
              />
              <Route
                path="/cars/:id"
                element={
                  <Layout>
                    <CarDetailsPage />
                  </Layout>
                }
              />
              {/* Keep both '/sell-car' and '/sell' for compatibility */}
              <Route
                path="/sell-car"
                element={
                  <Layout>
                    <SellCarPage />
                  </Layout>
                }
              />
              <Route
                path="/sell"
                element={
                  <Layout>
                    <SellPage />
                  </Layout>
                }
              />
              {/* Mobile.de-style sell workflow */}
              <Route
                path="/sell/auto"
                element={
                  <Layout>
                    <VehicleStartPage />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/verkaeufertyp"
                element={
                  <Layout>
                    <SellerTypePageNew />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/fahrzeugdaten/antrieb-und-umwelt"
                element={
                  <Layout>
                    <VehicleDataPageNew />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/ausstattung"
                element={
                  <Layout>
                    <EquipmentMainPage />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/ausstattung/sicherheit"
                element={
                  <Layout>
                    <SafetyEquipmentPage />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/ausstattung/komfort"
                element={
                  <Layout>
                    <ComfortEquipmentPage />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/ausstattung/infotainment"
                element={
                  <Layout>
                    <InfotainmentEquipmentPage />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/ausstattung/extras"
                element={
                  <Layout>
                    <ExtrasEquipmentPage />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/details/bilder"
                element={
                  <Layout>
                    <ImagesPage />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/details/preis"
                element={
                  <Layout>
                    <PricingPage />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/kontakt/name"
                element={
                  <Layout>
                    <ContactNamePage />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/kontakt/adresse"
                element={
                  <Layout>
                    <ContactAddressPage />
                  </Layout>
                }
              />
              <Route
                path="/sell/inserat/:vehicleType/kontakt/telefonnummer"
                element={
                  <Layout>
                    <ContactPhonePage />
                  </Layout>
                }
              />
              <Route
                path="/sell/vehicle-selection"
                element={
                  <Layout>
                    <VehicleSelectionPage />
                  </Layout>
                }
              />
              <Route
                path="/sell/seller-type"
                element={
                  <Layout>
                    <SellerTypePage />
                  </Layout>
                }
              />
              <Route
                path="/sell/vehicle-data"
                element={
                  <Layout>
                    <VehicleDataPage />
                  </Layout>
                }
              />
              <Route
                path="/profile"
                element={
                  <Layout>
                    <ProfilePage />
                  </Layout>
                }
              />
              <Route
                path="/messages"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <MessagingPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/admin"
                element={
                  <Layout>
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  </Layout>
                }
              />

              {/* Theme Test Page */}
              <Route
                path="/theme-test"
                element={
                  <Layout>
                    <ThemeTest />
                  </Layout>
                }
              />

              {/* Background Test Page */}
              <Route
                path="/background-test"
                element={
                  <Layout>
                    <BackgroundTest />
                  </Layout>
                }
              />

              {/* Full Theme Demo Page */}
              <Route
                path="/full-demo"
                element={
                  <Layout>
                    <FullThemeDemo />
                  </Layout>
                }
              />

              {/* Effects Test Page */}
              <Route
                path="/effects-test"
                element={
                  <Layout>
                    <EffectsTest />
                  </Layout>
                }
              />

              {/* Advanced Features */}
              <Route
                path="/advanced-search"
                element={
                  <Layout>
                    <AdvancedSearchPage />
                  </Layout>
                }
              />
              <Route
                path="/analytics"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <B2BAnalyticsPortal />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/digital-twin"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <DigitalTwinPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />
              <Route
                path="/subscription"
                element={
                  <Layout>
                    <ProtectedRoute>
                      <SubscriptionPage />
                    </ProtectedRoute>
                  </Layout>
                }
              />

              {/* Legal Pages */}
              <Route
                path="/privacy-policy"
                element={
                  <Layout>
                    <PrivacyPolicyPage />
                  </Layout>
                }
              />
              <Route
                path="/terms-of-service"
                element={
                  <Layout>
                    <TermsOfServicePage />
                  </Layout>
                }
              />
              <Route
                path="/data-deletion"
                element={
                  <Layout>
                    <DataDeletionPage />
                  </Layout>
                }
              />

              {/* Additional Pages */}
              <Route
                path="/about"
                element={
                  <Layout>
                    <AboutPage />
                  </Layout>
                }
              />
              <Route
                path="/contact"
                element={
                  <Layout>
                    <ContactPage />
                  </Layout>
                }
              />
              <Route
                path="/help"
                element={
                  <Layout>
                    <HelpPage />
                  </Layout>
                }
              />
              <Route
                path="/cookie-policy"
                element={
                  <Layout>
                    <CookiePolicyPage />
                  </Layout>
                }
              />
              <Route
                path="/sitemap"
                element={
                  <Layout>
                    <SitemapPage />
                  </Layout>
                }
              />

              {/* 404 Page */}
              <Route
                path="*"
                element={
                  <Layout>
                    <div style={{
                      textAlign: 'center',
                      padding: '4rem 2rem',
                      minHeight: '50vh',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
                      <h2 style={{ marginBottom: '2rem' }}>Страницата не е намерена</h2>
                      <p style={{ marginBottom: '2rem', color: '#666' }}>
                        Страницата, която търсите, не съществува или е преместена.
                      </p>
                      <a
                        href="/"
                        style={{
                          padding: '12px 24px',
                          background: '#1976d2',
                          color: 'white',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: 'bold'
                        }}
                      >
                        Към началната страница
                      </a>
                    </div>
                  </Layout>
                }
              />
            </Routes>
          </Suspense>
            </TranslationProvider>
          </AuthProvider>
        </ErrorBoundary>
      </Router>
      <PerformanceMonitor />
      <BundleAnalyzer />
    </ThemeProvider>
  );
};

export default App;
