/**
 * Data Migration Script: Firestore → Realtime Database
 * ================================
 * One-time migration to preserve all historical conversations
 * 
 * @critical This script is CRITICAL - it prevents data loss
 * @author Gemini Suggestion + Implementation
 * @date January 14, 2026
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://new-globul-cars-default-rtdb.europe-west1.firebasedatabase.app'
});

const firestoreDb = getFirestore(app);
const realtimeDb = getDatabase(app);

interface LegacyConversation {
  id: string;
  participants: string[]; // Firebase UIDs
  carId?: string;
  messages: any[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}

interface UserProfile {
  uid: string;
  numericId?: number;
  displayName?: string;
  email?: string;
}

interface CarData {
  id: string;
  carNumericId?: number;
  sellerNumericId?: number;
  title?: string;
}

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  startTime: number;
  endTime?: number;
}

class FirestoreToRTDBMigration {
  private stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    startTime: Date.now()
  };
  
  private dryRun: boolean = false;
  private logFile: string;
  
  constructor(dryRun: boolean = false) {
    this.dryRun = dryRun;
    this.logFile = path.join(__dirname, `migration-log-${Date.now()}.txt`);
    this.log(`\n${'='.repeat(80)}`);
    this.log(`DATA MIGRATION: Firestore → Realtime Database`);
    this.log(`Mode: ${dryRun ? 'DRY RUN (no actual changes)' : 'LIVE MIGRATION'}`);
    this.log(`Started: ${new Date().toISOString()}`);
    this.log(`${'='.repeat(80)}\n`);
  }
  
  /**
   * Main migration entry point
   */
  async migrateAllConversations(): Promise<MigrationStats> {
    try {
      this.log('[STEP 1] Fetching all conversations from Firestore...');
      
      const conversationsRef = firestoreDb.collection('conversations');
      const snapshot = await conversationsRef.get();
      
      this.stats.total = snapshot.size;
      this.log(`Found ${this.stats.total} conversations to migrate\n`);
      
      // Process each conversation
      let index = 0;
      for (const doc of snapshot.docs) {
        index++;
        this.log(`\n[${index}/${this.stats.total}] Processing conversation: ${doc.id}`);
        
        try {
          const conversation = doc.data() as LegacyConversation;
          conversation.id = doc.id;
          
          const result = await this.migrateConversation(conversation);
          
          if (result.success) {
            this.stats.migrated++;
            this.log(`  ✅ SUCCESS - Migrated ${result.messageCount} messages`);
          } else {
            this.stats.skipped++;
            this.log(`  ⚠️  SKIPPED - ${result.reason}`);
          }
          
        } catch (error) {
          this.stats.failed++;
          this.log(`  ❌ FAILED - ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Progress indicator every 10 conversations
        if (index % 10 === 0) {
          this.logProgress();
        }
      }
      
      this.stats.endTime = Date.now();
      this.logFinalReport();
      
      return this.stats;
      
    } catch (error) {
      this.log(`\n❌ FATAL ERROR: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Migrate single conversation
   */
  private async migrateConversation(conversation: LegacyConversation): Promise<{
    success: boolean;
    reason?: string;
    messageCount?: number;
  }> {
    try {
      // Validate participants
      if (!conversation.participants || conversation.participants.length !== 2) {
        return { success: false, reason: 'Invalid participants array' };
      }
      
      const [uid1, uid2] = conversation.participants;
      
      // Resolve numeric IDs
      const user1 = await this.getUserProfile(uid1);
      const user2 = await this.getUserProfile(uid2);
      
      if (!user1) {
        return { success: false, reason: `User not found: ${uid1}` };
      }
      
      if (!user2) {
        return { success: false, reason: `User not found: ${uid2}` };
      }
      
      if (!user1.numericId) {
        return { success: false, reason: `Missing numericId for user: ${uid1}` };
      }
      
      if (!user2.numericId) {
        return { success: false, reason: `Missing numericId for user: ${uid2}` };
      }
      
      // Get car numeric ID if exists
      let carNumericId = 0;
      if (conversation.carId) {
        const car = await this.getCarData(conversation.carId);
        if (car?.carNumericId) {
          carNumericId = car.carNumericId;
        }
      }
      
      // Generate RTDB channel ID
      const channelId = this.generateChannelId(
        user1.numericId,
        user2.numericId,
        carNumericId
      );
      
      // Check if already migrated
      const existingChannel = await realtimeDb.ref(`channels/${channelId}`).once('value');
      if (existingChannel.exists()) {
        return { success: false, reason: 'Already migrated' };
      }
      
      if (!this.dryRun) {
        // Create channel in RTDB
        await realtimeDb.ref(`channels/${channelId}`).set({
          buyerNumericId: user1.numericId,
          sellerNumericId: user2.numericId,
          carNumericId: carNumericId || null,
          createdAt: conversation.createdAt?.toMillis() || Date.now(),
          updatedAt: conversation.updatedAt?.toMillis() || Date.now(),
          migratedFrom: 'firestore',
          migratedAt: Date.now(),
          originalConversationId: conversation.id
        });
        
        // Migrate messages
        const messages = conversation.messages || [];
        for (const msg of messages) {
          const messageId = msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Determine sender numeric ID
          const senderNumericId = msg.senderId === uid1 
            ? user1.numericId 
            : user2.numericId;
          
          await realtimeDb.ref(`messages/${channelId}/${messageId}`).set({
            senderNumericId,
            content: msg.content || '',
            timestamp: msg.timestamp?.toMillis() || msg.createdAt?.toMillis() || Date.now(),
            type: msg.type || 'text',
            imageUrl: msg.imageUrl || null,
            read: msg.read || false,
            migratedFrom: 'firestore'
          });
        }
        
        this.log(`    📝 Created channel: ${channelId}`);
        this.log(`    💬 Migrated ${messages.length} messages`);
      } else {
        this.log(`    [DRY RUN] Would create channel: ${channelId}`);
        this.log(`    [DRY RUN] Would migrate ${conversation.messages?.length || 0} messages`);
      }
      
      return {
        success: true,
        messageCount: conversation.messages?.length || 0
      };
      
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Generate deterministic channel ID
   */
  private generateChannelId(id1: number, id2: number, carId: number): string {
    const [min, max] = id1 < id2 ? [id1, id2] : [id2, id1];
    return carId > 0 
      ? `msg_${min}_${max}_car_${carId}` 
      : `msg_${min}_${max}`;
  }
  
  /**
   * Get user profile from Firestore
   */
  private async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const doc = await firestoreDb.collection('users').doc(uid).get();
      if (!doc.exists) {
        return null;
      }
      return { uid, ...doc.data() } as UserProfile;
    } catch (error) {
      this.log(`    ⚠️  Error fetching user ${uid}: ${error}`);
      return null;
    }
  }
  
  /**
   * Get car data from Firestore
   */
  private async getCarData(carId: string): Promise<CarData | null> {
    try {
      // Try all car collections
      const collections = ['passenger_cars', 'suvs', 'vans', 'motorcycles', 'trucks', 'buses'];
      
      for (const collectionName of collections) {
        const doc = await firestoreDb.collection(collectionName).doc(carId).get();
        if (doc.exists) {
          return { id: carId, ...doc.data() } as CarData;
        }
      }
      
      return null;
    } catch (error) {
      this.log(`    ⚠️  Error fetching car ${carId}: ${error}`);
      return null;
    }
  }
  
  /**
   * Log to console and file
   */
  private log(message: string): void {
    console.log(message);
    fs.appendFileSync(this.logFile, message + '\n');
  }
  
  /**
   * Log progress
   */
  private logProgress(): void {
    const elapsed = ((Date.now() - this.stats.startTime) / 1000 / 60).toFixed(1);
    this.log(`\n📊 Progress: ${this.stats.migrated + this.stats.skipped + this.stats.failed}/${this.stats.total} (${elapsed} min)`);
    this.log(`  ✅ Migrated: ${this.stats.migrated}`);
    this.log(`  ⚠️  Skipped: ${this.stats.skipped}`);
    this.log(`  ❌ Failed: ${this.stats.failed}\n`);
  }
  
  /**
   * Log final report
   */
  private logFinalReport(): void {
    const duration = ((this.stats.endTime! - this.stats.startTime) / 1000 / 60).toFixed(1);
    
    this.log(`\n\n${'='.repeat(80)}`);
    this.log(`MIGRATION COMPLETED`);
    this.log(`${'='.repeat(80)}`);
    this.log(`Duration: ${duration} minutes`);
    this.log(`Total conversations: ${this.stats.total}`);
    this.log(`✅ Successfully migrated: ${this.stats.migrated}`);
    this.log(`⚠️  Skipped: ${this.stats.skipped}`);
    this.log(`❌ Failed: ${this.stats.failed}`);
    this.log(`Success rate: ${((this.stats.migrated / this.stats.total) * 100).toFixed(1)}%`);
    this.log(`Log file: ${this.logFile}`);
    this.log(`${'='.repeat(80)}\n`);
  }
}

/**
 * CLI Entry Point
 */
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isVerify = args.includes('--verify');
  
  if (isVerify) {
    console.log('Verification mode not yet implemented');
    process.exit(1);
  }
  
  console.log('\n⚠️  WARNING: This script will modify your Realtime Database!');
  console.log(`Mode: ${isDryRun ? 'DRY RUN (safe)' : 'LIVE MIGRATION'}\n`);
  
  if (!isDryRun) {
    console.log('❗ LIVE MODE - Data will be written to RTDB');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  const migration = new FirestoreToRTDBMigration(isDryRun);
  
  try {
    const stats = await migration.migrateAllConversations();
    
    if (stats.failed > 0) {
      console.log('\n⚠️  Some conversations failed to migrate. Check the log file.');
      process.exit(1);
    } else {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { FirestoreToRTDBMigration };
