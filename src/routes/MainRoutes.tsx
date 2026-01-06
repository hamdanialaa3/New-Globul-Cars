import React, { Suspense, memo } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { safeLazy } from '../utils/lazyImport';
import { AuthGuard, NumericIdGuard, RequireCompanyGuard } from '../components/guards';
import LoadingSpinner from '../components/LoadingSpinner';
import SellRouteRedirect from '../components/SellWorkflow/SellRouteRedirect';
import InactivityWarning from '../components/InactivityWarning';

// Lazy Loaded Components
const HomePage = safeLazy(() => import('../pages/01_main-pages/home/HomePage'));
const CarsPage = safeLazy(() => import('../pages/01_main-pages/CarsPage'));
// PHASE 3: Team Management System (Updated path)
const TeamManagementPage = safeLazy(() => import('../pages/06_admin/TeamManagement/TeamManagementPage'));
const CompanyAnalyticsDashboard = safeLazy(() => import('../pages/09_dealer-company/CompanyAnalyticsDashboard'));
const SuperAdminLoginPage = safeLazy(() => import('../pages/02_authentication/admin-login/SuperAdminLoginPage'));
const SuperAdminDashboard = safeLazy(() => import('../pages/06_admin/super-admin/SuperAdminDashboard'));

// ... existing imports ...
const CarDetailsPage = safeLazy(() => import('../pages/01_main-pages/CarDetailsPage'));
const SocialFeedPage = safeLazy(() => import('../pages/03_user-pages/social/SocialFeedPage'));
const SellModalPage = safeLazy(() => import('../pages/04_car-selling/sell/SellModalPage'));
const MessagesPage = safeLazy(() => import('../pages/03_user-pages/MessagesPage'));
const AdminPage = safeLazy(() => import('../pages/06_admin/regular-admin/AdminPage'));
const AdminLoginPage = safeLazy(() => import('../pages/02_authentication/admin-login/AdminLoginPage'));
const AdminDataFix = safeLazy(() => import('../pages/06_admin/regular-admin/AdminDataFix'));
const NumericCarDetailsPage = safeLazy(() => import('../pages/01_main-pages/NumericCarDetailsPage'));
// ❌ REMOVED: const NumericMessagingPage - Legacy system archived (Phase 1 Remediation)
const NumericProfileRouter = safeLazy(() => import('./NumericProfileRouter'));
const VerificationPage = safeLazy(() => import('../features/verification/VerificationPage'));
const BillingPage = safeLazy(() => import('../features/billing/BillingPage'));
const BillingSuccessPage = safeLazy(() => import('../pages/08_payment-billing/BillingSuccessPage'));
const BillingCanceledPage = safeLazy(() => import('../pages/08_payment-billing/BillingCanceledPage'));
const AnalyticsDashboard = safeLazy(() => import('../features/analytics/AnalyticsDashboard'));
const TeamManagement = safeLazy(() => import('../features/team/TeamManagement'));
const UsersDirectoryPage = safeLazy(() => import('../pages/03_user-pages/users-directory/UsersDirectoryPage'));
const AllPostsPage = safeLazy(() => import('../pages/03_user-pages/social/AllPostsPage'));
const AllCarsPage = safeLazy(() => import('../pages/05_search-browse/all-cars/AllCarsPage'));
const EventsPage = safeLazy(() => import('../pages/07_advanced-features/EventsPage'));
const CreatePostPage = safeLazy(() => import('../pages/03_user-pages/social/CreatePostPage'));
const DashboardPage = safeLazy(() => import('../pages/03_user-pages/dashboard/DashboardPage'));
const AdminDashboard = safeLazy(() => import('../components/AdminDashboard'));
const ThemeTest = safeLazy(() => import('../components/ThemeTest'));
const BackgroundTest = safeLazy(() => import('../components/BackgroundTest'));
const FullThemeDemo = safeLazy(() => import('../components/FullThemeDemo'));
const EffectsTest = safeLazy(() => import('../components/EffectsTest'));
const PrivacyPolicyPage = safeLazy(() => import('../pages/10_legal/privacy-policy/PrivacyPolicyPage'));
const TermsOfServicePage = safeLazy(() => import('../pages/10_legal/terms-of-service/TermsOfServicePage'));
const DataDeletionPage = safeLazy(() => import('../pages/10_legal/data-deletion/DataDeletionPage'));
const AdvancedSearchPage = safeLazy(() => import('../pages/05_search-browse/advanced-search/AdvancedSearchPage'));
const AlgoliaSearchPage = safeLazy(() => import('../pages/05_search-browse/algolia-search/AlgoliaSearchPage'));
const MyListingsPage = safeLazy(() => import('../pages/03_user-pages/my-listings/MyListingsPage'));
const MyDraftsPage = safeLazy(() => import('../pages/03_user-pages/my-drafts/MyDraftsPage'));
const AcceptInvitePage = safeLazy(() => import('../pages/03_user-pages/AcceptInvitePage'));
const MigrationPage = safeLazy(() => import('../pages/06_admin/MigrationPage'));
const DebugCarsPage = safeLazy(() => import('../pages/06_admin/DebugCarsPage'));
const EditCarPage = safeLazy(() => import('../pages/04_car-selling/EditCarPage'));
const N8nTestPage = safeLazy(() => import('../pages/11_testing-dev/N8nTestPage'));
const TestDropdownsPage = safeLazy(() => import('../pages/11_testing-dev/TestDropdownsPage'));
const B2BAnalyticsPortal = safeLazy(() => import('../pages/07_advanced-features/B2BAnalyticsPortal'));
const DigitalTwinPage = safeLazy(() => import('../pages/07_advanced-features/DigitalTwinPage'));
const SubscriptionPage = safeLazy(() => import('../pages/08_payment-billing/SubscriptionPage'));
const AboutPage = safeLazy(() => import('../pages/01_main-pages/about/AboutPage'));
const BrandGalleryPage = safeLazy(() => import('../pages/05_search-browse/brand-gallery/BrandGalleryPage'));
const TopBrandsPage = safeLazy(() => import('../pages/05_search-browse/top-brands/TopBrandsPage'));
const DealersPage = safeLazy(() => import('../pages/05_search-browse/dealers/DealersPage'));
const MapAnalyticsPage = safeLazy(() => import('../pages/01_main-pages/map/MapPage'));
const FinancePage = safeLazy(() => import('../pages/05_search-browse/finance/FinancePage'));
const ContactPage = safeLazy(() => import('../pages/01_main-pages/contact/ContactPage'));
const HelpPage = safeLazy(() => import('../pages/01_main-pages/help/HelpPage'));
const CookiePolicyPage = safeLazy(() => import('../pages/10_legal/cookie-policy/CookiePolicyPage'));
const SitemapPage = safeLazy(() => import('../pages/10_legal/sitemap/SitemapPage'));
const NotificationsPage = safeLazy(() => import('../pages/03_user-pages/notifications/NotificationsPage'));
const SavedSearchesPage = safeLazy(() => import('../pages/03_user-pages/saved-searches/SavedSearchesPage'));
const FavoritesPage = safeLazy(() => import('../pages/03_user-pages/favorites/FavoritesPage'));
const UserFavoritesPage = safeLazy(() => import('../pages/03_user-profile/UserFavoritesPage'));
const FavoritesRedirectPage = safeLazy(() => import('../pages/03_user-profile/FavoritesRedirectPage'));
const DealerPublicPage = safeLazy(() => import('../pages/09_dealer-company/DealerPublicPage'));
const InvoicesPage = safeLazy(() => import('../pages/08_payment-billing/InvoicesPage'));
const CommissionsPage = safeLazy(() => import('../pages/08_payment-billing/CommissionsPage'));
const CheckoutPage = safeLazy(() => import('../pages/08_payment-billing/CheckoutPage'));
const PaymentSuccessPage = safeLazy(() => import('../pages/08_payment-billing/PaymentSuccessPage'));
const DealerRegistrationPage = safeLazy(() => import('../pages/09_dealer-company/DealerRegistrationPage'));
const DealerDashboardPage = safeLazy(() => import('../pages/09_dealer-company/DealerDashboardPage'));
const AlgoliaSyncManager = safeLazy(() => import('../pages/06_admin/AlgoliaSyncManager'));
const AdminCarManagementPage = safeLazy(() => import('../pages/06_admin/regular-admin/AdminCarManagementPage'));
const IconShowcasePage = safeLazy(() => import('../pages/11_testing-dev/IconShowcasePage'));
const IoTDashboardPage = safeLazy(() => import('../pages/03_user-pages/IoTDashboardPage'));
const CarTrackingPage = safeLazy(() => import('../pages/03_user-pages/CarTrackingPage'));
const IoTAnalyticsPage = safeLazy(() => import('../pages/03_user-pages/IoTAnalyticsPage'));
const AIDashboardPage = safeLazy(() => import('../pages/03_user-pages/ai-dashboard/AIDashboardPage'));
const AIQuotaManager = safeLazy(() => import('../pages/06_admin/AIQuotaManager'));
const IntegrationStatusDashboard = safeLazy(() => import('../components/admin/IntegrationStatusDashboard'));
const QuickSetupPage = safeLazy(() => import('../pages/06_admin/QuickSetupPage'));
const CloudServicesManager = safeLazy(() => import('../pages/06_admin/CloudServicesManager'));
const DevelopmentToolsPage = safeLazy(() => import('../pages/11_testing-dev/DevelopmentToolsPage'));
const CityCarsPage = safeLazy(() => import('../pages/seo/CityCarsPage'));
const BrandCityPage = safeLazy(() => import('../pages/seo/BrandCityPage'));
const NewCarsPage = safeLazy(() => import('../pages/seo/NewCarsPage'));
const AccidentCarsPage = safeLazy(() => import('../pages/seo/AccidentCarsPage'));
// 🗺️ Programmatic SEO: Location Landing Pages
const LocationLandingPage = safeLazy(() => import('../pages/05_search-browse/location/LocationLandingPage'));
const CarNotFoundPage = safeLazy(() => import('../pages/02_error-pages/CarNotFoundPage'));
const NotFoundPage = safeLazy(() => import('../components/NotFoundPage'));

// 🆕 Dynamic Car Showcase Pages (Container Pages)
const DynamicCarShowcase = safeLazy(() => import('../pages/05_search-browse/DynamicCarShowcase'));

// Helper for dev tools components
const BackupManagement = safeLazy(() => import('../components/admin/BackupManagement'));
const LeadScoringDashboard = safeLazy(() => import('../components/messaging/LeadScoringDashboard'));
const QuickReplyManager = safeLazy(() => import('../components/messaging/QuickReplyManager'));
const AutoResponderSettings = safeLazy(() => import('../components/messaging/AutoResponderSettings'));
const AuthUsersPage = safeLazy(() => import('../pages/06_admin/AuthUsersPage'));
const SharedInboxPage = safeLazy(() => import('../pages/06_admin/SharedInboxPage'));
const StripeSetupPage = safeLazy(() => import('../pages/09_dealer-company/StripeSetupPage'));
const InsurancePage = safeLazy(() => import('../pages/11_testing-dev/InsurancePage'));





/**
 * Main Content Routes
 * Extracted from AppRoutes.tsx for modularity
 */
export const MainRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/social" element={<SocialFeedPage />} />
            <Route path="/cars" element={<CarsPage />} />

            {/* 🆕 Dynamic Car Showcase Pages (Container Pages) */}
            <Route path="/cars/all" element={<DynamicCarShowcase pageType="all" />} />
            <Route path="/cars/family" element={<DynamicCarShowcase pageType="family" />} />
            <Route path="/cars/sport" element={<DynamicCarShowcase pageType="sport" />} />
            <Route path="/cars/vip" element={<DynamicCarShowcase pageType="vip" />} />
            <Route path="/cars/classic" element={<DynamicCarShowcase pageType="classic" />} />
            <Route path="/cars/new" element={<DynamicCarShowcase pageType="new" />} />
            <Route path="/cars/used" element={<DynamicCarShowcase pageType="used" />} />
            <Route path="/cars/economy" element={<DynamicCarShowcase pageType="economy" />} />
            <Route path="/cars/city/:cityName" element={<DynamicCarShowcase pageType="city" />} />
            <Route path="/cars/brand/:brandName" element={<DynamicCarShowcase pageType="brand" />} />

            {/* �️ PROGRAMMATIC SEO: Location Landing Pages (Long-Tail Trap) */}
            <Route path="/cars/:city" element={<LocationLandingPage />} />
            <Route path="/cars/:city/:brand" element={<LocationLandingPage />} />
            <Route path="/cars/:city/:fuelType/:priceRange" element={<LocationLandingPage />} />

            {/* �👑 SUPER ADMIN ROUTES - THE GOD MODE (Restored Phase 1) */}
            <Route path="/super-admin-login" element={<SuperAdminLoginPage />} />
            <Route path="/super-admin/*" element={
                <AuthGuard requireAuth={true}>
                    <SuperAdminDashboard />
                </AuthGuard>
            } />

            {/* 🔢 Strict Numeric Car URLs (Constitution: /car/:sellerNumericId/:carNumericId) */}
            <Route path="/car/:sellerNumericId/:carNumericId" element={<NumericCarDetailsPage />} />
            <Route path="/car/:sellerNumericId/:carNumericId/edit" element={
                <AuthGuard requireAuth={true}>
                    <EditCarPage />
                </AuthGuard>
            } />
            <Route path="/car/:sellerNumericId/:carNumericId/not-found" element={<CarNotFoundPage />} />
            <Route path="/car/:sellerNumericId/:carNumericId/*" element={<CarNotFoundPage />} />

            {/* Legacy UUID route kept for automatic redirect to numeric URLs */}
            <Route
                path="/car-details/:id"
                element={
                    <NumericIdGuard>
                        <CarDetailsPage />
                    </NumericIdGuard>
                }
            />

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
            {/* Redirects including SellRouteRedirect */}
            <Route path="/sell/inserat/:vehicleType/data" element={<SellRouteRedirect step={1} />} />
            <Route path="/sell/inserat/:vehicleType/equipment" element={<SellRouteRedirect step={2} />} />
            <Route path="/sell/inserat/:vehicleType/images" element={<SellRouteRedirect step={3} />} />
            <Route path="/sell/inserat/:vehicleType/pricing" element={<SellRouteRedirect step={4} />} />
            <Route path="/sell/inserat/:vehicleType/contact" element={<SellRouteRedirect step={5} />} />
            <Route path="/sell/inserat/:vehicleType/preview" element={<SellRouteRedirect step={5} />} />
            <Route path="/sell/inserat/:vehicleType/submission" element={<SellRouteRedirect step={5} />} />

            {/* 🔢 Numeric ID-based profile routes (world-class URLs) */}
            <Route path="/profile/*" element={<NumericProfileRouter />} />

            {/* 🔢 Numeric Car Details Pages */}
            {/* Strict Numeric URLs: /car/{userNumericId}/{carNumericId} */}
            {/* Route already defined above at line 102 */}

            {/* 🔢 UNIFIED Messaging System (Phase 1 Remediation - Jan 4, 2026) */}
            {/* ✅ NEW: Supports both numeric IDs and query params */}
            {/* Pattern 1: /messages/:id1/:id2 (e.g., /messages/1/5) - Numeric IDs */}
            {/* Pattern 2: /messages?conversationId=abc123 - Direct conversation */}
            {/* Pattern 3: /messages - Inbox list */}
            <Route path="/messages/:id1?/:id2?" element={
                <AuthGuard requireAuth={true}>
                    <MessagesPage />
                </AuthGuard>
            } />

            {/* 🎟️ PHASE 3: Team Invitation Acceptance (Join Company Team) */}
            <Route path="/join-team" element={
                <AuthGuard requireAuth={true}>
                    <AcceptInvitePage />
                </AuthGuard>
            } />

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
            <Route path="/koli/novi" element={<NewCarsPage />} />
            <Route path="/koli/avarijni" element={<AccidentCarsPage />} />
            <Route path="/koli/:city" element={<CityCarsPage />} />
            <Route path="/koli/:city/:brand" element={<BrandCityPage />} />
            {/* ❌ REMOVED: Duplicate /messages route - Now handled by unified route above */}
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
                element={<AuthGuard requireAuth={true}><SavedSearchesPage /></AuthGuard>}
            />
            {/* 🔥 NEW: Favorites Redirect - Auto-redirects to /profile/{numericId}/favorites */}
            <Route path="/favorites" element={<FavoritesRedirectPage />} />
            <Route
                path="/invoices"
                element={<AuthGuard requireAuth={true}><InvoicesPage /></AuthGuard>}
            />
            <Route
                path="/commissions"
                element={<AuthGuard requireAuth={true}><CommissionsPage /></AuthGuard>}
            />
            <Route
                path="/dashboard"
                element={<AuthGuard requireAuth={true}><DashboardPage /></AuthGuard>}
            />
            <Route path="/theme-test" element={<ThemeTest />} />
            <Route path="/background-test" element={<BackgroundTest />} />
            <Route path="/full-demo" element={<FullThemeDemo />} />
            <Route path="/effects-test" element={<EffectsTest />} />
            <Route path="/icon-showcase" element={<IconShowcasePage />} />
            <Route path="/iot-dashboard" element={<AuthGuard requireAuth={true}><IoTDashboardPage /></AuthGuard>} />
            <Route path="/car-tracking" element={<AuthGuard requireAuth={true}><CarTrackingPage /></AuthGuard>} />
            <Route path="/iot-analytics" element={<AuthGuard requireAuth={true}><IoTAnalyticsPage /></AuthGuard>} />
            <Route path="/ai-dashboard" element={<AuthGuard requireAuth={true}><AIDashboardPage /></AuthGuard>} />
            <Route path="/admin/ai-quotas" element={<AuthGuard requireAuth={true}><AIQuotaManager /></AuthGuard>} />
            <Route path="/admin/integration-status" element={<AuthGuard requireAuth={true}><IntegrationStatusDashboard /></AuthGuard>} />
            <Route path="/admin/setup" element={<AuthGuard requireAuth={true}><QuickSetupPage /></AuthGuard>} />
            <Route path="/admin/cloud-services" element={<AuthGuard requireAuth={true}><CloudServicesManager /></AuthGuard>} />
            <Route path="/admin/algolia-sync" element={<AuthGuard requireAuth={true} requireAdmin={true}><AlgoliaSyncManager /></AuthGuard>} />
            <Route path="/development-tools" element={<DevelopmentToolsPage />} />

            {/* Development Tools Routes */}
            <Route path="/admin/backup" element={<AuthGuard requireAuth={true} requireAdmin={true}><BackupManagement /></AuthGuard>} />
            <Route path="/admin/leads" element={<AuthGuard requireAuth={true} requireAdmin={true}><LeadScoringDashboard /></AuthGuard>} />
            <Route path="/messages/quick-replies" element={<AuthGuard requireAuth={true}><QuickReplyManager /></AuthGuard>} />
            <Route path="/messages/auto-responder" element={<AuthGuard requireAuth={true}><AutoResponderSettings /></AuthGuard>} />
            <Route path="/admin/auth-users" element={<AuthGuard requireAuth={true} requireAdmin={true}><AuthUsersPage /></AuthGuard>} />
            <Route path="/admin/shared-inbox" element={<AuthGuard requireAuth={true} requireAdmin={true}><SharedInboxPage /></AuthGuard>} />
            <Route path="/dealer/stripe-setup" element={<AuthGuard requireAuth={true}><StripeSetupPage /></AuthGuard>} />

            {/* Company Routes */}
            <Route path="/company/team" element={<RequireCompanyGuard><TeamManagementPage /></RequireCompanyGuard>} />
            <Route path="/company/analytics" element={<RequireCompanyGuard><CompanyAnalyticsDashboard /></RequireCompanyGuard>} />

            <Route path="/insurance" element={<InsurancePage />} />

            <Route path="/n8n-test" element={<N8nTestPage />} />
            <Route path="/test-dropdowns" element={<TestDropdownsPage />} />
            <Route path="/advanced-search" element={<AuthGuard requireAuth={false}><AdvancedSearchPage /></AuthGuard>} />
            <Route path="/search" element={<AuthGuard requireAuth={false}><AlgoliaSearchPage /></AuthGuard>} />
            <Route path="/my-listings" element={<AuthGuard requireAuth={true}><MyListingsPage /></AuthGuard>} />
            <Route path="/my-drafts" element={<AuthGuard requireAuth={true}><MyDraftsPage /></AuthGuard>} />
            <Route path="/analytics" element={<AuthGuard requireAuth={true}><B2BAnalyticsPortal /></AuthGuard>} />
            <Route path="/digital-twin" element={<AuthGuard requireAuth={true}><DigitalTwinPage /></AuthGuard>} />
            <Route path="/subscription" element={<AuthGuard requireAuth={true}><SubscriptionPage /></AuthGuard>} />
            <Route path="/migration" element={<AuthGuard requireAuth={true}><MigrationPage /></AuthGuard>} />
            <Route path="/debug-cars" element={<AuthGuard requireAuth={true}><DebugCarsPage /></AuthGuard>} />

            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/data-deletion" element={<DataDeletionPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/map" element={<MapAnalyticsPage />} />
            <Route path="/top-brands" element={<TopBrandsPage />} />
            <Route path="/brand-gallery" element={<AuthGuard requireAuth={true}><BrandGalleryPage /></AuthGuard>} />
            <Route path="/dealers" element={<AuthGuard requireAuth={true}><DealersPage /></AuthGuard>} />
            <Route path="/finance" element={<AuthGuard requireAuth={true}><FinancePage /></AuthGuard>} />

            <Route path="/contact" element={<ContactPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/support" element={<HelpPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />

            <Route path="*" element={<Suspense fallback={<div>Loading...</div>}><NotFoundPage /></Suspense>} />
        </Routes>
    );
};
