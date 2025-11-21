// src/services/messaging/cloud-messaging-service.ts
// Cloud Functions Integration for Advanced Messaging
// Integration with Backend P2.1 Features

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebase-config';
import { logger } from '../logger-service';

// ==================== TYPES ====================

export interface QuickReplyTemplate {
  id: string;
  userId: string;
  category: 'greeting' | 'pricing' | 'availability' | 'appointment' | 'closing' | 'custom';
  title: string;
  message: string;
  language: 'bg' | 'en';
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutoResponderSettings {
  enabled: boolean;
  message: string;
  workingHours: {
    [key: string]: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  holidays: {
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    message?: string;
  };
  instantReply: {
    enabled: boolean;
    delay: number;
  };
}

export interface Lead {
  id: string;
  conversationId: string;
  userId: string;
  score: number;
  priority: 'hot' | 'warm' | 'cold';
  status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'won' | 'lost';
  notes?: string;
  lastActivity: Date;
  scoreBreakdown: {
    engagement: number;
    responseTime: number;
    seriousness: number;
    budget: number;
  };
}

export interface MessageAssignment {
  conversationId: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: Date;
}

export interface InternalNote {
  id: string;
  conversationId: string;
  userId: string;
  note: string;
  createdAt: Date;
}

// ==================== QUICK REPLY FUNCTIONS ====================

export const createQuickReply = async (data: {
  category: string;
  title: string;
  message: string;
  language: 'bg' | 'en';
}): Promise<{ success: boolean; templateId?: string; error?: string }> => {
  try {
    const createQuickReplyFn = httpsCallable(functions, 'createQuickReply');
    const result = await createQuickReplyFn(data);
    return result.data as any;
  } catch (error: any) {
    logger.error('Error creating quick reply', error, { category: data.category, language: data.language });
    return { success: false, error: error.message };
  }
};

export const getQuickReplies = async (params?: {
  category?: string;
  language?: 'bg' | 'en';
}): Promise<{ success: boolean; templates?: QuickReplyTemplate[]; error?: string }> => {
  try {
    const getQuickRepliesFn = httpsCallable(functions, 'getQuickReplies');
    const result = await getQuickRepliesFn(params || {});
    return result.data as any;
  } catch (error: any) {
    logger.error('Error getting quick replies', error, params);
    return { success: false, error: error.message };
  }
};

export const updateQuickReply = async (
  templateId: string,
  data: {
    title?: string;
    message?: string;
    category?: string;
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateQuickReplyFn = httpsCallable(functions, 'updateQuickReply');
    const result = await updateQuickReplyFn({ templateId, ...data });
    return result.data as any;
  } catch (error: any) {
    logger.error('Error updating quick reply', error, { templateId });
    return { success: false, error: error.message };
  }
};

export const deleteQuickReply = async (templateId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const deleteQuickReplyFn = httpsCallable(functions, 'deleteQuickReply');
    const result = await deleteQuickReplyFn({ templateId });
    return result.data as any;
  } catch (error: any) {
    logger.error('Error deleting quick reply', error, { templateId });
    return { success: false, error: error.message };
  }
};

export const useQuickReply = async (
  templateId: string,
  conversationId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const useQuickReplyFn = httpsCallable(functions, 'useQuickReply');
    const result = await useQuickReplyFn({ templateId, conversationId });
    return result.data as any;
  } catch (error: any) {
    logger.error('Error using quick reply', error, { templateId, conversationId });
    return { success: false, error: error.message };
  }
};

// ==================== AUTO RESPONDER FUNCTIONS ====================

export const getAutoResponderSettings = async (): Promise<{
  success: boolean;
  settings?: AutoResponderSettings;
  error?: string;
}> => {
  try {
    const getAutoResponderSettingsFn = httpsCallable(functions, 'getAutoResponderSettings');
    const result = await getAutoResponderSettingsFn();
    return result.data as any;
  } catch (error: any) {
    logger.error('Error getting auto responder settings', error);
    return { success: false, error: error.message };
  }
};

export const updateAutoResponderSettings = async (
  settings: Partial<AutoResponderSettings>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateAutoResponderSettingsFn = httpsCallable(functions, 'updateAutoResponderSettings');
    const result = await updateAutoResponderSettingsFn(settings);
    return result.data as any;
  } catch (error: any) {
    logger.error('Error updating auto responder settings', error);
    return { success: false, error: error.message };
  }
};

// ==================== LEAD SCORING FUNCTIONS ====================

export const calculateLeadScore = async (
  conversationId: string
): Promise<{ success: boolean; lead?: Lead; error?: string }> => {
  try {
    const calculateLeadScoreFn = httpsCallable(functions, 'calculateLeadScore');
    const result = await calculateLeadScoreFn({ conversationId });
    return result.data as any;
  } catch (error: any) {
    logger.error('Error calculating lead score', error, { conversationId });
    return { success: false, error: error.message };
  }
};

export const getLeads = async (params?: {
  priority?: 'hot' | 'warm' | 'cold';
  status?: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'won' | 'lost';
  minScore?: number;
}): Promise<{ success: boolean; leads?: Lead[]; stats?: any; error?: string }> => {
  try {
    const getLeadsFn = httpsCallable(functions, 'getLeads');
    const result = await getLeadsFn(params || {});
    return result.data as any;
  } catch (error: any) {
    logger.error('Error getting leads', error, params);
    return { success: false, error: error.message };
  }
};

export const updateLeadStatus = async (
  leadId: string,
  status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'won' | 'lost',
  notes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateLeadStatusFn = httpsCallable(functions, 'updateLeadStatus');
    const result = await updateLeadStatusFn({ leadId, status, notes });
    return result.data as any;
  } catch (error: any) {
    logger.error('Error updating lead status', error, { leadId, status });
    return { success: false, error: error.message };
  }
};

// ==================== SHARED INBOX FUNCTIONS ====================

export const assignConversation = async (
  conversationId: string,
  assignToUserId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const assignConversationFn = httpsCallable(functions, 'assignConversation');
    const result = await assignConversationFn({ conversationId, assignToUserId });
    return result.data as any;
  } catch (error: any) {
    logger.error('Error assigning conversation', error, { conversationId, assignToUserId });
    return { success: false, error: error.message };
  }
};

export const getSharedInbox = async (params?: {
  filter?: 'unassigned' | 'assignedToMe' | 'assignedToOthers' | 'all';
}): Promise<{
  success: boolean;
  conversations?: any[];
  stats?: { unassigned: number; assignedToMe: number; total: number };
  error?: string;
}> => {
  try {
    const getSharedInboxFn = httpsCallable(functions, 'getSharedInbox');
    const result = await getSharedInboxFn(params || {});
    return result.data as any;
  } catch (error: any) {
    logger.error('Error getting shared inbox', error, params);
    return { success: false, error: error.message };
  }
};

export const addInternalNote = async (
  conversationId: string,
  note: string
): Promise<{ success: boolean; noteId?: string; error?: string }> => {
  try {
    const addInternalNoteFn = httpsCallable(functions, 'addInternalNote');
    const result = await addInternalNoteFn({ conversationId, note });
    return result.data as any;
  } catch (error: any) {
    logger.error('Error adding internal note', error, { conversationId });
    return { success: false, error: error.message };
  }
};

export const getInternalNotes = async (
  conversationId: string
): Promise<{ success: boolean; notes?: InternalNote[]; error?: string }> => {
  try {
    const getInternalNotesFn = httpsCallable(functions, 'getInternalNotes');
    const result = await getInternalNotesFn({ conversationId });
    return result.data as any;
  } catch (error: any) {
    logger.error('Error getting internal notes', error, { conversationId });
    return { success: false, error: error.message };
  }
};
