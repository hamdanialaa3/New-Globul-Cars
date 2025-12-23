// English translations - My Listings
export const myListings = {
  title: 'My listings',
  subtitle: 'Manage your car listings, track performance, and connect with buyers.',
  loadError: "We couldn't load your listings right now. Please refresh.",
  confirmDelete: 'Are you sure you want to permanently delete this listing?',
  loading: 'Loading your listings...',
  empty: {
    title: 'No listings yet',
    subtitle: "You haven't created any car listings yet.",
    cta: 'Create your first listing'
  },
  filters: {
    status: 'Status:',
    statusAll: 'All',
    statusActive: 'Active',
    statusSold: 'Sold',
    statusPending: 'Pending',
    statusInactive: 'Inactive',
    sortBy: 'Sort by:',
    sortDate: 'Newest',
    sortPrice: 'Price',
    sortViews: 'Views',
    sortInquiries: 'Inquiries',
    order: 'Order:',
    orderDesc: 'Descending',
    orderAsc: 'Ascending',
    search: 'Search:',
    searchPlaceholder: 'Search listings...'
  },
  stats: {
    total: 'Total listings',
    active: 'Active',
    sold: 'Sold',
    views: 'Total views',
    inquiries: 'Inquiries',
    messages: 'Messages',
    activeAds: 'Active Ads',
    totalViews: 'Total Views',
    totalListings: 'Total Listings'
  },
  status: {
    active: 'Active',
    sold: 'Sold',
    pending: 'Pending',
    inactive: 'Inactive'
  },
  badges: {
    featured: 'Featured',
    urgent: 'Urgent'
  },
  cards: {
    priceMissing: 'Price on request',
    mileageMissing: 'Mileage N/A',
    locationMissing: 'Location N/A',
    doors: 'doors',
    seats: 'seats',
    doorsMissing: 'Doors N/A',
    seatsMissing: 'Seats N/A',
    safety: 'Safety',
    comfort: 'Comfort',
    infotainment: 'Infotainment',
    extras: 'Extras',
    features: 'features',
    dealer: 'Dealer',
    private: 'Private'
  },
  actions: {
    view: 'View listing',
    edit: 'Edit listing',
    deactivate: 'Deactivate',
    activate: 'Activate',
    unfeature: 'Remove from featured',
    feature: 'Make featured',
    delete: 'Delete listing',
    errorGeneric: 'Something went wrong. Please try again.'
  }
} as const;
