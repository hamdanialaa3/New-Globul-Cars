// src/routes/main.routes.tsx
/**
 * Main Application Routes
 * 
 * Contains all main application routes (~40+ routes):
 * - Home & Public pages
 * - Cars listing & details
 * - Social feed
 * - User profile
 * - Messages
 * - Search
 * - Billing & Payment
 * - Notifications
 * - Favorites & Saved searches
 * - Analytics & Dashboard
 * - Test/Demo pages
 * - IoT features
 * - Legal pages
 * 
 * Created: Week 2, Day 4
 * Part of: Route Extraction Refactoring
 */

import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthGuard } from '@/components/guards';
import ProtectedRoute from '@/components/ProtectedRoute';

// ==================== PUBLIC PAGES ====================
const HomePage = React.lazy(() => import('@/pages/01_main-pages/home/HomePage'));
const CarsPage = React.lazy(() => import('@/pages/01_main-pages/cars/CarsPage'));
const CarDetailsPage = React.lazy(() => import('@/pages/01_main-pages/car-details/CarDetailsPage'));
const SocialFeedPage = React.lazy(() => import('@/pages/01_main-pages/social-feed/SocialFeedPage'));
const CreatePostPage = React.lazy(() => import('@/pages/01_main-pages/social-feed/CreatePostPage'));

// ==================== USER PAGES ====================
const ProfileRouter = React.lazy(() => import('@/pages/03_user-pages/profile/ProfilePage/ProfileRouter'));
const MessagesPage = React.lazy(() => import('@/pages/03_user-pages/messages/MessagesPage'));
const VerificationPage = React.lazy(() => import('@/pages/03_user-pages/verification/VerificationPage'));
const BillingPage = React.lazy(() => import('@/pages/03_user-pages/billing/BillingPage'));
const NotificationsPage = React.lazy(() => import('@/pages/03_user-pages/notifications/NotificationsPage'));
const SavedSearchesPage = React.lazy(() => import('@/pages/03_user-pages/saved-searches/SavedSearchesPage'));
const FavoritesPage = React.lazy(() => import('@/pages/03_user-pages/favorites/FavoritesPage'));
const DashboardPage = React.lazy(() => import('@/pages/03_user-pages/dashboard/DashboardPage'));

// ==================== PAYMENT & BILLING ====================
const CheckoutPage = React.lazy(() => import('@/pages/03_user-pages/checkout/CheckoutPage'));
const PaymentSuccessPage = React.lazy(() => import('@/pages/03_user-pages/payment/PaymentSuccessPage'));
const PaymentCanceledPage = React.lazy(() => import('@/pages/03_user-pages/payment/PaymentCanceledPage'));
const BillingSuccessPage = React.lazy(() => import('@/pages/03_user-pages/billing/BillingSuccessPage'));
const BillingCanceledPage = React.lazy(() => import('@/pages/03_user-pages/billing/BillingCanceledPage'));
const InvoicesPage = React.lazy(() => import('@/pages/03_user-pages/invoices/InvoicesPage'));
const CommissionsPage = React.lazy(() => import('@/pages/03_user-pages/commissions/CommissionsPage'));

// ==================== BROWSE PAGES ====================
const AllPostsPage = React.lazy(() => import('@/pages/01_main-pages/browse/AllPostsPage'));
const AllCarsPage = React.lazy(() => import('@/pages/01_main-pages/browse/AllCarsPage'));
const UsersDirectoryPage = React.lazy(() => import('@/pages/01_main-pages/users/UsersDirectoryPage'));

// ==================== SOCIAL & EVENTS ====================
const EventsPage = React.lazy(() => import('@/pages/01_main-pages/events/EventsPage'));

// ==================== ANALYTICS & MANAGEMENT ====================
const AnalyticsDashboard = React.lazy(() => import('@/pages/05_analytics/AnalyticsDashboard'));
const TeamManagement = React.lazy(() => import('@/pages/05_management/TeamManagement'));

// ==================== IOT FEATURES ====================
const IoTDashboardPage = React.lazy(() => import('@/pages/07_iot/IoTDashboardPage'));
const CarTrackingPage = React.lazy(() => import('@/pages/07_iot/CarTrackingPage'));
const MaintenanceSchedulePage = React.lazy(() => import('@/pages/07_iot/MaintenanceSchedulePage'));

// ==================== TEST/DEMO PAGES ====================
const ThemeTest = React.lazy(() => import('@/pages/08_test/ThemeTest'));
const BackgroundTest = React.lazy(() => import('@/pages/08_test/BackgroundTest'));
const FullThemeDemo = React.lazy(() => import('@/pages/08_test/FullThemeDemo'));
const EffectsTest = React.lazy(() => import('@/pages/08_test/EffectsTest'));
const IconShowcasePage = React.lazy(() => import('@/pages/08_test/IconShowcasePage'));

// ==================== LEGAL & INFO PAGES ====================
const AboutPage = React.lazy(() => import('@/pages/09_legal/AboutPage'));
const PrivacyPage = React.lazy(() => import('@/pages/09_legal/PrivacyPage'));
const TermsPage = React.lazy(() => import('@/pages/09_legal/TermsPage'));
const ContactPage = React.lazy(() => import('@/pages/09_legal/ContactPage'));

/**
 * Main Routes Component
 * 
 * Renders all main application routes
 * 
 * Total Routes: ~40+
 * - Public: ~10 routes
 * - User: ~15 routes
 * - Payment: ~7 routes
 * - Browse: ~4 routes
 * - Social: ~2 routes
 * - Analytics: ~2 routes
 * - IoT: ~3 routes
 * - Test: ~5 routes
 * - Legal: ~4 routes
 * 
 * @returns {JSX.Element} Main application routes
 */
export const MainRoutes: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* ==================== PUBLIC PAGES ==================== */}

                {/* Home Page */}
                <Route path="/" element={<HomePage />} />

                {/* Social Feed */}
                <Route path="/social" element={<SocialFeedPage />} />

                {/* Cars Listing */}
                <Route path="/cars" element={<CarsPage />} />

                {/* Car Details (both /cars/:id and /car/:id) */}
                <Route path="/cars/:id" element={<CarDetailsPage />} />
                <Route path="/car/:id" element={<CarDetailsPage />} />

                {/* Create Post */}
                <Route path="/create-post" element={<CreatePostPage />} />

                {/* ==================== USER PAGES ==================== */}

                {/* Profile Routes (nested router handles both index and :userId) */}
                <Route path="/profile/*" element={<ProfileRouter />} />

                {/* Messages */}
                <Route path="/messages" element={<MessagesPage />} />

                {/* Verification System */}
                <Route path="/verification" element={<VerificationPage />} />

                {/* Billing System */}
                <Route path="/billing" element={<BillingPage />} />

                {/* Notifications */}
                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <NotificationsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Saved Searches */}
                <Route
                    path="/saved-searches"
                    element={
                        <ProtectedRoute>
                            <SavedSearchesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Favorites */}
                <Route
                    path="/favorites"
                    element={
                        <ProtectedRoute>
                            <FavoritesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* ==================== PAYMENT & BILLING ==================== */}

                {/* Checkout */}
                <Route
                    path="/checkout/:carId"
                    element={
                        <ProtectedRoute>
                            <CheckoutPage />
                        </ProtectedRoute>
                    }
                />

                {/* Payment Success */}
                <Route
                    path="/payment-success/:transactionId"
                    element={
                        <ProtectedRoute>
                            <PaymentSuccessPage />
                        </ProtectedRoute>
                    }
                />

                {/* Payment Canceled */}
                <Route
                    path="/payment-canceled"
                    element={
                        <ProtectedRoute>
                            <PaymentCanceledPage />
                        </ProtectedRoute>
                    }
                />

                {/* Billing Success */}
                <Route
                    path="/billing/success"
                    element={
                        <ProtectedRoute>
                            <BillingSuccessPage />
                        </ProtectedRoute>
                    }
                />

                {/* Billing Canceled */}
                <Route
                    path="/billing/canceled"
                    element={
                        <ProtectedRoute>
                            <BillingCanceledPage />
                        </ProtectedRoute>
                    }
                />

                {/* Invoices */}
                <Route
                    path="/invoices"
                    element={
                        <ProtectedRoute>
                            <InvoicesPage />
                        </ProtectedRoute>
                    }
                />

                {/* Commissions */}
                <Route
                    path="/commissions"
                    element={
                        <ProtectedRoute>
                            <CommissionsPage />
                        </ProtectedRoute>
                    }
                />

                {/* ==================== BROWSE PAGES ==================== */}

                {/* All Posts */}
                <Route path="/all-posts" element={<AllPostsPage />} />

                {/* All Cars */}
                <Route path="/all-cars" element={<AllCarsPage />} />

                {/* Users Directory */}
                <Route path="/users" element={<UsersDirectoryPage />} />
                <Route path="/all-users" element={<UsersDirectoryPage />} />

                {/* ==================== SOCIAL & EVENTS ==================== */}

                {/* Events */}
                <Route
                    path="/events"
                    element={
                        <ProtectedRoute>
                            <EventsPage />
                        </ProtectedRoute>
                    }
                />

                {/* ==================== ANALYTICS & MANAGEMENT ==================== */}

                {/* Analytics Dashboard */}
                <Route path="/analytics" element={<AnalyticsDashboard />} />

                {/* Team Management */}
                <Route path="/team" element={<TeamManagement />} />

                {/* ==================== IOT FEATURES ==================== */}

                {/* IoT Dashboard */}
                <Route
                    path="/iot-dashboard"
                    element={
                        <ProtectedRoute>
                            <IoTDashboardPage />
                        </ProtectedRoute>
                    }
                />

                {/* Car Tracking */}
                <Route
                    path="/car-tracking"
                    element={
                        <ProtectedRoute>
                            <CarTrackingPage />
                        </ProtectedRoute>
                    }
                />

                {/* Maintenance Schedule */}
                <Route
                    path="/maintenance-schedule"
                    element={
                        <ProtectedRoute>
                            <MaintenanceSchedulePage />
                        </ProtectedRoute>
                    }
                />

                {/* ==================== TEST/DEMO PAGES ==================== */}

                {/* Theme Test */}
                <Route path="/theme-test" element={<ThemeTest />} />

                {/* Background Test */}
                <Route path="/background-test" element={<BackgroundTest />} />

                {/* Full Theme Demo */}
                <Route path="/full-demo" element={<FullThemeDemo />} />

                {/* Effects Test */}
                <Route path="/effects-test" element={<EffectsTest />} />

                {/* Icon Showcase */}
                <Route path="/icon-showcase" element={<IconShowcasePage />} />

                {/* ==================== LEGAL & INFO PAGES ==================== */}

                {/* About */}
                <Route path="/about" element={<AboutPage />} />

                {/* Privacy Policy */}
                <Route path="/privacy" element={<PrivacyPage />} />

                {/* Terms of Service */}
                <Route path="/terms" element={<TermsPage />} />

                {/* Contact */}
                <Route path="/contact" element={<ContactPage />} />
            </Routes>
        </Suspense>
    );
};

/**
 * Usage in App.tsx:
 * 
 * import { FEATURE_FLAGS } from '@/config/feature-flags';
 * import { MainRoutes } from '@/routes/main.routes';
 * 
 * // In your Routes (within MainLayout):
 * {FEATURE_FLAGS.USE_EXTRACTED_ROUTES ? (
 *   <Route path="/*" element={<MainRoutes />} />
 * ) : (
 *   // Legacy main routes
 *   <>
 *     <Route path="/" element={...} />
 *     <Route path="/cars" element={...} />
 *     ...
 *   </>
 * )}
 */

/**
 * Route Categories:
 * 
 * PUBLIC (No Auth Required):
 * - Home, Cars, Car Details, Social Feed, Browse pages
 * 
 * PROTECTED (Auth Required):
 * - Profile, Messages, Dashboard, Notifications
 * - Favorites, Saved Searches
 * - Payment, Billing, Invoices, Commissions
 * - Events, IoT features
 * 
 * OPEN (Optional Auth):
 * - Test/Demo pages
 * - Legal pages
 * - Analytics (depends on implementation)
 */

export default MainRoutes;
