// src/utils/userFilters.ts
import type { BulgarianUser } from '../types/user/bulgarian-user.types';

export const filterUsersBySearch = (users: BulgarianUser[], searchTerm: string): BulgarianUser[] => {
  if (!searchTerm || searchTerm.length < 2) return users;
  
  const term = searchTerm.toLowerCase().trim();
  
  return users.filter((user: any) => {
    const displayName = user.displayName?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const companyName = user.profileType === 'dealer' 
      ? user.dealerSnapshot?.nameBG?.toLowerCase() || user.dealerSnapshot?.nameEN?.toLowerCase() || ''
      : user.profileType === 'company'
      ? user.companySnapshot?.nameBG?.toLowerCase() || user.companySnapshot?.nameEN?.toLowerCase() || ''
      : '';
    
    return displayName.includes(term) || 
           email.includes(term) || 
           companyName.includes(term);
  });
};

export const sortUsers = (
  users: BulgarianUser[], 
  sortBy: 'name' | 'newest' | 'trust' | 'listings'
): BulgarianUser[] => {
  const sorted = [...users];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => 
        (a.displayName || '').localeCompare(b.displayName || '')
      );
    
    case 'newest':
      return sorted.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
    
    case 'trust':
      return sorted.sort((a, b) => 
        (b.stats?.trustScore || 0) - (a.stats?.trustScore || 0)
      );
    
    case 'listings':
      return sorted.sort((a, b) => 
        (b.stats?.activeListings || 0) - (a.stats?.activeListings || 0)
      );
    
    default:
      return sorted;
  }
};
