/**
 * Enhanced Google Analytics 4 E-commerce Tracking
 * Implements GA4 recommended events for car marketplace
 */

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

interface CarItem {
    item_id: string;
    item_name: string;
    item_brand: string;
    item_category: string;
    item_variant?: string;
    price: number;
    currency?: string;
}

interface SubscriptionItem {
    item_id: string;
    item_name: string;
    item_category: string;
    price: number;
    currency?: string;
}

/**
 * Track car view (Product Detail View)
 */
export const trackCarView = (car: {
    numericId: number;
    brand: string;
    model: string;
    year: number;
    variant?: string;
    price: number;
    category?: string;
}): void => {
    if (!window.gtag) return;

    const item: CarItem = {
        item_id: `car_${car.numericId}`,
        item_name: `${car.brand} ${car.model} ${car.year}`,
        item_brand: car.brand,
        item_category: car.category || 'car',
        item_variant: car.variant,
        price: car.price,
        currency: 'EUR'
    };

    window.gtag('event', 'view_item', {
        currency: 'EUR',
        value: car.price,
        items: [item]
    });
};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string, filters?: Record<string, any>): void => {
    if (!window.gtag) return;

    window.gtag('event', 'search', {
        search_term: searchTerm,
        ...filters
    });
};

/**
 * Track car listing view in search results
 */
export const trackCarListView = (cars: Array<{
    numericId: number;
    brand: string;
    model: string;
    year: number;
    price: number;
    category?: string;
}>): void => {
    if (!window.gtag) return;

    const items: CarItem[] = cars.map((car, index) => ({
        item_id: `car_${car.numericId}`,
        item_name: `${car.brand} ${car.model} ${car.year}`,
        item_brand: car.brand,
        item_category: car.category || 'car',
        price: car.price,
        currency: 'EUR',
        index
    }));

    window.gtag('event', 'view_item_list', {
        item_list_id: 'search_results',
        item_list_name: 'Search Results',
        items
    });
};

/**
 * Track when user clicks on a car in search results
 */
export const trackCarClick = (car: {
    numericId: number;
    brand: string;
    model: string;
    year: number;
    price: number;
    category?: string;
}, position: number): void => {
    if (!window.gtag) return;

    const item: CarItem = {
        item_id: `car_${car.numericId}`,
        item_name: `${car.brand} ${car.model} ${car.year}`,
        item_brand: car.brand,
        item_category: car.category || 'car',
        price: car.price,
        currency: 'EUR'
    };

    window.gtag('event', 'select_item', {
        item_list_id: 'search_results',
        item_list_name: 'Search Results',
        items: [{ ...item, index: position }]
    });
};

/**
 * Track subscription purchase
 */
export const trackSubscriptionPurchase = (
    plan: string,
    price: number,
    transactionId: string
): void => {
    if (!window.gtag) return;

    const item: SubscriptionItem = {
        item_id: `subscription_${plan}`,
        item_name: `${plan} Subscription`,
        item_category: 'subscription',
        price,
        currency: 'EUR'
    };

    window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: price,
        currency: 'EUR',
        items: [item]
    });
};

/**
 * Track when user starts checkout for subscription
 */
export const trackBeginCheckout = (plan: string, price: number): void => {
    if (!window.gtag) return;

    const item: SubscriptionItem = {
        item_id: `subscription_${plan}`,
        item_name: `${plan} Subscription`,
        item_category: 'subscription',
        price,
        currency: 'EUR'
    };

    window.gtag('event', 'begin_checkout', {
        currency: 'EUR',
        value: price,
        items: [item]
    });
};

/**
 * Track car listing creation (seller action)
 */
export const trackCarListingCreated = (car: {
    numericId: number;
    brand: string;
    model: string;
    price: number;
    category?: string;
}): void => {
    if (!window.gtag) return;

    window.gtag('event', 'car_listing_created', {
        car_id: car.numericId,
        brand: car.brand,
        model: car.model,
        price: car.price,
        category: car.category || 'car',
        currency: 'EUR'
    });
};

/**
 * Track message sent (engagement)
 */
export const trackMessageSent = (recipientType: 'seller' | 'buyer'): void => {
    if (!window.gtag) return;

    window.gtag('event', 'message_sent', {
        recipient_type: recipientType
    });
};

/**
 * Track phone number reveal (high-intent action)
 */
export const trackPhoneReveal = (carId: number): void => {
    if (!window.gtag) return;

    window.gtag('event', 'phone_reveal', {
        car_id: carId,
        engagement_type: 'high_intent'
    });
};

/**
 * Set user properties (subscription tier, user type)
 */
export const setUserProperties = (properties: {
    subscription_tier?: string;
    user_type?: 'dealer' | 'private' | 'company';
    total_listings?: number;
}): void => {
    if (!window.gtag) return;

    window.gtag('set', 'user_properties', properties);
};

/**
 * Track custom conversion events
 */
export const trackConversion = (eventName: string, value?: number): void => {
    if (!window.gtag) return;

    window.gtag('event', eventName, {
        value,
        currency: 'EUR'
    });
};
