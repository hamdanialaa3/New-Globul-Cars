"use strict";
// functions/src/service-network.ts
// Gloubul Service Network Firebase Functions
// Service centers, maintenance scheduling, and review system
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceNetworkStats = exports.getAvailableTimeSlots = exports.getServiceCenterReviews = exports.submitServiceReview = exports.getCustomerServiceRequests = exports.createServiceRequest = exports.getServiceCenterDetails = exports.findServiceCenters = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
/**
 * Find service centers near a location
 */
exports.findServiceCenters = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { latitude, longitude, radius = 50, filters = {} } = request.data;
        if (!latitude || !longitude) {
            throw new https_1.HttpsError('invalid-argument', 'Latitude and longitude are required');
        }
        firebase_functions_1.logger.info('Finding service centers', { latitude, longitude, radius, filters });
        // In production, query Firestore for service centers
        // For now, return mock data
        const centers = await getMockServiceCenters(latitude, longitude, radius, filters);
        return centers;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error finding service centers:', error);
        throw new https_1.HttpsError('internal', 'Failed to find service centers');
    }
});
/**
 * Get detailed service center information
 */
exports.getServiceCenterDetails = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { centerId } = request.data;
        if (!centerId) {
            throw new https_1.HttpsError('invalid-argument', 'Service center ID is required');
        }
        firebase_functions_1.logger.info('Getting service center details', { centerId });
        // In production, query Firestore
        const center = await getMockServiceCenterDetails(centerId);
        if (!center) {
            throw new https_1.HttpsError('not-found', 'Service center not found');
        }
        return center;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting service center details:', error);
        throw new https_1.HttpsError('internal', 'Failed to get service center details');
    }
});
/**
 * Create a service request
 */
exports.createServiceRequest = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { customerId, vehicleId, serviceCenterId, services, preferredDate, preferredTime, urgency = 'low' } = request.data;
        if (!customerId || !vehicleId || !serviceCenterId || !services || !preferredDate) {
            throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
        }
        firebase_functions_1.logger.info('Creating service request', { customerId, serviceCenterId });
        // Calculate estimated cost
        const estimatedCost = await calculateEstimatedCost(serviceCenterId, services);
        const requestData = {
            id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            customerId,
            vehicleId,
            serviceCenterId,
            services,
            preferredDate: new Date(preferredDate),
            preferredTime: preferredTime || '09:00',
            urgency,
            status: 'pending',
            estimatedCost,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // In production, save to Firestore
        // await db.collection('serviceRequests').doc(requestData.id).set(requestData);
        firebase_functions_1.logger.info('Service request created', { requestId: requestData.id });
        return requestData.id;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error creating service request:', error);
        throw new https_1.HttpsError('internal', 'Failed to create service request');
    }
});
/**
 * Get service requests for a customer
 */
exports.getCustomerServiceRequests = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { customerId } = request.data;
        if (!customerId) {
            throw new https_1.HttpsError('invalid-argument', 'Customer ID is required');
        }
        firebase_functions_1.logger.info('Getting customer service requests', { customerId });
        // In production, query Firestore
        const requests = await getMockCustomerRequests(customerId);
        return requests;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting customer service requests:', error);
        throw new https_1.HttpsError('internal', 'Failed to get service requests');
    }
});
/**
 * Submit a review for completed service
 */
exports.submitServiceReview = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { serviceRequestId, customerId, serviceCenterId, rating, comment, categories } = request.data;
        if (!serviceRequestId || !customerId || !serviceCenterId || !rating) {
            throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
        }
        firebase_functions_1.logger.info('Submitting service review', { serviceRequestId, rating });
        const reviewData = {
            id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            serviceRequestId,
            customerId,
            serviceCenterId,
            rating,
            comment: comment || '',
            categories: categories || {
                quality: rating,
                timeliness: rating,
                value: rating,
                communication: rating
            },
            createdAt: new Date()
        };
        // In production, save to Firestore and update center rating
        // await db.collection('reviews').doc(reviewData.id).set(reviewData);
        // await updateServiceCenterRating(serviceCenterId);
        firebase_functions_1.logger.info('Service review submitted', { reviewId: reviewData.id });
        return reviewData.id;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error submitting service review:', error);
        throw new https_1.HttpsError('internal', 'Failed to submit review');
    }
});
/**
 * Get service center reviews
 */
exports.getServiceCenterReviews = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { centerId, limit = 10 } = request.data;
        if (!centerId) {
            throw new https_1.HttpsError('invalid-argument', 'Service center ID is required');
        }
        firebase_functions_1.logger.info('Getting service center reviews', { centerId, limit });
        // In production, query Firestore
        const reviews = await getMockCenterReviews(centerId, limit);
        return reviews;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting service center reviews:', error);
        throw new https_1.HttpsError('internal', 'Failed to get reviews');
    }
});
/**
 * Get available time slots for a service center
 */
exports.getAvailableTimeSlots = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        const { centerId, date, serviceIds } = request.data;
        if (!centerId || !date || !serviceIds) {
            throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
        }
        firebase_functions_1.logger.info('Getting available time slots', { centerId, date, serviceIds });
        // In production, check center schedule and existing bookings
        const slots = await getMockAvailableSlots(centerId, date, serviceIds);
        return slots;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting available time slots:', error);
        throw new https_1.HttpsError('internal', 'Failed to get time slots');
    }
});
/**
 * Get service network statistics
 */
exports.getServiceNetworkStats = (0, https_1.onCall)({
    region: 'europe-west1',
    cors: true
}, async (request) => {
    try {
        firebase_functions_1.logger.info('Getting service network statistics');
        // In production, aggregate from Firestore
        const stats = {
            totalCenters: 850,
            certifiedCenters: 320,
            avgRating: 4.2,
            totalReviews: 12500,
            servicesByCategory: {
                maintenance: 450,
                repair: 380,
                inspection: 290,
                emergency: 180,
                modification: 120
            },
            citiesCovered: ['София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора', 'Плевен']
        };
        return stats;
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting service network stats:', error);
        throw new https_1.HttpsError('internal', 'Failed to get network statistics');
    }
});
// Mock implementations (replace with real database queries in production)
async function getMockServiceCenters(latitude, longitude, radius, filters) {
    const centers = [];
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * 2 * Math.PI;
        const distance = 5 + Math.random() * (radius - 5);
        const centerLat = latitude + (distance / 111) * Math.cos(angle);
        const centerLng = longitude + (distance / 111) * Math.sin(angle);
        const center = {
            id: `center_${i + 1}`,
            name: `Auto Service ${['Център', 'Сервиз', 'Майстори', 'Техник'][i % 4]} ${i + 1}`,
            type: ['dealership', 'independent', 'specialized', 'mobile'][i % 4],
            address: `ул. ${['Витоша', 'Граф Игнатиев', 'Пиротска', 'Цар Освободител'][i % 4]} ${10 + i}`,
            city: ['София', 'Пловдив', 'Варна', 'Бургас'][i % 4],
            latitude: centerLat,
            longitude: centerLng,
            phone: `+359 2 ${8000000 + i}`,
            email: `info@autoservice${i + 1}.bg`,
            website: `https://autoservice${i + 1}.bg`,
            rating: 3.5 + Math.random() * 1.5,
            reviewCount: Math.floor(Math.random() * 100) + 10,
            specialties: ['engine', 'transmission', 'brakes', 'electrical'].filter(() => Math.random() > 0.5),
            certifications: ['ISO 9001', 'Gloubul Certified'].filter(() => Math.random() > 0.7),
            workingHours: {
                monday: { open: '08:00', close: '18:00' },
                tuesday: { open: '08:00', close: '18:00' },
                wednesday: { open: '08:00', close: '18:00' },
                thursday: { open: '08:00', close: '18:00' },
                friday: { open: '08:00', close: '18:00' },
                saturday: { open: '09:00', close: '16:00' },
                sunday: { open: 'Closed', close: 'Closed', closed: true }
            },
            services: [
                {
                    id: 'oil_change',
                    name: 'Oil Change',
                    category: 'maintenance',
                    description: 'Complete oil change with filter replacement',
                    estimatedDuration: 45,
                    priceRange: { min: 25, max: 45, currency: 'EUR' },
                    partsIncluded: true,
                    warranty: 12,
                    availability: 'immediate'
                },
                {
                    id: 'brake_service',
                    name: 'Brake Service',
                    category: 'repair',
                    description: 'Brake pad and rotor replacement',
                    estimatedDuration: 120,
                    priceRange: { min: 80, max: 200, currency: 'EUR' },
                    partsIncluded: false,
                    warranty: 24,
                    availability: 'scheduled'
                }
            ],
            pricing: {
                laborRate: 35 + Math.random() * 15,
                diagnosticFee: 15 + Math.random() * 10,
                emergencyCallout: 50 + Math.random() * 25
            },
            facilities: ['parking', 'waiting room', 'coffee', 'wifi'].filter(() => Math.random() > 0.4),
            languages: ['bg', 'en'],
            isGloubulCertified: Math.random() > 0.6,
            lastUpdated: new Date(Date.now() - Math.random() * 86400000)
        };
        centers.push(center);
    }
    // Apply filters
    let filteredCenters = centers;
    if (filters.type && filters.type.length > 0) {
        filteredCenters = filteredCenters.filter(c => filters.type.includes(c.type));
    }
    if (filters.specialties && filters.specialties.length > 0) {
        filteredCenters = filteredCenters.filter(c => c.specialties.some(s => filters.specialties.includes(s)));
    }
    if (filters.minRating) {
        filteredCenters = filteredCenters.filter(c => c.rating >= filters.minRating);
    }
    if (filters.gloubulCertified !== undefined) {
        filteredCenters = filteredCenters.filter(c => c.isGloubulCertified === filters.gloubulCertified);
    }
    return filteredCenters.sort((a, b) => {
        const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
        const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
        return distA - distB;
    });
}
async function getMockServiceCenterDetails(centerId) {
    const centers = await getMockServiceCenters(42.6977, 23.3219, 100, {});
    return centers.find(c => c.id === centerId) || null;
}
async function calculateEstimatedCost(serviceCenterId, services) {
    // Mock cost calculation
    let total = 0;
    services.forEach(() => {
        total += 50 + Math.random() * 100; // Random cost between 50-150 EUR
    });
    return Math.round(total * 100) / 100;
}
async function getMockCustomerRequests(customerId) {
    const mockRequests = [
        {
            id: 'req_1',
            customerId,
            vehicleId: 'vehicle_123',
            serviceCenterId: 'center_1',
            services: [{ serviceId: 'oil_change' }],
            preferredDate: new Date(Date.now() + 86400000),
            preferredTime: '10:00',
            urgency: 'low',
            status: 'confirmed',
            estimatedCost: 35,
            createdAt: new Date(Date.now() - 3600000),
            updatedAt: new Date(Date.now() - 1800000)
        }
    ];
    return mockRequests;
}
async function getMockCenterReviews(centerId, limit) {
    const reviews = [];
    for (let i = 0; i < limit; i++) {
        reviews.push({
            id: `review_${i + 1}`,
            serviceRequestId: `request_${i + 1}`,
            customerId: `customer_${i + 1}`,
            serviceCenterId: centerId,
            rating: 3 + Math.random() * 2,
            comment: 'Professional service and good value for money.',
            categories: {
                quality: 4 + Math.random(),
                timeliness: 4 + Math.random(),
                value: 4 + Math.random(),
                communication: 4 + Math.random()
            },
            createdAt: new Date(Date.now() - Math.random() * 2592000000)
        });
    }
    return reviews;
}
async function getMockAvailableSlots(centerId, date, serviceIds) {
    const slots = [];
    const startHour = 8;
    const endHour = 18;
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push({
                time,
                available: Math.random() > 0.3,
                estimatedDuration: 60
            });
        }
    }
    return slots;
}
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
//# sourceMappingURL=service-network.js.map