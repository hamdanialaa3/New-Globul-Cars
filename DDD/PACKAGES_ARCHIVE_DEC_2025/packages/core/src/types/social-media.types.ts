// Social Media Integration Types
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

export type SocialPlatform = 'facebook' | 'twitter' | 'tiktok' | 'linkedin' | 'youtube';

export interface SocialMediaAccount {
  platform: SocialPlatform;
  accountId: string;
  accountName: string;
  accountHandle: string;
  profileImage?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt: number;
  isActive: boolean;
  permissions: string[];
  connectedAt: number;
  lastUsed?: number;
}

export interface CrossPostOptions {
  platforms: SocialPlatform[];
  customMessage?: {
    [key in SocialPlatform]?: string;
  };
  scheduledTime?: number;
}

export interface SocialMediaState {
  accounts: SocialMediaAccount[];
  loading: boolean;
  error: string | null;
}

export interface PlatformConfig {
  name: string;
  displayName: {
    bg: string;
    en: string;
  };
  icon: string;
  color: string;
  authUrl: string;
  scopes: string[];
  enabled: boolean;
}

export const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  facebook: {
    name: 'facebook',
    displayName: { bg: 'Facebook', en: 'Facebook' },
    icon: 'facebook',
    color: '#1877F2',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['public_profile', 'pages_manage_posts', 'pages_read_engagement'],
    enabled: true
  },
  twitter: {
    name: 'twitter',
    displayName: { bg: 'Twitter/X', en: 'Twitter/X' },
    icon: 'twitter',
    color: '#000000',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scopes: ['tweet.read', 'tweet.write', 'users.read'],
    enabled: true
  },
  tiktok: {
    name: 'tiktok',
    displayName: { bg: 'TikTok', en: 'TikTok' },
    icon: 'tiktok',
    color: '#000000',
    authUrl: 'https://www.tiktok.com/auth/authorize',
    scopes: ['user.info.basic', 'video.upload', 'video.publish'],
    enabled: true
  },
  linkedin: {
    name: 'linkedin',
    displayName: { bg: 'LinkedIn', en: 'LinkedIn' },
    icon: 'linkedin',
    color: '#0A66C2',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes: ['w_member_social', 'r_liteprofile'],
    enabled: true
  },
  youtube: {
    name: 'youtube',
    displayName: { bg: 'YouTube', en: 'YouTube' },
    icon: 'youtube',
    color: '#FF0000',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/youtube.upload'],
    enabled: true
  }
};

