// useAuth Hook - Moved to @globul-cars/core package
// Updated imports to use package aliases

import { useContext } from 'react';
import { AuthContext } from '@globul-cars/core/contextsAuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;

