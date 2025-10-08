// Mock subscription service for development when CORS is blocking
import { functions } from '../firebase/firebase-config';
import { httpsCallable } from 'firebase/functions';

// Mock data for development
const MOCK_SUBSCRIPTION = {
  hasSubscription: true,
  tier: 'basic',
  status: 'active',
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  isActive: true,
  features: ['Up to 100 requests/month', 'Basic analytics', 'Email support'],
  limits: {
    requests_per_month: 100,
    concurrent_users: 1
  }
};

// Check if we're in development and having CORS issues
const isDevelopment = process.env.NODE_ENV === 'development';

export const getB2BSubscription = async () => {
  try {
    const getSubscription = httpsCallable(functions, 'getB2BSubscription');
    const result = await getSubscription();
    return result.data;
  } catch (error: any) {
    console.warn('Cloud Function call failed:', error?.message);
    
    // If it's a CORS error in development, return mock data
    if (isDevelopment && (
      error?.message?.includes('CORS') || 
      error?.message?.includes('net::ERR_FAILED') ||
      error?.code === 'internal'
    )) {
return MOCK_SUBSCRIPTION;
    }
    
    throw error;
  }
};

export const createB2BSubscription = async (data: any) => {
  try {
    const createSubscription = httpsCallable(functions, 'createB2BSubscription');
    const result = await createSubscription(data);
    return result.data;
  } catch (error: any) {
    console.warn('Cloud Function call failed:', error?.message);
    
    if (isDevelopment && (
      error?.message?.includes('CORS') || 
      error?.message?.includes('net::ERR_FAILED') ||
      error?.code === 'internal'
    )) {
return {
        success: true,
        subscriptionId: 'mock-id',
        tier: data.tier,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
    }
    
    throw error;
  }
};

export const cancelB2BSubscription = async () => {
  try {
    const cancelSubscription = httpsCallable(functions, 'cancelB2BSubscription');
    const result = await cancelSubscription();
    return result.data;
  } catch (error: any) {
    console.warn('Cloud Function call failed:', error?.message);
    
    if (isDevelopment && (
      error?.message?.includes('CORS') || 
      error?.message?.includes('net::ERR_FAILED') ||
      error?.code === 'internal'
    )) {
return {
        success: true,
        message: 'Subscription cancelled successfully (mock)'
      };
    }
    
    throw error;
  }
};

export const upgradeB2BSubscription = async (data: any) => {
  try {
    const upgradeSubscription = httpsCallable(functions, 'upgradeB2BSubscription');
    const result = await upgradeSubscription(data);
    return result.data;
  } catch (error: any) {
    console.warn('Cloud Function call failed:', error?.message);
    
    if (isDevelopment && (
      error?.message?.includes('CORS') || 
      error?.message?.includes('net::ERR_FAILED') ||
      error?.code === 'internal'
    )) {
return {
        success: true,
        message: 'Subscription upgraded successfully (mock)',
        newTier: data.newTier,
        features: ['Premium features (mock)'],
        limits: { requests_per_month: 1000, concurrent_users: 5 }
      };
    }
    
    throw error;
  }
};