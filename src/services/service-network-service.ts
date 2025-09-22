// src/services/service-network-service.ts
// Gloubul Service Network - Service Centers and Maintenance Marketplace
// Connects car owners with certified service centers in Bulgaria

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase-config';

export interface ServiceCenter {
  id: string;
  name: string;
  type: 'dealership' | 'independent' | 'specialized' | 'mobile';
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  certifications: string[];
  workingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  services: ServiceOffering[];
  pricing: {
    laborRate: number; // EUR per hour
    diagnosticFee: number; // EUR
    emergencyCallout: number; // EUR
  };
  facilities: string[];
  languages: string[];
  distance?: number;
  isGloubulCertified: boolean;
  lastUpdated: Date;
}

export interface ServiceOffering {
  id: string;
  name: string;
  category: 'maintenance' | 'repair' | 'inspection' | 'emergency' | 'modification';
  description: string;
  estimatedDuration: number; // minutes
  priceRange: {
    min: number;
    max: number;
    currency: 'EUR';
  };
  partsIncluded: boolean;
  warranty: number; // months
  availability: 'immediate' | 'scheduled' | 'quote_required';
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceCenterId: string;
  services: Array<{
    serviceId: string;
    notes?: string;
  }>;
  preferredDate: Date;
  preferredTime: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  actualCost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceReview {
  id: string;
  serviceRequestId: string;
  customerId: string;
  serviceCenterId: string;
  rating: number;
  comment: string;
  categories: {
    quality: number;
    timeliness: number;
    value: number;
    communication: number;
  };
  photos?: string[];
  createdAt: Date;
}

class ServiceNetworkService {
  private static instance: ServiceNetworkService;

  static getInstance(): ServiceNetworkService {
    if (!ServiceNetworkService.instance) {
      ServiceNetworkService.instance = new ServiceNetworkService();
    }
    return ServiceNetworkService.instance;
  }

  /**
   * Find service centers near a location
   */
  async findServiceCenters(
    latitude: number,
    longitude: number,
    radius: number = 50,
    filters?: {
      type?: string[];
      specialties?: string[];
      minRating?: number;
      gloubulCertified?: boolean;
      services?: string[];
    }
  ): Promise<ServiceCenter[]> {
    try {
      const findCenters = httpsCallable(functions, 'findServiceCenters');

      const result = await findCenters({
        latitude,
        longitude,
        radius,
        filters
      });

      return result.data as ServiceCenter[];
    } catch (error: any) {
      console.error('Error finding service centers:', error);
      throw new Error(`Failed to find service centers: ${error.message}`);
    }
  }

  /**
   * Get detailed service center information
   */
  async getServiceCenterDetails(centerId: string): Promise<ServiceCenter> {
    try {
      const getDetails = httpsCallable(functions, 'getServiceCenterDetails');

      const result = await getDetails({ centerId });
      return result.data as ServiceCenter;
    } catch (error: any) {
      console.error('Error getting service center details:', error);
      throw new Error(`Failed to get service center details: ${error.message}`);
    }
  }

  /**
   * Create a service request
   */
  async createServiceRequest(request: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const createRequest = httpsCallable(functions, 'createServiceRequest');

      const result = await createRequest(request);
      return result.data as string; // Returns request ID
    } catch (error: any) {
      console.error('Error creating service request:', error);
      throw new Error(`Failed to create service request: ${error.message}`);
    }
  }

  /**
   * Get service requests for a customer
   */
  async getCustomerServiceRequests(customerId: string): Promise<ServiceRequest[]> {
    try {
      const getRequests = httpsCallable(functions, 'getCustomerServiceRequests');

      const result = await getRequests({ customerId });
      return result.data as ServiceRequest[];
    } catch (error: any) {
      console.error('Error getting customer service requests:', error);
      throw new Error(`Failed to get service requests: ${error.message}`);
    }
  }

  /**
   * Submit a review for completed service
   */
  async submitServiceReview(review: Omit<ServiceReview, 'id' | 'createdAt'>): Promise<string> {
    try {
      const submitReview = httpsCallable(functions, 'submitServiceReview');

      const result = await submitReview(review);
      return result.data as string; // Returns review ID
    } catch (error: any) {
      console.error('Error submitting service review:', error);
      throw new Error(`Failed to submit review: ${error.message}`);
    }
  }

  /**
   * Get service center reviews
   */
  async getServiceCenterReviews(centerId: string, limit: number = 10): Promise<ServiceReview[]> {
    try {
      const getReviews = httpsCallable(functions, 'getServiceCenterReviews');

      const result = await getReviews({ centerId, limit });
      return result.data as ServiceReview[];
    } catch (error: any) {
      console.error('Error getting service center reviews:', error);
      throw new Error(`Failed to get reviews: ${error.message}`);
    }
  }

  /**
   * Get available time slots for a service center
   */
  async getAvailableTimeSlots(
    centerId: string,
    date: string, // YYYY-MM-DD format
    serviceIds: string[]
  ): Promise<Array<{ time: string; available: boolean; estimatedDuration: number }>> {
    try {
      const getSlots = httpsCallable(functions, 'getAvailableTimeSlots');

      const result = await getSlots({ centerId, date, serviceIds });
      return result.data as any[];
    } catch (error: any) {
      console.error('Error getting available time slots:', error);
      throw new Error(`Failed to get time slots: ${error.message}`);
    }
  }

  /**
   * Calculate estimated service cost
   */
  calculateEstimatedCost(
    services: ServiceOffering[],
    laborRate: number,
    diagnosticFee: number = 0
  ): {
    partsCost: number;
    laborCost: number;
    diagnosticCost: number;
    total: number;
    currency: string;
  } {
    let partsCost = 0;
    let laborCost = 0;

    services.forEach(service => {
      if (service.partsIncluded) {
        partsCost += (service.priceRange.min + service.priceRange.max) / 2;
      }
      laborCost += (service.estimatedDuration / 60) * laborRate;
    });

    const total = partsCost + laborCost + diagnosticFee;

    return {
      partsCost: Math.round(partsCost * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      diagnosticCost: diagnosticFee,
      total: Math.round(total * 100) / 100,
      currency: 'EUR'
    };
  }

  /**
   * Format service center data for display
   */
  formatServiceCenterForDisplay(center: ServiceCenter): {
    id: string;
    name: string;
    type: string;
    address: string;
    rating: string;
    reviewCount: string;
    specialties: string[];
    certifications: string[];
    pricing: {
      laborRate: string;
      diagnosticFee: string;
    };
    facilities: string[];
    distance: string;
    isGloubulCertified: boolean;
    workingHours: Array<{ day: string; hours: string }>;
  } {
    const workingHours = Object.entries(center.workingHours).map(([day, hours]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1),
      hours: hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`
    }));

    return {
      id: center.id,
      name: center.name,
      type: center.type.replace('_', ' ').toUpperCase(),
      address: `${center.address}, ${center.city}`,
      rating: center.rating.toFixed(1),
      reviewCount: center.reviewCount.toString(),
      specialties: center.specialties,
      certifications: center.certifications,
      pricing: {
        laborRate: `€${center.pricing.laborRate}/hr`,
        diagnosticFee: `€${center.pricing.diagnosticFee}`
      },
      facilities: center.facilities,
      distance: center.distance ? `${center.distance.toFixed(1)} km` : 'Unknown',
      isGloubulCertified: center.isGloubulCertified,
      workingHours
    };
  }

  /**
   * Get Bulgarian service network statistics
   */
  async getServiceNetworkStats(): Promise<{
    totalCenters: number;
    certifiedCenters: number;
    avgRating: number;
    totalReviews: number;
    servicesByCategory: { [key: string]: number };
    citiesCovered: string[];
  }> {
    try {
      const getStats = httpsCallable(functions, 'getServiceNetworkStats');

      const result = await getStats();
      return result.data as any;
    } catch (error: any) {
      console.error('Error getting service network stats:', error);
      throw new Error(`Failed to get network stats: ${error.message}`);
    }
  }
}

// Firebase Functions for Service Network
export const findServiceCenters = async (data: {
  latitude: number;
  longitude: number;
  radius: number;
  filters?: any;
}) => {
  // Mock implementation - in production, integrate with real service center database
  const { latitude, longitude, radius, filters = {} } = data;

  const mockCenters: ServiceCenter[] = [];

  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * 2 * Math.PI;
    const distance = 5 + Math.random() * (radius - 5);
    const centerLat = latitude + (distance / 111) * Math.cos(angle);
    const centerLng = longitude + (distance / 111) * Math.sin(angle);

    const center: ServiceCenter = {
      id: `center_${i + 1}`,
      name: `Auto Service ${['Център', 'Сервиз', 'Майстори', 'Техник'][i % 4]} ${i + 1}`,
      type: ['dealership', 'independent', 'specialized', 'mobile'][i % 4] as any,
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
      distance: distance,
      isGloubulCertified: Math.random() > 0.6,
      lastUpdated: new Date(Date.now() - Math.random() * 86400000) // Within last 24 hours
    };

    mockCenters.push(center);
  }

  // Apply filters
  let filteredCenters = mockCenters;

  if (filters.type && filters.type.length > 0) {
    filteredCenters = filteredCenters.filter(c => filters.type.includes(c.type));
  }

  if (filters.specialties && filters.specialties.length > 0) {
    filteredCenters = filteredCenters.filter(c =>
      c.specialties.some(s => filters.specialties.includes(s))
    );
  }

  if (filters.minRating) {
    filteredCenters = filteredCenters.filter(c => c.rating >= filters.minRating);
  }

  if (filters.gloubulCertified !== undefined) {
    filteredCenters = filteredCenters.filter(c => c.isGloubulCertified === filters.gloubulCertified);
  }

  return filteredCenters.sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

export const getServiceCenterDetails = async (data: { centerId: string }) => {
  // Mock implementation - return detailed center info
  const centers = await findServiceCenters({ latitude: 42.6977, longitude: 23.3219, radius: 100 });
  const center = centers.find(c => c.id === data.centerId);

  if (!center) {
    throw new Error('Service center not found');
  }

  return center;
};

export const createServiceRequest = async () => {
  // Mock implementation - in production, save to Firestore
  const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  return requestId;
};

export const getCustomerServiceRequests = async (data: { customerId: string }) => {
  // Mock implementation - return customer's service requests
  const mockRequests: ServiceRequest[] = [
    {
      id: 'req_1',
      customerId: data.customerId,
      vehicleId: 'vehicle_123',
      serviceCenterId: 'center_1',
      services: [{ serviceId: 'oil_change' }],
      preferredDate: new Date(Date.now() + 86400000), // Tomorrow
      preferredTime: '10:00',
      urgency: 'low',
      status: 'confirmed',
      estimatedCost: 35,
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      updatedAt: new Date(Date.now() - 1800000) // 30 min ago
    }
  ];

  return mockRequests;
};

export const submitServiceReview = async () => {
  // Mock implementation - save review to database
  const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await new Promise(resolve => setTimeout(resolve, 500));

  return reviewId;
};

export const getServiceCenterReviews = async (data: { centerId: string; limit: number }) => {
  // Mock implementation - return center reviews
  const mockReviews: ServiceReview[] = [];

  for (let i = 0; i < data.limit; i++) {
    mockReviews.push({
      id: `review_${i + 1}`,
      serviceRequestId: `request_${i + 1}`,
      customerId: `customer_${i + 1}`,
      serviceCenterId: data.centerId,
      rating: 3 + Math.random() * 2,
      comment: 'Good service, professional staff.',
      categories: {
        quality: 4 + Math.random(),
        timeliness: 4 + Math.random(),
        value: 4 + Math.random(),
        communication: 4 + Math.random()
      },
      createdAt: new Date(Date.now() - Math.random() * 2592000000) // Within last 30 days
    });
  }

  return mockReviews;
};

export const getAvailableTimeSlots = async () => {
  // Mock implementation - return available time slots
  const slots = [];
  const startHour = 8;
  const endHour = 18;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({
        time,
        available: Math.random() > 0.3, // 70% availability
        estimatedDuration: 60 // 1 hour
      });
    }
  }

  return slots;
};

export const getServiceNetworkStats = async () => {
  // Mock network statistics
  return {
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
};

export const serviceNetworkService = ServiceNetworkService.getInstance();