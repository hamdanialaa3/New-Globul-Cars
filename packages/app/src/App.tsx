// src/App.tsx
// Main App Component for Bulgarian Car Marketplace with Global Translation System

import React, { Suspense } from 'react';
import { logger } from '@globul-cars/services';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
// ⚠️ TEMPORARY: Using local imports until symlink is created
// TODO: Change back to @globul-cars/core after symlink is created
import { LanguageProvider } from '@globul-cars/core/contexts/LanguageContext';
import { AuthProvider } from '@globul-cars/core/contexts/AuthProvider';
import { ProfileTypeProvider } from '@globul-cars/core/contexts/ProfileTypeContext';
import { ThemeProvider as CustomThemeProvider } from '@globul-cars/core/contexts/ThemeContext';
import { ToastProvider } from '@globul-cars/ui/components/Toast';
import { bulgarianTheme, GlobalStyles } from './styles/theme';
import './styles/mobile-responsive.css';
import './styles/typography-improved.css';
import './styles/premium-effects.css';
import ErrorBoundary from '@globul-cars/ui/components/ErrorBoundary';
// import RouteErrorBoundary from '@globul-cars/ui/componentsErrorBoundary/RouteErrorBoundary';
import { SkipNavigation } from '@globul-cars/ui/components/Accessibility';
import Header from '@globul-cars/ui/components/Header/Header';
import MobileHeader from '@globul-cars/ui/components/Header/MobileHeader'; // ✅ NEW: Mobile-only header
import { MobileBottomNav } from '@globul-cars/ui/components/layout'; // ✅ NEW: Mobile bottom navigation
import Footer from '@globul-cars/ui/components/Footer/Footer';
import ProtectedRoute from '@globul-cars/ui/components/ProtectedRoute';
import AdminRoute from '@globul-cars/ui/components/AdminRoute';
import AuthGuard from '@globul-cars/ui/components/AuthGuard';
import NotificationHandler from '@globul-cars/ui/components/NotificationHandler';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { FilterProvider } from '@globul-cars/core/contexts/FilterContext';
// import AnalyticsTracker from '@globul-cars/ui/componentsAnalyticsTracker';
import NotFoundPage from '@globul-cars/ui/components/NotFoundPage';
import FacebookPixel from '@globul-cars/ui/components/FacebookPixel';
import FloatingAddButton from '@globul-cars/ui/components/FloatingAddButton';
import AssistantHead from '@globul-cars/ui/components/AI/AssistantHead';
import { useIsMobile } from '@globul-cars/core';
import ProgressBar from '@globul-cars/ui/components/ProgressBar';
import { LoadingSpinner } from '@globul-cars/ui/components';
// Removed problematic imports
// import useAuthRedirectHandler from '@globul-cars/coreuseAuthRedirectHandler';

// Lazy load pages for better performance
// Architecture Diagram - Direct import (no lazy loading)
import ArchitectureDiagramPage from './pages/ArchitectureDiagramPage';
const HomePage = React.lazy(() => import('./pages/01_main-pages/home/HomePage'));
const CarsPage = React.lazy(() => import('./pages/01_main-pages/CarsPage'));
const CarDetailsPage = React.lazy(() => import('./pages/01_main-pages/CarDetailsPage'));
const SocialFeedPage = React.lazy(() => import('./pages/03_user-pages/social/SocialFeedPage'));

// Mobile.de-style sell workflow pages (الوحيد المستخدم)
const VehicleStartPage = React.lazy(() => import('./pages/04_car-selling/sell/VehicleStartPageNew'));
const MobileSellerTypePage = React.lazy(() => import('./pages/04_car-selling/sell/MobileSellerTypePage'));
const VehicleDataPageUnified = React.lazy(() => import('./pages/04_car-selling/sell/VehicleDataPageUnified'));
const EquipmentMainPage = React.lazy(() => import('./pages/04_car-selling/sell/EquipmentMainPage'));
const MobileEquipmentMainPage = React.lazy(() => import('./pages/04_car-selling/sell/MobileEquipmentMainPage'));
const MobilePricingPage = React.lazy(() => import('./pages/04_car-selling/sell/MobilePricingPage'));
const MobileContactPage = React.lazy(() => import('./pages/04_car-selling/sell/MobileContactPage'));
const MobilePreviewPage = React.lazy(() => import('./pages/04_car-selling/sell/MobilePreviewPage'));
const DesktopPreviewPage = React.lazy(() => import('./pages/04_car-selling/sell/DesktopPreviewPage'));
const MobileSubmissionPage = React.lazy(() => import('./pages/04_car-selling/sell/MobileSubmissionPage'));
const DesktopSubmissionPage = React.lazy(() => import('./pages/04_car-selling/sell/DesktopSubmissionPage'));
const SafetyEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/SafetyPage'));
const ComfortEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/ComfortPage'));
const InfotainmentEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/InfotainmentPage'));
const ExtrasEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/ExtrasPage'));
const UnifiedEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/UnifiedEquipmentPage'));
const ImagesPageUnified = React.lazy(() => import('./pages/04_car-selling/sell/ImagesPageUnified'));
const PricingPage = React.lazy(() => import('./pages/04_car-selling/sell/Pricing'));
const ContactNamePage = React.lazy(() => import('./pages/04_car-selling/sell/ContactNamePage'));
const ContactAddressPage = React.lazy(() => import('./pages/04_car-selling/sell/ContactAddressPage'));
const ContactPhonePage = React.lazy(() => import('./pages/04_car-selling/sell/ContactPhonePage'));
const UnifiedContactPage = React.lazy(() => import('./pages/04_car-selling/sell/UnifiedContactPage'));

const MessagesPage = React.lazy(() => import('./pages/03_user-pages/messages/MessagesPage'));
const AdminPage = React.lazy(() => import('./pages/06_admin/regular-admin/AdminPage'));
const AdminLoginPage = React.lazy(() => import('./pages/02_authentication/admin-login/AdminLoginPage'));
const AdminDataFix = React.lazy(() => import('./pages/06_admin/regular-admin/AdminDataFix'));
const SuperAdminLogin = React.lazy(() => import('./pages/02_authentication/admin-login/SuperAdminLoginPage'));
const SuperAdminDashboard = React.lazy(() => import('./pages/06_admin/super-admin/SuperAdminDashboard'));
const SuperAdminUsersPage = React.lazy(() => import('./pages/06_admin/super-admin/SuperAdminUsersPage'));

const ProfileRouter = React.lazy(() => import('./pages/03_user-pages/profile/ProfilePage/ProfileRouter'));  // NEW: Profile Type Router
const VerificationPage = React.lazy(() => import('./features/verification/VerificationPage'));  // NEW: Verification System
const BillingPage = React.lazy(() => import('./features/billing/BillingPage'));  // NEW: Billing System
const AnalyticsDashboard = React.lazy(() => import('./features/analytics/AnalyticsDashboard'));  // NEW: Analytics System
const TeamManagement = React.lazy(() => import('./features/team/TeamManagement'));  // NEW: Team Management
const UsersDirectoryPage = React.lazy(() => import('./pages/03_user-pages/users-directory/UsersDirectoryPage')); // Bubbles View
// ⚡ NEW: Browse Pages (All Posts, All Cars)
const AllPostsPage = React.lazy(() => import('./pages/03_user-pages/social/AllPostsPage'));
const AllCarsPage = React.lazy(() => import('./pages/05_search-browse/all-cars/AllCarsPage'));
// NEW: Social Platform Pages
const EventsPage = React.lazy(() => import('./pages/07_advanced-features/EventsPage'));  // NEW: Events Page with BG/EN translations - NOT MIGRATED YET
const CreatePostPage = React.lazy(() => import('./pages/03_user-pages/social/CreatePostPage')); // NEW: Create Post Page
const OAuthCallback = React.lazy(() => import('./pages/02_authentication/oauth/OAuthCallbackPage')); // NEW: OAuth Callback Handler
// Glass Morphism Premium Auth Pages
const LoginPage = React.lazy(() => import('./pages/02_authentication/login/LoginPage/LoginPageGlassFixed'));
const RegisterPage = React.lazy(() => import('./pages/02_authentication/register/RegisterPage/RegisterPageGlassFixed'));
const EmailVerificationPage = React.lazy(() => import('./pages/02_authentication/verification/EmailVerificationPage'));
const DashboardPage = React.lazy(() => import('./pages/03_user-pages/dashboard/DashboardPage'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const ThemeTest = React.lazy(() => import('./components/ThemeTest'));
const BackgroundTest = React.lazy(() => import('./components/BackgroundTest'));
const FullThemeDemo = React.lazy(() => import('./components/FullThemeDemo'));
const EffectsTest = React.lazy(() => import('./components/EffectsTest'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/10_legal/privacy-policy/PrivacyPolicyPage'));
const TermsOfServicePage = React.lazy(() => import('./pages/10_legal/terms-of-service/TermsOfServicePage'));
const DataDeletionPage = React.lazy(() => import('./pages/10_legal/data-deletion/DataDeletionPage'));
const AdvancedSearchPage = React.lazy(() => import('./pages/05_search-browse/advanced-search/AdvancedSearchPage'));
const MyListingsPage = React.lazy(() => import('./pages/03_user-pages/my-listings/MyListingsPage'));
const MyDraftsPage = React.lazy(() => import('./pages/03_user-pages/my-drafts/MyDraftsPage'));
const MigrationPage = React.lazy(() => import('./pages/06_admin/MigrationPage'));
// ArchitectureDiagramPage is imported above (line 44)
const TestDiagramPage = React.lazy(() => import('./pages/TestDiagramPage'));
const DebugCarsPage = React.lazy(() => import('./pages/06_admin/DebugCarsPage'));
const EditCarPage = React.lazy(() => import('./pages/04_car-selling/EditCarPage'));
const N8nTestPage = React.lazy(() => import('./pages/11_testing-dev/N8nTestPage'));
const TestDropdownsPage = React.lazy(() => import('./pages/11_testing-dev/TestDropdownsPage'));
const B2BAnalyticsPortal = React.lazy(() => import('./pages/07_advanced-features/B2BAnalyticsPortal'));
const DigitalTwinPage = React.lazy(() => import('./pages/07_advanced-features/DigitalTwinPage'));
const SubscriptionPage = React.lazy(() => import('./pages/08_payment-billing/SubscriptionPage'));
const AboutPage = React.lazy(() => import('./pages/01_main-pages/about/AboutPage'));
const BrandGalleryPage = React.lazy(() => import('./pages/05_search-browse/brand-gallery/BrandGalleryPage'));
const TopBrandsPage = React.lazy(() => import('./pages/05_search-browse/top-brands/TopBrandsPage'));
const DealersPage = React.lazy(() => import('./pages/05_search-browse/dealers/DealersPage'));
const FinancePage = React.lazy(() => import('./pages/05_search-browse/finance/FinancePage'));
const ContactPage = React.lazy(() => import('./pages/01_main-pages/contact/ContactPage'));
const HelpPage = React.lazy(() => import('./pages/01_main-pages/help/HelpPage'));
const CookiePolicyPage = React.lazy(() => import('./pages/10_legal/cookie-policy/CookiePolicyPage'));
const SitemapPage = React.lazy(() => import('./pages/10_legal/sitemap/SitemapPage'));
const NotificationsPage = React.lazy(() => import('./pages/03_user-pages/notifications/NotificationsPage'));
const SavedSearchesPage = React.lazy(() => import('./pages/03_user-pages/saved-searches/SavedSearchesPage'));
const FavoritesPage = React.lazy(() => import('./pages/03_user-pages/favorites/FavoritesPage'));
const DealerPublicPage = React.lazy(() => import('./pages/09_dealer-company/DealerPublicPage'));  // NEW: Public Dealer Profiles

// NEW: P2 Frontend Integration - Invoices & Commissions
const InvoicesPage = React.lazy(() => import('./pages/08_payment-billing/InvoicesPage'));
const CommissionsPage = React.lazy(() => import('./pages/08_payment-billing/CommissionsPage'));

// NEW: Payment & Checkout Pages
const CheckoutPage = React.lazy(() => import('./pages/08_payment-billing/CheckoutPage'));
const PaymentSuccessPage = React.lazy(() => import('./pages/08_payment-billing/PaymentSuccessPage'));
const BillingSuccessPage = React.lazy(() => import('./pages/08_payment-billing/BillingSuccessPage'));
const BillingCanceledPage = React.lazy(() => import('./pages/08_payment-billing/BillingCanceledPage'));

// NEW: Dealer Pages
const DealerRegistrationPage = React.lazy(() => import('./pages/09_dealer-company/DealerRegistrationPage'));
const DealerDashboardPage = React.lazy(() => import('./pages/09_dealer-company/DealerDashboardPage'));

// NEW: Admin & Development Pages
const AdminCarManagementPage = React.lazy(() => import('./pages/06_admin/regular-admin/AdminCarManagementPage'));
const IconShowcasePage = React.lazy(() => import('./pages/11_testing-dev/IconShowcasePage'));

// NEW: IoT Pages
const IoTDashboardPage = React.lazy(() => import('./pages/03_user-pages/IoTDashboardPage'));
const CarTrackingPage = React.lazy(() => import('./pages/03_user-pages/CarTrackingPage'));
const IoTAnalyticsPage = React.lazy(() => import('./pages/03_user-pages/IoTAnalyticsPage'));

// NEW: AI Dashboard
const AIDashboardPage = React.lazy(() => import('./pages/03_user-pages/ai-dashboard/AIDashboardPage'));
const AIQuotaManager = React.lazy(() => import('./pages/06_admin/AIQuotaManager'));

// NEW: Integration & Setup Pages
const IntegrationStatusDashboard = React.lazy(() => import('./components/admin/IntegrationStatusDashboard'));
const QuickSetupPage = React.lazy(() => import('./pages/06_admin/QuickSetupPage'));
const CloudServicesManager = React.lazy(() => import('./pages/06_admin/CloudServicesManager'));

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="main-layout" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header role="banner">
        {/* ✅ Desktop Header - Hidden on mobile */}
        <div className="desktop-header-only">
          <Header />
        </div>
        {/* ✅ Mobile Header - Visible only on mobile/tablet portrait */}
        <div className="mobile-header-only">
          <MobileHeader />
        </div>
      </header>
      <main
        id="main-content"
        role="main"
        style={{
          flex: 1,
          padding: '0', // ❌ REMOVED: No padding on mobile - causes yellow transparent frame
          paddingBottom: '80px' // ✅ Space for mobile bottom nav
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
      {/* ✅ Mobile Bottom Navigation - Visible only on mobile */}
      <MobileBottomNav />
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

// Loading fallback is provided inline where needed (simple spinner)

// App Component
const App: React.FC = () => {
  const recaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  // Note: reCAPTCHA is optional for development
  // In production, consider adding the key to .env
  if (!recaptchaKey && process.env.NODE_ENV === 'production') {
    logger.warn('reCAPTCHA Site Key is not configured');
  }

  return (
    <ThemeProvider theme={bulgarianTheme}>
      <GlobalStyles />
      <ErrorBoundary>
        <LanguageProvider>
          <CustomThemeProvider>
            <AuthProvider>
              <ProfileTypeProvider>
              <ToastProvider>
                <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey || "dummy-key"}>
                  <Router>
                  {/* Unified filter context (search + listings). Nested to preserve critical provider order. */}
                  <FilterProvider>
                  <FacebookPixel />
                  {/* <FacebookMessengerWidget /> - Temporarily disabled */}
                  <SkipNavigation />
                  <NotificationHandler />
                  <Suspense fallback={<ProgressBar duration={2000} />}>
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
                      
                      {/* OAuth Callback - Full Screen (no header/footer) */}
                      <Route path="/oauth/callback" element={
                        <FullScreenLayout>
                          <OAuthCallback />
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
                      <Route path="/super-admin/users" element={
                        <FullScreenLayout>
                          <SuperAdminUsersPage />
                        </FullScreenLayout>
                      } />
                      
                      {/* Test Diagram Page - للاختبار */}
                      <Route path="/test-diagram" element={
                        <FullScreenLayout>
                          <TestDiagramPage />
                        </FullScreenLayout>
                      } />
                      
                      {/* Architecture Diagram - Full Screen */}
                      <Route path="/diagram" element={
                        <FullScreenLayout>
                          <ArchitectureDiagramPage />
                        </FullScreenLayout>
                      } />
                      
                      {/* All other routes with header/footer */}
                      <Route path="/*" element={<MainLayout />} />
                    </Routes>
                  </Suspense>
                  </FilterProvider>
                </Router>
              </GoogleReCaptchaProvider>
            </ToastProvider>
            </ProfileTypeProvider>
          </AuthProvider>
          </CustomThemeProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

const MainLayout: React.FC = () => {
  const isMobile = useIsMobile();
  return (
  <Layout>
    <FloatingAddButton />
    <AssistantHead />
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/social" element={<SocialFeedPage />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/cars/:id" element={<CarDetailsPage />} />
        <Route path="/car/:id" element={<CarDetailsPage />} />
      
      {/* Dealer Routes */}
      <Route path="/dealer/:slug" element={<DealerPublicPage />} />
      <Route path="/dealer-registration" element={<DealerRegistrationPage />} />
      <Route
        path="/dealer-dashboard"
        element={
          <ProtectedRoute>
            <DealerDashboardPage />
          </ProtectedRoute>
        }
      />
      
      {/* Unified Sell System - بدء التجربة مباشرة من /sell/auto */}
      <Route path="/sell" element={<Navigate to="/sell/auto" replace />} />
      {/* Redirect old routes to new system */}
      <Route path="/sell-car" element={<Navigate to="/sell/auto" replace />} />
      <Route path="/add-car" element={<Navigate to="/sell/auto" replace />} />
      
      {/* Social Feed - Create Post */}
      <Route path="/create-post" element={<CreatePostPage />} />
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
            <MobileSellerTypePage />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/fahrzeugdaten/antrieb-und-umwelt"
        element={
          <AuthGuard requireAuth={true}>
            <VehicleDataPageUnified />
          </AuthGuard>
        }
      />
      {/* NEW: Unified Equipment Page - All Features in One Place */}
      <Route
        path="/sell/inserat/:vehicleType/equipment"
        element={
          <AuthGuard requireAuth={true}>
            <UnifiedEquipmentPage />
          </AuthGuard>
        }
      />
      
      {/* Legacy Equipment Routes - Keep for backward compatibility */}
      <Route
        path="/sell/inserat/:vehicleType/ausstattung"
        element={
          <AuthGuard requireAuth={true}>
              {isMobile ? <MobileEquipmentMainPage /> : <EquipmentMainPage />}
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
            <ImagesPageUnified />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/details/preis"
        element={
          <AuthGuard requireAuth={true}>
              {isMobile ? <MobilePricingPage /> : <PricingPage />}
          </AuthGuard>
        }
      />
      {/* NEW: Unified Contact Page - All Contact Info in One Place */}
      <Route
        path="/sell/inserat/:vehicleType/contact"
        element={
          <AuthGuard requireAuth={true}>
              {isMobile ? <MobileContactPage /> : <UnifiedContactPage />}
          </AuthGuard>
        }
      />

      {/* Preview / Summary step before submission */}
      <Route
        path="/sell/inserat/:vehicleType/preview"
        element={
          <AuthGuard requireAuth={true}>
              {isMobile ? <MobilePreviewPage /> : <DesktopPreviewPage />}
          </AuthGuard>
        }
      />

      {/* Final submission step */}
      <Route
        path="/sell/inserat/:vehicleType/submission"
        element={
          <AuthGuard requireAuth={true}>
              {isMobile ? <MobileSubmissionPage /> : <DesktopSubmissionPage />}
          </AuthGuard>
        }
      />

      {/* Legacy Contact Routes - Keep for backward compatibility */}
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
  {/* Profile routes - single entry; nested router handles both index and :userId */}
  <Route path="/profile/*" element={<ProfileRouter />} />
      <Route path="/verification" element={<VerificationPage />} />  {/* NEW: Verification System */}
      <Route path="/billing" element={<BillingPage />} />  {/* NEW: Billing System */}
      
      {/* NEW: Payment & Checkout Routes */}
      <Route
        path="/checkout/:carId"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-success/:transactionId"
        element={
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/success"
        element={
          <ProtectedRoute>
            <BillingSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/canceled"
        element={
          <ProtectedRoute>
            <BillingCanceledPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="/analytics" element={<AnalyticsDashboard />} />  {/* NEW: Analytics System */}
      <Route path="/team" element={<TeamManagement />} />  {/* NEW: Team Management */}
      <Route path="/users" element={<UsersDirectoryPage />} />
      {/* Redirect /all-users to /users */}
      <Route path="/all-users" element={<UsersDirectoryPage />} />
      {/* ⚡ NEW: Browse Pages */}
      <Route path="/all-posts" element={<AllPostsPage />} />
      <Route path="/all-cars" element={<AllCarsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      
      {/* NEW: Social Platform Routes */}
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <EventsPage />
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
        path="/admin-car-management"
        element={
          <AdminRoute>
            <AdminCarManagementPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/data-fix"
        element={
          <AdminRoute>
            <AdminDataFix />
          </AdminRoute>
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
      
      {/* NEW: Invoices & Commissions Pages - P2 Integration */}
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <InvoicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/commissions"
        element={
          <ProtectedRoute>
            <CommissionsPage />
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

      {/* Icon Showcase Page */}
      <Route path="/icon-showcase" element={<IconShowcasePage />} />

      {/* IoT Pages */}
      <Route
        path="/iot-dashboard"
        element={
          <ProtectedRoute>
            <IoTDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/car-tracking"
        element={
          <ProtectedRoute>
            <CarTrackingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/iot-analytics"
        element={
          <ProtectedRoute>
            <IoTAnalyticsPage />
          </ProtectedRoute>
        }
      />
      
      {/* AI Dashboard */}
      <Route
        path="/ai-dashboard"
        element={
          <ProtectedRoute>
            <AIDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ai-quotas"
        element={
          <ProtectedRoute>
            <AIQuotaManager />
          </ProtectedRoute>
        }
      />
      
      {/* Integration & Setup Pages */}
      <Route
        path="/admin/integration-status"
        element={
          <ProtectedRoute>
            <IntegrationStatusDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/setup"
        element={
          <ProtectedRoute>
            <QuickSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cloud-services"
        element={
          <ProtectedRoute>
            <CloudServicesManager />
          </ProtectedRoute>
        }
      />

      {/* N8N Integration Test Page */}
      <Route path="/n8n-test" element={<N8nTestPage />} />

      {/* Dropdowns Test Page */}
      <Route path="/test-dropdowns" element={<TestDropdownsPage />} />

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
        path="/my-drafts"
        element={
          <ProtectedRoute>
            <MyDraftsPage />
          </ProtectedRoute>
        }
      />
            <Route
              path="/edit-car/:carId"
              element={
                <ProtectedRoute>
                  <EditCarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/car-details/:carId"
              element={
                <ProtectedRoute>
                  <CarDetailsPage />
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
      
      {/* Migration Page */}
      <Route
        path="/migration"
        element={
          <ProtectedRoute>
            <MigrationPage />
          </ProtectedRoute>
        }
      />
      
      {/* Debug Cars Page */}
      <Route
        path="/debug-cars"
        element={
          <ProtectedRoute>
            <DebugCarsPage />
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
    </Suspense>
  </Layout>
  );
};

export default App;
