import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
import { serviceLogger } from './logger-service';

// Permission Management Interfaces
export interface PermissionCategory {
  id: string;
  name: string;
  nameBg: string;
  nameEn: string;
  description: string;
  descriptionBg: string;
  descriptionEn: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export interface PermissionTemplate {
  id: string;
  categoryId: string;
  name: string;
  nameBg: string;
  nameEn: string;
  description: string;
  descriptionBg: string;
  descriptionEn: string;
  resource: string;
  action: string;
  level: 'read' | 'write' | 'delete' | 'admin';
  isSystemPermission: boolean;
  isActive: boolean;
  order: number;
}

export interface RoleTemplate {
  id: string;
  name: string;
  nameBg: string;
  nameEn: string;
  description: string;
  descriptionBg: string;
  descriptionEn: string;
  permissions: string[];
  isSystemRole: boolean;
  isActive: boolean;
  level: 'basic' | 'advanced' | 'admin' | 'super_admin';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermission {
  userId: string;
  permissions: string[];
  customPermissions: string[];
  inheritedFromRoles: string[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}
