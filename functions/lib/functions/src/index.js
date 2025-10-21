"use strict";
// functions/src/index.ts
// Firebase Cloud Functions - Social Features
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateContent = exports.onPostDelete = exports.onUserUpdate = exports.onPostCreate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// Fan-Out on Post Create (Hybrid model)
exports.onPostCreate = functions.firestore
    .document('posts/{postId}')
    .onCreate(async (snapshot, context) => {
    var _a, _b;
    const post = snapshot.data();
    const authorId = post.authorId;
    const postId = context.params.postId;
    try {
        const authorDoc = await admin.firestore()
            .doc(`users/${authorId}`).get();
        if (!authorDoc.exists)
            return null;
        const followerCount = ((_b = (_a = authorDoc.data()) === null || _a === void 0 ? void 0 : _a.stats) === null || _b === void 0 ? void 0 : _b.followers) || 0;
        if (followerCount < 1000) {
            const followersSnapshot = await admin.firestore()
                .collection(`users/${authorId}/followers`)
                .get();
            const batch = admin.firestore().batch();
            let count = 0;
            for (const followerDoc of followersSnapshot.docs) {
                const followerId = followerDoc.id;
                const feedRef = admin.firestore()
                    .doc(`users/${followerId}/feed/${postId}`);
                batch.set(feedRef, {
                    postRef: snapshot.ref,
                    authorInfo: post.authorInfo,
                    createdAt: post.createdAt,
                    type: post.type
                });
                count++;
                if (count % 500 === 0) {
                    await batch.commit();
                }
            }
            if (count % 500 !== 0) {
                await batch.commit();
            }
            console.log(`Fanned out post ${postId} to ${count} followers`);
        }
        return null;
    }
    catch (error) {
        console.error('Error in onPostCreate:', error);
        return null;
    }
});
// Sync user data on update
exports.onUserUpdate = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
    var _a, _b, _c, _d, _e;
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;
    const profileChanged = before.displayName !== after.displayName ||
        ((_a = before.profileImage) === null || _a === void 0 ? void 0 : _a.url) !== ((_b = after.profileImage) === null || _b === void 0 ? void 0 : _b.url) ||
        before.profileType !== after.profileType;
    if (!profileChanged)
        return null;
    try {
        const newAuthorInfo = {
            displayName: after.displayName,
            profileImage: (_c = after.profileImage) === null || _c === void 0 ? void 0 : _c.url,
            profileType: after.profileType || 'private',
            isVerified: ((_d = after.verification) === null || _d === void 0 ? void 0 : _d.emailVerified) || false,
            trustScore: ((_e = after.verification) === null || _e === void 0 ? void 0 : _e.trustScore) || 0
        };
        const postsSnapshot = await admin.firestore()
            .collection('posts')
            .where('authorId', '==', userId)
            .get();
        const batch = admin.firestore().batch();
        let count = 0;
        for (const postDoc of postsSnapshot.docs) {
            batch.update(postDoc.ref, {
                authorInfo: newAuthorInfo,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            count++;
            if (count % 500 === 0) {
                await batch.commit();
            }
        }
        if (count % 500 !== 0) {
            await batch.commit();
        }
        console.log(`Synced ${count} posts for user ${userId}`);
        return null;
    }
    catch (error) {
        console.error('Error in onUserUpdate:', error);
        return null;
    }
});
// Clean up on post delete
exports.onPostDelete = functions.firestore
    .document('posts/{postId}')
    .onDelete(async (snapshot, context) => {
    var _a, _b;
    const postId = context.params.postId;
    const post = snapshot.data();
    const authorId = post.authorId;
    try {
        const authorDoc = await admin.firestore()
            .doc(`users/${authorId}`).get();
        if (authorDoc.exists) {
            const followerCount = ((_b = (_a = authorDoc.data()) === null || _a === void 0 ? void 0 : _a.stats) === null || _b === void 0 ? void 0 : _b.followers) || 0;
            if (followerCount < 1000) {
                const followersSnapshot = await admin.firestore()
                    .collection(`users/${authorId}/followers`)
                    .get();
                const batch = admin.firestore().batch();
                let count = 0;
                for (const followerDoc of followersSnapshot.docs) {
                    const followerId = followerDoc.id;
                    const feedRef = admin.firestore()
                        .doc(`users/${followerId}/feed/${postId}`);
                    batch.delete(feedRef);
                    count++;
                    if (count % 500 === 0) {
                        await batch.commit();
                    }
                }
                if (count % 500 !== 0) {
                    await batch.commit();
                }
                console.log(`Cleaned up post ${postId} from ${count} feeds`);
            }
        }
        return null;
    }
    catch (error) {
        console.error('Error in onPostDelete:', error);
        return null;
    }
});
// Content moderation (placeholder for future AI integration)
exports.moderateContent = functions.firestore
    .document('posts/{postId}')
    .onCreate(async (snapshot, context) => {
    var _a;
    const post = snapshot.data();
    const text = ((_a = post.content) === null || _a === void 0 ? void 0 : _a.text) || '';
    const bannedWords = ['spam', 'scam', 'fake'];
    const containsBannedWord = bannedWords.some(word => text.toLowerCase().includes(word));
    if (containsBannedWord) {
        await snapshot.ref.update({
            status: 'flagged',
            moderationStatus: 'needs_review',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Post ${context.params.postId} flagged for review`);
    }
    return null;
});
// ==================== EXPORT NEW CLOUD FUNCTIONS ====================
// Stories Functions
__exportStar(require("./stories-functions"), exports);
// Messaging Functions
__exportStar(require("./messaging-functions"), exports);
//# sourceMappingURL=index.js.map