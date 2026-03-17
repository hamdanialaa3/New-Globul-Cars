import { logger } from '@/services/logger-service';
import { UnifiedCar } from '@/services/car';

// Browsing History Interface
export interface BrowsingHistoryItem {
    listing: UnifiedCar;
    viewedAt: Date;
    viewCount: number;
}

// Local Storage Key
const BROWSING_HISTORY_KEY = 'globul_cars_browsing_history';
const MAX_HISTORY_ITEMS = 12;

export const getBrowsingHistory = (): BrowsingHistoryItem[] => {
    try {
        const historyJson = localStorage.getItem(BROWSING_HISTORY_KEY);
        if (historyJson) {
            const history = JSON.parse(historyJson);
            return history.map((item: unknown) => ({
                ...item,
                viewedAt: new Date(item.viewedAt)
            }));
        }
        return [];
    } catch (error) {
        logger.error('Error loading browsing history:', error);
        return [];
    }
};

export const addToBrowsingHistory = (listing: UnifiedCar) => {
    try {
        const historyJson = localStorage.getItem(BROWSING_HISTORY_KEY);
        let history: BrowsingHistoryItem[] = historyJson ? JSON.parse(historyJson) : [];

        const existingIndex = history.findIndex(item => item.listing.id === listing.id);

        if (existingIndex !== -1) {
            history[existingIndex] = {
                listing,
                viewedAt: new Date(),
                viewCount: (history[existingIndex].viewCount || 1) + 1
            };
        } else {
            history.unshift({
                listing,
                viewedAt: new Date(),
                viewCount: 1
            });
        }

        history = history.slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(BROWSING_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        logger.error('Error adding to browsing history:', error);
    }
};

export const clearBrowsingHistory = () => {
    localStorage.removeItem(BROWSING_HISTORY_KEY);
};
