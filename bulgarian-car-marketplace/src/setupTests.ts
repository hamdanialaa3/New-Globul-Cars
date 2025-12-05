// Setup file for Jest tests
import '@testing-library/jest-dom';

// Mock Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: '[DEFAULT]', options: {} })),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({ name: '[DEFAULT]', options: {} })),
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn(); // unsubscribe function
    }),
  })),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  FacebookAuthProvider: jest.fn(),
  OAuthProvider: jest.fn().mockImplementation((providerId) => ({
    providerId,
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  })),
}));

// Mock Firestore
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockGetDoc = jest.fn(() => Promise.resolve({ exists: jest.fn(() => false), data: jest.fn(() => ({})) }));
const mockGetDocs = jest.fn(() => Promise.resolve({ docs: [], empty: true, size: 0 }));
const mockSetDoc = jest.fn(() => Promise.resolve());
const mockUpdateDoc = jest.fn(() => Promise.resolve());
const mockDeleteDoc = jest.fn(() => Promise.resolve());
const mockQuery = jest.fn((...args) => args);
const mockWhere = jest.fn((field, op, value) => ({ field, op, value }));
const mockOrderBy = jest.fn((field, direction) => ({ field, direction }));
const mockLimit = jest.fn((n) => ({ limit: n }));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  initializeFirestore: jest.fn(() => ({})),
  collection: mockCollection,
  doc: mockDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  query: mockQuery,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000 })),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    fromDate: jest.fn((date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 })),
  },
  CACHE_SIZE_UNLIMITED: -1,
  onSnapshot: jest.fn((ref, callback) => {
    callback({ docs: [], empty: true, size: 0 });
    return jest.fn(); // unsubscribe
  }),
  addDoc: jest.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
}));

// Mock Firebase Storage
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytes: jest.fn(() => Promise.resolve({ metadata: {} })),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(() => Promise.resolve('https://mock-url.com/image.jpg')),
  deleteObject: jest.fn(() => Promise.resolve()),
}));

// Mock Firebase Functions
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({})),
  httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({ data: {} }))),
}));

// Mock Firebase Realtime Database
jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn(),
  set: jest.fn(() => Promise.resolve()),
  get: jest.fn(() => Promise.resolve({ exists: jest.fn(() => false), val: jest.fn(() => null) })),
  push: jest.fn(() => ({ key: 'mock-key' })),
  remove: jest.fn(() => Promise.resolve()),
  onValue: jest.fn((ref, callback) => {
    callback({ exists: jest.fn(() => false), val: jest.fn(() => null) });
    return jest.fn(); // unsubscribe
  }),
  update: jest.fn(() => Promise.resolve()),
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

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
