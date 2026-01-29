// Mock Firebase Config for tests
import { jest } from '@jest/globals';

export const app = { name: '[DEFAULT]', options: {} };
export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback: (user: any) => void) => {
    callback(null);
    return jest.fn();
  }),
};
export const db = {};
export const storage = {};
export const functions = {};
export const realtimeDb = {};
export const appCheck = {};

// Mock memoryLocalCache for tests
export const memoryLocalCache = jest.fn(() => ({}));
