"use strict";
// functions/src/insurance-service.ts
// Insurance Integration Firebase Functions
// Bulgarian insurance companies integration for quotes, policies, and claims
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsuranceMarketStats = exports.getInsuranceProviders = exports.getClaimDetails = exports.fileInsuranceClaim = exports.getCustomerPolicies = exports.purchaseInsurancePolicy = exports.getInsuranceQuotes = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
/**
 * Get insurance quotes from Bulgarian providers
 */
exports.getInsuranceQuotes = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { vehicleId, customerId, coverageType = 'comprehensive' } = request.data;
        if (!vehicleId || !customerId) {
            throw new https_1.HttpsError('invalid-argument', 'Vehicle ID and Customer ID are required');
        }
        firebase_functions_1.logger.info('Getting insurance quotes', { vehicleId, customerId, coverageType });
        // In production, integrate with Bulgarian insurance company APIs
        const quotes = await getBulgarianInsuranceQuotes(vehicleId, customerId, coverageType);
        return quotes;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting insurance quotes:', error);
        throw new https_1.HttpsError('internal', 'Failed to get insurance quotes');
    }
});
/**
 * Purchase insurance policy
 */
exports.purchaseInsurancePolicy = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { quoteId, paymentMethod, paymentFrequency = 'annual' } = request.data;
        if (!quoteId) {
            throw new https_1.HttpsError('invalid-argument', 'Quote ID is required');
        }
        firebase_functions_1.logger.info('Purchasing insurance policy', { quoteId, paymentMethod, paymentFrequency });
        // In production, process payment and create policy with insurance provider
        const policyId = await processInsurancePurchase(quoteId, paymentMethod, paymentFrequency);
        return policyId;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error purchasing insurance policy:', error);
        throw new https_1.HttpsError('internal', 'Failed to purchase insurance policy');
    }
});
/**
 * Get customer's insurance policies
 */
exports.getCustomerPolicies = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { customerId } = request.data;
        if (!customerId) {
            throw new https_1.HttpsError('invalid-argument', 'Customer ID is required');
        }
        firebase_functions_1.logger.info('Getting customer policies', { customerId });
        // In production, query Firestore
        const policies = await getCustomerInsurancePolicies(customerId);
        return policies;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting customer policies:', error);
        throw new https_1.HttpsError('internal', 'Failed to get customer policies');
    }
});
/**
 * File an insurance claim
 */
exports.fileInsuranceClaim = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { policyId, claim } = request.data;
        if (!policyId || !claim) {
            throw new https_1.HttpsError('invalid-argument', 'Policy ID and claim data are required');
        }
        firebase_functions_1.logger.info('Filing insurance claim', { policyId, claimType: claim.type });
        // In production, submit to insurance provider and save to Firestore
        const claimId = await submitInsuranceClaim(policyId, claim);
        return claimId;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error filing insurance claim:', error);
        throw new https_1.HttpsError('internal', 'Failed to file insurance claim');
    }
});
/**
 * Get claim details
 */
exports.getClaimDetails = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { claimId } = request.data;
        if (!claimId) {
            throw new https_1.HttpsError('invalid-argument', 'Claim ID is required');
        }
        firebase_functions_1.logger.info('Getting claim details', { claimId });
        // In production, query Firestore and insurance provider
        const claim = await getInsuranceClaimDetails(claimId);
        if (!claim) {
            throw new https_1.HttpsError('not-found', 'Claim not found');
        }
        return claim;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting claim details:', error);
        throw new https_1.HttpsError('internal', 'Failed to get claim details');
    }
});
/**
 * Get Bulgarian insurance providers
 */
exports.getInsuranceProviders = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        firebase_functions_1.logger.info('Getting insurance providers');
        const providers = getBulgarianInsuranceProviders();
        return providers;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting insurance providers:', error);
        throw new https_1.HttpsError('internal', 'Failed to get insurance providers');
    }
});
/**
 * Get insurance market statistics
 */
exports.getInsuranceMarketStats = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        firebase_functions_1.logger.info('Getting insurance market statistics');
        // In production, aggregate from Firestore and external APIs
        const stats = {
            totalPolicies: 1250000,
            avgPremium: 385,
            claimSettlementRate: 0.91,
            popularProviders: ['Uniqa', 'Allianz', 'Bulstrad'],
            coverageTypes: {
                basic: 350000,
                comprehensive: 650000,
                premium: 250000
            },
            monthlyGrowth: 8.5
        };
        return stats;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting insurance market stats:', error);
        throw new https_1.HttpsError('internal', 'Failed to get insurance market statistics');
    }
});
// Helper functions
async function getBulgarianInsuranceQuotes(vehicleId, customerId, coverageType) {
    // Mock implementation - in production, call Bulgarian insurance APIs
    const providers = ['bulstrad', 'uniqa', 'allianz', 'generali', 'lev-ins'];
    const quotes = [];
    // Get vehicle data (mock)
    const vehicleData = await getVehicleData(vehicleId);
    const customerData = await getCustomerData(customerId);
    providers.forEach((provider) => {
        const basePremium = calculateBasePremium(vehicleData, customerData, coverageType);
        const finalPremium = Math.round(basePremium * (0.9 + Math.random() * 0.2)); // ±10% variation
        quotes.push({
            id: `quote_${provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            customerId,
            vehicleId,
            coverageType: coverageType,
            provider: provider,
            premium: finalPremium,
            currency: 'EUR',
            coverage: getCoverageDetails(coverageType, provider),
            deductibles: getDeductibles(coverageType),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            createdAt: new Date()
        });
    });
    // Sort by premium (lowest first)
    return quotes.sort((a, b) => a.premium - b.premium);
}
async function getVehicleData(vehicleId) {
    // Mock vehicle data - in production, query database
    return {
        make: 'BMW',
        model: 'X3',
        year: 2020,
        value: 35000,
        mileage: 45000
    };
}
async function getCustomerData(customerId) {
    // Mock customer data - in production, query database
    return {
        age: 35,
        drivingExperience: 12,
        location: 'София',
        hasAccidents: false
    };
}
function calculateBasePremium(vehicleData, customerData, coverageType) {
    let basePremium = vehicleData.value * 0.035; // 3.5% of vehicle value
    // Risk factors
    const riskMultiplier = 1.0;
    if (customerData.age < 25)
        basePremium *= 1.5;
    if (customerData.drivingExperience < 5)
        basePremium *= 1.3;
    if (customerData.location === 'София')
        basePremium *= 1.2;
    if (customerData.hasAccidents)
        basePremium *= 1.4;
    if (coverageType === 'premium')
        basePremium *= 1.8;
    else if (coverageType === 'comprehensive')
        basePremium *= 1.3;
    return Math.round(basePremium);
}
function getCoverageDetails(coverageType, provider) {
    const baseCoverage = {
        liability: {
            bodilyInjury: 1000000,
            propertyDamage: 500000,
            uninsuredMotorist: 100000
        },
        collision: {
            covered: coverageType !== 'basic',
            deductible: coverageType === 'premium' ? 100 : 200
        },
        comprehensive: {
            covered: coverageType === 'comprehensive' || coverageType === 'premium',
            deductible: 150,
            includes: ['theft', 'vandalism', 'weather damage']
        },
        roadsideAssistance: coverageType !== 'basic',
        rentalReimbursement: coverageType === 'premium',
        newCarReplacement: coverageType === 'premium',
        gapInsurance: provider === 'allianz' && coverageType === 'premium'
    };
    return baseCoverage;
}
function getDeductibles(coverageType) {
    const deductibles = {
        collision: coverageType === 'premium' ? 100 : 200,
        comprehensive: 150,
        glass: 50
    };
    return deductibles;
}
async function processInsurancePurchase(quoteId, paymentMethod, paymentFrequency) {
    // Mock implementation - in production, process payment and create policy
    const policyId = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    // In production, save policy to Firestore and notify insurance provider
    firebase_functions_1.logger.info('Insurance policy purchased', { policyId, quoteId });
    return policyId;
}
async function getCustomerInsurancePolicies(customerId) {
    // Mock implementation - in production, query Firestore
    const policies = [
        {
            id: 'policy_001',
            policyNumber: `BG-INS-2024-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            customerId,
            vehicleId: 'vehicle_123',
            provider: 'uniqa',
            coverageType: 'comprehensive',
            premium: 450,
            paymentFrequency: 'annual',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
            status: 'active',
            coverage: getCoverageDetails('comprehensive', 'uniqa'),
            documents: ['policy.pdf', 'terms.pdf', 'certificate.pdf'],
            claims: [],
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
    ];
    return policies;
}
async function submitInsuranceClaim(policyId, claimData) {
    // Mock implementation - in production, submit to insurance provider
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    firebase_functions_1.logger.info('Insurance claim submitted', { claimId, policyId });
    return claimId;
}
async function getInsuranceClaimDetails(claimId) {
    // Mock implementation - in production, query Firestore and insurance provider
    const claim = {
        id: claimId,
        policyId: 'policy_001',
        claimNumber: `CL-${claimId.slice(-8).toUpperCase()}`,
        incidentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        reportDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        type: 'collision',
        description: 'Rear-end collision at traffic light',
        location: 'бул. България 25, София',
        estimatedDamage: 2500,
        status: 'under_review',
        adjusterNotes: 'Photos and police report received. Damage assessment scheduled for next week.',
        photos: [
            `https://storage.gloubul.bg/claims/${claimId}/damage1.jpg`,
            `https://storage.gloubul.bg/claims/${claimId}/police_report.pdf`
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };
    return claim;
}
function getBulgarianInsuranceProviders() {
    return [
        {
            id: 'bulstrad',
            name: 'Bulstrad',
            bulgarianName: 'Булстрад',
            logo: 'https://bulstrad.bg/logo.png',
            website: 'https://bulstrad.bg',
            phone: '+359 2 811 11 11',
            coverage: ['liability', 'collision', 'comprehensive', 'commercial'],
            rating: 4.2,
            reviewCount: 1250,
            specialties: ['commercial vehicles', 'fleet insurance', 'agricultural machinery'],
            responseTime: 24,
            claimSettlementRatio: 0.92
        },
        {
            id: 'uniqa',
            name: 'Uniqa',
            bulgarianName: 'Уника',
            logo: 'https://uniqa.bg/logo.png',
            website: 'https://uniqa.bg',
            phone: '+359 2 489 49 49',
            coverage: ['liability', 'collision', 'comprehensive', 'premium', 'young drivers'],
            rating: 4.5,
            reviewCount: 2100,
            specialties: ['personal vehicles', 'young drivers', 'family packages'],
            responseTime: 12,
            claimSettlementRatio: 0.95
        },
        {
            id: 'allianz',
            name: 'Allianz',
            bulgarianName: 'Алианц',
            logo: 'https://allianz.bg/logo.png',
            website: 'https://allianz.bg',
            phone: '+359 700 10 800',
            coverage: ['liability', 'collision', 'comprehensive', 'premium', 'classic cars'],
            rating: 4.3,
            reviewCount: 1800,
            specialties: ['high-value vehicles', 'classic cars', 'luxury vehicles'],
            responseTime: 18,
            claimSettlementRatio: 0.94
        },
        {
            id: 'generali',
            name: 'Generali',
            bulgarianName: 'Дженерали',
            logo: 'https://generali.bg/logo.png',
            website: 'https://generali.bg',
            phone: '+359 700 12 012',
            coverage: ['liability', 'collision', 'comprehensive', 'family'],
            rating: 4.1,
            reviewCount: 950,
            specialties: ['family insurance', 'multi-vehicle discounts', 'home-car packages'],
            responseTime: 36,
            claimSettlementRatio: 0.89
        },
        {
            id: 'lev-ins',
            name: 'Lev Ins',
            bulgarianName: 'Лев Инс',
            logo: 'https://lev-ins.bg/logo.png',
            website: 'https://lev-ins.bg',
            phone: '+359 2 811 81 81',
            coverage: ['liability', 'collision', 'comprehensive'],
            rating: 4.0,
            reviewCount: 750,
            specialties: ['budget insurance', 'basic coverage', 'first-time drivers'],
            responseTime: 48,
            claimSettlementRatio: 0.87
        }
    ];
}
//# sourceMappingURL=insurance-service.js.map