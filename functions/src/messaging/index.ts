// functions/src/messaging/index.ts
// Messaging System Module Exports

export {
  createQuickReply,
  getQuickReplies,
  updateQuickReply,
  deleteQuickReply,
  useQuickReply,
} from './quickReply';

export {
  getAutoResponderSettings,
  updateAutoResponderSettings,
  onNewMessage,
} from './autoResponder';

export {
  calculateLeadScore,
  getLeads,
  updateLeadStatus,
  onConversationUpdate,
} from './leadScoring';

export {
  assignConversation,
  getSharedInbox,
  addInternalNote,
  getInternalNotes,
} from './sharedInbox';
