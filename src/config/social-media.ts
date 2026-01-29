/**
 * Official Social Media Links for Koli One
 * ==========================================
 * 
 * All official social media accounts for Koli One platform.
 * Update these links if any social media account changes.
 * 
 * @company Alaa Technologies
 * @project Koli One - Bulgarian Car Marketplace
 */

export const SOCIAL_MEDIA_LINKS = {
  facebook: 'https://www.facebook.com/koli.one/',
  instagram: 'https://www.instagram.com/kolione/',
  youtube: 'https://www.youtube.com/@Kolionebg',
  linkedin: 'https://www.linkedin.com/in/koli-one-a011993a9/',
  twitter: 'https://x.com/kolionebg',
  tiktok: 'https://www.tiktok.com/@mobilebg.eu',
  threads: 'https://www.threads.com/@kolione',
} as const;

export const SOCIAL_MEDIA_NAMES = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  twitter: 'X (Twitter)',
  tiktok: 'TikTok',
  threads: 'Threads',
} as const;

export const SOCIAL_MEDIA_COLORS = {
  facebook: '#1877f2',
  instagram: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
  youtube: '#ff0000',
  linkedin: '#0077b5',
  twitter: '#000000',
  tiktok: '#000000',
  threads: '#000000',
} as const;

export type SocialMediaPlatform = keyof typeof SOCIAL_MEDIA_LINKS;

/**
 * Get all social media links as an array
 */
export const getSocialMediaLinks = () => {
  return Object.entries(SOCIAL_MEDIA_LINKS).map(([platform, url]) => ({
    platform: platform as SocialMediaPlatform,
    name: SOCIAL_MEDIA_NAMES[platform as SocialMediaPlatform],
    url,
    color: SOCIAL_MEDIA_COLORS[platform as SocialMediaPlatform],
  }));
};
