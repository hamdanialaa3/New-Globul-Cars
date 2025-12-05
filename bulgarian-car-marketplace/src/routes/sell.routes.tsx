// src/routes/sell.routes.tsx
/**
 * Sell Workflow Routes
 * 
 * Contains all car selling workflow routes (~25 routes):
 * - Vehicle start page
 * - Seller type selection
 * - Vehicle data entry
 * - Equipment selection
 * - Images upload
 * - Pricing
 * - Contact information
 * - Preview
 * - Submission
 * 
 * Includes both new unified routes and legacy routes for backward compatibility
 * 
 * Created: Week 2, Day 3
 * Part of: Route Extraction Refactoring
 */

import React, { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthGuard } from '../components/guards';
import { useIsMobile } from '../hooks/useIsMobile';

// Lazy load sell workflow pages
const VehicleStartPage = React.lazy(() => import('@/pages/04_car-selling/sell/VehicleStartPageNew'));
const MobileSellerTypePage = React.lazy(() => import('@/pages/04_car-selling/sell/MobileSellerTypePage'));
const VehicleDataPageUnified = React.lazy(() => import('@/pages/04_car-selling/sell/VehicleDataPageUnified'));

// Equipment pages
const UnifiedEquipmentPage = React.lazy(() => import('@/pages/04_car-selling/sell/Equipment/UnifiedEquipmentPage'));
const EquipmentMainPage = React.lazy(() => import('@/pages/04_car-selling/sell/EquipmentMainPage'));
const MobileEquipmentMainPage = React.lazy(() => import('@/pages/04_car-selling/sell/MobileEquipmentMainPage'));
const SafetyEquipmentPage = React.lazy(() => import('@/pages/04_car-selling/sell/Equipment/SafetyPage'));
const ComfortEquipmentPage = React.lazy(() => import('@/pages/04_car-selling/sell/Equipment/ComfortPage'));
const InfotainmentEquipmentPage = React.lazy(() => import('@/pages/04_car-selling/sell/Equipment/InfotainmentPage'));
const ExtrasEquipmentPage = React.lazy(() => import('@/pages/04_car-selling/sell/Equipment/ExtrasPage'));

// Details pages
const ImagesPageUnified = React.lazy(() => import('@/pages/04_car-selling/sell/ImagesPageUnified'));
const PricingPage = React.lazy(() => import('@/pages/04_car-selling/sell/Pricing'));
const MobilePricingPage = React.lazy(() => import('@/pages/04_car-selling/sell/MobilePricingPage'));

// Contact pages
const UnifiedContactPage = React.lazy(() => import('@/pages/04_car-selling/sell/UnifiedContactPage'));
const MobileContactPage = React.lazy(() => import('@/pages/04_car-selling/sell/MobileContactPage'));
const ContactNamePage = React.lazy(() => import('@/pages/04_car-selling/sell/ContactNamePage'));
const ContactAddressPage = React.lazy(() => import('@/pages/04_car-selling/sell/ContactAddressPage'));
const ContactPhonePage = React.lazy(() => import('@/pages/04_car-selling/sell/ContactPhonePage'));

// Preview and submission pages
const MobilePreviewPage = React.lazy(() => import('@/pages/04_car-selling/sell/MobilePreviewPage'));
const DesktopPreviewPage = React.lazy(() => import('@/pages/04_car-selling/sell/DesktopPreviewPage'));
const MobileSubmissionPage = React.lazy(() => import('@/pages/04_car-selling/sell/MobileSubmissionPage'));
const DesktopSubmissionPage = React.lazy(() => import('@/pages/04_car-selling/sell/DesktopSubmissionPage'));

/**
 * Sell Routes Component
 * 
 * Renders all sell workflow routes with AuthGuard protection
 * Handles mobile/desktop variations automatically
 * 
 * Total Routes: ~25
 * - Main workflow: 9 routes
 * - Legacy equipment: 5 routes
 * - Legacy contact: 3 routes
 * - Redirects: 3 routes
 * 
 * @returns {JSX.Element} Sell workflow routes
 */
export const SellRoutes: React.FC = () => {
    const isMobile = useIsMobile();

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* ==================== REDIRECTS ==================== */}

                {/* Main sell entry point - redirect to /sell/auto */}
                <Route path="/sell" element={<Navigate to="/sell/auto" replace />} />

                {/* Legacy route redirects */}
                <Route path="/sell-car" element={<Navigate to="/sell/auto" replace />} />
                <Route path="/add-car" element={<Navigate to="/sell/auto" replace />} />

                {/* ==================== MAIN WORKFLOW ==================== */}

                {/* Step 1: Vehicle Start Page */}
                <Route
                    path="/sell/auto"
                    element={
                        <AuthGuard requireAuth={true}>
                            <VehicleStartPage />
                        </AuthGuard>
                    }
                />

                {/* Step 2: Seller Type Selection */}
                <Route
                    path="/sell/inserat/:vehicleType/verkaeufertyp"
                    element={
                        <AuthGuard requireAuth={true}>
                            <MobileSellerTypePage />
                        </AuthGuard>
                    }
                />

                {/* Step 3: Vehicle Data (Drive & Environment) */}
                <Route
                    path="/sell/inserat/:vehicleType/fahrzeugdaten/antrieb-und-umwelt"
                    element={
                        <AuthGuard requireAuth={true}>
                            <VehicleDataPageUnified />
                        </AuthGuard>
                    }
                />

                {/* Step 4: Equipment - Unified Page (NEW) */}
                <Route
                    path="/sell/inserat/:vehicleType/equipment"
                    element={
                        <AuthGuard requireAuth={true}>
                            <UnifiedEquipmentPage />
                        </AuthGuard>
                    }
                />

                {/* Step 5: Images Upload */}
                <Route
                    path="/sell/inserat/:vehicleType/details/bilder"
                    element={
                        <AuthGuard requireAuth={true}>
                            <ImagesPageUnified />
                        </AuthGuard>
                    }
                />

                {/* Step 6: Pricing */}
                <Route
                    path="/sell/inserat/:vehicleType/details/preis"
                    element={
                        <AuthGuard requireAuth={true}>
                            {isMobile ? <MobilePricingPage /> : <PricingPage />}
                        </AuthGuard>
                    }
                />

                {/* Step 7: Contact Information - Unified Page (NEW) */}
                <Route
                    path="/sell/inserat/:vehicleType/contact"
                    element={
                        <AuthGuard requireAuth={true}>
                            {isMobile ? <MobileContactPage /> : <UnifiedContactPage />}
                        </AuthGuard>
                    }
                />

                {/* Step 8: Preview / Summary */}
                <Route
                    path="/sell/inserat/:vehicleType/preview"
                    element={
                        <AuthGuard requireAuth={true}>
                            {isMobile ? <MobilePreviewPage /> : <DesktopPreviewPage />}
                        </AuthGuard>
                    }
                />

                {/* Step 9: Final Submission */}
                <Route
                    path="/sell/inserat/:vehicleType/submission"
                    element={
                        <AuthGuard requireAuth={true}>
                            {isMobile ? <MobileSubmissionPage /> : <DesktopSubmissionPage />}
                        </AuthGuard>
                    }
                />

                {/* ==================== LEGACY EQUIPMENT ROUTES ==================== */}
                {/* Keep for backward compatibility */}

                {/* Equipment Main Page */}
                <Route
                    path="/sell/inserat/:vehicleType/ausstattung"
                    element={
                        <AuthGuard requireAuth={true}>
                            {isMobile ? <MobileEquipmentMainPage /> : <EquipmentMainPage />}
                        </AuthGuard>
                    }
                />

                {/* Safety Equipment */}
                <Route
                    path="/sell/inserat/:vehicleType/ausstattung/sicherheit"
                    element={
                        <AuthGuard requireAuth={true}>
                            <SafetyEquipmentPage />
                        </AuthGuard>
                    }
                />

                {/* Comfort Equipment */}
                <Route
                    path="/sell/inserat/:vehicleType/ausstattung/komfort"
                    element={
                        <AuthGuard requireAuth={true}>
                            <ComfortEquipmentPage />
                        </AuthGuard>
                    }
                />

                {/* Infotainment Equipment */}
                <Route
                    path="/sell/inserat/:vehicleType/ausstattung/infotainment"
                    element={
                        <AuthGuard requireAuth={true}>
                            <InfotainmentEquipmentPage />
                        </AuthGuard>
                    }
                />

                {/* Extras Equipment */}
                <Route
                    path="/sell/inserat/:vehicleType/ausstattung/extras"
                    element={
                        <AuthGuard requireAuth={true}>
                            <ExtrasEquipmentPage />
                        </AuthGuard>
                    }
                />

                {/* ==================== LEGACY CONTACT ROUTES ==================== */}
                {/* Keep for backward compatibility */}

                {/* Contact Name */}
                <Route
                    path="/sell/inserat/:vehicleType/kontakt/name"
                    element={
                        <AuthGuard requireAuth={true}>
                            <ContactNamePage />
                        </AuthGuard>
                    }
                />

                {/* Contact Address */}
                <Route
                    path="/sell/inserat/:vehicleType/kontakt/adresse"
                    element={
                        <AuthGuard requireAuth={true}>
                            <ContactAddressPage />
                        </AuthGuard>
                    }
                />

                {/* Contact Phone */}
                <Route
                    path="/sell/inserat/:vehicleType/kontakt/telefonnummer"
                    element={
                        <AuthGuard requireAuth={true}>
                            <ContactPhonePage />
                        </AuthGuard>
                    }
                />
            </Routes>
        </Suspense>
    );
};

/**
 * Usage in App.tsx:
 * 
 * import { FEATURE_FLAGS } from '../config/feature-flags';
 * import { SellRoutes } from '@/routes/sell.routes';
 * 
 * // In your Routes:
 * {FEATURE_FLAGS.USE_SELL_ROUTES ? (
 *   <Route path="/*" element={<SellRoutes />} />
 * ) : (
 *   // Legacy sell routes
 *   <>
 *     <Route path="/sell" element={...} />
 *     <Route path="/sell/auto" element={...} />
 *     ...
 *   </>
 * )}
 */

/**
 * Route Flow:
 * 
 * 1. /sell → redirects to /sell/auto
 * 2. /sell/auto → Vehicle start page
 * 3. /sell/inserat/:vehicleType/verkaeufertyp → Seller type
 * 4. /sell/inserat/:vehicleType/fahrzeugdaten/antrieb-und-umwelt → Vehicle data
 * 5. /sell/inserat/:vehicleType/equipment → Equipment (unified)
 * 6. /sell/inserat/:vehicleType/details/bilder → Images
 * 7. /sell/inserat/:vehicleType/details/preis → Pricing
 * 8. /sell/inserat/:vehicleType/contact → Contact info (unified)
 * 9. /sell/inserat/:vehicleType/preview → Preview
 * 10. /sell/inserat/:vehicleType/submission → Submit
 */

/**
 * Mobile/Desktop Handling:
 * 
 * Some routes render different components based on device:
 * - Pricing: MobilePricingPage vs PricingPage
 * - Contact: MobileContactPage vs UnifiedContactPage
 * - Equipment Main: MobileEquipmentMainPage vs EquipmentMainPage
 * - Preview: MobilePreviewPage vs DesktopPreviewPage
 * - Submission: MobileSubmissionPage vs DesktopSubmissionPage
 * 
 * Uses useIsMobile() hook to detect device type
 */

/**
 * Security Notes:
 * 
 * - All routes require authentication (requireAuth={true})
 * - Uses AuthGuard component for protection
 * - Unauthenticated users redirected to login
 * - Session state preserved for return after login
 */

export default SellRoutes;
