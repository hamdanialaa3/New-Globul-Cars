/**
 * FacebookPixelTracker.ts
 * 🔵 Facebook Pixel (Meta Pixel) Event Tracking
 * 
 * Implements standard events for:
 * - PageView (automatically via base code, but can be manual)
 * - ViewContent (car listing views)
 * - Search (car searches)
 * - Lead (inquiry/contact)
 * - CompleteRegistration (user signup)
 * - AddToWishlist (favorites)
 */

import { logger } from '../../services/logger-service';

// Extend window type for fbq
declare global {
    interface Window {
        fbq?: (...args: any[]) => void;
        _fbq?: any;
    }
}

export class FacebookPixelTracker {
    /**
     * Check if fbq is available
     */
    private static isAvailable(): boolean {
        return typeof window !== 'undefined' && typeof window.fbq === 'function';
    }

    /**
     * Send standard event to Meta
     */
    private static track(eventName: string, params?: Record<string, any>): void {
        if (!this.isAvailable()) {
            return;
        }

        if (params) {
            window.fbq!('track', eventName, params);
        } else {
            window.fbq!('track', eventName);
        }
    }

    /**
     * Send custom event to Meta
     */
    private static trackCustom(eventName: string, params?: Record<string, any>): void {
        if (!this.isAvailable()) {
            return;
        }

        window.fbq!('trackCustom', eventName, params);
    }

    // ============================================================================
    // STANDARD EVENTS
    // ============================================================================

    /**
     * 👁️ Track car listing view
     */
    static viewContent(car: any): void {
        this.track('ViewContent', {
            content_name: `${car.make} ${car.model}`,
            content_category: car.bodyType || car.type || 'Car',
            content_ids: [car.id || `${car.sellerNumericId}-${car.carNumericId}`],
            content_type: 'product',
            value: car.price || 0,
            currency: 'EUR'
        });
    }

    /**
     * 🔍 Track search
     */
    static search(searchTerm: string, filters?: Record<string, any>): void {
        this.track('Search', {
            search_string: searchTerm,
            ...filters
        });
    }

    /**
     * ❤️ Track add to favorites
     */
    static addToWishlist(car: any): void {
        this.track('AddToWishlist', {
            content_name: `${car.make} ${car.model}`,
            content_category: car.bodyType || car.type || 'Car',
            content_ids: [car.id],
            content_type: 'product',
            value: car.price || 0,
            currency: 'EUR'
        });
    }

    /**
     * ✅ Track successful inquiry sent (Lead)
     */
    static lead(car: any): void {
        this.track('Lead', {
            content_name: `${car.make} ${car.model}`,
            content_category: car.bodyType || car.type || 'Car',
            content_ids: [car.id],
            value: car.price || 0,
            currency: 'EUR'
        });
    }

    /**
     * 📝 Track user signup
     */
    static completeRegistration(): void {
        this.track('CompleteRegistration');
    }

    /**
     * 👤 Track user login (Custom event)
     */
    static login(method: string): void {
        this.trackCustom('Login', { method });
    }

    /**
     * 📱 Track phone reveal (Custom/Lead event)
     */
    static phoneReveal(car: any): void {
        this.trackCustom('PhoneReveal', {
            content_id: car.id,
            brand: car.make,
            model: car.model
        });
    }
}

export default FacebookPixelTracker;
