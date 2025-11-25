# Firestore Security Rules for Profile Enhancements

## Collections to Add

### 1. successStories
```javascript
match /successStories/{storyId} {
  // Users can read public stories
  allow read: if resource.data.isPublic == true;
  
  // Users can read their own stories (public or private)
  allow read: if request.auth != null && 
                 resource.data.userId == request.auth.uid;
  
  // Users can create their own stories
  allow create: if request.auth != null && 
                   request.resource.data.userId == request.auth.uid;
  
  // Users can update their own stories
  allow update: if request.auth != null && 
                   resource.data.userId == request.auth.uid;
  
  // Users can delete their own stories
  allow delete: if request.auth != null && 
                   resource.data.userId == request.auth.uid;
}
```

### 2. trustConnections
```javascript
match /trustConnections/{connectionId} {
  // Users can read connections where they are involved
  allow read: if request.auth != null && 
                 (resource.data.fromUserId == request.auth.uid || 
                  resource.data.toUserId == request.auth.uid);
  
  // Users can create connections from themselves
  allow create: if request.auth != null && 
                   request.resource.data.fromUserId == request.auth.uid;
  
  // Users can update connections where they are the recipient
  allow update: if request.auth != null && 
                   resource.data.toUserId == request.auth.uid;
  
  // Users can delete their own outgoing connections
  allow delete: if request.auth != null && 
                   resource.data.fromUserId == request.auth.uid;
}
```

### 3. carStories
```javascript
match /carStories/{userId} {
  // Anyone can read car stories (public profile feature)
  allow read: if true;
  
  // Users can create/update their own car story
  allow write: if request.auth != null && 
                  request.resource.data.userId == request.auth.uid;
}
```

### 4. userPoints
```javascript
match /userPoints/{userId} {
  // Users can read their own points
  allow read: if request.auth != null && 
                 resource.data.userId == request.auth.uid;
  
  // Only server/admin can write (via Cloud Functions)
  allow write: if false; // Points should be updated via Cloud Functions only
}
```

## Complete Rules Section

Add these rules to your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ... existing rules ...
    
    // Profile Enhancements Collections
    match /successStories/{storyId} {
      allow read: if resource.data.isPublic == true || 
                     (request.auth != null && resource.data.userId == request.auth.uid);
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    match /trustConnections/{connectionId} {
      allow read: if request.auth != null && 
                     (resource.data.fromUserId == request.auth.uid || 
                      resource.data.toUserId == request.auth.uid);
      allow create: if request.auth != null && 
                       request.resource.data.fromUserId == request.auth.uid;
      allow update: if request.auth != null && 
                       resource.data.toUserId == request.auth.uid;
      allow delete: if request.auth != null && 
                       resource.data.fromUserId == request.auth.uid;
    }
    
    match /carStories/{userId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
    
    match /userPoints/{userId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow write: if false; // Managed by Cloud Functions
    }
    
    // ==================== PHASE 2 COLLECTIONS ====================
    
    // User Groups
    match /userGroups/{groupId} {
      // Anyone can read public groups
      allow read: if resource.data.isPublic == true;
      
      // Users can read groups they're members of
      allow read: if request.auth != null;
      
      // Only admins can create groups
      allow create: if isAdmin();
      
      // Only admins can update/delete groups
      allow update, delete: if isAdmin();
    }
    
    // Group Memberships
    match /groupMemberships/{membershipId} {
      // Users can read their own memberships
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Users can read memberships for groups they're in (for member list)
      allow read: if request.auth != null;
      
      // Users can join groups (create membership)
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      
      // Users can leave groups (delete their own membership)
      allow delete: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
      
      // Only group admins/moderators can update (for role changes)
      allow update: if isAdmin();
    }
    
    // Monthly Challenges
    match /monthlyChallenges/{challengeId} {
      // Anyone can read active challenges
      allow read: if resource.data.isActive == true;
      
      // Only admins can create/update challenges
      allow create, update, delete: if isAdmin();
    }
    
    // User Challenge Progress
    match /userChallengeProgress/{progressId} {
      // Users can read their own progress
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Users can create their own progress
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      
      // Users can update their own progress
      allow update: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
      
      // System can update progress (via Cloud Functions)
      allow update: if isAdmin();
    }
    
    // Transactions
    match /transactions/{transactionId} {
      // Users can read their own transactions
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Users can create transactions for their own sales
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      
      // Users can update their own transactions (e.g., status, notes)
      allow update: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
      
      // Users cannot delete transactions (for audit trail)
      allow delete: if false;
    }
    
    // Availability Calendars
    match /availabilityCalendars/{userId} {
      // Anyone can read availability (for scheduling)
      allow read: if true;
      
      // Users can create/update their own calendar
      allow write: if request.auth != null && 
                      request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Notes

1. **userPoints**: Should be managed via Cloud Functions to prevent manipulation
2. **successStories**: Public stories are readable by everyone, private only by owner
3. **trustConnections**: Both parties can read, but only recipient can update status
4. **carStories**: Public profile feature, readable by all

