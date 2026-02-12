/**
 * Navigation Links Configuration
 * تكوين روابط الملاحة - روابط الموقع الرئيسية
 * 
 * @since January 17, 2026
 */

export const navigationLinks = {
  public: {
    home: '/',
    search: '/search',
    advancedSearch: '/advanced-search',
    whyUs: '/why-us',
    launchOffer: '/launch-offer',
    competitiveComparison: '/competitive-comparison',
  },
  
  dealer: {
    dashboard: '/dealer-dashboard',
    sellerDashboard: '/seller-dashboard',
    sell: '/sell',
    myListings: '/my-listings',
    myDrafts: '/my-drafts',
  },

  user: {
    profile: (numericId: number) => `/profile/${numericId}`,
    messages: '/messages',
    favorites: '/favorites',
  },

  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    listings: '/admin/listings',
    payments: '/super-admin/finance/manual-payments',
  }
};

export default navigationLinks;
