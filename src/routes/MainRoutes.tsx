import React, { Suspense, memo } from 'react';
import { Route, Routes, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { safeLazy } from '../utils/lazyImport';
import { AuthGuard, NumericIdGuard, RequireCompanyGuard } from '../components/guards';
import { RoleGuard } from '../components/guards/RoleGuard';
import LoadingSpinner from '../components/LoadingSpinner';
import SellRouteRedirect from '../components/SellWorkflow/SellRouteRedirect';
import InactivityWarning from '../components/InactivityWarning';

const IS_DEV = process.env.NODE_ENV === 'development';

/** Redirect /browse and /browse/:brandId to /cars with proper query params */
const MOMENT_FILTERS: Record<string, string> = {
  family: '/cars?bodyType=SUV',
  work: '/cars?bodyType=sedan',
  adventure: '/cars?bodyType=SUV&fuelType=diesel',
  eco: '/cars?fuelType=electric',
  city: '/cars?bodyType=hatchback',
  luxury: '/cars?priceMin=30000',
};
const BrowseRedirect: React.FC = () => {
  const { brandId } = useParams<{ brandId?: string }>();
  const [searchParams] = useSearchParams();
  if (brandId) {
    return <Navigate to={`/cars?make=${encodeURIComponent(brandId)}`} replace />;
  }
  const moment = searchParams.get('moment');
  const target = (moment && MOMENT_FILTERS[moment]) || '/cars';
  return <Navigate to={target} replace />;
};


// Lazy Loaded Components
const HomePage = safeLazy(() => import('../pages/01_main-pages/home/HomePage'));
const SEOCityBrandPage = safeLazy(() => import('../pages/SEOCityBrandPage'));
const CarsPage = safeLazy(() => import('../pages/01_main-pages/CarsPage'));
const AIAdvisorPage = safeLazy(() => import('../pages/01_main-pages/advisor/AIAdvisorPage'));
const AIValuationPage = safeLazy(() => import('../pages/01_main-pages/valuation/AIValuationPage'));
const AIHistoryPage = safeLazy(() => import('../pages/01_main-pages/history/AIHistoryPage'));
const MarketplacePage = safeLazy(() => import('../pages/01_main-pages/marketplace/MarketplacePage'));
const ProductDetailPage = safeLazy(() => import('../pages/01_main-pages/marketplace/ProductDetailPage'));
const CartPage = safeLazy(() => import('../pages/01_main-pages/marketplace/CartPage'));
const MarketplaceCheckoutPage = safeLazy(() => import('../pages/01_main-pages/marketplace/CheckoutPage'));
const OrderSuccessPage = safeLazy(() => import('../pages/01_main-pages/marketplace/OrderSuccessPage'));
const StripePaymentPage = safeLazy(() => import('../pages/01_main-pages/marketplace/StripePaymentPage'));
const BlogPage = safeLazy(() => import('../pages/01_main-pages/blog/BlogPage'));
const BlogPostPage = safeLazy(() => import('../pages/01_main-pages/blog/BlogPostPage'));
const AiValuationDeepDive = safeLazy(() => import('../pages/01_main-pages/blog/posts/AiValuationDeepDive'));
const BulgarianCarMarket2026 = safeLazy(() => import('../pages/01_main-pages/blog/posts/BulgarianCarMarket2026'));
const MarketplaceComparison2026 = safeLazy(() => import('../pages/01_main-pages/blog/posts/MarketplaceComparison2026'));
const HybridSearchDeepDive = safeLazy(() => import('../pages/01_main-pages/blog/posts/HybridSearchDeepDive'));
const NeuralPricingDeepDive = safeLazy(() => import('../pages/01_main-pages/blog/posts/NeuralPricingDeepDive'));
const ConstitutionalCodingDeepDive = safeLazy(() => import('../pages/01_main-pages/blog/posts/ConstitutionalCodingDeepDive'));
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
const RealtimeMessagesPage = safeLazy(() => import('../pages/03_user-pages/RealtimeMessagesPage'));
const AdminPage = safeLazy(() => import('../pages/06_admin/regular-admin/AdminPage'));
const AdminLoginPage = safeLazy(() => import('../pages/02_authentication/admin-login/AdminLoginPage'));
// ✅ AUDIT FIX: AdminDataFix.tsx was missing — replaced with fallback (2026-02-19)
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
const SearchPage = safeLazy(() => import('../pages/05_search-browse/SearchPage'));
const CompetitiveComparisonPage = safeLazy(() => import('../pages/10_landing/CompetitiveComparisonPage'));
const CarPricingPage = safeLazy(() => import('../features/pricing/CarPricingPage'));
const AIAnalysisPage = safeLazy(() => import('../pages/01_main-pages/ai-analysis/AIAnalysisPage'));
const EventsPage = safeLazy(() => import('../pages/07_advanced-features/EventsPage'));
const CreatePostPage = safeLazy(() => import('../pages/03_user-pages/social/CreatePostPage'));
const DashboardPage = safeLazy(() => import('../pages/03_user-pages/dashboard/DashboardPage'));
const AdminDashboard = safeLazy(() => import('../components/AdminDashboard'));
const PrivacyPolicyPage = safeLazy(() => import('../pages/10_legal/privacy-policy/PrivacyPolicyPage'));
const TermsOfServicePage = safeLazy(() => import('../pages/10_legal/terms-of-service/TermsOfServicePage'));
const DataDeletionPage = safeLazy(() => import('../pages/10_legal/data-deletion/DataDeletionPage'));
const AdvancedSearchPage = safeLazy(() => import('../pages/05_search-browse/advanced-search/AdvancedSearchPage'));
const AlgoliaSearchPage = safeLazy(() => import('../pages/05_search-browse/algolia-search/AlgoliaSearchPage'));
const MyListingsPage = safeLazy(() => import('../pages/03_user-pages/my-listings/MyListingsPage'));
const MyDraftsPage = safeLazy(() => import('../pages/03_user-pages/my-drafts/MyDraftsPage'));
const GaragePage = safeLazy(() => import('../pages/03_user-pages/garage/GaragePage'));
const AcceptInvitePage = safeLazy(() => import('../pages/03_user-pages/AcceptInvitePage'));
const MigrationPage = safeLazy(() => import('../pages/06_admin/MigrationPage'));
const DebugCarsPage = safeLazy(() => import('../pages/06_admin/DebugCarsPage'));
const EditCarPage = safeLazy(() => import('../pages/04_car-selling/EditCarPage'));
const B2BAnalyticsPortal = safeLazy(() => import('../pages/07_advanced-features/B2BAnalyticsPortal'));
const SubscriptionPage = safeLazy(() => import('../pages/08_payment-billing/SubscriptionPage'));
const AboutPage = safeLazy(() => import('../pages/01_main-pages/about/AboutPage'));
const BrandGalleryPage = safeLazy(() => import('../pages/05_search-browse/brand-gallery/BrandGalleryPage'));
const TopBrandsPage = safeLazy(() => import('../pages/05_search-browse/top-brands/TopBrandsPage'));
const DealersPage = safeLazy(() => import('../pages/05_search-browse/dealers/DealersPage'));
const ViewAllNewCarsPage = safeLazy(() => import('../pages/05_search-browse/view-all-new-cars/ViewAllNewCarsPage'));
const ViewAllDealersPage = safeLazy(() => import('../pages/05_search-browse/view-all-dealers/ViewAllDealersPage'));
const MapAnalyticsPage = safeLazy(() => import('../pages/01_main-pages/map/MapPage'));
const FinancePage = safeLazy(() => import('../pages/05_search-browse/finance/FinancePage'));
const FinancingCalculatorPage = safeLazy(() => import('../pages/financing/FinancingCalculatorPage'));
const FinancingComparisonPage = safeLazy(() => import('../pages/financing/FinancingComparisonPage'));
const OpenBankingInstantPage = safeLazy(() => import('../pages/07_advanced-features/OpenBankingInstantPage'));
const CrossBorderEscrowPage = safeLazy(() => import('../pages/07_advanced-features/CrossBorderEscrowPage'));
const OmniScanSellPage = safeLazy(() => import('../pages/07_advanced-features/OmniScanSellPage'));
const ContactPage = safeLazy(() => import('../pages/01_main-pages/contact/ContactPage'));
const HelpPage = safeLazy(() => import('../pages/01_main-pages/help/HelpPage'));
const CookiePolicyPage = safeLazy(() => import('../pages/10_legal/cookie-policy/CookiePolicyPage'));
const SitemapPage = safeLazy(() => import('../pages/10_legal/sitemap/SitemapPage'));
const WhyUsPage = safeLazy(() => import('../pages/10_landing/WhyUsPage'));
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
const PaymentFailedPage = safeLazy(() => import('../pages/08_payment-billing/PaymentFailedPage'));
const UpdatePaymentMethodPage = safeLazy(() => import('../pages/08_payment-billing/UpdatePaymentMethodPage'));
// ✅ NEW: Manual Bank Transfer Payment Pages
const ManualCheckoutPage = safeLazy(() => import('../pages/08_payment-billing/ManualCheckoutPage'));
const ManualPaymentSuccessPage = safeLazy(() => import('../pages/08_payment-billing/ManualPaymentSuccessPage'));
const DealerRegistrationPage = safeLazy(() => import('../pages/09_dealer-company/DealerRegistrationPage'));
const DealerDashboardPage = safeLazy(() => import('../pages/09_dealer-company/DealerDashboardPage'));
const SubscriptionSelectionPage = safeLazy(() => import('../pages/dealer/SubscriptionSelectionPage'));
const BulkReviewPage = safeLazy(() => import('../pages/09_dealer-company/BulkReviewPage'));
const AlgoliaSyncManager = safeLazy(() => import('../pages/06_admin/AlgoliaSyncManager'));
const AdminCarManagementPage = safeLazy(() => import('../pages/06_admin/regular-admin/AdminCarManagementPage'));
const ContentModerationPage = safeLazy(() => import('../components/AdvancedContentManagement'));
// 🔥 NEW: Car History Report Page - COMPETITIVE ADVANTAGE!
const CarHistoryPage = safeLazy(() => import('../pages/07_car-details/CarHistoryPage'));
// 🔗 NEW: Routing with slug support and short links (2026-02-19)
// ListingSlugRedirectPage removed — conflicted with /car/:sellerNumericId/:carNumericId
const UserProfileSlugRedirectPage = safeLazy(() => import('../pages/03_user-pages/UserProfileSlugRedirectPage'));
const UserSettingsGuardedPage = safeLazy(() => import('../pages/03_user-pages/UserSettingsGuardedPage'));
import { ShortLinkResolverComponent } from '../hooks/useShortLinkResolver';
const DeleteMockCarsPage = safeLazy(() => import('../pages/06_admin/DeleteMockCarsPage'));
const CarTrackingPage = safeLazy(() => import('../pages/03_user-pages/CarTrackingPage'));
const IoTAnalyticsPage = safeLazy(() => import('../pages/03_user-pages/IoTAnalyticsPage'));
const AIDashboardPage = safeLazy(() => import('../pages/03_user-pages/ai-dashboard/AIDashboardPage'));
const AIQuotaManager = safeLazy(() => import('../pages/06_admin/AIQuotaManager'));
const IntegrationStatusDashboard = safeLazy(() => import('../components/admin/IntegrationStatusDashboard'));
const QuickSetupPage = safeLazy(() => import('../pages/06_admin/QuickSetupPage'));
const CloudServicesManager = safeLazy(() => import('../pages/06_admin/CloudServicesManager'));
const CityCarsPage = safeLazy(() => import('../pages/seo/CityCarsPage'));
const CityCarsLandingPage = safeLazy(() => import('../pages/seo/CityCarsLandingPage'));
const BrandCityPage = safeLazy(() => import('../pages/seo/BrandCityPage'));
const NewCarsPage = safeLazy(() => import('../pages/seo/NewCarsPage'));
const AccidentCarsPage = safeLazy(() => import('../pages/seo/AccidentCarsPage'));
// 🗺️ Programmatic SEO: Location Landing Pages
const LocationLandingPage = safeLazy(() => import('../pages/05_search-browse/location/LocationLandingPage'));
const SocialHubPage = safeLazy(() => import('../pages/01_main-pages/social-hub'));
const CarNotFoundPage = safeLazy(() => import('../pages/02_error-pages/CarNotFoundPage'));
const NotFoundPage = safeLazy(() => import('../components/NotFoundPage'));

// 🆕 Dynamic Car Showcase Pages (Container Pages)
const DynamicCarShowcase = safeLazy(() => import('../pages/05_search-browse/DynamicCarShowcase')) as unknown as React.ComponentType<any>;

// Helper for dev tools components
const BackupManagement = safeLazy(() => import('../components/admin/BackupManagement'));
const LeadScoringDashboard = safeLazy(() => import('../components/messaging/LeadScoringDashboard'));
const QuickReplyManager = safeLazy(() => import('../components/messaging/QuickReplyManager'));
const AutoResponderSettings = safeLazy(() => import('../components/messaging/AutoResponderSettings'));
const AuthUsersPage = safeLazy(() => import('../pages/06_admin/AuthUsersPage'));
const SharedInboxPage = safeLazy(() => import('../pages/06_admin/SharedInboxPage'));
const StripeSetupPage = safeLazy(() => import('../pages/09_dealer-company/StripeSetupPage'));
const AdminManualPaymentsDashboard = safeLazy(() => import('../pages/06_admin/finance/manual-payments/AdminManualPaymentsDashboard'));
const AuctionsPage = safeLazy(() => import('../pages/01_main-pages/auctions/AuctionsPage'));
const KATServicesPage = safeLazy(() => import('../pages/07_advanced-features/KATServicesPage'));
const DevelopmentToolsPage = safeLazy(() => import('../pages/11_test-pages/DevelopmentToolsPage'));






/**
 * Main Content Routes
 * Extracted from AppRoutes.tsx for modularity
 */
export const MainRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/KAT-R-BG" element={<KATServicesPage />} />

            {/* 🔗 SHORT LINKS - Must be early to avoid shadowing by wildcards */}
            <Route path="/s/:shortCode" element={<ShortLinkResolverComponent />} />

            <Route path="/social" element={<SocialFeedPage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* 🤖 AI Car Advisor */}
            <Route path="/advisor" element={<AIAdvisorPage />} />

            {/* 💰 AI Car Valuation */}
            <Route path="/valuation" element={<AIValuationPage />} />
            <Route path="/valuation/:brand" element={<AIValuationPage />} />

            {/* 📜 AI Car History */}
            <Route path="/history" element={<AIHistoryPage />} />

            {/* 💳 Financing Calculator */}
            <Route path="/financing" element={<FinancingCalculatorPage />} />
            <Route path="/financing/compare" element={<FinancingComparisonPage />} />
            <Route
                path="/financing/instant"
                element={
                    <AuthGuard requireAuth={true}>
                        <OpenBankingInstantPage />
                    </AuthGuard>
                }
            />

            {/* 🌍 Cross-Border Import Escrow */}
            <Route
                path="/import/escrow"
                element={
                    <AuthGuard requireAuth={true}>
                        <CrossBorderEscrowPage />
                    </AuthGuard>
                }
            />

            {/* 📸 Omni-Scan AI Sell Flow */}
            <Route
                path="/sell/scan"
                element={
                    <AuthGuard requireAuth={true}>
                        <OmniScanSellPage />
                    </AuthGuard>
                }
            />

            {/* 🛒 Marketplace - Parts & Accessories */}
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/product/:productId" element={<ProductDetailPage />} />
            <Route path="/marketplace/cart" element={<CartPage />} />
            <Route path="/marketplace/checkout" element={<MarketplaceCheckoutPage />} />
            <Route path="/marketplace/payment" element={<StripePaymentPage />} />
            <Route path="/marketplace/order-success" element={<OrderSuccessPage />} />

            {/* 📝 Blog - Bulgarian Content & SEO */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/ai-valuation-works" element={<AiValuationDeepDive />} />
            <Route path="/blog/bulgarian-market-2026" element={<BulgarianCarMarket2026 />} />
            <Route path="/blog/marketplace-comparison" element={<MarketplaceComparison2026 />} />
            <Route path="/blog/technical-deep-dive" element={<HybridSearchDeepDive />} />
            <Route path="/blog/neural-pricing" element={<NeuralPricingDeepDive />} />
            <Route path="/blog/constitutional-coding" element={<ConstitutionalCodingDeepDive />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />

            {/* 🏙️ SEO: City Landing Pages */}
            <Route path="/city/:city" element={<CityCarsLandingPage />} />

            {/* 🆕 Dynamic Car Showcase Pages (Container Pages) */}
            <Route path="/cars/all" element={<DynamicCarShowcase pageType="all" />} />
            <Route path="/cars/family" element={<DynamicCarShowcase pageType="family" />} />
            <Route path="/cars/sport" element={<DynamicCarShowcase pageType="sport" />} />
            <Route path="/cars/womens" element={<DynamicCarShowcase pageType="womens" />} />
            <Route path="/cars/vip" element={<DynamicCarShowcase pageType="vip" />} />
            <Route path="/cars/classic" element={<DynamicCarShowcase pageType="classic" />} />
            <Route path="/cars/new" element={<DynamicCarShowcase pageType="new" />} />
            <Route path="/cars/used" element={<DynamicCarShowcase pageType="used" />} />
            <Route path="/cars/economy" element={<DynamicCarShowcase pageType="economy" />} />
            <Route path="/cars/city/:cityName" element={<DynamicCarShowcase pageType="city" />} />
            <Route path="/cars/brand/:brandName" element={<DynamicCarShowcase pageType="brand" />} />

            {/* ✅ NEW FILTER ROUTES (January 30, 2026) */}
            {/* ⚡ Electric Cars - fuel_type = electric */}
            <Route path="/cars/electric" element={<DynamicCarShowcase pageType="electric" />} />
            {/* 🔋 Hybrid Cars - fuel_type = hybrid */}
            <Route path="/cars/hybrid" element={<DynamicCarShowcase pageType="hybrid" />} />
            {/* ✨ Low Mileage (Like New) - mileage <= 3515 km */}
            <Route path="/cars/low-mileage" element={<DynamicCarShowcase pageType="lowMileage" />} />
            <Route path="/cars/like-new" element={<DynamicCarShowcase pageType="lowMileage" />} />
            {/* 🆕 Newly Added - sorted by created_at DESC */}
            <Route path="/cars/newly-added" element={<DynamicCarShowcase pageType="newlyAdded" />} />
            <Route path="/cars/latest" element={<DynamicCarShowcase pageType="newlyAdded" />} />
            {/* 💰 Budget Cars - price < 5000 EUR */}
            <Route path="/cars/budget" element={<DynamicCarShowcase pageType="budget" />} />
            <Route path="/cars/cheap" element={<DynamicCarShowcase pageType="budget" />} />
            {/* ✅ Verified Dealers */}
            <Route path="/cars/verified-dealers" element={<DynamicCarShowcase pageType="verifiedDealer" />} />
            {/* 🚙 Body Types */}
            <Route path="/cars/suv" element={<DynamicCarShowcase pageType="suv" />} />
            <Route path="/cars/sedan" element={<DynamicCarShowcase pageType="sedan" />} />
            <Route path="/cars/hatchback" element={<DynamicCarShowcase pageType="hatchback" />} />
            {/* ⛽ Fuel Types */}
            <Route path="/cars/diesel" element={<DynamicCarShowcase pageType="diesel" />} />
            <Route path="/cars/petrol" element={<DynamicCarShowcase pageType="petrol" />} />

            {/* �️ PROGRAMMATIC SEO: Location Landing Pages (Long-Tail Trap) */}
            <Route path="/cars/:city" element={<LocationLandingPage />} />
            <Route path="/cars/:city/:brand" element={<LocationLandingPage />} />
            <Route path="/cars/:city/:fuelType/:priceRange" element={<LocationLandingPage />} />

            {/* �👑 SUPER ADMIN ROUTES - THE GOD MODE (Restored Phase 1) */}
            <Route path="/super-admin-login" element={<SuperAdminLoginPage />} />
            <Route path="/super-admin/*" element={
                <RoleGuard requireSuperAdmin={true}>
                    <SuperAdminDashboard />
                </RoleGuard>
            } />

            {/* 🔢 Strict Numeric Car URLs (Constitution: /car/:sellerNumericId/:carNumericId) */}
            <Route path="/car/:sellerNumericId/:carNumericId" element={<NumericCarDetailsPage />} />
            <Route path="/car/:sellerNumericId/:carNumericId/edit" element={
                <AuthGuard requireAuth={true}>
                    <EditCarPage />
                </AuthGuard>
            } />
            {/* 🔥 NEW: Car History Report - COMPETITIVE ADVANTAGE! */}
            <Route path="/car/:sellerNumericId/:carNumericId/history" element={
                <Suspense fallback={<LoadingSpinner size="medium" />}>
                    <CarHistoryPage />
                </Suspense>
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
                path="/dealer/subscription"
                element={
                    <AuthGuard requireAuth={true}>
                        <SubscriptionSelectionPage />
                    </AuthGuard>
                }
            />
            <Route
                path="/dealer-dashboard"
                element={
                    <AuthGuard requireAuth={true}>
                        <DealerDashboardPage />
                    </AuthGuard>
                }
            />
            <Route
                path="/dealer/bulk-review/:batchId"
                element={
                    <AuthGuard requireAuth={true}>
                        <BulkReviewPage />
                    </AuthGuard>
                }
            />
            {/* Alias for seller-dashboard */}
            <Route
                path="/seller-dashboard"
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

            {/* � USER PROFILE ROUTES WITH SLUG SUPPORT (2026-02-19) */}
            {/* Handles: /u/123 and /u/123/john-doe */}
            <Route path="/u/:userNumericId/:slug?" element={<UserProfileSlugRedirectPage />} />
            {/* Settings page with access control (owner or admin only) */}
            <Route path="/profile/:userNumericId/settings" element={<UserSettingsGuardedPage />} />

            {/* �🔢 Numeric ID-based profile routes (world-class URLs) */}
            <Route path="/profile/*" element={<NumericProfileRouter />} />

            {/* 🔢 Numeric Car Details Pages */}
            {/* Strict Numeric URLs: /car/{userNumericId}/{carNumericId} */}
            {/* Route already defined above at line 102 */}

            {/* 💬 Realtime Messaging System */}
            <Route path="/messages" element={<AuthGuard requireAuth={true}><RealtimeMessagesPage /></AuthGuard>} />
            <Route path="/messages-v2" element={<AuthGuard requireAuth={true}><RealtimeMessagesPage /></AuthGuard>} />

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
            {/* ✅ NEW: Manual Bank Transfer Payment Routes */}
            <Route
                path="/billing/manual-checkout"
                element={
                    <AuthGuard requireAuth={true}>
                        <ManualCheckoutPage />
                    </AuthGuard>
                }
            />
            <Route
                path="/billing/manual-success"
                element={
                    <AuthGuard requireAuth={true}>
                        <ManualPaymentSuccessPage />
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
            <Route
                path="/payment-failed"
                element={
                    <AuthGuard requireAuth={true}>
                        <PaymentFailedPage />
                    </AuthGuard>
                }
            />
            <Route
                path="/billing/update-payment-method"
                element={
                    <AuthGuard requireAuth={true}>
                        <UpdatePaymentMethodPage />
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
                path="/admin/moderation"
                element={
                    <AuthGuard requireAuth={true} requireAdmin={true}>
                        <ContentModerationPage />
                    </AuthGuard>
                }
            />
            <Route
                path="/super-admin/finance/manual-payments"
                element={
                    <AuthGuard requireAuth={true} requireAdmin={true}>
                        <AdminManualPaymentsDashboard />
                    </AuthGuard>
                }
            />
            {/* Moved to Dev Tools Block */},
            {/* Moved to Dev Tools Block */}
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
            <Route path="/car-tracking" element={<AuthGuard requireAuth={true}><CarTrackingPage /></AuthGuard>} />
            <Route path="/iot-analytics" element={<AuthGuard requireAuth={true}><IoTAnalyticsPage /></AuthGuard>} />
            <Route path="/ai-dashboard" element={<AuthGuard requireAuth={true}><AIDashboardPage /></AuthGuard>} />
            <Route path="/admin/ai-quotas" element={<AuthGuard requireAuth={true}><AIQuotaManager /></AuthGuard>} />
            <Route path="/admin/integration-status" element={<AuthGuard requireAuth={true}><IntegrationStatusDashboard /></AuthGuard>} />
            <Route path="/admin/setup" element={<AuthGuard requireAuth={true}><QuickSetupPage /></AuthGuard>} />
            <Route path="/admin/cloud-services" element={<AuthGuard requireAuth={true}><CloudServicesManager /></AuthGuard>} />
            <Route path="/admin/algolia-sync" element={<AuthGuard requireAuth={true} requireAdmin={true}><AlgoliaSyncManager /></AuthGuard>} />


            {/* Development Tools Routes - ONLY AVAILABLE IN DEV */}
            {IS_DEV && (
                <>
                    <Route path="/admin/backup" element={<AuthGuard requireAuth={true} requireAdmin={true}><BackupManagement /></AuthGuard>} />
                    <Route path="/admin/leads" element={<AuthGuard requireAuth={true} requireAdmin={true}><LeadScoringDashboard /></AuthGuard>} />
                    <Route path="/messages/quick-replies" element={<AuthGuard requireAuth={true}><QuickReplyManager /></AuthGuard>} />
                    <Route path="/messages/auto-responder" element={<AuthGuard requireAuth={true}><AutoResponderSettings /></AuthGuard>} />
                    <Route path="/admin/auth-users" element={<AuthGuard requireAuth={true} requireAdmin={true}><AuthUsersPage /></AuthGuard>} />
                    <Route path="/admin/shared-inbox" element={<AuthGuard requireAuth={true} requireAdmin={true}><SharedInboxPage /></AuthGuard>} />
                    <Route path="/dealer/stripe-setup" element={<AuthGuard requireAuth={true}><StripeSetupPage /></AuthGuard>} />
                    <Route path="/admin/delete-mock-cars" element={<AuthGuard requireAuth={true} requireAdmin={true}><DeleteMockCarsPage /></AuthGuard>} />
                    <Route path="/debug-cars" element={<AuthGuard requireAuth={true}><DebugCarsPage /></AuthGuard>} />
                    <Route path="/development-tools" element={<DevelopmentToolsPage />} />
                </>
            )}

            {/* Company Routes */}
            <Route path="/company/team" element={<RequireCompanyGuard><TeamManagementPage /></RequireCompanyGuard>} />
            <Route path="/company/analytics" element={<RequireCompanyGuard><CompanyAnalyticsDashboard /></RequireCompanyGuard>} />

            <Route path="/advanced-search" element={<AuthGuard requireAuth={false}><AdvancedSearchPage /></AuthGuard>} />

            <Route path="/my-listings" element={<AuthGuard requireAuth={true}><MyListingsPage /></AuthGuard>} />
            <Route path="/my-drafts" element={<AuthGuard requireAuth={true}><MyDraftsPage /></AuthGuard>} />
            <Route path="/my-garage" element={<AuthGuard requireAuth={true}><GaragePage /></AuthGuard>} />
            <Route path="/analytics" element={<AuthGuard requireAuth={true}><B2BAnalyticsPortal /></AuthGuard>} />
            <Route path="/subscription" element={<AuthGuard requireAuth={true}><SubscriptionPage /></AuthGuard>} />
            <Route path="/migration" element={<AuthGuard requireAuth={true}><MigrationPage /></AuthGuard>} />
            {/* Moved to Dev Tools Block */}

            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/data-deletion" element={<DataDeletionPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/social-hub" element={<SocialHubPage />} />
            <Route path="/competitive-comparison" element={<CompetitiveComparisonPage />} />
            <Route path="/pricing" element={<CarPricingPage />} />
            <Route path="/ai-analysis" element={<AIAnalysisPage />} />
            <Route path="/visual-search" lazy={async () => {
                const { VisualSearchPage } = await import('../pages/VisualSearchPage');
                return { Component: VisualSearchPage };
            }} />
            <Route path="/architecture" lazy={async () => {
                const mod = await import('../pages/ArchitectureDiagramPage');
                return { Component: mod.default };
            }} />
            <Route path="/map" element={<MapAnalyticsPage />} />
            <Route path="/auctions" element={<AuctionsPage />} />
            <Route path="/top-brands" element={<TopBrandsPage />} />
            <Route path="/brand-gallery" element={<AuthGuard requireAuth={true}><BrandGalleryPage /></AuthGuard>} />
            <Route path="/dealers" element={<AuthGuard requireAuth={true}><DealersPage /></AuthGuard>} />
            <Route path="/view-all-new-cars" element={<ViewAllNewCarsPage />} />
            <Route path="/view-all-dealers" element={<ViewAllDealersPage />} />
            <Route path="/finance" element={<AuthGuard requireAuth={true}><FinancePage /></AuthGuard>} />

            <Route path="/contact" element={<ContactPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/support" element={<HelpPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/why-us" element={<WhyUsPage />} />
            <Route
                path="/launch-offer"
                lazy={async () => {
                    const LaunchOfferPage = await import('../pages/10_landing/LaunchOfferPage');
                    return { Component: LaunchOfferPage.default };
                }}
            />

            {/* Browse redirects — LifeMoments + brand links → CarsPage */}
            <Route path="/browse/:brandId" element={<BrowseRedirect />} />
            <Route path="/browse" element={<BrowseRedirect />} />

            {/* SEO City-Brand Pages: /bmw-sofia, /audi-plovdiv, etc. */}
            <Route path="/:slug" element={<SEOCityBrandPage />} />

            {/* Error Pages */}
            <Route path="/500" lazy={async () => {
                const mod = await import('../pages/02_error-pages/ServerErrorPage');
                return { Component: mod.default };
            }} />
            <Route path="/offline" lazy={async () => {
                const mod = await import('../pages/02_error-pages/OfflinePage');
                return { Component: mod.default };
            }} />
            <Route path="/403" lazy={async () => {
                const mod = await import('../pages/02_error-pages/ForbiddenPage');
                return { Component: mod.default };
            }} />

            <Route path="*" element={<Suspense fallback={<LoadingSpinner size="medium" />}><NotFoundPage /></Suspense>} />
        </Routes>
    );
};
