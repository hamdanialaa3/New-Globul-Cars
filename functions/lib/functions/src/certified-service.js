"use strict";
// functions/src/certified-service.ts
// Gloubul Certified Firebase Functions
// Vehicle inspection, certification, and verification system
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCertificationStats = exports.verifyCertificate = exports.getVehicleCertificate = exports.getCustomerInspections = exports.getInspectionDetails = exports.scheduleVehicleInspection = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
/**
 * Schedule a vehicle inspection
 */
exports.scheduleVehicleInspection = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { vehicleId, customerId, inspectionType, scheduledDate, location } = request.data;
        if (!vehicleId || !customerId || !inspectionType || !scheduledDate) {
            throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
        }
        firebase_functions_1.logger.info('Scheduling vehicle inspection', { vehicleId, customerId, inspectionType });
        // Calculate inspection cost
        const cost = calculateInspectionCost(inspectionType);
        const inspectionData = {
            id: `insp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            vehicleId,
            customerId,
            inspectorId: await assignInspector(location),
            inspectionType,
            status: 'scheduled',
            scheduledDate: new Date(scheduledDate),
            location,
            results: {}, // Will be filled after inspection
            photos: [],
            notes: '',
            cost,
            paymentStatus: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // In production, save to Firestore
        // await db.collection('inspections').doc(inspectionData.id).set(inspectionData);
        firebase_functions_1.logger.info('Inspection scheduled', { inspectionId: inspectionData.id });
        return inspectionData.id;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error scheduling inspection:', error);
        throw new https_1.HttpsError('internal', 'Failed to schedule inspection');
    }
});
/**
 * Get inspection details
 */
exports.getInspectionDetails = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { inspectionId } = request.data;
        if (!inspectionId) {
            throw new https_1.HttpsError('invalid-argument', 'Inspection ID is required');
        }
        firebase_functions_1.logger.info('Getting inspection details', { inspectionId });
        // In production, query Firestore
        const inspection = await getMockInspectionDetails(inspectionId);
        if (!inspection) {
            throw new https_1.HttpsError('not-found', 'Inspection not found');
        }
        return inspection;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting inspection details:', error);
        throw new https_1.HttpsError('internal', 'Failed to get inspection details');
    }
});
/**
 * Get customer's inspection history
 */
exports.getCustomerInspections = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { customerId } = request.data;
        if (!customerId) {
            throw new https_1.HttpsError('invalid-argument', 'Customer ID is required');
        }
        firebase_functions_1.logger.info('Getting customer inspections', { customerId });
        // In production, query Firestore
        const inspections = await getMockCustomerInspections(customerId);
        return inspections;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting customer inspections:', error);
        throw new https_1.HttpsError('internal', 'Failed to get customer inspections');
    }
});
/**
 * Get vehicle certificate details
 */
exports.getVehicleCertificate = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { certificateId } = request.data;
        if (!certificateId) {
            throw new https_1.HttpsError('invalid-argument', 'Certificate ID is required');
        }
        firebase_functions_1.logger.info('Getting vehicle certificate', { certificateId });
        // In production, query Firestore
        const certificate = await getMockVehicleCertificate(certificateId);
        if (!certificate) {
            throw new https_1.HttpsError('not-found', 'Certificate not found');
        }
        return certificate;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting vehicle certificate:', error);
        throw new https_1.HttpsError('internal', 'Failed to get certificate');
    }
});
/**
 * Verify certificate authenticity
 */
exports.verifyCertificate = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { certificateNumber } = request.data;
        if (!certificateNumber) {
            throw new https_1.HttpsError('invalid-argument', 'Certificate number is required');
        }
        firebase_functions_1.logger.info('Verifying certificate', { certificateNumber });
        // In production, verify against blockchain/database
        const verification = await verifyCertificateAuthenticity(certificateNumber);
        return verification;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error verifying certificate:', error);
        throw new https_1.HttpsError('internal', 'Failed to verify certificate');
    }
});
/**
 * Get certification statistics
 */
exports.getCertificationStats = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        firebase_functions_1.logger.info('Getting certification statistics');
        // In production, aggregate from Firestore
        const stats = {
            totalInspections: 15420,
            certifiedVehicles: 12850,
            avgScore: 82.5,
            certificationsByLevel: {
                bronze: 4250,
                silver: 3800,
                gold: 3200,
                platinum: 1600
            },
            popularInspectionTypes: ['comprehensive', 'pre_purchase', 'insurance', 'basic'],
            monthlyGrowth: 12.5
        };
        return stats;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting certification stats:', error);
        throw new https_1.HttpsError('internal', 'Failed to get certification statistics');
    }
});
// Helper functions
async function assignInspector(location) {
    // Mock inspector assignment based on location
    const inspectors = [
        'inspector_sofia_001',
        'inspector_plovdiv_001',
        'inspector_varna_001',
        'inspector_burgas_001'
    ];
    // Simple assignment based on city
    if (location.city.includes('София'))
        return inspectors[0];
    if (location.city.includes('Пловдив'))
        return inspectors[1];
    if (location.city.includes('Варна'))
        return inspectors[2];
    if (location.city.includes('Бургас'))
        return inspectors[3];
    return inspectors[0]; // Default
}
function calculateInspectionCost(inspectionType) {
    const costs = {
        basic: 50,
        comprehensive: 150,
        pre_purchase: 120,
        export: 200,
        insurance: 80
    };
    return costs[inspectionType] || 100;
}
function calculateGrade(score) {
    if (score >= 90)
        return 'A';
    if (score >= 80)
        return 'B';
    if (score >= 70)
        return 'C';
    if (score >= 60)
        return 'D';
    return 'F';
}
async function getMockInspectionDetails(inspectionId) {
    // Generate detailed mock inspection results
    const categories = ['exterior', 'interior', 'engine', 'transmission', 'brakes', 'suspension', 'electrical', 'tires', 'safety'];
    const categoryResults = {};
    let totalScore = 0;
    categories.forEach(category => {
        const score = 70 + Math.random() * 25; // 70-95
        totalScore += score;
        categoryResults[category] = {
            score: Math.round(score),
            grade: calculateGrade(score),
            issues: Math.random() > 0.7 ? [`Minor issue in ${category}`] : [],
            recommendations: Math.random() > 0.8 ? [`Check ${category} components`] : []
        };
    });
    const overallScore = Math.round(totalScore / categories.length);
    const results = {
        overallScore,
        overallGrade: calculateGrade(overallScore),
        categories: categoryResults,
        criticalIssues: [
            {
                severity: 'minor',
                category: 'brakes',
                description: 'Rear brake pads worn',
                estimatedCost: 120,
                safetyConcern: true
            }
        ],
        recommendedRepairs: [
            {
                category: 'brakes',
                description: 'Replace rear brake pads',
                priority: 'medium',
                estimatedCost: 120,
                estimatedDuration: 2
            }
        ],
        marketValue: {
            current: 18500,
            afterRepairs: 18200,
            currency: 'EUR'
        },
        certificationEligible: overallScore >= 75,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };
    const inspection = {
        id: inspectionId,
        vehicleId: 'vehicle_123',
        customerId: 'customer_456',
        inspectorId: 'inspector_789',
        inspectionType: 'comprehensive',
        status: 'completed',
        scheduledDate: new Date(Date.now() - 86400000),
        completedDate: new Date(Date.now() - 3600000),
        location: {
            address: 'ул. Витоша 25',
            city: 'София',
            latitude: 42.6977,
            longitude: 23.3219
        },
        results,
        certificate: results.certificationEligible ? {
            id: `cert_${inspectionId}`,
            certificateNumber: `GC-2024-${inspectionId.slice(-6).toUpperCase()}`,
            vehicleId: 'vehicle_123',
            inspectionId,
            certificationLevel: overallScore >= 90 ? 'platinum' : overallScore >= 85 ? 'gold' : overallScore >= 80 ? 'silver' : 'bronze',
            issuedDate: new Date(Date.now() - 3600000),
            expiresDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            certifiedBy: 'Gloubul Certified',
            qrCode: `https://qr.gloubul.bg/cert/GC-2024-${inspectionId.slice(-6).toUpperCase()}`,
            benefits: ['Warranty coverage', 'Priority service', 'Trade-in bonus'],
            restrictions: ['Valid only in Bulgaria', 'Subject to annual re-inspection']
        } : undefined,
        photos: [
            'https://storage.gloubul.bg/inspections/' + inspectionId + '/exterior.jpg',
            'https://storage.gloubul.bg/inspections/' + inspectionId + '/engine.jpg'
        ],
        notes: 'Vehicle is in good condition with minor maintenance needed.',
        cost: 150,
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 3600000)
    };
    return inspection;
}
async function getMockCustomerInspections(customerId) {
    const inspections = [];
    for (let i = 0; i < 3; i++) {
        const inspection = await getMockInspectionDetails(`insp_${customerId}_${i}`);
        if (inspection) {
            inspections.push(inspection);
        }
    }
    return inspections;
}
async function getMockVehicleCertificate(certificateId) {
    const certificate = {
        id: certificateId,
        certificateNumber: `GC-2024-${certificateId.slice(-6).toUpperCase()}`,
        vehicleId: 'vehicle_123',
        inspectionId: 'insp_001',
        certificationLevel: 'silver',
        issuedDate: new Date(Date.now() - 86400000),
        expiresDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        certifiedBy: 'Gloubul Certified',
        qrCode: `https://qr.gloubul.bg/cert/GC-2024-${certificateId.slice(-6).toUpperCase()}`,
        benefits: ['12-month warranty', 'Roadside assistance', 'Priority service'],
        restrictions: ['Valid only in Bulgaria', 'Subject to annual re-inspection']
    };
    return certificate;
}
async function verifyCertificateAuthenticity(certificateNumber) {
    // Mock verification - in production, check blockchain/database
    const isValid = Math.random() > 0.1; // 90% valid
    if (isValid) {
        const certificate = await getMockVehicleCertificate('cert_001');
        return {
            isValid: true,
            certificate: certificate || undefined,
            message: 'Certificate is valid and authentic.'
        };
    }
    else {
        return {
            isValid: false,
            message: 'Certificate number not found or expired.'
        };
    }
}
//# sourceMappingURL=certified-service.js.map