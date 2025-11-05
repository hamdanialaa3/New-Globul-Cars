// src/App.tsx
// Main App Component for Bulgarian Car Marketplace with Global Translation System

import React, { Suspense } from 'react';
import { logger } from './services/logger-service';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthProvider';
import { ProfileTypeProvider } from './contexts/ProfileTypeContext';  // NEW: Profile Type System
import { ToastProvider } from './components/Toast';
import { bulgarianTheme, GlobalStyles } from './styles/theme';
import './styles/mobile-responsive.css';
import ErrorBoundary from './components/ErrorBoundary';
import RouteErrorBoundary from './components/ErrorBoundary/RouteErrorBoundary';
import { SkipNavigation } from './components/Accessibility';
import Header from './components/Header/Header';
import MobileHeader from './components/Header/MobileHeader'; // ✅ NEW: Mobile-only header
import { MobileBottomNav } from './components/layout'; // ✅ NEW: Mobile bottom navigation
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AuthGuard from './components/AuthGuard';
import NotificationHandler from './components/NotificationHandler';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
// import AnalyticsTracker from './components/AnalyticsTracker';
import NotFoundPage from './components/NotFoundPage';
import FacebookPixel from './components/FacebookPixel';
import FloatingAddButton from './components/FloatingAddButton';
import { useIsMobile } from './hooks/useBreakpoint';
// Removed problematic imports
// import useAuthRedirectHandler from './hooks/useAuthRedirectHandler';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/01_main-pages/home/HomePage'));
const CarsPage = React.lazy(() => import('./pages/01_main-pages/CarsPage'));
const CarDetailsPage = React.lazy(() => import('./pages/01_main-pages/CarDetailsPage'));
const SellPage = React.lazy(() => import('./pages/04_car-selling/SellPageNew'));
const SocialFeedPage = React.lazy(() => import('./pages/03_user-pages/social/SocialFeedPage'));

// Mobile.de-style sell workflow pages (الوحيد المستخدم)
const VehicleStartPage = React.lazy(() => import('./pages/04_car-selling/sell/VehicleStartPageNew'));
const SellerTypePageNew = React.lazy(() => import('./pages/04_car-selling/sell/SellerTypePageNew'));
const VehicleDataPageNew = React.lazy(() => import('./pages/04_car-selling/sell/VehicleData'));
const MobileVehicleDataPage = React.lazy(() => import('./pages/04_car-selling/sell/MobileVehicleDataPageClean'));
const EquipmentMainPage = React.lazy(() => import('./pages/04_car-selling/sell/EquipmentMainPage'));
const MobileEquipmentMainPage = React.lazy(() => import('./pages/04_car-selling/sell/MobileEquipmentMainPage'));
const MobileImagesPage = React.lazy(() => import('./pages/04_car-selling/sell/MobileImagesPage'));
const MobilePricingPage = React.lazy(() => import('./pages/04_car-selling/sell/MobilePricingPage'));
const MobileContactPage = React.lazy(() => import('./pages/04_car-selling/sell/MobileContactPage'));
const MobilePreviewPage = React.lazy(() => import('./pages/04_car-selling/sell/MobilePreviewPage'));
const MobileSubmissionPage = React.lazy(() => import('./pages/04_car-selling/sell/MobileSubmissionPage'));
const SafetyEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/SafetyPage'));
const ComfortEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/ComfortPage'));
const InfotainmentEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/InfotainmentPage'));
const ExtrasEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/ExtrasPage'));
const UnifiedEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/UnifiedEquipmentPage'));
const ImagesPage = React.lazy(() => import('./pages/04_car-selling/sell/Images'));
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

const ProfileRouter = React.lazy(() => import('./pages/03_user-pages/profile/ProfilePage/ProfileRouter'));  // NEW: Profile Type Router
const VerificationPage = React.lazy(() => import('./features/verification/VerificationPage'));  // NEW: Verification System
const BillingPage = React.lazy(() => import('./features/billing/BillingPage'));  // NEW: Billing System
const AnalyticsDashboard = React.lazy(() => import('./features/analytics/AnalyticsDashboard'));  // NEW: Analytics System
const TeamManagement = React.lazy(() => import('./features/team/TeamManagement'));  // NEW: Team Management
const UsersDirectoryPage = React.lazy(() => import('./pages/03_user-pages/users-directory/UsersDirectoryPage')); // Bubbles View
// ⚡ NEW: Browse Pages (All Users, All Posts, All Cars)
const AllUsersPage = React.lazy(() => import('./pages/05_search-browse/all-users/AllUsersPage'));
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
// const DealerPublicPage = React.lazy(() => import('./pages/09_dealer-company/DealerPublicPage'));  // NEW: Public Dealer Profiles - NOT MIGRATED YET

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

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff' // ✅ CHANGED: White background instead of beige/yellow #f8fafc
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
          <AuthProvider>
            <ProfileTypeProvider>
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
                      
                      {/* All other routes with header/footer */}
                      <Route path="/*" element={<MainLayout />} />
                    </Routes>
                  </Suspense>
                </Router>
              </GoogleReCaptchaProvider>
            </ToastProvider>
            </ProfileTypeProvider>
          </AuthProvider>
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
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/social" element={<SocialFeedPage />} />
      <Route path="/cars" element={<CarsPage />} />
      <Route path="/cars/:id" element={<CarDetailsPage />} />
      <Route path="/car/:id" element={<CarDetailsPage />} />
      
      {/* Dealer Routes */}
      {/* <Route path="/dealer/:slug" element={<DealerPublicPage />} /> */}  {/* NOT MIGRATED YET */}
      <Route path="/dealer-registration" element={<DealerRegistrationPage />} />
      <Route
        path="/dealer-dashboard"
        element={
          <ProtectedRoute>
            <DealerDashboardPage />
          </ProtectedRoute>
        }
      />
      
      {/* Unified Sell System - Mobile.de Style Only */}
      <Route path="/sell" element={<SellPage />} />
      {/* Redirect old routes to new system */}
      <Route path="/sell-car" element={<SellPage />} />
      <Route path="/add-car" element={<SellPage />} />
      
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
            <SellerTypePageNew />
          </AuthGuard>
        }
      />
      <Route
        path="/sell/inserat/:vehicleType/fahrzeugdaten/antrieb-und-umwelt"
        element={
          <AuthGuard requireAuth={true}>
            {isMobile ? <MobileVehicleDataPage /> : <VehicleDataPageNew />}
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
              {isMobile ? <MobileImagesPage /> : <ImagesPage />}
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
              {isMobile ? <MobilePreviewPage /> : <MobilePreviewPage />}
          </AuthGuard>
        }
      />

      {/* Final submission step */}
      <Route
        path="/sell/inserat/:vehicleType/submission"
        element={
          <AuthGuard requireAuth={true}>
              {isMobile ? <MobileSubmissionPage /> : <MobileSubmissionPage />}
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
      <Route path="/profile" element={<ProfileRouter />} />  {/* Own profile */}
      <Route path="/profile/:userId/*" element={<ProfileRouter />} />  {/* Other user's profile with nested routes */}
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
      {/* ⚡ NEW: Browse Pages */}
      <Route path="/all-users" element={<AllUsersPage />} />
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
  </Layout>
  );
};

export default App;
