"use strict";
// src/firebase/index.ts
// Firebase Services Index for Bulgarian Car Marketplace
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteObject = exports.getDownloadURL = exports.uploadBytes = exports.ref = exports.onSnapshot = exports.limit = exports.orderBy = exports.where = exports.query = exports.getDocs = exports.getDoc = exports.deleteDoc = exports.updateDoc = exports.addDoc = exports.doc = exports.collection = exports.sendEmailVerification = exports.sendPasswordResetEmail = exports.updateProfile = exports.onAuthStateChanged = exports.signInWithPopup = exports.FacebookAuthProvider = exports.GoogleAuthProvider = exports.signOut = exports.signInWithEmailAndPassword = exports.createUserWithEmailAndPassword = exports.bulgarianMessagingService = exports.BulgarianMessagingService = exports.bulgarianAuthService = exports.BulgarianAuthService = exports.BulgarianAppCheckService = exports.BulgarianFirebaseUtils = exports.functions = exports.storage = exports.db = exports.auth = exports.app = void 0;
// Export Firebase configuration and utilities
var firebase_config_1 = require("./firebase-config");
Object.defineProperty(exports, "app", { enumerable: true, get: function () { return firebase_config_1.default; } });
Object.defineProperty(exports, "auth", { enumerable: true, get: function () { return firebase_config_1.auth; } });
Object.defineProperty(exports, "db", { enumerable: true, get: function () { return firebase_config_1.db; } });
Object.defineProperty(exports, "storage", { enumerable: true, get: function () { return firebase_config_1.storage; } });
Object.defineProperty(exports, "functions", { enumerable: true, get: function () { return firebase_config_1.functions; } });
Object.defineProperty(exports, "BulgarianFirebaseUtils", { enumerable: true, get: function () { return firebase_config_1.BulgarianFirebaseUtils; } });
// Export App Check service
var app_check_service_1 = require("./app-check-service");
Object.defineProperty(exports, "BulgarianAppCheckService", { enumerable: true, get: function () { return app_check_service_1.BulgarianAppCheckService; } });
// Export authentication service
var auth_service_1 = require("./auth-service");
Object.defineProperty(exports, "BulgarianAuthService", { enumerable: true, get: function () { return auth_service_1.BulgarianAuthService; } });
Object.defineProperty(exports, "bulgarianAuthService", { enumerable: true, get: function () { return auth_service_1.bulgarianAuthService; } });
// Export messaging service
var messaging_service_1 = require("./messaging-service");
Object.defineProperty(exports, "BulgarianMessagingService", { enumerable: true, get: function () { return messaging_service_1.BulgarianMessagingService; } });
Object.defineProperty(exports, "bulgarianMessagingService", { enumerable: true, get: function () { return messaging_service_1.bulgarianMessagingService; } });
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
var auth_1 = require("firebase/auth");
// Auth
Object.defineProperty(exports, "createUserWithEmailAndPassword", { enumerable: true, get: function () { return auth_1.createUserWithEmailAndPassword; } });
Object.defineProperty(exports, "signInWithEmailAndPassword", { enumerable: true, get: function () { return auth_1.signInWithEmailAndPassword; } });
Object.defineProperty(exports, "signOut", { enumerable: true, get: function () { return auth_1.signOut; } });
Object.defineProperty(exports, "GoogleAuthProvider", { enumerable: true, get: function () { return auth_1.GoogleAuthProvider; } });
Object.defineProperty(exports, "FacebookAuthProvider", { enumerable: true, get: function () { return auth_1.FacebookAuthProvider; } });
Object.defineProperty(exports, "signInWithPopup", { enumerable: true, get: function () { return auth_1.signInWithPopup; } });
Object.defineProperty(exports, "onAuthStateChanged", { enumerable: true, get: function () { return auth_1.onAuthStateChanged; } });
Object.defineProperty(exports, "updateProfile", { enumerable: true, get: function () { return auth_1.updateProfile; } });
Object.defineProperty(exports, "sendPasswordResetEmail", { enumerable: true, get: function () { return auth_1.sendPasswordResetEmail; } });
Object.defineProperty(exports, "sendEmailVerification", { enumerable: true, get: function () { return auth_1.sendEmailVerification; } });
var firestore_1 = require("firebase/firestore");
// Firestore
Object.defineProperty(exports, "collection", { enumerable: true, get: function () { return firestore_1.collection; } });
Object.defineProperty(exports, "doc", { enumerable: true, get: function () { return firestore_1.doc; } });
Object.defineProperty(exports, "addDoc", { enumerable: true, get: function () { return firestore_1.addDoc; } });
Object.defineProperty(exports, "updateDoc", { enumerable: true, get: function () { return firestore_1.updateDoc; } });
Object.defineProperty(exports, "deleteDoc", { enumerable: true, get: function () { return firestore_1.deleteDoc; } });
Object.defineProperty(exports, "getDoc", { enumerable: true, get: function () { return firestore_1.getDoc; } });
Object.defineProperty(exports, "getDocs", { enumerable: true, get: function () { return firestore_1.getDocs; } });
Object.defineProperty(exports, "query", { enumerable: true, get: function () { return firestore_1.query; } });
Object.defineProperty(exports, "where", { enumerable: true, get: function () { return firestore_1.where; } });
Object.defineProperty(exports, "orderBy", { enumerable: true, get: function () { return firestore_1.orderBy; } });
Object.defineProperty(exports, "limit", { enumerable: true, get: function () { return firestore_1.limit; } });
Object.defineProperty(exports, "onSnapshot", { enumerable: true, get: function () { return firestore_1.onSnapshot; } });
var storage_1 = require("firebase/storage");
// Storage
Object.defineProperty(exports, "ref", { enumerable: true, get: function () { return storage_1.ref; } });
Object.defineProperty(exports, "uploadBytes", { enumerable: true, get: function () { return storage_1.uploadBytes; } });
Object.defineProperty(exports, "getDownloadURL", { enumerable: true, get: function () { return storage_1.getDownloadURL; } });
Object.defineProperty(exports, "deleteObject", { enumerable: true, get: function () { return storage_1.deleteObject; } });
//# sourceMappingURL=index.js.map