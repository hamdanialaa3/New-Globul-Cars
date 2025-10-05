// src/setupTests.ts
// Jest setup file for testing

import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('./firebase/firebase-config', () => ({
  auth: {},
  db: {},
  storage: {},
  functions: {},
  analytics: null,
  BulgarianFirebaseUtils: {
    formatCurrency: (amount: number) => `€${amount.toLocaleString('bg-BG')}`,
    formatDate: (date: Date) => date.toLocaleDateString('bg-BG'),
    formatPhoneNumber: (phone: string) => phone,
    validateBulgarianPhone: (phone: string) => /^(\+359|0)[0-9]{8,9}$/.test(phone),
    validateBulgarianPostalCode: (code: string) => /^[0-9]{4}$/.test(code)
  }
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock PerformanceObserver
global.PerformanceObserver = class PerformanceObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
} as any;

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
