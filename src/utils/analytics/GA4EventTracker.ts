/**
 * GA4EventTracker.ts
 * 📊 Google Analytics 4 Enhanced E-commerce Tracking
 * 
 * Implements GA4 recommended events for:
 * - view_item (car listing views)
 * - add_to_wishlist (favorites)
 * - begin_checkout (inquiry/contact)
 * - purchase (if applicable)
 * - search (car searches)
 * - view_item_list (car grid views)
 * 
 * @author SEO Supremacy System
 */

// ============================================================================
// TYPES
// ============================================================================

interface GA4Item {
    item_id: string;
    item_name: string;
    item_brand?: string;
    item_category?: string;
    item_category2?: string;
    item_variant?: string;
    price?: number;
    quantity?: number;
    index?: number;
}

interface GA4EventParams {
    currency?: string;
    value?: number;
    items?: GA4Item[];
    [key: string]: any;
}

/**
 * Car data interface for GA4 tracking
 */
interface CarForGA4 {
    id: string;
    make?: string;
    model?: string;
    year?: number;
    price?: number;
    fuelType?: string;
    [key: string]: unknown;
}

// Extend window type for gtag
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

import { logger } from '../../services/logger-service';

// ============================================================================
// GA4 EVENT TRACKER
// ============================================================================

export class GA4EventTracker {
    private static readonly CURRENCY = 'EUR';

    /**
     * Check if gtag is available
     */
    private static isAvailable(): boolean {
        return typeof window !== 'undefined' && typeof window.gtag === 'function';
    }

    /**
     * Send event to GA4
     */
    private static sendEvent(eventName: string, params: GA4EventParams): void {
        if (!this.isAvailable()) {
            logger.warn('GA4 not available');
            return;
        }

        window.gtag!('event', eventName, params);
    }

    /**
     * Convert car data to GA4 item format
     */
    static carToItem(car: any, index?: number): GA4Item {
        return {
            item_id: car.id || `${car.sellerNumericId}-${car.carNumericId}`,
            item_name: `${car.make} ${car.model} ${car.year || ''}`.trim(),
            item_brand: car.make,
            item_category: car.bodyType || car.type || 'Car',
            item_category2: car.fuelType,
            item_variant: car.transmission,
            price: car.price || 0,
            quantity: 1,
            ...(index !== undefined && { index }),
        };
    }

    // ============================================================================
    // E-COMMERCE EVENTS
    // ============================================================================

    /**
     * 👁️ Track car listing view
     */
    static viewItem(car: any): void {
        const item = this.carToItem(car);

        this.sendEvent('view_item', {
            currency: this.CURRENCY,
            value: car.price || 0,
            items: [item],
        });
    }

    /**
     * 📋 Track car list view (grid/search results)
     */
    static viewItemList(cars: CarForGA4[], listName: string): void {
        const items = cars.slice(0, 20).map((car, index) =>
            this.carToItem(car, index)
        );

        this.sendEvent('view_item_list', {
            item_list_id: listName.toLowerCase().replace(/\s+/g, '_'),
            item_list_name: listName,
            items,
        });
    }

    /**
     * ❤️ Track add to favorites/wishlist
     */
    static addToWishlist(car: CarForGA4): void {
        const item = this.carToItem(car);

        this.sendEvent('add_to_wishlist', {
            currency: this.CURRENCY,
            value: car.price || 0,
            items: [item],
        });
    }

    /**
     * 🔍 Track search
     */
    static search(searchTerm: string, filters?: Record<string, any>): void {
        this.sendEvent('search', {
            search_term: searchTerm,
            ...filters,
        });
    }

    /**
     * 📞 Track inquiry/contact (begin_checkout equivalent)
     */
    static beginInquiry(car: CarForGA4): void {
        const item = this.carToItem(car);

        this.sendEvent('begin_checkout', {
            currency: this.CURRENCY,
            value: car.price || 0,
            items: [item],
        });
    }

    /**
     * ✅ Track successful inquiry sent
     */
    static inquirySent(car: CarForGA4): void {
        const item = this.carToItem(car);

        this.sendEvent('generate_lead', {
            currency: this.CURRENCY,
            value: car.price || 0,
            items: [item],
        });
    }

    /**
     * 📱 Track phone reveal
     */
    static phoneReveal(car: CarForGA4): void {
        this.sendEvent('select_content', {
            content_type: 'phone_reveal',
            content_id: car.id,
            item_id: car.id,
        });
    }

    /**
     * 🔗 Track share
     */
    static share(car: any, method: string): void {
        this.sendEvent('share', {
            method,
            content_type: 'car_listing',
            item_id: car.id,
        });
    }

    // ============================================================================
    // USER ENGAGEMENT EVENTS
    // ============================================================================

    /**
     * 👤 Track user login
     */
    static login(method: string): void {
        this.sendEvent('login', { method });
    }

    /**
     * 📝 Track user signup
     */
    static signUp(method: string): void {
        this.sendEvent('sign_up', { method });
    }

    /**
     * 📸 Track story view
     */
    static viewStory(storyId: string, sellerId: string): void {
        this.sendEvent('view_item', {
            content_type: 'story',
            content_id: storyId,
            seller_id: sellerId,
        });
    }

    /**
     * 🎥 Track video play
     */
    static videoStart(videoId: string, videoTitle: string): void {
        this.sendEvent('video_start', {
            video_current_time: 0,
            video_duration: 0,
            video_percent: 0,
            video_provider: 'internal',
            video_title: videoTitle,
            video_url: videoId,
        });
    }

    /**
     * ⏱️ Track scroll depth
     */
    static scrollDepth(percent: number): void {
        this.sendEvent('scroll', {
            percent_scrolled: percent,
        });
    }

    // ============================================================================
    // CUSTOM EVENTS
    // ============================================================================

    /**
     * 🚗 Track car comparison
     */
    static compare(cars: CarForGA4[]): void {
        const items = cars.map((car, index) => this.carToItem(car, index));

        this.sendEvent('select_content', {
            content_type: 'comparison',
            items,
        });
    }

    /**
     * 💰 Track price alert set
     */
    static setPriceAlert(car: CarForGA4, targetPrice: number): void {
        this.sendEvent('select_content', {
            content_type: 'price_alert',
            item_id: car.id,
            target_price: targetPrice,
        });
    }

    /**
     * 🏠 Track dealer visit
     */
    static viewDealer(dealerId: string, dealerName: string): void {
        this.sendEvent('view_item', {
            content_type: 'dealer',
            content_id: dealerId,
            dealer_name: dealerName,
        });
    }
}

// ============================================================================
// REACT HOOK FOR GA4
// ============================================================================

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to track page views automatically
 */
export function useGA4PageView(): void {
    const location = useLocation();

    useEffect(() => {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'page_view', {
                page_path: location.pathname + location.search,
                page_title: document.title,
            });
        }
    }, [location]);
}

export default GA4EventTracker;
