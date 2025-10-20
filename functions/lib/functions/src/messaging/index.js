"use strict";
// functions/src/messaging/index.ts
// Messaging System Module Exports
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInternalNotes = exports.addInternalNote = exports.getSharedInbox = exports.assignConversation = exports.onConversationUpdate = exports.updateLeadStatus = exports.getLeads = exports.calculateLeadScore = exports.onNewMessage = exports.updateAutoResponderSettings = exports.getAutoResponderSettings = exports.useQuickReply = exports.deleteQuickReply = exports.updateQuickReply = exports.getQuickReplies = exports.createQuickReply = void 0;
var quickReply_1 = require("./quickReply");
Object.defineProperty(exports, "createQuickReply", { enumerable: true, get: function () { return quickReply_1.createQuickReply; } });
Object.defineProperty(exports, "getQuickReplies", { enumerable: true, get: function () { return quickReply_1.getQuickReplies; } });
Object.defineProperty(exports, "updateQuickReply", { enumerable: true, get: function () { return quickReply_1.updateQuickReply; } });
Object.defineProperty(exports, "deleteQuickReply", { enumerable: true, get: function () { return quickReply_1.deleteQuickReply; } });
Object.defineProperty(exports, "useQuickReply", { enumerable: true, get: function () { return quickReply_1.useQuickReply; } });
var autoResponder_1 = require("./autoResponder");
Object.defineProperty(exports, "getAutoResponderSettings", { enumerable: true, get: function () { return autoResponder_1.getAutoResponderSettings; } });
Object.defineProperty(exports, "updateAutoResponderSettings", { enumerable: true, get: function () { return autoResponder_1.updateAutoResponderSettings; } });
Object.defineProperty(exports, "onNewMessage", { enumerable: true, get: function () { return autoResponder_1.onNewMessage; } });
var leadScoring_1 = require("./leadScoring");
Object.defineProperty(exports, "calculateLeadScore", { enumerable: true, get: function () { return leadScoring_1.calculateLeadScore; } });
Object.defineProperty(exports, "getLeads", { enumerable: true, get: function () { return leadScoring_1.getLeads; } });
Object.defineProperty(exports, "updateLeadStatus", { enumerable: true, get: function () { return leadScoring_1.updateLeadStatus; } });
Object.defineProperty(exports, "onConversationUpdate", { enumerable: true, get: function () { return leadScoring_1.onConversationUpdate; } });
var sharedInbox_1 = require("./sharedInbox");
Object.defineProperty(exports, "assignConversation", { enumerable: true, get: function () { return sharedInbox_1.assignConversation; } });
Object.defineProperty(exports, "getSharedInbox", { enumerable: true, get: function () { return sharedInbox_1.getSharedInbox; } });
Object.defineProperty(exports, "addInternalNote", { enumerable: true, get: function () { return sharedInbox_1.addInternalNote; } });
Object.defineProperty(exports, "getInternalNotes", { enumerable: true, get: function () { return sharedInbox_1.getInternalNotes; } });
//# sourceMappingURL=index.js.map