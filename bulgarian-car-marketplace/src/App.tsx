// src/App.tsx
// Main App Component for Bulgarian Car Marketplace with Global Translation System

import React, { Suspense } from 'react';
import { logger } from './services/logger-service';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthProvider';
import { ProfileTypeProvider } from './contexts/ProfileTypeContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './contexts/ThemeContext';
import { ToastProvider } from './components/Toast';
import { bulgarianTheme, GlobalStyles } from './styles/theme';
import './styles/mobile-responsive.css';
import './styles/typography-improved.css';
import './styles/premium-effects.css';
import ErrorBoundary from './components/ErrorBoundary';
import { SkipNavigation } from './components/Accessibility';
const Header = React.lazy(() => import('./components/Header/UnifiedHeader'));
const MobileHeader = React.lazy(() => import('./components/Header/MobileHeader'));
const MobileBottomNav = React.lazy(() => import('./components/layout').then(module => ({ default: module.MobileBottomNav })));
const Footer = React.lazy(() => import('./components/Footer/Footer'));
import { AuthGuard } from './components/guards';
import { AppProviders } from './providers';
import NotificationHandler from './components/NotificationHandler';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { FilterProvider } from './contexts/FilterContext';
const NotFoundPage = React.lazy(() => import('./components/NotFoundPage'));

// 🔧 Dev utilities (available in console)
if (process.env.NODE_ENV === 'development') {
  import('./utils/checkCarsStatus').then(module => {
    (window as any).checkCarsStatus = module.checkAllCarsStatus;
    (window as any).fixCarsStatus = module.fixAllCarsStatus;
    console.log('🛠️ Dev utilities loaded:');
    console.log('  - checkCarsStatus() - فحص حالة السيارات');
    console.log('  - fixCarsStatus() - إصلاح السيارات المخفية');
  });
}
const FacebookPixel = React.lazy(() => import('./components/FacebookPixel'));
const FloatingAddButton = React.lazy(() => import('./components/FloatingAddButton'));
const RobotChatIcon = React.lazy(() => import('./components/AI/RobotChatIcon'));
import { useIsMobile } from './hooks/useBreakpoint';
const ProgressBar = React.lazy(() => import('./components/ProgressBar'));
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for better performance
const ArchitectureDiagramPage = React.lazy(() => import('./pages/ArchitectureDiagramPage'));
const HomePage = React.lazy(() => import('./pages/01_main-pages/home/HomePage'));
const CarsPage = React.lazy(() => import('./pages/01_main-pages/CarsPage'));
const CarDetailsPage = React.lazy(() => import('./pages/01_main-pages/CarDetailsPage'));
const SocialFeedPage = React.lazy(() => import('./pages/03_user-pages/social/SocialFeedPage'));

// Mobile.de-style sell workflow pages (الوحيد المستخدم)
const VehicleStartPage = React.lazy(() => import('./pages/04_car-selling/sell/VehicleStartPageNew'));
const MobileSellerTypePage = React.lazy(() => import('./pages/04_car-selling/sell/MobileSellerTypePage'));
const VehicleDataPageUnified = React.lazy(() => import('./pages/04_car-selling/sell/VehicleDataPageUnified'));
const MobilePricingPage = React.lazy(() => import('./pages/04_car-selling/sell/MobilePricingPage'));
const MobileContactPage = React.lazy(() => import('./pages/04_car-selling/sell/MobileContactPage'));
const MobilePreviewPage = React.lazy(() => import('./pages/04_car-selling/sell/MobilePreviewPage'));
const DesktopPreviewPage = React.lazy(() => import('./pages/04_car-selling/sell/DesktopPreviewPage'));
const MobileSubmissionPage = React.lazy(() => import('./pages/04_car-selling/sell/MobileSubmissionPage'));
const DesktopSubmissionPage = React.lazy(() => import('./pages/04_car-selling/sell/DesktopSubmissionPage'));
const UnifiedEquipmentPage = React.lazy(() => import('./pages/04_car-selling/sell/Equipment/UnifiedEquipmentPage'));
const ImagesPageUnified = React.lazy(() => import('./pages/04_car-selling/sell/ImagesPageUnified'));
const PricingPage = React.lazy(() => import('./pages/04_car-selling/sell/Pricing'));
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
const AlgoliaSearchPage = React.lazy(() => import('./pages/05_search-browse/algolia-search/AlgoliaSearchPage'));
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
// NEW: Map Analytics Page
const MapAnalyticsPage = React.lazy(() => import('./pages/01_main-pages/map/MapPage'));
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

// 🔧 Admin Tools
const AlgoliaSyncManager = React.lazy(() => import('./pages/06_admin/AlgoliaSyncManager'));

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
  // Get theme from context
  const { theme } = useTheme();

  return (
    <div className="main-layout" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
      // backgroundColor controlled by CSS var(--bg-primary) in index.css
    }}>
      <header role="banner">
        {/* ✅ Desktop Header - Hidden on mobile */}
        <div className="desktop-header-only">
          <Suspense fallback={<div style={{ height: '70px' }} />}>
            <Header />
          </Suspense>
        </div>
        {/* ✅ Mobile Header - Visible only on mobile/tablet portrait */}
        <div className="mobile-header-only">
          <Suspense fallback={<div style={{ height: '60px' }} />}>
            <MobileHeader />
          </Suspense>
        </div>
      </header>
      <main
        id="main-content"
        role="main"
        style={{
          flex: 1,
          padding: '0', // ❌ REMOVED: No padding on mobile - causes yellow transparent frame
          paddingTop: '80px', // ✅ Space for fixed transparent header
          paddingBottom: '80px', // ✅ Space for mobile bottom nav
          backgroundColor: 'transparent', // Let page components control background
          transition: 'background-color 0.3s ease'
        }}
        tabIndex={-1}
      >
        <div className="page-container" style={{
          backgroundColor: 'transparent', // Always transparent - let page components control their own background
          transition: 'background-color 0.3s ease'
        }}>
          {children}
        </div>
      </main>
      <footer role="contentinfo">
        <Suspense fallback={<div style={{ height: '300px' }} />}>
          <Footer />
        </Suspense>
      </footer>
      {/* ✅ Mobile Bottom Navigation - Visible only on mobile */}
      <Suspense fallback={<div style={{ height: '60px' }} />}>
        <MobileBottomNav />
      </Suspense>
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
// Wrapper component that injects theme.mode from ThemeContext into styled-components
const ThemedApp: React.FC = () => {
  const { theme } = useTheme();
  const recaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  // Note: reCAPTCHA is optional for development
  // In production, consider adding the key to .env
  if (!recaptchaKey && process.env.NODE_ENV === 'production') {
    logger.warn('reCAPTCHA Site Key is not configured');
  }

  // Create dynamic theme object with mode property from ThemeContext
  const dynamicTheme = React.useMemo(() => ({
    ...bulgarianTheme,
    mode: theme // 'light' or 'dark' from ThemeContext
  }), [theme]);

  return (
    <ThemeProvider theme={dynamicTheme}>
      <GlobalStyles />
      <ErrorBoundary>
        <Suspense fallback={<div style={{ height: '0' }} />}>
          <FacebookPixel />
        </Suspense>
        {/* <FacebookMessengerWidget /> - Temporarily disabled */}
        <SkipNavigation />
        <NotificationHandler />
        <Suspense fallback={
          <Suspense fallback={<div>Loading...</div>}>
            <ProgressBar duration={2000} />
          </Suspense>
        }>
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
      </ErrorBoundary>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  const recaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  return (
    <AppProviders recaptchaKey={recaptchaKey || "dummy-key"}>
      <ThemedApp />
    </AppProviders>
  );
};

const MainLayout: React.FC = () => {
  const isMobile = useIsMobile();
  return (
    <Layout>
      <Suspense fallback={null}>
        <FloatingAddButton />
      </Suspense>
      <Suspense fallback={null}>
        <RobotChatIcon />
      </Suspense>
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
            <AuthGuard requireAuth={true}>
              <DealerDashboardPage />
            </AuthGuard>
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

        {/* Redirect German routes to English unified routes */}
        <Route 
          path="/sell/inserat/:vehicleType/ausstattung" 
          element={<Navigate to="../equipment" replace />} 
        />
        <Route 
          path="/sell/inserat/:vehicleType/ausstattung/*" 
          element={<Navigate to="../equipment" replace />} 
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

        {/* Redirect German contact routes to English unified route */}
        <Route 
          path="/sell/inserat/:vehicleType/kontakt/*" 
          element={<Navigate to="../contact" replace />} 
        />

        {/* NEW: Preview Page - Review all data before submission */}
        <Route
          path="/sell/inserat/:vehicleType/preview"
          element={
            <AuthGuard requireAuth={true}>
              {isMobile ? <MobilePreviewPage /> : <DesktopPreviewPage />}
            </AuthGuard>
          }
        />

        {/* Profile routes - single entry; nested router handles both index and :userId */}
        <Route path="/profile/*" element={<ProfileRouter />} />
        <Route path="/verification" element={<VerificationPage />} />  {/* NEW: Verification System */}
        <Route path="/billing" element={<BillingPage />} />  {/* NEW: Billing System */}
        
        {/* NEW: Subscription Success & Cancel Pages */}
        <Route 
          path="/billing/success" 
          element={
            <AuthGuard requireAuth={true}>
              <React.Suspense fallback={<LoadingSpinner />}>
                {React.createElement(React.lazy(() => import('./pages/billing/SuccessPage')))}
              </React.Suspense>
            </AuthGuard>
          } 
        />
        <Route 
          path="/billing/cancel" 
          element={
            <AuthGuard requireAuth={true}>
              <React.Suspense fallback={<LoadingSpinner />}>
                {React.createElement(React.lazy(() => import('./pages/billing/CancelPage')))}
              </React.Suspense>
            </AuthGuard>
          } 
        />

        {/* NEW: Payment & Checkout Routes */}
        <Route
          path="/checkout/:carId"
          element={
            <AuthGuard requireAuth={true}>
              <CheckoutPage />
            </AuthGuard>
          }
        />
        <Route
          path="/payment-success/:transactionId"
          element={
            <AuthGuard requireAuth={true}>
              <PaymentSuccessPage />
            </AuthGuard>
          }
        />
        <Route
          path="/billing/success"
          element={
            <AuthGuard requireAuth={true}>
              <BillingSuccessPage />
            </AuthGuard>
          }
        />
        <Route
          path="/billing/canceled"
          element={
            <AuthGuard requireAuth={true}>
              <BillingCanceledPage />
            </AuthGuard>
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
            <AuthGuard requireAuth={true}>
              <EventsPage />
            </AuthGuard>
          }
        />

        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AuthGuard requireAuth={true}>
              <AdminPage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin-car-management"
          element={
            <AuthGuard requireAuth={true} requireAdmin={true}>
              <AdminCarManagementPage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/data-fix"
          element={
            <AuthGuard requireAuth={true} requireAdmin={true}>
              <AdminDataFix />
            </AuthGuard>
          }
        />
        <Route
          path="/notifications"
          element={
            <AuthGuard requireAuth={true}>
              <NotificationsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/saved-searches"
          element={
            <AuthGuard requireAuth={true}>
              <SavedSearchesPage />
            </AuthGuard>
          }
        />
        <Route
          path="/favorites"
          element={
            <AuthGuard requireAuth={true}>
              <FavoritesPage />
            </AuthGuard>
          }
        />

        {/* NEW: Invoices & Commissions Pages - P2 Integration */}
        <Route
          path="/invoices"
          element={
            <AuthGuard requireAuth={true}>
              <InvoicesPage />
            </AuthGuard>
          }
        />
        <Route
          path="/commissions"
          element={
            <AuthGuard requireAuth={true}>
              <CommissionsPage />
            </AuthGuard>
          }
        />

        <Route
          path="/dashboard"
          element={
            <AuthGuard requireAuth={true}>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthGuard requireAuth={true} requireAdmin={true}>
              <AdminDashboard />
            </AuthGuard>
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
            <AuthGuard requireAuth={true}>
              <IoTDashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/car-tracking"
          element={
            <AuthGuard requireAuth={true}>
              <CarTrackingPage />
            </AuthGuard>
          }
        />
        <Route
          path="/iot-analytics"
          element={
            <AuthGuard requireAuth={true}>
              <IoTAnalyticsPage />
            </AuthGuard>
          }
        />

        {/* AI Dashboard */}
        <Route
          path="/ai-dashboard"
          element={
            <AuthGuard requireAuth={true}>
              <AIDashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/ai-quotas"
          element={
            <AuthGuard requireAuth={true}>
              <AIQuotaManager />
            </AuthGuard>
          }
        />

        {/* Integration & Setup Pages */}
        <Route
          path="/admin/integration-status"
          element={
            <AuthGuard requireAuth={true}>
              <IntegrationStatusDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/setup"
          element={
            <AuthGuard requireAuth={true}>
              <QuickSetupPage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/cloud-services"
          element={
            <AuthGuard requireAuth={true}>
              <CloudServicesManager />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/algolia-sync"
          element={
            <AuthGuard requireAuth={true} requireAdmin={true}>
              <AlgoliaSyncManager />
            </AuthGuard>
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
            <AuthGuard requireAuth={false}>
              <AdvancedSearchPage />
            </AuthGuard>
          }
        />
        <Route
          path="/search"
          element={
            <AuthGuard requireAuth={false}>
              <AlgoliaSearchPage />
            </AuthGuard>
          }
        />
        {/* New Car Listing System */}
        <Route
          path="/my-listings"
          element={
            <AuthGuard requireAuth={true}>
              <MyListingsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/my-drafts"
          element={
            <AuthGuard requireAuth={true}>
              <MyDraftsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/edit-car/:carId"
          element={
            <AuthGuard requireAuth={true}>
              <EditCarPage />
            </AuthGuard>
          }
        />
        <Route
          path="/car-details/:carId"
          element={
            <AuthGuard requireAuth={true}>
              <CarDetailsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/analytics"
          element={
            <AuthGuard requireAuth={true}>
              <B2BAnalyticsPortal />
            </AuthGuard>
          }
        />
        <Route
          path="/digital-twin"
          element={
            <AuthGuard requireAuth={true}>
              <DigitalTwinPage />
            </AuthGuard>
          }
        />
        <Route
          path="/subscription"
          element={
            <AuthGuard requireAuth={true}>
              <SubscriptionPage />
            </AuthGuard>
          }
        />

        {/* Migration Page */}
        <Route
          path="/migration"
          element={
            <AuthGuard requireAuth={true}>
              <MigrationPage />
            </AuthGuard>
          }
        />

        {/* Debug Cars Page */}
        <Route
          path="/debug-cars"
          element={
            <AuthGuard requireAuth={true}>
              <DebugCarsPage />
            </AuthGuard>
          }
        />

        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/data-deletion" element={<DataDeletionPage />} />

        {/* Additional Pages */}
        <Route path="/about" element={<AboutPage />} />
        {/* Bulgaria Map Analytics */}
        <Route path="/map" element={<MapAnalyticsPage />} />
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
        <Route path="*" element={
          <Suspense fallback={<div>Loading...</div>}>
            <NotFoundPage />
          </Suspense>
        } />
      </Routes>
    </Layout>
  );
};

export default App;
