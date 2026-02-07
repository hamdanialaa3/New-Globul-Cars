import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { AdCampaign, AdContext, DeviceType } from '../types';

const CAMPAIGNS_COLLECTION = 'ad_campaigns';
const ANALYTICS_COLLECTION = 'ad_analytics';

// Feature Flag
const ADS_ENABLED = import.meta.env.VITE_ADS_ENABLED !== 'false';

export const adService = {
    /**
     * Fetch active campaigns for a specific placement and context.
     */
    async getAdForPlacement(placementId: string, context: AdContext = {}): Promise<AdCampaign | null> {
        if (!ADS_ENABLED) return null;

        try {
            const now = new Date().toISOString();
            const adsRef = collection(db, CAMPAIGNS_COLLECTION);

            // Basic Query: Active + Placement
            const q = query(
                adsRef,
                where('isActive', '==', true),
                where('placementIds', 'array-contains', placementId)
            );

            const snapshot = await getDocs(q);
            const candidates: AdCampaign[] = [];

            snapshot.forEach(doc => {
                const data = doc.data() as AdCampaign;

                // 1. Time Check
                if (data.startDate > now) return;
                if (data.endDate && data.endDate < now) return;

                // 2. Device Check
                const currentDevice = context.device || 'desktop';
                if (data.targetDevices !== 'both' && data.targetDevices !== currentDevice) return;

                // 3. Country Check
                if (data.targetCountries && data.targetCountries.length > 0) {
                    const currentCountry = context.country || 'BG';
                    if (!data.targetCountries.includes(currentCountry)) return;
                }

                // 4. Contextual Targeting (Brand/Model)
                if (context.brand && data.targetBrands && data.targetBrands.length > 0) {
                    if (!data.targetBrands.includes(context.brand)) return;
                }

                if (context.model && data.targetModels && data.targetModels.length > 0) {
                    if (!data.targetModels.includes(context.model)) return;
                }

                candidates.push({ ...data, id: doc.id });
            });

            if (candidates.length === 0) return null;

            return this.selectWeightedAd(candidates);

        } catch (error) {
            console.error('[AdService] Error fetching ads:', error);
            return null;
        }
    },

    selectWeightedAd(ads: AdCampaign[]): AdCampaign {
        const totalWeight = ads.reduce((sum, ad) => sum + (ad.weight || 0), 0);

        if (totalWeight === 0) {
            return ads[Math.floor(Math.random() * ads.length)];
        }

        let random = Math.random() * totalWeight;

        for (const ad of ads) {
            random -= (ad.weight || 0);
            if (random <= 0) return ad;
        }
        return ads[0];
    },

    // --- Tracking ---

    async trackImpression(campaignId: string, placementId: string) {
        if (!ADS_ENABLED) return;
        try {
            const campaignRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
            updateDoc(campaignRef, {
                'stats.impressions': increment(1)
            }).catch(e => console.warn('[AdService] Impression track failed', e));
        } catch (e) {
            console.warn('[AdService] Impression track failed', e);
        }
    },

    async trackClick(campaignId: string, placementId: string) {
        if (!ADS_ENABLED) return;
        try {
            const campaignRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
            updateDoc(campaignRef, {
                'stats.clicks': increment(1)
            }).catch(e => console.warn('[AdService] Click track failed', e));
        } catch (e) {
            console.warn('[AdService] Click track failed', e);
        }
    },

    // --- CRUD ---

    async createCampaign(campaign: Omit<AdCampaign, 'id'>) {
        return addDoc(collection(db, CAMPAIGNS_COLLECTION), {
            ...campaign,
            createdAt: serverTimestamp(),
            isActive: true,
            stats: { impressions: 0, clicks: 0 }
        });
    },

    async updateCampaign(id: string, updates: Partial<AdCampaign>) {
        const docRef = doc(db, CAMPAIGNS_COLLECTION, id);
        return updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    },

    async deleteCampaign(id: string) {
        return deleteDoc(doc(db, CAMPAIGNS_COLLECTION, id));
    },

    async getCampaigns() {
        try {
            const q = query(collection(db, CAMPAIGNS_COLLECTION));
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as AdCampaign));
        } catch (e) {
            console.error('[AdService] Get campaigns failed', e);
            return [];
        }
    }
};
