// functions/src/team/types.ts
// Team Management Types

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  role: TeamRole;
  permissions: TeamPermissions;
  
  invitedBy: string;
  invitedAt: FirebaseFirestore.Timestamp;
  joinedAt?: FirebaseFirestore.Timestamp;
  
  status: 'pending' | 'active' | 'inactive';
  lastActive?: FirebaseFirestore.Timestamp;
}

export type TeamRole = 'owner' | 'admin' | 'manager' | 'sales' | 'support';

export interface TeamPermissions {
  // Listings
  canCreateListings: boolean;
  canEditListings: boolean;
  canDeleteListings: boolean;
  canPublishListings: boolean;
  
  // Messages
  canReadMessages: boolean;
  canSendMessages: boolean;
  canDeleteMessages: boolean;
  
  // Reviews
  canRespondToReviews: boolean;
  canViewReviews: boolean;
  
  // Analytics
  canViewAnalytics: boolean;
  canViewFinancials: boolean;
  
  // Team
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canEditMemberRoles: boolean;
  
  // Settings
  canEditBusinessProfile: boolean;
  canManageSubscriptions: boolean;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: TeamRole;
  permissions: TeamPermissions;
  
  invitedBy: string;
  invitedByName: string;
  businessName: string;
  businessId: string;
  
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invitedAt: FirebaseFirestore.Timestamp;
  expiresAt: FirebaseFirestore.Timestamp;
  
  acceptedAt?: FirebaseFirestore.Timestamp;
  declinedAt?: FirebaseFirestore.Timestamp;
}

export interface InviteMemberRequest {
  email: string;
  role: TeamRole;
  customPermissions?: Partial<TeamPermissions>;
}

export interface AcceptInviteRequest {
  invitationId: string;
}

export interface RemoveMemberRequest {
  memberId: string;
  reason?: string;
}

export interface UpdateMemberRequest {
  memberId: string;
  role?: TeamRole;
  permissions?: Partial<TeamPermissions>;
}
