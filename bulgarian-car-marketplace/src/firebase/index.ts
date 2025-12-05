// src/firebase/index.ts
// Firebase Services Index for Bulgarian Car Marketplace

// Export Firebase configuration and utilities
export { default as app, auth, db, storage, functions, BulgarianFirebaseUtils } from './firebase-config';

// Export App Check service
export { BulgarianAppCheckService } from './app-check-service';

// Export authentication service
export { BulgarianAuthService, bulgarianAuthService, type BulgarianUser } from './auth-service';

// Export messaging service
export {
  BulgarianMessagingService,
  bulgarianMessagingService,
  type BulgarianMessage,
  type MessageType,
  type ChatRoom
} from './messaging-service';

// Export car service
// ⚠️ DEPRECATED: car-service.ts has been moved to deprecated/services/
// Use UnifiedCarService from '../services/car' instead
// export {
//   BulgarianCarService,
//   bulgarianCarService,
//   type BulgarianCar,
//   type CarCondition,
//   type FuelType,
//   type TransmissionType,
//   type CarSearchFilters
// } from './car-service';

// Re-export Firebase SDK for convenience
export {
  // Auth
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';

export {
  // Firestore
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';

export {
  // Storage
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';