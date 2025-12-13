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
import { safeLazy } from './utils/lazyImport';

const Header = safeLazy(() => import('./components/Header/UnifiedHeader'));
const MobileHeader = safeLazy(() => import('./components/Header/MobileHeader'));
const MobileBottomNav = safeLazy(() => import('./components/layout/MobileBottomNav'));
const Footer = safeLazy(() => import('./components/Footer/Footer'));
import { AuthGuard } from './components/guards';
import { AppProviders } from './providers';
import NotificationHandler from './components/NotificationHandler';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { FilterProvider } from './contexts/FilterContext';
import InactivityWarning from './components/InactivityWarning';
import IndexedDBActivityTracker from './services/indexeddb-activity-tracker';
const NotFoundPage = safeLazy(() => import('./components/NotFoundPage'));

// 🔧 Dev utilities (available in console)
if (process.env.NODE_ENV === 'development') {
  import('./utils/checkCarsStatus').then(module => {
    (window as any).checkCarsStatus = module.checkAllCarsStatus;
    (window as any).fixCarsStatus = module.fixAllCarsStatus;
    console.log('  - checkCarsStatus() - فحص حالة السيارات');
    console.log('  - fixCarsStatus() - إصلاح السيارات المخفية');
  });
}
const FacebookPixel = safeLazy(() => import('./components/FacebookPixel'));
const FloatingAddButton = safeLazy(() => import('./components/FloatingAddButton'));
const RobotChatIcon = safeLazy(() => import('./components/AI/RobotChatIcon'));
const GlobalWorkflowTimer = safeLazy(() => import('./components/GlobalWorkflowTimer'));
const WorkflowProgressBar = safeLazy(() => import('./components/WorkflowProgressBar'));
import { useIsMobile } from './hooks/useBreakpoint';
const ProgressBar = safeLazy(() => import('./components/ProgressBar'));
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for better performance
const HomePage = safeLazy(() => import('./pages/01_main-pages/home/HomePage'));
const CarsPage = safeLazy(() => import('./pages/01_main-pages/CarsPage'));
const CarDetailsPage = safeLazy(() => import('./pages/01_main-pages/CarDetailsPage'));
const SocialFeedPage = safeLazy(() => import('./pages/03_user-pages/social/SocialFeedPage'));

// Mobile.de-style sell workflow pages (الوحيد المستخدم)
const VehicleStartPage = safeLazy(() => import('./pages/04_car-selling/sell/VehicleStartPageNew'));
const SellModalPage = safeLazy(() => import('./pages/04_car-selling/sell/SellModalPage'));
const MobileSellerTypePage = safeLazy(() => import('./pages/04_car-selling/sell/MobileSellerTypePage'));
const VehicleDataPageUnified = safeLazy(() => import('./pages/04_car-selling/sell/VehicleDataPageUnified'));
const MobilePricingPage = safeLazy(() => import('./pages/04_car-selling/sell/MobilePricingPage'));
const MobileContactPage = safeLazy(() => import('./pages/04_car-selling/sell/MobileContactPage'));
const MobilePreviewPage = safeLazy(() => import('./pages/04_car-selling/sell/MobilePreviewPage'));
const DesktopPreviewPage = safeLazy(() => import('./pages/04_car-selling/sell/DesktopPreviewPage'));
const MobileSubmissionPage = safeLazy(() => import('./pages/04_car-selling/sell/MobileSubmissionPage'));
const DesktopSubmissionPage = safeLazy(() => import('./pages/04_car-selling/sell/DesktopSubmissionPage'));
const UnifiedEquipmentPage = safeLazy(() => import('./pages/04_car-selling/sell/Equipment/UnifiedEquipmentPage'));
const ImagesPageUnified = safeLazy(() => import('./pages/04_car-selling/sell/ImagesPageUnified'));
const PricingPage = safeLazy(() => import('./pages/04_car-selling/sell/Pricing'));
const UnifiedContactPage = safeLazy(() => import('./pages/04_car-selling/sell/UnifiedContactPage'));

const MessagesPage = safeLazy(() => import('./pages/03_user-pages/messages/MessagesPage'));
const AdminPage = safeLazy(() => import('./pages/06_admin/regular-admin/AdminPage'));
const AdminLoginPage = safeLazy(() => import('./pages/02_authentication/admin-login/AdminLoginPage'));
const AdminDataFix = safeLazy(() => import('./pages/06_admin/regular-admin/AdminDataFix'));
const SuperAdminLogin = safeLazy(() => import('./pages/02_authentication/admin-login/SuperAdminLoginPage'));
const SuperAdminDashboard = safeLazy(() => import('./pages/06_admin/super-admin/SuperAdminDashboard'));
const SuperAdminUsersPage = safeLazy(() => import('./pages/06_admin/super-admin/SuperAdminUsersPage'));

const ProfileRouter = safeLazy(() => import('./pages/03_user-pages/profile/ProfilePage/ProfileRouter'));
const VerificationPage = safeLazy(() => import('./features/verification/VerificationPage'));
const BillingPage = safeLazy(() => import('./features/billing/BillingPage'));
const BillingSuccessPage = safeLazy(() => import('./pages/08_payment-billing/BillingSuccessPage'));
const BillingCanceledPage = safeLazy(() => import('./pages/08_payment-billing/BillingCanceledPage'));
const AnalyticsDashboard = safeLazy(() => import('./features/analytics/AnalyticsDashboard'));
const TeamManagement = safeLazy(() => import('./features/team/TeamManagement'));
const UsersDirectoryPage = safeLazy(() => import('./pages/03_user-pages/users-directory/UsersDirectoryPage'));
const AllPostsPage = safeLazy(() => import('./pages/03_user-pages/social/AllPostsPage'));
const AllCarsPage = safeLazy(() => import('./pages/05_search-browse/all-cars/AllCarsPage'));
const EventsPage = safeLazy(() => import('./pages/07_advanced-features/EventsPage'));
const CreatePostPage = safeLazy(() => import('./pages/03_user-pages/social/CreatePostPage'));
const OAuthCallback = safeLazy(() => import('./pages/02_authentication/oauth/OAuthCallbackPage'));
const LoginPage = safeLazy(() => import('./pages/02_authentication/login/LoginPage/LoginPageGlassFixed'));
const RegisterPage = safeLazy(() => import('./pages/02_authentication/register/RegisterPage/RegisterPageGlassFixed'));
const EmailVerificationPage = safeLazy(() => import('./pages/02_authentication/verification/EmailVerificationPage'));
const DashboardPage = safeLazy(() => import('./pages/03_user-pages/dashboard/DashboardPage'));
const AdminDashboard = safeLazy(() => import('./components/AdminDashboard'));
const ThemeTest = safeLazy(() => import('./components/ThemeTest'));
const BackgroundTest = safeLazy(() => import('./components/BackgroundTest'));
const FullThemeDemo = safeLazy(() => import('./components/FullThemeDemo'));
const EffectsTest = safeLazy(() => import('./components/EffectsTest'));
const PrivacyPolicyPage = safeLazy(() => import('./pages/10_legal/privacy-policy/PrivacyPolicyPage'));
const TermsOfServicePage = safeLazy(() => import('./pages/10_legal/terms-of-service/TermsOfServicePage'));
const DataDeletionPage = safeLazy(() => import('./pages/10_legal/data-deletion/DataDeletionPage'));
const AdvancedSearchPage = safeLazy(() => import('./pages/05_search-browse/advanced-search/AdvancedSearchPage'));
const AlgoliaSearchPage = safeLazy(() => import('./pages/05_search-browse/algolia-search/AlgoliaSearchPage'));
const MyListingsPage = safeLazy(() => import('./pages/03_user-pages/my-listings/MyListingsPage'));
const MyDraftsPage = safeLazy(() => import('./pages/03_user-pages/my-drafts/MyDraftsPage'));
const MigrationPage = safeLazy(() => import('./pages/06_admin/MigrationPage'));
const DebugCarsPage = safeLazy(() => import('./pages/06_admin/DebugCarsPage'));
const EditCarPage = safeLazy(() => import('./pages/04_car-selling/EditCarPage'));
const N8nTestPage = safeLazy(() => import('./pages/11_testing-dev/N8nTestPage'));
const TestDropdownsPage = safeLazy(() => import('./pages/11_testing-dev/TestDropdownsPage'));
const B2BAnalyticsPortal = safeLazy(() => import('./pages/07_advanced-features/B2BAnalyticsPortal'));
const DigitalTwinPage = safeLazy(() => import('./pages/07_advanced-features/DigitalTwinPage'));
const SubscriptionPage = safeLazy(() => import('./pages/08_payment-billing/SubscriptionPage'));
const AboutPage = safeLazy(() => import('./pages/01_main-pages/about/AboutPage'));
const BrandGalleryPage = safeLazy(() => import('./pages/05_search-browse/brand-gallery/BrandGalleryPage'));
const TopBrandsPage = safeLazy(() => import('./pages/05_search-browse/top-brands/TopBrandsPage'));
const DealersPage = safeLazy(() => import('./pages/05_search-browse/dealers/DealersPage'));
const MapAnalyticsPage = safeLazy(() => import('./pages/01_main-pages/map/MapPage'));
const FinancePage = safeLazy(() => import('./pages/05_search-browse/finance/FinancePage'));
const ContactPage = safeLazy(() => import('./pages/01_main-pages/contact/ContactPage'));
const HelpPage = safeLazy(() => import('./pages/01_main-pages/help/HelpPage'));
const CookiePolicyPage = safeLazy(() => import('./pages/10_legal/cookie-policy/CookiePolicyPage'));
const SitemapPage = safeLazy(() => import('./pages/10_legal/sitemap/SitemapPage'));
const NotificationsPage = safeLazy(() => import('./pages/03_user-pages/notifications/NotificationsPage'));
const SavedSearchesPage = safeLazy(() => import('./pages/03_user-pages/saved-searches/SavedSearchesPage'));
const FavoritesPage = safeLazy(() => import('./pages/03_user-pages/favorites/FavoritesPage'));
const DealerPublicPage = safeLazy(() => import('./pages/09_dealer-company/DealerPublicPage'));
const InvoicesPage = safeLazy(() => import('./pages/08_payment-billing/InvoicesPage'));
const CommissionsPage = safeLazy(() => import('./pages/08_payment-billing/CommissionsPage'));
const CheckoutPage = safeLazy(() => import('./pages/08_payment-billing/CheckoutPage'));
const PaymentSuccessPage = safeLazy(() => import('./pages/08_payment-billing/PaymentSuccessPage'));
const DealerRegistrationPage = safeLazy(() => import('./pages/09_dealer-company/DealerRegistrationPage'));
const DealerDashboardPage = safeLazy(() => import('./pages/09_dealer-company/DealerDashboardPage'));
const AlgoliaSyncManager = safeLazy(() => import('./pages/06_admin/AlgoliaSyncManager'));
const AdminCarManagementPage = safeLazy(() => import('./pages/06_admin/regular-admin/AdminCarManagementPage'));
const IconShowcasePage = safeLazy(() => import('./pages/11_testing-dev/IconShowcasePage'));
const IoTDashboardPage = safeLazy(() => import('./pages/03_user-pages/IoTDashboardPage'));
const CarTrackingPage = safeLazy(() => import('./pages/03_user-pages/CarTrackingPage'));
const IoTAnalyticsPage = safeLazy(() => import('./pages/03_user-pages/IoTAnalyticsPage'));
const AIDashboardPage = safeLazy(() => import('./pages/03_user-pages/ai-dashboard/AIDashboardPage'));
const AIQuotaManager = safeLazy(() => import('./pages/06_admin/AIQuotaManager'));
const IntegrationStatusDashboard = safeLazy(() => import('./components/admin/IntegrationStatusDashboard'));
const QuickSetupPage = safeLazy(() => import('./pages/06_admin/QuickSetupPage'));
const CloudServicesManager = safeLazy(() => import('./pages/06_admin/CloudServicesManager'));

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className="main-layout" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header role="banner">
        <div className="desktop-header-only">
          <Suspense fallback={<div style={{ height: '70px' }} />}>
            <Header />
          </Suspense>
        </div>
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
          padding: '0',
          paddingTop: '80px',
          paddingBottom: '80px',
          backgroundColor: 'transparent',
          transition: 'background-color 0.3s ease'
        }}
        tabIndex={-1}
      >
        <div className="page-container" style={{
          backgroundColor: 'transparent',
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
      <Suspense fallback={<div style={{ height: '60px' }} />}>
        <MobileBottomNav />
      </Suspense>
    </div>
  );
};

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

const ThemedApp: React.FC = () => {
  const { theme } = useTheme();
  const recaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  // Initialize activity tracker on mount
  React.useEffect(() => {
    IndexedDBActivityTracker.initialize();
  }, []);

  if (!recaptchaKey && process.env.NODE_ENV === 'production') {
    logger.warn('reCAPTCHA Site Key is not configured');
  }

  const dynamicTheme = React.useMemo(() => ({
    ...bulgarianTheme,
    mode: theme
  }), [theme]);

  return (
    <ThemeProvider theme={dynamicTheme}>
      <GlobalStyles />
      <ErrorBoundary>
        <Suspense fallback={<div style={{ height: '0' }} />}>
          <FacebookPixel />
        </Suspense>
        <SkipNavigation />
        <NotificationHandler />
        <InactivityWarning />
        
        {/* Global Workflow Timer - Visible across all sell workflow pages */}
        <Suspense fallback={null}>
          <GlobalWorkflowTimer />
        </Suspense>
        
        <Suspense fallback={
          <Suspense fallback={<div>Loading...</div>}>
            <ProgressBar duration={2000} />
          </Suspense>
        }>
          <Routes>
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
            <Route path="/oauth/callback" element={
              <FullScreenLayout>
                <OAuthCallback />
              </FullScreenLayout>
            } />
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
        <Route path="/sell" element={<Navigate to="/sell/auto" replace />} />
        <Route path="/sell-car" element={<Navigate to="/sell/auto" replace />} />
        <Route path="/add-car" element={<Navigate to="/sell/auto" replace />} />
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route
          path="/sell/auto"
          element={
            <AuthGuard requireAuth={true}>
              <SellModalPage />
            </AuthGuard>
          }
        />
        {/* ✅ NEW: Unified Sell Workflow Routes - Clean & Sequential */}
        {/* Step 1: Vehicle Data */}
        <Route
          path="/sell/inserat/:vehicleType/data"
          element={
            <AuthGuard requireAuth={true}>
              <VehicleDataPageUnified />
            </AuthGuard>
          }
        />
        {/* Step 2: Equipment */}
        <Route
          path="/sell/inserat/:vehicleType/equipment"
          element={
            <AuthGuard requireAuth={true}>
              <UnifiedEquipmentPage />
            </AuthGuard>
          }
        />
        {/* Step 3: Images */}
        <Route
          path="/sell/inserat/:vehicleType/images"
          element={
            <AuthGuard requireAuth={true}>
              <ImagesPageUnified />
            </AuthGuard>
          }
        />
        {/* Step 4: Pricing */}
        <Route
          path="/sell/inserat/:vehicleType/pricing"
          element={
            <AuthGuard requireAuth={true}>
              {isMobile ? <MobilePricingPage /> : <PricingPage />}
            </AuthGuard>
          }
        />
        {/* Step 5: Contact */}
        <Route
          path="/sell/inserat/:vehicleType/contact"
          element={
            <AuthGuard requireAuth={true}>
              {isMobile ? <MobileContactPage /> : <UnifiedContactPage />}
            </AuthGuard>
          }
        />
        {/* Step 6: Preview */}
        <Route
          path="/sell/inserat/:vehicleType/preview"
          element={
            <AuthGuard requireAuth={true}>
              {isMobile ? <MobilePreviewPage /> : <DesktopPreviewPage />}
            </AuthGuard>
          }
        />

        {/* ✅ REDIRECTS: Old routes → New routes (for backward compatibility) */}
        <Route 
          path="/sell/inserat/:vehicleType/fahrzeugdaten/antrieb-und-umwelt" 
          element={<Navigate to="../data" replace />} 
        />
        <Route 
          path="/sell/inserat/:vehicleType/fahrzeugdaten/antrieb-und-umwelt/*" 
          element={<Navigate to="../../data" replace />} 
        />
        <Route 
          path="/sell/inserat/:vehicleType/details/bilder" 
          element={<Navigate to="../images" replace />} 
        />
        <Route 
          path="/sell/inserat/:vehicleType/details/bilder/*" 
          element={<Navigate to="../../images" replace />} 
        />
        <Route 
          path="/sell/inserat/:vehicleType/details/preis" 
          element={<Navigate to="../pricing" replace />} 
        />
        <Route 
          path="/sell/inserat/:vehicleType/details/preis/*" 
          element={<Navigate to="../../pricing" replace />} 
        />
        <Route 
          path="/sell/inserat/:vehicleType/ausstattung" 
          element={<Navigate to="../equipment" replace />} 
        />
        <Route 
          path="/sell/inserat/:vehicleType/ausstattung/*" 
          element={<Navigate to="../../equipment" replace />} 
        />
        <Route 
          path="/sell/inserat/:vehicleType/kontakt" 
          element={<Navigate to="../contact" replace />} 
        />
        <Route 
          path="/sell/inserat/:vehicleType/kontakt/*" 
          element={<Navigate to="../../contact" replace />} 
        />
        {/* Old seller type route - redirect to data (seller type is now handled in data page) */}
        <Route 
          path="/sell/inserat/:vehicleType/verkaeufertyp" 
          element={<Navigate to="../data" replace />} 
        />
        {/* Step 7: Submission (Final Step) */}
        <Route
          path="/sell/inserat/:vehicleType/submission"
          element={
            <AuthGuard requireAuth={true}>
              {isMobile ? <MobileSubmissionPage /> : <DesktopSubmissionPage />}
            </AuthGuard>
          }
        />
        <Route path="/profile/*" element={<ProfileRouter />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/billing" element={<BillingPage />} />
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
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/team" element={<TeamManagement />} />
        <Route path="/users" element={<UsersDirectoryPage />} />
        <Route path="/all-users" element={<UsersDirectoryPage />} />
        <Route path="/all-posts" element={<AllPostsPage />} />
        <Route path="/all-cars" element={<AllCarsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
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
            <AuthGuard requireAuth={true} requireAdmin={true}>
              <AdminPage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AuthGuard requireAuth={true} requireAdmin={true}>
              <AdminDashboard />
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
        <Route path="/theme-test" element={<ThemeTest />} />
        <Route path="/background-test" element={<BackgroundTest />} />
        <Route path="/full-demo" element={<FullThemeDemo />} />
        <Route path="/effects-test" element={<EffectsTest />} />
        <Route path="/icon-showcase" element={<IconShowcasePage />} />
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
        <Route path="/n8n-test" element={<N8nTestPage />} />
        <Route path="/test-dropdowns" element={<TestDropdownsPage />} />
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
        <Route
          path="/migration"
          element={
            <AuthGuard requireAuth={true}>
              <MigrationPage />
            </AuthGuard>
          }
        />
        <Route
          path="/debug-cars"
          element={
            <AuthGuard requireAuth={true}>
              <DebugCarsPage />
            </AuthGuard>
          }
        />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/data-deletion" element={<DataDeletionPage />} />
        <Route path="/about" element={<AboutPage />} />
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
        <Route path="/support" element={<HelpPage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
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