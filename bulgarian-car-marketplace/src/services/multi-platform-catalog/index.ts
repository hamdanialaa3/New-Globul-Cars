// Multi-Platform Catalog Service
// Automatic product feed generation for all platforms
// Location: Bulgaria | Languages: BG/EN | Currency: EUR

import GoogleMerchantFeedService from './google-merchant-feed';
import InstagramFeedService from './instagram-feed';
import TikTokFeedService from './tiktok-feed';

export interface PlatformFeedConfig {
  platform: 'google' | 'instagram' | 'tiktok' | 'facebook';
  format: 'xml' | 'csv' | 'json';
  enabled: boolean;
  updateFrequency: 'hourly' | 'daily' | 'weekly';
}

class MultiPlatformCatalogService {
  private static platforms: PlatformFeedConfig[] = [
    { platform: 'google', format: 'xml', enabled: true, updateFrequency: 'hourly' },
    { platform: 'instagram', format: 'csv', enabled: true, updateFrequency: 'hourly' },
    { platform: 'tiktok', format: 'json', enabled: true, updateFrequency: 'daily' },
    { platform: 'facebook', format: 'xml', enabled: false, updateFrequency: 'hourly' }
  ];
  
  static async generateFeedForPlatform(platform: string, format: string): Promise<string> {
    let cars: any[] = [];
    
    switch (platform) {
      case 'google':
        cars = await GoogleMerchantFeedService.getActiveCars();
        return GoogleMerchantFeedService.generateXMLFeed(cars);
        
      case 'instagram':
        cars = await InstagramFeedService.getActiveCars();
        return InstagramFeedService.generateCSVFeed(cars);
        
      case 'tiktok':
        cars = await TikTokFeedService.getActiveCars();
        return TikTokFeedService.generateJSONFeed(cars);
        
      default:
        throw new Error(`Platform ${platform} not supported`);
    }
  }
  
  static async downloadFeed(platform: string): Promise<void> {
    const config = this.platforms.find(p => p.platform === platform);
    if (!config) throw new Error(`Platform ${platform} not found`);
    
    const feed = await this.generateFeedForPlatform(platform, config.format);
    const blob = new Blob([feed], { 
      type: config.format === 'json' ? 'application/json' : 
            config.format === 'csv' ? 'text/csv' : 'application/xml'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `globul-cars-${platform}.${config.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
  
  static getEnabledPlatforms(): PlatformFeedConfig[] {
    return this.platforms.filter(p => p.enabled);
  }
  
  static getFeedURL(platform: string): string {
    const baseURL = 'https://us-central1-fire-new-globul.cloudfunctions.net';
    return `${baseURL}/${platform}CatalogFeed`;
  }
}

export default MultiPlatformCatalogService;
export { GoogleMerchantFeedService, InstagramFeedService, TikTokFeedService };

