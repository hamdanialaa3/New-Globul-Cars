// OAuth Token Exchange Handler - Firebase Cloud Function
// Location: Bulgaria | Languages: BG/EN | Currency: EUR
// Security: Handles sensitive OAuth token exchanges

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

interface TokenExchangeRequest {
  userId: string;
  platform: 'facebook' | 'twitter' | 'tiktok' | 'linkedin' | 'youtube';
  code: string;
  redirectUri: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  accountId: string;
  accountName: string;
  accountHandle: string;
  profileImage?: string;
}

/**
 * Exchange OAuth authorization code for access token
 * Called from frontend after OAuth redirect
 */
export const exchangeOAuthToken = functions.https.onCall(
  async (data: TokenExchangeRequest, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    // Verify user matches
    if (context.auth.uid !== data.userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User ID mismatch'
      );
    }

    const { platform, code, redirectUri } = data;

    try {
      let tokenResponse: TokenResponse;

      switch (platform) {
        case 'facebook':
          tokenResponse = await exchangeFacebookToken(code, redirectUri);
          break;
        case 'twitter':
          tokenResponse = await exchangeTwitterToken(code, redirectUri);
          break;
        case 'tiktok':
          tokenResponse = await exchangeTikTokToken(code, redirectUri);
          break;
        case 'linkedin':
          tokenResponse = await exchangeLinkedInToken(code, redirectUri);
          break;
        case 'youtube':
          tokenResponse = await exchangeYouTubeToken(code, redirectUri);
          break;
        default:
          throw new Error(`Unknown platform: ${platform}`);
      }

      // Save to Firestore
      const db = admin.firestore();
      const accountRef = db.collection('socialMediaAccounts').doc(`${data.userId}_${platform}`);

      await accountRef.set({
        userId: data.userId,
        platform,
        accountId: tokenResponse.accountId,
        accountName: tokenResponse.accountName,
        accountHandle: tokenResponse.accountHandle,
        profileImage: tokenResponse.profileImage || '',
        accessToken: tokenResponse.accessToken, // Should be encrypted!
        refreshToken: tokenResponse.refreshToken || '',
        tokenExpiresAt: Date.now() + (tokenResponse.expiresIn * 1000),
        isActive: true,
        permissions: [],
        connectedAt: Date.now(),
        lastUsed: Date.now()
      });

      return {
        success: true,
        platform,
        accountHandle: tokenResponse.accountHandle
      };

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error exchanging token', { platform, message: err.message });
      throw new functions.https.HttpsError(
        'internal',
        `Failed to connect ${platform}: ${err.message}`
      );
    }
  }
);

// ==================== PLATFORM-SPECIFIC EXCHANGES ====================

async function exchangeFacebookToken(code: string, redirectUri: string): Promise<TokenResponse> {
  const appId = functions.config().facebook.app_id;
  const appSecret = functions.config().facebook.app_secret;

  // Exchange code for token
  const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${appId}&` +
    `client_secret=${appSecret}&` +
    `redirect_uri=${redirectUri}&` +
    `code=${code}`;

  const tokenRes = await axios.get(tokenUrl);
  const { access_token, expires_in } = tokenRes.data as any;

  // Get user info
  const userRes = await axios.get(
    `https://graph.facebook.com/me?fields=id,name,picture&access_token=${access_token}`
  );

  return {
    accessToken: access_token,
    expiresIn: expires_in,
    accountId: (userRes.data as any).id,
    accountName: (userRes.data as any).name,
    accountHandle: (userRes.data as any).name.toLowerCase().replace(/\s+/g, ''),
    profileImage: (userRes.data as any).picture?.data?.url
  };
}

async function exchangeTwitterToken(code: string, redirectUri: string): Promise<TokenResponse> {
  const clientId = functions.config().twitter.client_id;
  const clientSecret = functions.config().twitter.client_secret;

  // Exchange code for token
  const tokenRes = await axios.post(
    'https://api.twitter.com/2/oauth2/token',
    new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: 'challenge' // Should match PKCE challenge
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      }
    }
  );

  const { access_token, refresh_token, expires_in } = tokenRes.data as any;

  // Get user info
  const userRes = await axios.get('https://api.twitter.com/2/users/me', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresIn: expires_in,
    accountId: (userRes.data as any).data.id,
    accountName: (userRes.data as any).data.name,
    accountHandle: (userRes.data as any).data.username
  };
}

async function exchangeTikTokToken(code: string, redirectUri: string): Promise<TokenResponse> {
  const clientKey = functions.config().tiktok.client_key;
  const clientSecret = functions.config().tiktok.client_secret;

  const tokenRes = await axios.post(
    'https://open-api.tiktok.com/oauth/access_token/',
    {
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code'
    }
  );

  const { access_token, expires_in, open_id } = (tokenRes.data as any).data;

  // Get user info
  const userRes = await axios.get(
    `https://open-api.tiktok.com/user/info/?access_token=${access_token}&open_id=${open_id}`
  );

  return {
    accessToken: access_token,
    expiresIn: expires_in,
    accountId: open_id,
    accountName: (userRes.data as any).data.display_name,
    accountHandle: (userRes.data as any).data.unique_id,
    profileImage: (userRes.data as any).data.avatar_url
  };
}

async function exchangeLinkedInToken(code: string, redirectUri: string): Promise<TokenResponse> {
  const clientId = functions.config().linkedin.client_id;
  const clientSecret = functions.config().linkedin.client_secret;

  const tokenRes = await axios.post(
    'https://www.linkedin.com/oauth/v2/accessToken',
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );

  const { access_token, expires_in } = tokenRes.data as any;

  // Get user info
  const userRes = await axios.get('https://api.linkedin.com/v2/me', {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });

  return {
    accessToken: access_token,
    expiresIn: expires_in,
    accountId: (userRes.data as any).id,
    accountName: `${(userRes.data as any).localizedFirstName} ${(userRes.data as any).localizedLastName}`,
    accountHandle: (userRes.data as any).id
  };
}

async function exchangeYouTubeToken(code: string, redirectUri: string): Promise<TokenResponse> {
  const clientId = functions.config().google.client_id;
  const clientSecret = functions.config().google.client_secret;

  const tokenRes = await axios.post(
    'https://oauth2.googleapis.com/token',
    {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }
  );

  const { access_token, refresh_token, expires_in } = tokenRes.data as any;

  // Get channel info
  const channelRes = await axios.get(
    'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
    {
      headers: { 'Authorization': `Bearer ${access_token}` }
    }
  );

  const channel = (channelRes.data as any).items[0];

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresIn: expires_in,
    accountId: channel.id,
    accountName: channel.snippet.title,
    accountHandle: channel.snippet.customUrl || channel.id,
    profileImage: channel.snippet.thumbnails.default.url
  };
}

