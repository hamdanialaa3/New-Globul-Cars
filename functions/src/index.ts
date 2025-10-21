// functions/src/index.ts
// Firebase Cloud Functions - Social Features
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Fan-Out on Post Create (Hybrid model)
export const onPostCreate = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snapshot, context) => {
    const post = snapshot.data();
    const authorId = post.authorId;
    const postId = context.params.postId;
    
    try {
      const authorDoc = await admin.firestore()
        .doc(`users/${authorId}`).get();
      
      if (!authorDoc.exists) return null;
      
      const followerCount = authorDoc.data()?.stats?.followers || 0;
      
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
    } catch (error) {
      console.error('Error in onPostCreate:', error);
      return null;
    }
  });

// Sync user data on update
export const onUserUpdate = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;
    
    const profileChanged = 
      before.displayName !== after.displayName ||
      before.profileImage?.url !== after.profileImage?.url ||
      before.profileType !== after.profileType;
    
    if (!profileChanged) return null;
    
    try {
      const newAuthorInfo = {
        displayName: after.displayName,
        profileImage: after.profileImage?.url,
        profileType: after.profileType || 'private',
        isVerified: after.verification?.emailVerified || false,
        trustScore: after.verification?.trustScore || 0
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
    } catch (error) {
      console.error('Error in onUserUpdate:', error);
      return null;
    }
  });

// Clean up on post delete
export const onPostDelete = functions.firestore
  .document('posts/{postId}')
  .onDelete(async (snapshot, context) => {
    const postId = context.params.postId;
    const post = snapshot.data();
    const authorId = post.authorId;
    
    try {
      const authorDoc = await admin.firestore()
        .doc(`users/${authorId}`).get();
      
      if (authorDoc.exists) {
        const followerCount = authorDoc.data()?.stats?.followers || 0;
        
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
    } catch (error) {
      console.error('Error in onPostDelete:', error);
      return null;
    }
  });

// Content moderation (placeholder for future AI integration)
export const moderateContent = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snapshot, context) => {
    const post = snapshot.data();
    const text = post.content?.text || '';
    
    const bannedWords = ['spam', 'scam', 'fake'];
    const containsBannedWord = bannedWords.some(word => 
      text.toLowerCase().includes(word)
    );
    
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
export * from './stories-functions';

// Messaging Functions
export * from './messaging-functions';
