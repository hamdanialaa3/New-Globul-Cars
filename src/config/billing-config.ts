export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    limits: {
        listings: number;
        flexEdits: number;
    };
}

export const SUBSCRIPTION_PLANS: Record<'dealer' | 'company', SubscriptionPlan> = {
    dealer: {
        id: 'price_dealer_monthly',
        name: 'Professional Dealer',
        price: 20, // EUR
        limits: { listings: 30, flexEdits: 10 }
    },
    company: {
        id: 'price_company_monthly',
        name: 'Enterprise',
        price: 100, // EUR
        limits: { listings: 200, flexEdits: 9999 }
    }
};
