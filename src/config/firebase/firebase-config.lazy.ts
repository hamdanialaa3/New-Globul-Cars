/**
 * Firebase Lazy Config
 * Lazy loads Firebase modules on demand
 * Reduces initial bundle size significantly
 * 
 * Usage:
 * const db = await getFirestoreLazy();
 * const auth = await getAuthLazy();
 */

import { getApp } from 'firebase/app';

let firestoreInstance: any = null;
let authInstance: any = null;
let storageInstance: any = null;
let functionsInstance: any = null;

/**
 * Lazy load Firestore
 * @returns Firestore instance
 */
export const getFirestoreLazy = async () => {
  if (!firestoreInstance) {
    const { getFirestore } = await import('firebase/firestore');
    firestoreInstance = getFirestore(getApp());
  }
  return firestoreInstance;
};

/**
 * Lazy load Auth
 * @returns Auth instance
 */
export const getAuthLazy = async () => {
  if (!authInstance) {
    const { getAuth } = await import('firebase/auth');
    authInstance = getAuth(getApp());
  }
  return authInstance;
};

/**
 * Lazy load Storage
 * @returns Storage instance
 */
export const getStorageLazy = async () => {
  if (!storageInstance) {
    const { getStorage } = await import('firebase/storage');
    storageInstance = getStorage(getApp());
  }
  return storageInstance;
};

/**
 * Lazy load Functions
 * @returns Functions instance
 */
export const getFunctionsLazy = async () => {
  if (!functionsInstance) {
    const { getFunctions } = await import('firebase/functions');
    functionsInstance = getFunctions(getApp());
  }
  return functionsInstance;
};

/**
 * Preload critical Firebase modules
 * Call this during app initialization if needed
 */
export const preloadFirebase = async () => {
  await Promise.all([
    getAuthLazy(),
    getFirestoreLazy()
  ]);
};

/**
 * Clear all cached instances
 * Useful for testing
 */
export const clearFirebaseCache = () => {
  firestoreInstance = null;
  authInstance = null;
  storageInstance = null;
  functionsInstance = null;
};
