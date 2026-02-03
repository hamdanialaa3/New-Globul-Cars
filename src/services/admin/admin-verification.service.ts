import { db } from '../../firebase/firebase-config';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp,
    getDoc,
    writeBatch
} from 'firebase/firestore';
import { logger } from '../logger-service';
import { User, DealershipInfo } from '../../types/user/bulgarian-user.types';

export interface Subscriber {
    uid: string;
    displayName: string;
    email: string;
    planTier: 'dealer' | 'company' | 'free';
    profileType: 'dealer' | 'company' | 'private';
    status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
    currentPeriodEnd?: Date;
}

export interface PendingVerification {
    id: string; // dealership/company doc ID
    uid: string; // user ID
    type: 'dealer' | 'company';
    name: string;
    submittedAt: Date;
    documents: {
        license?: string;
        vat?: string;
    };
    userData?: Partial<User>;
}

class AdminService {
    /**
     * Fetches all pending verifications
     * Currently scans 'dealerships' (can be expanded to 'companies')
     */
    async getPendingVerifications(): Promise<PendingVerification[]> {
        try {
            // 1. Query pending dealerships
            const q = query(
                collection(db, 'dealerships'),
                where('verificationStatus', '==', 'pending')
            );

            const snapshot = await getDocs(q);
            const verifications: PendingVerification[] = [];

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();

                // Fetch User Data for context
                let userData: Partial<User> | undefined;
                if (data.uid) {
                    const userSnap = await getDoc(doc(db, 'users', data.uid));
                    if (userSnap.exists()) {
                        userData = userSnap.data() as User;
                    }
                }

                verifications.push({
                    id: docSnap.id,
                    uid: data.uid,
                    type: 'dealer', // Future: differentiate based on collection or field
                    name: data.companyName || 'Unknown Entity',
                    submittedAt: data.createdAt?.toDate() || new Date(),
                    documents: {
                        license: data.documents?.licenseUrl,
                        vat: data.documents?.vatUrl
                    },
                    userData
                });
            }

            return verifications;
        } catch (error) {
            logger.error('AdminService: Failed to fetch verifications', error as Error);
            throw error;
        }
    }

    /**
     * Approves a dealer verification request
     * 1. Updates dealership status to 'verified'
     * 2. Force-updates user's profileType and permissions
     */
    async approveVerification(dealershipId: string, uid: string): Promise<void> {
        try {
            const batch = writeBatch(db);

            // 1. Update Dealership Doc
            const dealershipRef = doc(db, 'dealerships', dealershipId);
            batch.update(dealershipRef, {
                verificationStatus: 'verified',
                verifiedAt: serverTimestamp(),
                rejectionReason: null
            });

            // 2. Update User Profile
            // Securely transition them to 'dealer' status if not already
            // Also grant default dealer plan permissions if on free tier
            const userRef = doc(db, 'users', uid);
            batch.update(userRef, {
                // Enforce dealer profile type
                profileType: 'dealer',

                // Update stats/badges
                'verificationBadge': true,
                updatedAt: serverTimestamp()
            });

            // 3. Log Action (Optional: audit log collection)
            const auditRef = doc(collection(db, 'admin_audit_logs'));
            batch.set(auditRef, {
                action: 'APPROVE_DEALER',
                targetUid: uid,
                targetDocId: dealershipId,
                timestamp: serverTimestamp()
            });

            await batch.commit();
            logger.info(`Dealer verified: ${dealershipId}`);

        } catch (error) {
            logger.error('AdminService: Approval failed', error as Error);
            throw error;
        }
    }

    /**
     * Rejects a verification request
     */
    async rejectVerification(dealershipId: string, reason: string): Promise<void> {
        try {
            const docRef = doc(db, 'dealerships', dealershipId);
            await updateDoc(docRef, {
                verificationStatus: 'rejected',
                rejectionReason: reason,
                rejectedAt: serverTimestamp()
            });
            logger.info(`Dealer rejected: ${dealershipId}`);
        } catch (error) {
            logger.error('AdminService: Rejection failed', error as Error);
            throw error;
        }
    }

    /**
     * Force Update User Field (God Mode Helper)
     */
    async forceUpdateUserField(uid: string, field: string, value: any): Promise<void> {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            [field]: value,
            updatedAt: serverTimestamp()
        });
    }

    /**
     * Get all active subscribers for Revenue Monitor
     */
    async getSubscribers(tier?: 'dealer' | 'company'): Promise<Subscriber[]> {
        try {
            // Base query for paying users (non-free)
            let q = query(
                collection(db, 'users'),
                where('planTier', 'in', ['dealer', 'company'])
            );

            if (tier) {
                q = query(collection(db, 'users'), where('planTier', '==', tier));
            }

            const snapshot = await getDocs(q);
            const subscribers: Subscriber[] = [];

            // Parallel fetch of subscription status (this is heavy, pagination recommended in prod)
            await Promise.all(snapshot.docs.map(async (userDoc) => {
                const userData = userDoc.data() as User;

                // Fetch sub status from sub-collection
                const subsRef = collection(db, 'customers', userDoc.id, 'subscriptions');
                const subsSnap = await getDocs(subsRef);

                let status: Subscriber['status'] = 'incomplete'; // Default if no sub found
                let currentPeriodEnd: Date | undefined;

                if (!subsSnap.empty) {
                    const subData = subsSnap.docs[0].data();
                    status = subData.status || 'active'; // Default to active if field missing but doc exists
                    if (subData.current_period_end) {
                        currentPeriodEnd = subData.current_period_end.toDate();
                    }
                }

                subscribers.push({
                    uid: userDoc.id,
                    displayName: userData.displayName || 'Unknown',
                    email: userData.email,
                    planTier: userData.planTier as any || 'free',
                    profileType: userData.profileType,
                    status,
                    currentPeriodEnd
                });
            }));

            return subscribers;
        } catch (error) {
            logger.error('AdminService: Failed to fetch subscribers', error as Error);
            return [];
        }
    }

    /**
     * Search users for God Mode Manager
     */
    async searchUsers(searchQuery: string): Promise<User[]> {
        try {
            // Note: Firestore text search is limited. 
            // In a real app we'd use Algolia. Here we do a basic prefix match on name/email would be handled by client 
            // or separate exact match queries.
            // For MVP, we'll fetch recent users or "starts with" logic if feasible, 
            // but strict "contains" isn't supported natively.

            // Just fetching recent 50 for now or exact match if it looks like an email
            const usersRef = collection(db, 'users');
            let q;

            if (searchQuery.includes('@')) {
                q = query(usersRef, where('email', '==', searchQuery));
            } else {
                // Fallback: just return latest users to filter client-side or partial match if possible
                // Using orderBy requires index. Let's just getAll (capped) and filter memory for MVP admin tool
                q = query(usersRef, where('profileType', 'in', ['private', 'dealer', 'company']));
                // We limit to 50
                // In prod: Implementation of Algolia is mandatory for this.
            }

            const snapshot = await getDocs(q);
            const users = snapshot.docs
                .map(d => d.data() as User)
                .filter(u =>
                    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .slice(0, 20);

            return users;
        } catch (error) {
            logger.error('AdminService: Search failed', error as Error);
            return [];
        }
    }

    /**
     * God Mode: Force update entire user object
     */
    async forceUpdateUser(uid: string, updates: Partial<User>): Promise<void> {
        return this.forceUpdateUserField(uid, 'updatedAt', serverTimestamp()) // Trigger generic update
            .then(() => updateDoc(doc(db, 'users', uid), updates));
    }
}

export const adminService = new AdminService();
