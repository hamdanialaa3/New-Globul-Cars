"use strict";
// src/firebase/auth-service.ts
// Bulgarian Authentication Service for Car Marketplace
// Phase -1: Updated to use canonical types
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulgarianAuthService = exports.BulgarianAuthService = void 0;
const auth_1 = require("firebase/auth");
const logger_service_1 = require("../services/logger-service");
const firestore_1 = require("firebase/firestore");
const firebase_config_1 = require("./firebase-config");
// Bulgarian Authentication Service
class BulgarianAuthService {
    constructor() {
        // Initialize auth state listener
        this.initializeAuthStateListener();
    }
    // Helper method to safely extract error code
    getErrorCode(error) {
        // Firebase Auth errors have a 'code' property
        if (error && typeof error === 'object') {
            // Check for FirebaseError code property
            if ('code' in error && typeof error.code === 'string') {
                return error.code;
            }
            // Check for error.message which might contain the code
            if ('message' in error && typeof error.message === 'string') {
                const message = error.message;
                // Extract auth/xxx pattern from message
                const codeMatch = message.match(/auth\/[a-z-]+/i);
                if (codeMatch) {
                    return codeMatch[0];
                }
            }
        }
        return 'unknown';
    }
    static getInstance() {
        if (!BulgarianAuthService.instance) {
            BulgarianAuthService.instance = new BulgarianAuthService();
        }
        return BulgarianAuthService.instance;
    }
    // Initialize auth state listener
    initializeAuthStateListener() {
        (0, auth_1.onAuthStateChanged)(firebase_config_1.auth, async (user) => {
            if (user) {
                // Update last login time
                await this.updateLastLogin(user.uid);
            }
        });
    }
    // Sign up with email and password
    async signUp(email, password, userData) {
        try {
            // Validate Bulgarian email format
            if (!this.validateBulgarianEmail(email)) {
                throw new Error('Невалиден имейл формат. Моля използвайте валиден български имейл адрес.');
            }
            // Validate password strength
            if (!this.validatePasswordStrength(password)) {
                throw new Error('Паролата трябва да съдържа поне 8 символа, главна буква, малка буква и цифра.');
            }
            // Create user
            const userCredential = await (0, auth_1.createUserWithEmailAndPassword)(firebase_config_1.auth, email, password);
            // Create Bulgarian user profile
            const bulgarianUser = {
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userData.displayName || '',
                phoneNumber: userData.phoneNumber,
                phoneCountryCode: '+359',
                preferredLanguage: userData.preferredLanguage || 'bg',
                currency: 'EUR',
                profileType: 'private',
                planTier: 'free',
                permissions: {
                    canAddListings: true,
                    maxListings: 3,
                    maxMonthlyListings: 3,
                    canEditLockedFields: false,
                    maxFlexEditsPerMonth: 0,
                    canBulkUpload: false,
                    bulkUploadLimit: 0,
                    canCloneListing: false,
                    hasAnalytics: false,
                    hasAdvancedAnalytics: false,
                    hasTeam: false,
                    canExportData: false,
                    hasPrioritySupport: false,
                    canUseQuickReplies: false,
                    canBulkEdit: false,
                    canImportCSV: false,
                    canUseAPI: false,
                    themeMode: 'standard'
                },
                verification: {
                    email: userCredential.user.emailVerified,
                    phone: !!userData.phoneNumber,
                    id: false,
                    business: false
                },
                stats: {
                    totalListings: 0,
                    activeListings: 0,
                    totalViews: 0,
                    totalMessages: 0,
                    trustScore: 10
                },
                createdAt: firestore_1.Timestamp.now(),
                updatedAt: firestore_1.Timestamp.now(),
                lastLoginAt: firestore_1.Timestamp.now(),
                isActive: true,
                isBanned: false
            };
            // Save user profile to Firestore
            await this.saveUserProfile(bulgarianUser);
            // Send email verification
            await (0, auth_1.sendEmailVerification)(userCredential.user, {
                url: `${window.location.origin}/verify-email`,
                handleCodeInApp: true
            });
            return userCredential;
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Sign in with email and password
    async signIn(email, password) {
        try {
            const userCredential = await (0, auth_1.signInWithEmailAndPassword)(firebase_config_1.auth, email, password);
            // Update last login (non-blocking - don't fail login if this fails)
            try {
                await this.updateLastLogin(userCredential.user.uid);
            }
            catch (updateError) {
                // Log but don't throw - login was successful
                logger_service_1.logger.warn('Failed to update last login timestamp', { error: updateError });
            }
            return userCredential;
        }
        catch (error) {
            logger_service_1.logger.error('Sign in error:', error);
            throw this.handleAuthError(error);
        }
    }
    // Sign in with Google
    async signInWithGoogle() {
        try {
            const provider = new auth_1.GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            const result = await (0, auth_1.signInWithPopup)(firebase_config_1.auth, provider);
            // Check if user exists, if not create Bulgarian profile
            const userExists = await this.userExists(result.user.uid);
            if (!userExists) {
                await this.createUserFromSocialLogin(result.user, 'google');
            }
            else {
                await this.updateLastLogin(result.user.uid);
            }
            return result;
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Sign in with Facebook
    async signInWithFacebook() {
        try {
            const provider = new auth_1.FacebookAuthProvider();
            provider.setCustomParameters({
                display: 'popup'
            });
            const result = await (0, auth_1.signInWithPopup)(firebase_config_1.auth, provider);
            // Check if user exists, if not create Bulgarian profile
            const userExists = await this.userExists(result.user.uid);
            if (!userExists) {
                await this.createUserFromSocialLogin(result.user, 'facebook');
            }
            else {
                await this.updateLastLogin(result.user.uid);
            }
            return result;
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Sign in with Twitter
    async signInWithTwitter() {
        try {
            const provider = new auth_1.TwitterAuthProvider();
            const result = await (0, auth_1.signInWithPopup)(firebase_config_1.auth, provider);
            // Check if user exists, if not create Bulgarian profile
            const userExists = await this.userExists(result.user.uid);
            if (!userExists) {
                await this.createUserFromSocialLogin(result.user, 'twitter');
            }
            else {
                await this.updateLastLogin(result.user.uid);
            }
            return result;
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Sign in with Microsoft
    async signInWithMicrosoft() {
        try {
            const provider = new auth_1.OAuthProvider('microsoft.com');
            provider.addScope('email');
            provider.addScope('profile');
            provider.addScope('openid');
            const result = await (0, auth_1.signInWithPopup)(firebase_config_1.auth, provider);
            // Check if user exists, if not create Bulgarian profile
            const userExists = await this.userExists(result.user.uid);
            if (!userExists) {
                await this.createUserFromSocialLogin(result.user, 'microsoft');
            }
            else {
                await this.updateLastLogin(result.user.uid);
            }
            return result;
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Sign in with Apple
    async signInWithApple() {
        try {
            const provider = new auth_1.OAuthProvider('apple.com');
            provider.addScope('email');
            provider.addScope('name');
            const result = await (0, auth_1.signInWithPopup)(firebase_config_1.auth, provider);
            // Check if user exists, if not create Bulgarian profile
            const userExists = await this.userExists(result.user.uid);
            if (!userExists) {
                await this.createUserFromSocialLogin(result.user, 'apple');
            }
            else {
                await this.updateLastLogin(result.user.uid);
            }
            return result;
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Sign in with iCloud
    async signInWithICloud() {
        try {
            const provider = new auth_1.OAuthProvider('apple.com');
            provider.addScope('email');
            provider.addScope('name');
            const result = await (0, auth_1.signInWithPopup)(firebase_config_1.auth, provider);
            // Check if user exists, if not create Bulgarian profile
            const userExists = await this.userExists(result.user.uid);
            if (!userExists) {
                await this.createUserFromSocialLogin(result.user, 'icloud');
            }
            else {
                await this.updateLastLogin(result.user.uid);
            }
            return result;
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Sign out
    async signOut() {
        try {
            await (0, auth_1.signOut)(firebase_config_1.auth);
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Get current user profile
    async getCurrentUserProfile() {
        try {
            const user = firebase_config_1.auth.currentUser;
            if (!user)
                return null;
            const userDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(firebase_config_1.db, 'users', user.uid));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Get any user profile by ID (for viewing other users' profiles)
    async getUserProfileById(userId) {
        try {
            if (!userId)
                return null;
            const userDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(firebase_config_1.db, 'users', userId));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        }
        catch (error) {
            logger_service_1.logger.error('Error fetching user profile by ID', error, { userId });
            throw this.handleAuthError(error);
        }
    }
    // Update user profile
    async updateUserProfile(updates) {
        try {
            const user = firebase_config_1.auth.currentUser;
            if (!user)
                throw new Error('Няма активен потребител');
            // Validate Bulgarian phone if provided
            if (updates.phoneNumber && !firebase_config_1.BulgarianFirebaseUtils.validateBulgarianPhone(updates.phoneNumber)) {
                throw new Error('Невалиден български телефонен номер');
            }
            /*
            // Validate Bulgarian postal code if provided
            if (updates.location?.postalCode && !BulgarianFirebaseUtils.validateBulgarianPostalCode(updates.location.postalCode)) {
              throw new Error('Невалиден пощенски код');
            }
            */
            // Update Firebase Auth profile
            if (updates.displayName || updates.photoURL) {
                await (0, auth_1.updateProfile)(user, {
                    displayName: updates.displayName,
                    photoURL: updates.photoURL
                });
            }
            // Update Firestore profile
            await (0, firestore_1.updateDoc)((0, firestore_1.doc)(firebase_config_1.db, 'users', user.uid), Object.assign(Object.assign({}, updates), { updatedAt: firestore_1.Timestamp.now() }));
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Send password reset email
    async sendPasswordResetEmail(email) {
        try {
            await (0, auth_1.sendPasswordResetEmail)(firebase_config_1.auth, email, {
                url: `${window.location.origin}/reset-password`,
                handleCodeInApp: true
            });
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Verify email
    async verifyEmail(actionCode) {
        try {
            await (0, auth_1.applyActionCode)(firebase_config_1.auth, actionCode);
            // Update user verification status
            const user = firebase_config_1.auth.currentUser;
            if (user) {
                await (0, firestore_1.updateDoc)((0, firestore_1.doc)(firebase_config_1.db, 'users', user.uid), {
                    isVerified: true,
                    verifiedAt: new Date()
                });
            }
        }
        catch (error) {
            throw this.handleAuthError(error);
        }
    }
    // Private helper methods
    async saveUserProfile(user) {
        await (0, firestore_1.setDoc)((0, firestore_1.doc)(firebase_config_1.db, 'users', user.uid), user);
    }
    async userExists(uid) {
        const userDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(firebase_config_1.db, 'users', uid));
        return userDoc.exists();
    }
    async updateLastLogin(uid) {
        try {
            const currentUser = firebase_config_1.auth.currentUser;
            if (!currentUser)
                return; // Nothing to do
            const userRef = (0, firestore_1.doc)(firebase_config_1.db, 'users', uid);
            const snapshot = await (0, firestore_1.getDoc)(userRef);
            if (snapshot.exists()) {
                // Merge only mutable fields; avoid overwriting createdAt or other profile data
                await (0, firestore_1.setDoc)(userRef, {
                    lastLoginAt: firestore_1.Timestamp.now(),
                    verification: Object.assign(Object.assign({}, (snapshot.data().verification || {})), { email: currentUser.emailVerified || false })
                }, { merge: true });
            }
            else {
                // Create minimal compliant doc
                await this.createUserFromSocialLogin(currentUser, 'system');
            }
        }
        catch (error) {
            logger_service_1.logger.error('Error updating last login', error, { uid });
            // Don't throw error to prevent breaking the auth flow
        }
    }
    async createUserFromSocialLogin(user, provider) {
        const bulgarianUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || undefined,
            phoneCountryCode: '+359',
            preferredLanguage: 'bg',
            currency: 'EUR',
            profileType: 'private',
            planTier: 'free',
            permissions: {
                canAddListings: true,
                maxListings: 3,
                maxMonthlyListings: 3,
                canEditLockedFields: false,
                maxFlexEditsPerMonth: 0,
                canBulkUpload: false,
                bulkUploadLimit: 0,
                canCloneListing: false,
                hasAnalytics: false,
                hasAdvancedAnalytics: false,
                hasTeam: false,
                canExportData: false,
                hasPrioritySupport: false,
                canUseQuickReplies: false,
                canBulkEdit: false,
                canImportCSV: false,
                canUseAPI: false,
                themeMode: 'standard'
            },
            verification: {
                email: user.emailVerified,
                phone: !!user.phoneNumber,
                id: false,
                business: false
            },
            stats: {
                totalListings: 0,
                activeListings: 0,
                totalViews: 0,
                totalMessages: 0,
                trustScore: 10
            },
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
            lastLoginAt: firestore_1.Timestamp.now(),
            isActive: true,
            isBanned: false
        };
        await this.saveUserProfile(bulgarianUser);
    }
    validateBulgarianEmail(email) {
        // Basic email validation with Bulgarian domain preference
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    validatePasswordStrength(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }
    handleAuthError(error) {
        try {
            const errorCode = this.getErrorCode(error);
            const errorMessages = {
                'auth/email-already-in-use': 'Този имейл вече е регистриран',
                'auth/weak-password': 'Паролата е твърде слаба',
                'auth/invalid-email': 'Невалиден имейл адрес',
                'auth/user-disabled': 'Този потребител е деактивиран',
                'auth/user-not-found': 'Потребителят не е намерен',
                'auth/wrong-password': 'Грешна парола',
                'auth/invalid-credential': 'Грешен имейл или парола',
                'auth/invalid-verification-code': 'Невалиден код за верификация',
                'auth/code-expired': 'Кодът за верификация е изтекъл',
                'auth/too-many-requests': 'Твърде много опити. Моля опитайте по-късно',
                'auth/network-request-failed': 'Проблем с интернет връзката',
                'auth/popup-closed-by-user': 'Прозорецът за вход беше затворен',
                'auth/cancelled-popup-request': 'Заявката беше отменена',
                'auth/operation-not-allowed': 'Операцията не е разрешена',
                'auth/requires-recent-login': 'Изисква се повторен вход за тази операция'
            };
            // Log the original error for debugging (safely)
            try {
                const errorDetails = new Error(`Auth error: ${errorCode}`);
                logger_service_1.logger.error('Auth error details:', errorDetails, {
                    errorCode,
                    errorType: error instanceof Error ? error.constructor.name : typeof error,
                    errorMessage: error instanceof Error ? error.message : String(error)
                });
            }
            catch (logError) {
                // If logging fails, continue anyway
                console.error('Auth error (logging failed):', errorCode, error);
            }
            // Get message or use default
            let bulgarianMessage = errorMessages[errorCode];
            // If no specific message, try to extract from original error
            if (!bulgarianMessage && error instanceof Error) {
                bulgarianMessage = error.message;
            }
            // Final fallback
            if (!bulgarianMessage) {
                bulgarianMessage = 'Възникна грешка при вход';
            }
            // Create new error with the Bulgarian message
            const handledError = new Error(bulgarianMessage);
            // Preserve original error code if available
            if (errorCode !== 'unknown' && error && typeof error === 'object' && 'code' in error) {
                handledError.code = errorCode;
            }
            return handledError;
        }
        catch (handlingError) {
            // If handleAuthError itself fails, return a safe error
            logger_service_1.logger.error('Error in handleAuthError:', handlingError);
            return new Error('Възникна грешка при вход');
        }
    }
}
exports.BulgarianAuthService = BulgarianAuthService;
// Export singleton instance
exports.bulgarianAuthService = BulgarianAuthService.getInstance();
//# sourceMappingURL=auth-service.js.map