// Social Media Service - OAuth & Cross-posting
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Inspired by: Buffer API, Hootsuite SDK

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { logger } from '../logger-service';
import { 
  SocialMediaAccount, 
  SocialPlatform, 
  CrossPostOptions,
  PLATFORM_CONFIGS 
} from '../../types/social-media.types';

class SocialMediaService {
  private collectionName = 'socialMediaAccounts';

  // Get all connected accounts for user
  async getConnectedAccounts(userId: string): Promise<SocialMediaAccount[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc: any) => doc.data() as SocialMediaAccount);
    } catch (error) {
      logger.error('Error getting connected accounts', error as Error, { userId });
      return [];
    }
  }

  // Initiate OAuth flow
  async initiateOAuth(platform: SocialPlatform, userId: string): Promise<void> {
    const config = PLATFORM_CONFIGS[platform];
    
    if (!config.enabled) {
      throw new Error(`${platform} is not enabled`);
    }

    // Store state for OAuth callback
    const state = this.generateState(userId, platform);
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_platform', platform);

    // Build OAuth URL based on platform
    const authUrl = this.buildOAuthUrl(platform, state);

    // Open OAuth popup
    const popup = window.open(
      authUrl,
      'oauth_popup',
      'width=600,height=700,scrollbars=yes'
    );

    // Listen for OAuth callback
    window.addEventListener('message', this.handleOAuthCallback.bind(this));
  }

  // Build OAuth URL for each platform
  private buildOAuthUrl(platform: SocialPlatform, state: string): string {
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const config = PLATFORM_CONFIGS[platform];

    switch (platform) {
      case 'facebook':
        return `${config.authUrl}?` +
          `client_id=${import.meta.env.VITE_FACEBOOK_APP_ID}&` +
          `redirect_uri=${redirectUri}&` +
          `scope=${config.scopes.join(',')}&` +
          `state=${state}`;

      case 'twitter':
        return `${config.authUrl}?` +
          `response_type=code&` +
          `client_id=${import.meta.env.VITE_TWITTER_CLIENT_ID}&` +
          `redirect_uri=${redirectUri}&` +
          `scope=${config.scopes.join(' ')}&` +
          `state=${state}`;

      case 'linkedin':
        return `${config.authUrl}?` +
          `response_type=code&` +
          `client_id=${import.meta.env.VITE_LINKEDIN_CLIENT_ID}&` +
          `redirect_uri=${redirectUri}&` +
          `scope=${config.scopes.join(' ')}&` +
          `state=${state}`;

      case 'youtube':
        return `${config.authUrl}?` +
          `response_type=code&` +
          `client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&` +
          `redirect_uri=${redirectUri}&` +
          `scope=${config.scopes.join(' ')}&` +
          `state=${state}`;

      case 'tiktok':
        return `${config.authUrl}?` +
          `client_key=${import.meta.env.VITE_TIKTOK_CLIENT_KEY}&` +
          `response_type=code&` +
          `redirect_uri=${redirectUri}&` +
          `scope=${config.scopes.join(',')}&` +
          `state=${state}`;

      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  // Generate secure state token
  private generateState(userId: string, platform: SocialPlatform): string {
    const random = Math.random().toString(36).substring(2);
    const timestamp = Date.now();
    return btoa(`${userId}:${platform}:${timestamp}:${random}`);
  }

  // Handle OAuth callback
  private async handleOAuthCallback(event: MessageEvent) {
    if (event.data.type !== 'oauth_success') return;

    const { code, state } = event.data;
    const storedState = sessionStorage.getItem('oauth_state');
    const platform = sessionStorage.getItem('oauth_platform') as SocialPlatform;

    if (state !== storedState) {
      logger.error('State mismatch - possible CSRF attack', new Error('OAuth state mismatch'), {
        receivedState: state,
        expectedState: storedState,
        platform
      });
      return;
    }

    // Exchange code for token (backend should handle this)
    // For now, mark as connected
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`OAuth success for ${platform}`, { code });
    }
    
    // Clean up
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_platform');
  }

  // Exchange OAuth code for access token (via Cloud Function)
  async exchangeCodeForToken(
    userId: string,
    platform: SocialPlatform,
    code: string,
    redirectUri: string
  ): Promise<void> {
    try {
      // Import Firebase Functions
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const exchangeToken = httpsCallable(functions, 'exchangeOAuthToken');

      const result = await exchangeToken({
        userId,
        platform,
        code,
        redirectUri
      });

      if (process.env.NODE_ENV === 'development') {
        logger.debug('Token exchange successful', { platform, data: result.data });
      }
    } catch (error: unknown) {
      logger.error('Token exchange failed', error as Error, { platform });
      const message = error instanceof Error ? error.message : 'Failed to exchange token';
      throw new Error(message);
    }
  }

  // Save connected account
  async saveAccount(userId: string, account: SocialMediaAccount): Promise<void> {
    try {
      const accountRef = doc(
        db,
        this.collectionName,
        `${userId}_${account.platform}`
      );

      await setDoc(accountRef, {
        ...account,
        userId,
        connectedAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      logger.error('Error saving account', error as Error, { userId, platform: account.platform });
      throw error;
    }
  }

  // Disconnect account
  async disconnectAccount(userId: string, platform: SocialPlatform): Promise<void> {
    try {
      const accountRef = doc(
        db,
        this.collectionName,
        `${userId}_${platform}`
      );

      await deleteDoc(accountRef);
    } catch (error) {
      logger.error('Error disconnecting account', error as Error, { userId, platform });
      throw error;
    }
  }

  // Cross-post to multiple platforms
  async crossPost(
    userId: string,
    content: string,
    mediaUrls: string[],
    options: CrossPostOptions
  ): Promise<Record<SocialPlatform, boolean>> {
    const results: Record<string, boolean> = {};

    const accounts = await this.getConnectedAccounts(userId);

    for (const platform of options.platforms) {
      const account = accounts.find(acc => acc.platform === platform);
      
      if (!account || !account.isActive) {
        results[platform] = false;
        continue;
      }

      try {
        const message = options.customMessage?.[platform] || content;
        await this.postToPlatform(platform, account, message, mediaUrls);
        results[platform] = true;

        // Update last used
        await this.updateLastUsed(userId, platform);
      } catch (error) {
        logger.error(`Error posting to ${platform}`, error as Error, { userId, platform });
        results[platform] = false;
      }
    }

    return results as Record<SocialPlatform, boolean>;
  }

  // Post to specific platform
  private async postToPlatform(
    platform: SocialPlatform,
    account: SocialMediaAccount,
    content: string,
    mediaUrls: string[]
  ): Promise<void> {
    // This should be handled by backend/Cloud Functions for security
    // Frontend just marks intention, backend does actual posting
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[Cross-post] ${platform}`, {
        content: content.substring(0, 50) + '...',
        mediaCount: mediaUrls.length
      });
    }

    // Backend endpoint would be:
    // POST /api/social/cross-post
    // Body: { platform, accountId, content, mediaUrls }
  }

  // Update last used timestamp
  private async updateLastUsed(userId: string, platform: SocialPlatform): Promise<void> {
    try {
      const accountRef = doc(
        db,
        this.collectionName,
        `${userId}_${platform}`
      );

      await setDoc(accountRef, {
        lastUsed: Date.now()
      }, { merge: true });
    } catch (error) {
      logger.error('Error updating last used', error as Error, { userId, platform });
    }
  }
}

export default new SocialMediaService();

