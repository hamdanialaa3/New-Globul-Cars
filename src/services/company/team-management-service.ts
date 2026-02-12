/**
 * Team Management Service
 * Handles multi-user collaboration for Company accounts
 * 
 * Features:
 * - Invite team members via email
 * - Role-based access control (Admin/Agent/Viewer)
 * - Permission matrix enforcement
 * - Invite code generation & validation
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  writeBatch,
  DocumentReference
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-config';
import { logger } from '@/services/logger-service';

// ===== Types =====

export type TeamRole = 'admin' | 'agent' | 'viewer';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type MemberStatus = 'pending' | 'active' | 'suspended';

export interface TeamPermissions {
  canCreateCars: boolean;
  canEditAllCars: boolean;
  canDeleteCars: boolean;
  canViewAnalytics: boolean;
  canManageTeam: boolean;
}

export interface TeamMember {
  id: string;
  email: string;
  displayName: string;
  role: TeamRole;
  permissions: TeamPermissions;
  invitedBy: string;
  invitedAt: Date;
  status: MemberStatus;
  linkedUserId?: string;
  lastActive?: Date;
  photoURL?: string;
}

export interface TeamInvitation {
  id: string;
  companyId: string;
  email: string;
  role: TeamRole;
  inviteCode: string;
  expiresAt: Date;
  status: InviteStatus;
  createdAt: Date;
  invitedBy: string;
}

export interface InviteMemberParams {
  email: string;
  role: TeamRole;
  displayName: string;
  customPermissions?: Partial<TeamPermissions>;
}

// ===== Permission Presets =====

const ROLE_PERMISSIONS: Record<TeamRole, TeamPermissions> = {
  admin: {
    canCreateCars: true,
    canEditAllCars: true,
    canDeleteCars: true,
    canViewAnalytics: true,
    canManageTeam: true
  },
  agent: {
    canCreateCars: true,
    canEditAllCars: false,  // Can only edit own cars
    canDeleteCars: false,
    canViewAnalytics: true,
    canManageTeam: false
  },
  viewer: {
    canCreateCars: false,
    canEditAllCars: false,
    canDeleteCars: false,
    canViewAnalytics: true,
    canManageTeam: false
  }
};

// ===== Service Class =====

class TeamManagementService {
  private static instance: TeamManagementService;

  static getInstance(): TeamManagementService {
    if (!this.instance) {
      this.instance = new TeamManagementService();
    }
    return this.instance;
  }

  /**
   * Generate unique 8-character invite code
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Get permission preset for a role
   */
  getPermissionsForRole(role: TeamRole): TeamPermissions {
    return { ...ROLE_PERMISSIONS[role] };
  }

  /**
   * Invite a new team member
   */
  async inviteMember(
    companyId: string,
    invitedBy: string,
    params: InviteMemberParams
  ): Promise<TeamInvitation> {
    try {
      logger.info('Inviting team member', { companyId, email: params.email, role: params.role });

      // Check if user already invited
      const existingInvite = await this.getInvitationByEmail(companyId, params.email);
      if (existingInvite && existingInvite.status === 'pending') {
        throw new Error('This user already has a pending invitation');
      }

      // Check if already a team member
      const existingMember = await this.getMemberByEmail(companyId, params.email);
      if (existingMember) {
        throw new Error('This user is already a team member');
      }

      const inviteCode = this.generateInviteCode();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invitationData = {
        companyId,
        email: params.email.toLowerCase(),
        role: params.role,
        inviteCode,
        expiresAt: Timestamp.fromDate(expiresAt),
        status: 'pending' as InviteStatus,
        createdAt: Timestamp.fromDate(now),
        invitedBy
      };

      const inviteRef = await addDoc(collection(db, 'team_invitations'), invitationData);

      // Create team member entry (pending status)
      const permissions = params.customPermissions
        ? { ...this.getPermissionsForRole(params.role), ...params.customPermissions }
        : this.getPermissionsForRole(params.role);

      const memberData = {
        email: params.email.toLowerCase(),
        displayName: params.displayName,
        role: params.role,
        permissions,
        invitedBy,
        invitedAt: Timestamp.fromDate(now),
        status: 'pending' as MemberStatus
      };

      await addDoc(collection(db, `users/${companyId}/team_members`), memberData);

      logger.info('Team member invited successfully', { inviteCode });

      return {
        id: inviteRef.id,
        ...invitationData,
        expiresAt,
        createdAt: now
      };
    } catch (error) {
      logger.error('Failed to invite team member', error as Error);
      throw error;
    }
  }

  /**
   * Get invitation by email
   */
  private async getInvitationByEmail(
    companyId: string,
    email: string
  ): Promise<TeamInvitation | null> {
    try {
      const q = query(
        collection(db, 'team_invitations'),
        where('companyId', '==', companyId),
        where('email', '==', email.toLowerCase())
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        expiresAt: doc.data().expiresAt.toDate(),
        createdAt: doc.data().createdAt.toDate()
      } as TeamInvitation;
    } catch (error) {
      logger.error('Failed to get invitation by email', error as Error);
      return null;
    }
  }

  /**
   * Get team member by email
   */
  private async getMemberByEmail(
    companyId: string,
    email: string
  ): Promise<TeamMember | null> {
    try {
      const q = query(
        collection(db, `users/${companyId}/team_members`),
        where('email', '==', email.toLowerCase())
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        invitedAt: doc.data().invitedAt.toDate(),
        lastActive: doc.data().lastActive?.toDate()
      } as TeamMember;
    } catch (error) {
      logger.error('Failed to get member by email', error as Error);
      return null;
    }
  }

  /**
   * Get all team members for a company
   */
  async getTeamMembers(companyId: string): Promise<TeamMember[]> {
    try {
      const snapshot = await getDocs(collection(db, `users/${companyId}/team_members`));

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        invitedAt: doc.data().invitedAt.toDate(),
        lastActive: doc.data().lastActive?.toDate()
      })) as TeamMember[];
    } catch (error) {
      logger.error('Failed to get team members', error as Error);
      return [];
    }
  }

  /**
   * Get invitation by invite code (Public - for AcceptInvitePage)
   */
  async getInvitationByCode(code: string): Promise<TeamInvitation | null> {
    try {
      const q = query(
        collection(db, 'team_invitations'),
        where('inviteCode', '==', code.toUpperCase()),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        expiresAt: doc.data().expiresAt,
        createdAt: doc.data().createdAt
      } as TeamInvitation;
    } catch (error) {
      logger.error('Failed to get invitation by code', error as Error);
      return null;
    }
  }

  /**
   * Get pending invitations for a company
   */
  async getPendingInvitations(companyId: string): Promise<TeamInvitation[]> {
    try {
      const q = query(
        collection(db, 'team_invitations'),
        where('companyId', '==', companyId),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        expiresAt: doc.data().expiresAt.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as TeamInvitation[];
    } catch (error) {
      logger.error('Failed to get pending invitations', error as Error);
      return [];
    }
  }

  /**
   * Accept invitation (called by invited user)
   */
  async acceptInvitation(inviteCode: string, userId: string): Promise<void> {
    try {
      logger.info('Accepting invitation', { inviteCode, userId });

      // Find invitation by code
      const q = query(
        collection(db, 'team_invitations'),
        where('inviteCode', '==', inviteCode),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error('Invalid or expired invitation code');
      }

      const inviteDoc = snapshot.docs[0];
      const invite = inviteDoc.data() as TeamInvitation;

      // Check expiration
      if ((invite.expiresAt as any).toDate() < new Date()) {
        await updateDoc(doc(db, 'team_invitations', inviteDoc.id), {
          status: 'expired'
        });
        throw new Error('Invitation code has expired');
      }

      const batch = writeBatch(db);

      // Update invitation status
      batch.update(doc(db, 'team_invitations', inviteDoc.id), {
        status: 'accepted',
        acceptedAt: Timestamp.now(),
        acceptedBy: userId
      });

      // Update team member with linkedUserId
      const memberQuery = query(
        collection(db, `users/${invite.companyId}/team_members`),
        where('email', '==', invite.email.toLowerCase())
      );
      const memberSnapshot = await getDocs(memberQuery);

      if (!memberSnapshot.empty) {
        const memberRef = memberSnapshot.docs[0].ref;
        batch.update(memberRef, {
          linkedUserId: userId,
          status: 'active',
          lastActive: Timestamp.now()
        });
      }

      await batch.commit();
      logger.info('Invitation accepted successfully');
    } catch (error) {
      logger.error('Failed to accept invitation', error as Error);
      throw error;
    }
  }

  /**
   * Revoke invitation
   */
  async revokeInvitation(invitationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'team_invitations', invitationId), {
        status: 'revoked',
        revokedAt: Timestamp.now()
      });
      logger.info('Invitation revoked', { invitationId });
    } catch (error) {
      logger.error('Failed to revoke invitation', error as Error);
      throw error;
    }
  }

  /**
   * Update team member role
   */
  async updateMemberRole(
    companyId: string,
    memberId: string,
    newRole: TeamRole
  ): Promise<void> {
    try {
      const memberRef = doc(db, `users/${companyId}/team_members`, memberId);
      const newPermissions = this.getPermissionsForRole(newRole);

      await updateDoc(memberRef, {
        role: newRole,
        permissions: newPermissions,
        updatedAt: Timestamp.now()
      });

      logger.info('Member role updated', { memberId, newRole });
    } catch (error) {
      logger.error('Failed to update member role', error as Error);
      throw error;
    }
  }

  /**
   * Update team member permissions (custom)
   */
  async updateMemberPermissions(
    companyId: string,
    memberId: string,
    permissions: Partial<TeamPermissions>
  ): Promise<void> {
    try {
      const memberRef = doc(db, `users/${companyId}/team_members`, memberId);
      const memberDoc = await getDoc(memberRef);

      if (!memberDoc.exists()) {
        throw new Error('Member not found');
      }

      const currentPermissions = memberDoc.data().permissions;
      const updatedPermissions = { ...currentPermissions, ...permissions };

      await updateDoc(memberRef, {
        permissions: updatedPermissions,
        updatedAt: Timestamp.now()
      });

      logger.info('Member permissions updated', { memberId });
    } catch (error) {
      logger.error('Failed to update member permissions', error as Error);
      throw error;
    }
  }

  /**
   * Remove team member
   */
  async removeMember(companyId: string, memberId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `users/${companyId}/team_members`, memberId));
      logger.info('Team member removed', { memberId });
    } catch (error) {
      logger.error('Failed to remove team member', error as Error);
      throw error;
    }
  }

  /**
   * Suspend team member (temporary disable)
   */
  async suspendMember(companyId: string, memberId: string): Promise<void> {
    try {
      await updateDoc(doc(db, `users/${companyId}/team_members`, memberId), {
        status: 'suspended',
        suspendedAt: Timestamp.now()
      });
      logger.info('Team member suspended', { memberId });
    } catch (error) {
      logger.error('Failed to suspend team member', error as Error);
      throw error;
    }
  }

  /**
   * Reactivate suspended member
   */
  async reactivateMember(companyId: string, memberId: string): Promise<void> {
    try {
      await updateDoc(doc(db, `users/${companyId}/team_members`, memberId), {
        status: 'active',
        reactivatedAt: Timestamp.now()
      });
      logger.info('Team member reactivated', { memberId });
    } catch (error) {
      logger.error('Failed to reactivate team member', error as Error);
      throw error;
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    companyId: string,
    userId: string,
    permission: keyof TeamPermissions
  ): Promise<boolean> {
    try {
      const q = query(
        collection(db, `users/${companyId}/team_members`),
        where('linkedUserId', '==', userId),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return false;

      const member = snapshot.docs[0].data() as TeamMember;
      return member.permissions[permission] === true;
    } catch (error) {
      logger.error('Failed to check permission', error as Error);
      return false;
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStats(companyId: string): Promise<{
    totalMembers: number;
    activeMembers: number;
    pendingInvites: number;
    adminCount: number;
    agentCount: number;
    viewerCount: number;
  }> {
    try {
      const members = await this.getTeamMembers(companyId);
      const invitations = await this.getPendingInvitations(companyId);

      return {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        pendingInvites: invitations.length,
        adminCount: members.filter(m => m.role === 'admin').length,
        agentCount: members.filter(m => m.role === 'agent').length,
        viewerCount: members.filter(m => m.role === 'viewer').length
      };
    } catch (error) {
      logger.error('Failed to get team stats', error as Error);
      return {
        totalMembers: 0,
        activeMembers: 0,
        pendingInvites: 0,
        adminCount: 0,
        agentCount: 0,
        viewerCount: 0
      };
    }
  }
}

export const teamManagementService = TeamManagementService.getInstance();
