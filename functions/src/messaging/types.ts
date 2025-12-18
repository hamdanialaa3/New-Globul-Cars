// functions/src/messaging/types.ts
// Types for Advanced Messaging System

export interface QuickReplyTemplate {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: 'greeting' | 'pricing' | 'availability' | 'appointment' | 'closing' | 'custom';
  language: 'bg' | 'en';
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutoResponderSettings {
  userId: string;
  enabled: boolean;
  workingHours: {
    monday: { start: string; end: string; enabled: boolean };
    tuesday: { start: string; end: string; enabled: boolean };
    wednesday: { start: string; end: string; enabled: boolean };
    thursday: { start: string; end: string; enabled: boolean };
    friday: { start: string; end: string; enabled: boolean };
    saturday: { start: string; end: string; enabled: boolean };
    sunday: { start: string; end: string; enabled: boolean };
  };
  awayMessage: string;
  holidayMode: {
    enabled: boolean;
    startDate: Date;
    endDate: Date;
    message: string;
  };
  instantReply: {
    enabled: boolean;
    message: string;
    delaySeconds: number;
  };
}

export interface Lead {
  id: string;
  conversationId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  listingId?: string;
  listingTitle?: string;
  score: number;
  scoreBreakdown: {
    engagement: number; // 30 points
    responseTime: number; // 20 points
    seriousness: number; // 25 points
    budget: number; // 25 points
  };
  status: 'new' | 'contacted' | 'qualified' | 'negotiating' | 'won' | 'lost';
  priority: 'hot' | 'warm' | 'cold';
  assignedTo?: string;
  notes: string[];
  lastContactAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAssignment {
  conversationId: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: Date;
  notes?: string;
}

export interface InternalNote {
  id: string;
  conversationId: string;
  authorId: string;
  authorName: string;
  content: string;
  isPrivate: boolean;
  createdAt: Date;
}

export interface CreateQuickReplyRequest {
  title: string;
  content: string;
  category: string;
  language?: string;
}

export interface UpdateQuickReplyRequest {
  templateId: string;
  title?: string;
  content?: string;
  category?: string;
  isActive?: boolean;
}

export interface UpdateAutoResponderRequest {
  enabled?: boolean;
  workingHours?: Record<string, unknown>;
  awayMessage?: string;
  holidayMode?: Record<string, unknown>;
  instantReply?: Record<string, unknown>;
}

export interface CalculateLeadScoreRequest {
  conversationId: string;
}

export interface UpdateLeadStatusRequest {
  leadId: string;
  status: string;
  notes?: string;
}

export interface AssignConversationRequest {
  conversationId: string;
  assignedTo: string;
  notes?: string;
}

export interface AddInternalNoteRequest {
  conversationId: string;
  content: string;
  isPrivate?: boolean;
}
