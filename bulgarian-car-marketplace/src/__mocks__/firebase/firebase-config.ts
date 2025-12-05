// Mock Firebase Config for tests
export const app = { name: '[DEFAULT]', options: {} };
export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn();
  }),
};
export const db = {};
export const storage = {};
export const functions = {};
export const realtimeDb = {};
export const appCheck = {};
