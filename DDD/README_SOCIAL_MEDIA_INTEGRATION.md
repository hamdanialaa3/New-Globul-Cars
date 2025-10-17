# Social Media Integration for Bulgarian Car Marketplace
# التكامل مع وسائل التواصل الاجتماعي لسوق السيارات البلغاري

## Overview
This comprehensive social media integration provides complete support for Facebook, Threads, TikTok, and Instagram platforms, specifically tailored for the Bulgarian car marketplace with full localization and multi-language support.

## Supported Platforms

### 🔵 Facebook
- **Graph API**: User profiles, posts, and interactions
- **Marketing API**: Targeted car advertisements
- **Messenger**: Customer communication
- **Analytics**: Performance tracking
- **Sharing**: Content distribution
- **Groups**: Community engagement

### 🧵 Threads
- **Car Posts**: Specialized car content posting
- **Bulgarian Localization**: Native Bulgarian language support
- **Hashtag Integration**: Bulgarian and international hashtags
- **Scheduling**: Automated content scheduling

### 🎵 TikTok
- **Video Content**: Car showcase videos
- **Trending Discovery**: Popular car content in Bulgaria
- **Hashtag Analysis**: Bulgarian car market hashtags
- **User Engagement**: Comments and interactions

### 📸 Instagram
- **Photo Posts**: Car image galleries
- **Stories**: Temporary car promotions
- **Reels**: Short car videos
- **Hashtag Marketing**: Bulgarian car hashtags

## Architecture

### Service Structure
```
social-media-integration.ts (Main Integration)
├── facebook/
│   ├── facebook-graph-service.ts
│   ├── facebook-marketing-service.ts
│   ├── facebook-messenger-service.ts
│   ├── facebook-analytics-service.ts
│   ├── facebook-sharing-service.ts
│   └── facebook-groups-service.ts
├── threads-service.ts
├── tiktok-service.ts
└── instagram-service.ts
```

### Unified Integration
```typescript
import { bulgarianSocialIntegration } from './services/social-media-integration';

// Access all platforms through single interface
const social = bulgarianSocialIntegration;

// Post to all platforms simultaneously
await social.postCarToAllPlatforms(carData);

// Get trending content from all platforms
const trending = await social.getAllTrendingContent();
```

## Configuration

### Environment Variables
```env
# Facebook
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
REACT_APP_FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
REACT_APP_FACEBOOK_PAGE_ACCESS_TOKEN=your_page_token

# TikTok
REACT_APP_TIKTOK_ACCESS_TOKEN=your_tiktok_token
REACT_APP_TIKTOK_CLIENT_KEY=your_client_key
REACT_APP_TIKTOK_CLIENT_SECRET=your_client_secret

# Instagram
REACT_APP_INSTAGRAM_ACCESS_TOKEN=your_instagram_token
REACT_APP_INSTAGRAM_CLIENT_ID=your_client_id
REACT_APP_INSTAGRAM_CLIENT_SECRET=your_client_secret
```

### Bulgarian Localization
- **Primary Language**: Bulgarian (bg-BG)
- **Secondary Language**: English (en)
- **Currency**: EUR (€)
- **Timezone**: Europe/Sofia
- **Country Code**: BG

## API Methods

### Multi-Platform Posting
```typescript
// Post car to all available platforms
const results = await bulgarianSocialIntegration.postCarToAllPlatforms({
  id: 'car123',
  make: 'BMW',
  model: 'X3',
  year: 2020,
  price: 25000,
  description: 'Отличен автомобил в перфектно състояние',
  images: ['image1.jpg', 'image2.jpg'],
  location: 'София'
});

// Results contain post IDs from each platform
console.log(results);
// {
//   facebook: { postId: '123', url: '...' },
//   threads: { postId: '456', permalink: '...' },
//   tiktok: { id: '789', videoUrl: '...' },
//   instagram: { id: '101', permalink: '...' }
// }
```

### Platform-Specific Usage

#### Facebook Groups
```typescript
import { bulgarianGroupsService } from './services/facebook-groups-service';

// Find Bulgarian car groups
const carGroups = await bulgarianGroupsService.getBulgarianCarGroups();

// Post to a group
await bulgarianGroupsService.postToCarGroup({
  groupId: 'group123',
  carId: 'car456',
  message: 'Продавам BMW X3 2020',
  tags: ['BMW', 'X3', 'продажба']
});
```

#### TikTok Videos
```typescript
import { bulgarianTikTokService } from './services/tiktok-service';

// Post car video
const videoPost = await bulgarianTikTokService.postCarVideo({
  carId: 'car123',
  title: 'BMW X3 2020 - Отлична цена!',
  description: 'Проверете тази страхотна кола...',
  videoUrl: 'video.mp4',
  hashtags: ['BMW', 'cars', 'продажба'],
  language: 'bg',
  privacyLevel: 'public'
});

// Get trending Bulgarian car videos
const trending = await bulgarianTikTokService.getTrendingBulgarianCarVideos(10);
```

#### Instagram Posts
```typescript
import { bulgarianInstagramService } from './services/instagram-service';

// Post car photo
const photoPost = await bulgarianInstagramService.postCarContent({
  carId: 'car123',
  mediaType: 'IMAGE',
  mediaUrls: ['car1.jpg', 'car2.jpg'],
  caption: 'BMW X3 2020 - 25,000€ #BMW #продажба',
  hashtags: ['BMW', 'X3', 'cars', 'коли'],
  language: 'bg'
});

// Create Instagram Story
await bulgarianInstagramService.createCarStory({
  carId: 'car123',
  mediaUrl: 'story-image.jpg',
  stickerText: 'BMW X3 - 25,000€'
});
```

## Bulgarian Market Features

### Localized Content
- **Bulgarian Hashtags**: #коли, #продажба, #автомобили, #БългарскиАвтомобили
- **Bulgarian Cities**: София, Пловдив, Варна, Бургас
- **Car Brands**: BMW, Mercedes, Audi, Volkswagen, Opel
- **Price Format**: 25,000€ (European format with comma)

### Search Optimization
- **Bulgarian Keywords**: автомобили, коли, продажба, авто пазар
- **Brand-Specific**: BMW България, Mercedes БГ
- **Location-Based**: коли София, продажба Пловдив

### Cultural Adaptation
- **Bulgarian Date Format**: DD.MM.YYYY
- **Bulgarian Number Format**: 25 000,00 (comma decimal separator)
- **Local Timezone**: Europe/Sofia (EET/EEST)

## Analytics & Insights

### Cross-Platform Analytics
```typescript
// Get status of all platforms
const status = bulgarianSocialIntegration.getStatus();
// {
//   facebook: true,
//   threads: true,
//   tiktok: false,  // No token configured
//   instagram: true,
//   environment: 'production',
//   language: 'bg'
// }

// Get trending content from all platforms
const trendingContent = await bulgarianSocialIntegration.getAllTrendingContent(20);
console.log(trendingContent.facebook.length);  // Facebook posts
console.log(trendingContent.tiktok.length);    // TikTok videos
console.log(trendingContent.instagram.length); // Instagram posts
```

### Platform-Specific Analytics
Each service provides detailed analytics:
- **Engagement Metrics**: Likes, comments, shares
- **Reach & Impressions**: Content visibility
- **Demographic Data**: Audience insights
- **Performance Tracking**: ROI measurement

## Error Handling

### Graceful Degradation
- **Missing Tokens**: Services disable gracefully when tokens unavailable
- **API Limits**: Automatic rate limiting and retry logic
- **Network Issues**: Offline queue and retry mechanisms
- **Platform-Specific Errors**: Localized error messages

### Logging & Monitoring
```typescript
// All services include comprehensive logging
console.log('✅ Social media integration initialized');
console.log('⚠️ TikTok token not configured - service disabled');
console.log('❌ Facebook API error - retrying...');
```

## Security & Compliance

### GDPR Compliance
- **Data Minimization**: Only necessary data collection
- **User Consent**: Explicit permission for cross-platform posting
- **Data Deletion**: Complete user data removal across platforms
- **Privacy Controls**: Granular privacy settings

### API Security
- **Token Management**: Secure token storage and rotation
- **Rate Limiting**: Respect platform API limits
- **Error Handling**: Secure error responses
- **Audit Logging**: Complete activity tracking

## Development & Testing

### Local Development
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run development server
npm start

# Test social media integration
npm run test:social
```

### Testing Strategy
- **Unit Tests**: Individual service testing
- **Integration Tests**: Cross-platform functionality
- **Bulgarian Localization**: Language and cultural testing
- **API Mocking**: Offline testing capabilities

## Deployment

### Production Configuration
```env
NODE_ENV=production
REACT_APP_SOCIAL_ENV=production

# All platform tokens must be configured
REACT_APP_FACEBOOK_ACCESS_TOKEN=prod_token
REACT_APP_TIKTOK_ACCESS_TOKEN=prod_token
REACT_APP_INSTAGRAM_ACCESS_TOKEN=prod_token
```

### Build Process
```bash
# Build optimized production bundle
npm run build

# Deploy to hosting
firebase deploy
```

## Support & Documentation

### API Documentation
- **Facebook Graph API**: https://developers.facebook.com/docs/graph-api
- **TikTok API**: https://developers.tiktok.com/
- **Instagram API**: https://developers.facebook.com/docs/instagram-api
- **Threads API**: https://developers.facebook.com/docs/threads

### Bulgarian Resources
- **Bulgarian Hashtags**: Research local trending hashtags
- **Cultural Context**: Understand Bulgarian car market nuances
- **Legal Compliance**: Bulgarian data protection laws

## Future Enhancements

### Planned Features
- **YouTube Integration**: Car review videos
- **LinkedIn**: Professional car sales
- **Telegram**: Bulgarian car communities
- **WhatsApp Business**: Direct messaging
- **AI Content Generation**: Automated post creation

### Advanced Analytics
- **Predictive Analytics**: Content performance prediction
- **A/B Testing**: Optimized posting strategies
- **Competitor Analysis**: Market intelligence
- **ROI Tracking**: Comprehensive business metrics

---
*This social media integration provides a complete solution for Bulgarian car marketplace social media presence across all major platforms.*