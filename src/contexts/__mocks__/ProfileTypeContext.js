// Manual Jest mock for ProfileTypeContext
module.exports = {
  useProfileType: () => ({
    profileType: 'private',
    planTier: 'free',
    canAddListing: () => true,
    canAccessAnalytics: () => false,
  }),
  ProfileTypeProvider: ({ children }) => children,
};