// Integration Helper for Recent Browsing Section
// ملف مساعد لربط قسم "شاهدت مؤخراً" مع صفحات المشروع

import { CarListing } from '@globul-cars/core/typesCarListing';

// Local Storage Key
const BROWSING_HISTORY_KEY = 'globul_cars_browsing_history';
const MAX_HISTORY_ITEMS = 12;

// Browsing History Interface
export interface BrowsingHistoryItem {
    listing: CarListing;
    viewedAt: Date;
    viewCount: number;
}

/**
 * Add a car listing to browsing history
 * إضافة مركبة إلى سجل المشاهدات
 * 
 * @param listing - Car listing object
 * 
 * @example
 * ```typescript
 * import { addToBrowsingHistory } from '@/utils/browsingHistoryHelper';
 * 
 * // In CarDetailsPage component
 * useEffect(() => {
 *   if (carListing) {
 *     addToBrowsingHistory(carListing);
 *   }
 * }, [carListing]);
 * ```
 */
export const addToBrowsingHistory = (listing: CarListing): void => {
    try {
        const historyJson = localStorage.getItem(BROWSING_HISTORY_KEY);
        let history: BrowsingHistoryItem[] = historyJson ? JSON.parse(historyJson) : [];

        // Check if item already exists
        const existingIndex = history.findIndex(item => item.listing.id === listing.id);

        if (existingIndex !== -1) {
            // Update existing item
            history[existingIndex] = {
                listing,
                viewedAt: new Date(),
                viewCount: history[existingIndex].viewCount + 1
            };
        } else {
            // Add new item at the beginning
            history.unshift({
                listing,
                viewedAt: new Date(),
                viewCount: 1
            });
        }

        // Keep only the most recent items
        history = history.slice(0, MAX_HISTORY_ITEMS);

        // Save to localStorage
        localStorage.setItem(BROWSING_HISTORY_KEY, JSON.stringify(history));

        console.log(`✅ Added to browsing history: ${listing.make} ${listing.model}`);
    } catch (error) {
        console.error('❌ Error adding to browsing history:', error);
    }
};

/**
 * Get browsing history
 * الحصول على سجل المشاهدات
 * 
 * @returns Array of browsing history items
 */
export const getBrowsingHistory = (): BrowsingHistoryItem[] => {
    try {
        const historyJson = localStorage.getItem(BROWSING_HISTORY_KEY);
        if (historyJson) {
            const history = JSON.parse(historyJson);
            // Convert date strings back to Date objects
            return history.map((item: any) => ({
                ...item,
                viewedAt: new Date(item.viewedAt)
            }));
        }
        return [];
    } catch (error) {
        console.error('❌ Error getting browsing history:', error);
        return [];
    }
};

/**
 * Clear browsing history
 * مسح سجل المشاهدات
 */
export const clearBrowsingHistory = (): void => {
    try {
        localStorage.removeItem(BROWSING_HISTORY_KEY);
        console.log('✅ Browsing history cleared');
    } catch (error) {
        console.error('❌ Error clearing browsing history:', error);
    }
};

/**
 * Remove a specific item from browsing history
 * حذف عنصر معين من سجل المشاهدات
 * 
 * @param listingId - ID of the listing to remove
 */
export const removeFromBrowsingHistory = (listingId: string): void => {
    try {
        const history = getBrowsingHistory();
        const updatedHistory = history.filter(item => item.listing.id !== listingId);
        localStorage.setItem(BROWSING_HISTORY_KEY, JSON.stringify(updatedHistory));
        console.log(`✅ Removed from browsing history: ${listingId}`);
    } catch (error) {
        console.error('❌ Error removing from browsing history:', error);
    }
};

/**
 * Get recently viewed count for a specific listing
 * الحصول على عدد المشاهدات لمركبة معينة
 * 
 * @param listingId - ID of the listing
 * @returns View count or 0 if not found
 */
export const getViewCount = (listingId: string): number => {
    try {
        const history = getBrowsingHistory();
        const item = history.find(h => h.listing.id === listingId);
        return item ? item.viewCount : 0;
    } catch (error) {
        console.error('❌ Error getting view count:', error);
        return 0;
    }
};

/**
 * Check if a listing is in browsing history
 * التحقق من وجود مركبة في سجل المشاهدات
 * 
 * @param listingId - ID of the listing
 * @returns true if in history, false otherwise
 */
export const isInBrowsingHistory = (listingId: string): boolean => {
    try {
        const history = getBrowsingHistory();
        return history.some(item => item.listing.id === listingId);
    } catch (error) {
        console.error('❌ Error checking browsing history:', error);
        return false;
    }
};

// Export constants for external use
export { BROWSING_HISTORY_KEY, MAX_HISTORY_ITEMS };
