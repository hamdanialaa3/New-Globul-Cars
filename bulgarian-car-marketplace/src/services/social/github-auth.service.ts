// src/services/social/github-auth.service.ts
// GitHub OAuth Integration Service
// الموقع: بلغاريا | اللغات: BG/EN | العملة: EUR

import { 
  GithubAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase-config';

interface GitHubUserData {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

interface APIKey {
  key: string;
  userId: string;
  createdAt: Date;
  active: boolean;
  rateLimit: number;
  permissions: string[];
}

class GitHubAuthService {
  private static instance: GitHubAuthService;
  
  private constructor() {}
  
  static getInstance(): GitHubAuthService {
    if (!this.instance) {
      this.instance = new GitHubAuthService();
    }
    return this.instance;
  }

  /**
   * Sign in with GitHub
   */
  async signInWithGitHub(): Promise<UserCredential> {
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');
      provider.addScope('read:user');

      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Starting GitHub sign-in...');
      }

      // Try popup first
      try {
        const result = await signInWithPopup(auth, provider);
        await this.syncGitHubProfile(result);
        return result;
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-blocked') {
          // Fallback to redirect
          await signInWithRedirect(auth, provider);
          throw new Error('REDIRECT_INITIATED');
        }
        throw popupError;
      }
    } catch (error) {
      console.error('❌ GitHub sign-in error:', error);
      throw error;
    }
  }

  /**
   * Handle redirect result
   */
  async handleRedirectResult(): Promise<UserCredential | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        await this.syncGitHubProfile(result);
      }
      return result;
    } catch (error) {
      console.error('❌ Redirect result error:', error);
      return null;
    }
  }

  /**
   * Sync GitHub profile data
   */
  private async syncGitHubProfile(result: UserCredential): Promise<void> {
    try {
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      if (!token) {
        console.warn('⚠️ No GitHub access token');
        return;
      }

      // Get GitHub profile data
      const githubData = await this.getGitHubProfileData(token);

      if (!githubData) {
        console.warn('⚠️ No GitHub profile data');
        return;
      }

      // Update Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        github: {
          username: githubData.login,
          githubId: githubData.id,
          avatar: githubData.avatar_url,
          name: githubData.name,
          bio: githubData.bio,
          company: githubData.company,
          location: githubData.location,
          blog: githubData.blog,
          publicRepos: githubData.public_repos,
          followers: githubData.followers,
          following: githubData.following,
          linkedAt: serverTimestamp(),
          accessToken: token // Encrypted in production
        },
        accountType: 'developer', // Special account type
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ GitHub profile synced:', githubData.login);
      }
    } catch (error) {
      console.error('❌ GitHub sync error:', error);
    }
  }

  /**
   * Get GitHub profile data
   */
  private async getGitHubProfileData(token: string): Promise<GitHubUserData | null> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      return null;
    }
  }

  /**
   * Generate API key for developer
   */
  async generateAPIKey(userId: string, permissions: string[] = []): Promise<string> {
    try {
      // Generate random API key
      const apiKey = `gck_${this.generateRandomString(32)}`;

      // Save to Firestore
      await setDoc(doc(db, 'api_keys', apiKey), {
        userId,
        createdAt: serverTimestamp(),
        active: true,
        rateLimit: 1000, // requests per day
        permissions: permissions.length > 0 ? permissions : ['read:cars', 'read:profile'],
        lastUsedAt: null,
        totalRequests: 0
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ API key generated for user:', userId);
      }

      return apiKey;
    } catch (error) {
      console.error('❌ Generate API key error:', error);
      throw error;
    }
  }

  /**
   * Validate API key
   */
  async validateAPIKey(apiKey: string): Promise<boolean> {
    try {
      const keyDoc = await getDoc(doc(db, 'api_keys', apiKey));
      
      if (!keyDoc.exists()) return false;
      
      const keyData = keyDoc.data();
      
      // Check if active
      if (!keyData.active) return false;
      
      // Check rate limit (simplified)
      const today = new Date().toISOString().split('T')[0];
      const requestsToday = keyData[`requests_${today}`] || 0;
      
      if (requestsToday >= keyData.rateLimit) {
        return false; // Rate limit exceeded
      }

      // Update usage
      await updateDoc(doc(db, 'api_keys', apiKey), {
        lastUsedAt: serverTimestamp(),
        totalRequests: (keyData.totalRequests || 0) + 1,
        [`requests_${today}`]: requestsToday + 1
      });

      return true;
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(apiKey: string, userId: string): Promise<boolean> {
    try {
      const keyDoc = await getDoc(doc(db, 'api_keys', apiKey));
      
      if (!keyDoc.exists() || keyDoc.data().userId !== userId) {
        return false;
      }

      await updateDoc(doc(db, 'api_keys', apiKey), {
        active: false,
        revokedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error revoking API key:', error);
      return false;
    }
  }

  /**
   * List user's API keys
   */
  async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    try {
      const keysQuery = query(
        collection(db, 'api_keys'),
        where('userId', '==', userId),
        where('active', '==', true)
      );

      const snapshot = await getDocs(keysQuery);
      
      return snapshot.docs.map(doc => ({
        key: doc.id,
        userId: doc.data().userId,
        createdAt: doc.data().createdAt?.toDate(),
        active: doc.data().active,
        rateLimit: doc.data().rateLimit,
        permissions: doc.data().permissions
      }));
    } catch (error) {
      console.error('Error getting API keys:', error);
      return [];
    }
  }

  /**
   * Generate random string
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const githubAuthService = GitHubAuthService.getInstance();

