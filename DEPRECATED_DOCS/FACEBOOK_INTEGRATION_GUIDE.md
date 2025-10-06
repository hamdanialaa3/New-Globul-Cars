# Facebook Integration Guide for Bulgarian Car Marketplace
# دليل تكامل Facebook لسوق السيارات البلغاري

## 🎯 **Overview | نظرة عامة**

This guide demonstrates how to use the comprehensive Facebook integration in the Bulgarian Car Marketplace. The integration includes 5 major components:

تشرح هذه الوثيقة كيفية استخدام التكامل الشامل مع Facebook في سوق السيارات البلغاري. يشمل التكامل 5 مكونات رئيسية:

1. **📊 Facebook Graph API** - User profiles, friends, posts
2. **📢 Facebook Marketing API** - Automated car advertisements  
3. **💬 Facebook Messenger** - Customer support chatbot
4. **📈 Facebook Analytics** - User behavior tracking
5. **🔗 Facebook Sharing** - Social sharing & Open Graph

## 🚀 **Quick Start | بداية سريعة**

### 1. Import the Integration

```typescript
import {
  bulgarianFacebookIntegration,
  bulgarianGraphService,
  bulgarianMarketingService,
  bulgarianMessengerService,
  bulgarianAnalyticsService,
  bulgarianSharingService
} from '../services/facebook-integration';
```

### 2. Basic Usage Examples

```typescript
// Get all Facebook services
const facebook = bulgarianFacebookIntegration.getServices();

// Use specific service
const graphService = bulgarianFacebookIntegration.getService('graph');
const marketingService = bulgarianFacebookIntegration.getService('marketing');
```

## 📊 **Facebook Graph API Usage**

### Get User Profile
```typescript
import { bulgarianFacebookGraph } from '../services/facebook-integration';

// Get current user with Bulgarian localization
const user = await bulgarianFacebookGraph.getCurrentUser();
console.log('Bulgarian user:', user);

// Get user's friends for social features
const friends = await bulgarianFacebookGraph.getUserFriends('me', 50);
console.log('User friends:', friends);

// Get Bulgarian Car Marketplace page data
const pageData = await bulgarianFacebookGraph.getBulgarianCarPage();
console.log('Page info:', pageData);
```

### Search Car-Related Content
```typescript
// Search for car-related pages in Bulgaria
const carPages = await bulgarianFacebookGraph.searchCarContent('BMW', 'page');
console.log('Car-related pages:', carPages);

// Get user's interests for targeted advertising
const interests = await bulgarianFacebookGraph.getUserInterests();
console.log('User interests:', interests);
```

## 📢 **Facebook Marketing API Usage**

### Create Car Advertisement
```typescript
import { bulgarianMarketingService } from '../services/facebook-integration';

// Car data example
const carData = {
  make: 'BMW',
  model: '320d',
  year: 2018,
  price: 25000, // in Euro
  mileage: 85000,
  fuelType: 'Дизел',
  transmission: 'Автоматик',
  images: ['https://example.com/bmw320d.jpg'],
  description: {
    bg: 'Отличен автомобил в перфектно състояние',
    en: 'Excellent car in perfect condition'
  },
  location: {
    city: 'София',
    region: 'София град',
    country: 'Bulgaria' as const
  },
  contactInfo: {
    phone: '+359888123456',
    email: 'seller@example.com'
  }
};

// Create automated advertisement campaign
const campaign = await bulgarianMarketingService.createCarAdCampaign(
  carData, 
  30 // Daily budget in Euro
);

console.log('Campaign created:', campaign);
```

### Campaign Management
```typescript
// Get all active campaigns
const activeCampaigns = await bulgarianMarketingService.getActiveCampaigns();

// Get campaign performance insights
const insights = await bulgarianMarketingService.getCampaignInsights('campaign_id');

// Pause or activate campaign
await bulgarianMarketingService.updateCampaignStatus('campaign_id', 'PAUSED');
```

## 💬 **Facebook Messenger Integration**

### Webhook Setup (Express.js example)
```typescript
import express from 'express';
import { bulgarianMessengerService } from '../services/facebook-integration';

const app = express();
app.use(express.json());

// Webhook verification
app.get('/api/facebook/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const result = bulgarianMessengerService.verifyWebhook(mode, token, challenge);
  
  if (result) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// Handle incoming messages
app.post('/api/facebook/webhook', async (req, res) => {
  await bulgarianMessengerService.processWebhookMessage(req.body);
  res.status(200).send('EVENT_RECEIVED');
});
```

### Send Manual Messages
```typescript
// Send message to user
await bulgarianMessengerService.sendMessage(
  'user_id',
  'Здравей! Как мога да ти помогна? / Hello! How can I help you?',
  [],
  [
    { content_type: 'text', title: '🔍 Търся кола / Looking for car', payload: 'SEARCH_CARS' },
    { content_type: 'text', title: '💰 Цени / Prices', payload: 'PRICE_INFO' }
  ]
);
```

## 📈 **Facebook Analytics Integration**

### Track Car Events
```typescript
import { bulgarianAnalyticsService } from '../services/facebook-integration';

// Track page view
bulgarianAnalyticsService.trackPageView('/car/123', 'user_id');

// Track car view with details
await bulgarianAnalyticsService.trackCarView({
  carId: '123',
  make: 'BMW',
  model: '320d',
  year: 2018,
  price: 25000,
  category: 'automotive',
  location: 'София',
  timestamp: Date.now()
});

// Track car search
await bulgarianAnalyticsService.trackCarSearch({
  searchQuery: 'BMW 320d София',
  filters: {
    make: 'BMW',
    model: '320d',
    minPrice: 20000,
    maxPrice: 30000,
    location: 'София'
  },
  resultsCount: 15,
  timestamp: Date.now()
});

// Track contact/lead
await bulgarianAnalyticsService.trackCarContact({
  carId: '123',
  contactMethod: 'phone',
  sellerId: 'seller_123',
  buyerId: 'buyer_456',
  timestamp: Date.now()
});
```

### Get Analytics Reports
```typescript
// Get comprehensive analytics report
const report = await bulgarianAnalyticsService.generateAnalyticsReport(30);
console.log('Analytics report:', report);

// Get page insights
const pageInsights = await bulgarianAnalyticsService.getPageInsights(30);
console.log('Page performance:', pageInsights);
```

## 🔗 **Facebook Sharing & Open Graph**

### Generate Open Graph Tags
```typescript
import { bulgarianSharingService } from '../services/facebook-integration';

// Generate OG tags for car listing
const openGraphTags = bulgarianSharingService.generateCarOpenGraphTags(carData, 'bg');

// Inject tags into HTML head (client-side)
bulgarianSharingService.injectOpenGraphTags(openGraphTags);
```

### Social Sharing
```typescript
// Share car to Facebook
const shareSuccess = await bulgarianSharingService.shareCarToFacebook(carData, 'bg');

// Share via Messenger
const messengerShare = await bulgarianSharingService.shareCarViaMessenger(carData, 'bg');

// Get share URLs for all platforms
const shareUrls = bulgarianSharingService.generateShareUrls(carData, 'bg');
console.log('Share URLs:', shareUrls);
```

### Create Facebook Posts
```typescript
// Create page post for new car listing
const postId = await bulgarianSharingService.createCarListingPost(carData, 'bg');

// Create Facebook event for car show
const eventId = await bulgarianSharingService.createCarShowEvent({
  title: 'Изложение на автомобили в София',
  description: 'Най-голямото изложение на автомобили в България',
  startTime: '2024-06-15T10:00:00Z',
  location: 'София, България',
  language: 'bg'
});
```

## 🔄 **Complete Workflow Example**

```typescript
import { bulgarianFacebookIntegration } from '../services/facebook-integration';

// Process new car listing with all Facebook integrations
const result = await bulgarianFacebookIntegration.processNewCarListing(
  carData,
  {
    createAd: true,        // Create Facebook advertisement
    shareToPage: true,     // Share to Facebook page
    trackAnalytics: true,  // Track with Facebook Analytics
    language: 'bg'         // Use Bulgarian language
  }
);

console.log('Processing result:', result);

if (result.success) {
  console.log('✅ Car listing processed successfully');
  console.log('📢 Advertisement ID:', result.results.advertisement);
  console.log('📱 Page post ID:', result.results.pagePost);
  console.log('🏷️ Open Graph tags:', result.results.openGraphTags);
} else {
  console.error('❌ Processing failed:', result.errors);
}
```

## 🤖 **Customer Inquiry Workflow**

```typescript
// Handle customer inquiry
const inquiryResult = await bulgarianFacebookIntegration.processCustomerInquiry({
  carId: '123',
  customerId: 'customer_456',
  inquiryType: 'test_drive',
  message: 'Искам да запазя тест драйв за тази кола',
  contactMethod: 'messenger',
  language: 'bg'
});

console.log('Inquiry response:', inquiryResult.response);
console.log('Tracking ID:', inquiryResult.trackingId);
```

## 📊 **Integration Monitoring**

```typescript
// Generate comprehensive integration report
const integrationReport = await bulgarianFacebookIntegration.generateIntegrationReport(30);

console.log('Integration status:', integrationReport.integrationStatus);
console.log('Performance insights:', integrationReport.pageInsights);
console.log('Recommendations:', integrationReport.recommendations);
```

## 🛠️ **React Component Examples**

### Car Listing Component with Facebook Integration
```tsx
import React, { useEffect } from 'react';
import { bulgarianSharingService, bulgarianAnalyticsService } from '../services/facebook-integration';

interface CarListingProps {
  car: CarData;
  language: 'bg' | 'en';
}

const CarListing: React.FC<CarListingProps> = ({ car, language }) => {
  useEffect(() => {
    // Generate and inject Open Graph tags
    const ogTags = bulgarianSharingService.generateCarOpenGraphTags(car, language);
    bulgarianSharingService.injectOpenGraphTags(ogTags);

    // Track page view
    bulgarianAnalyticsService.trackPageView(`/car/${car.id}`, undefined);

    // Track car view
    bulgarianAnalyticsService.trackCarView({
      carId: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      category: 'automotive',
      location: car.location,
      timestamp: Date.now()
    });
  }, [car, language]);

  const handleShare = async (platform: string) => {
    if (platform === 'facebook') {
      await bulgarianSharingService.shareCarToFacebook(car, language);
    } else if (platform === 'messenger') {
      await bulgarianSharingService.shareCarViaMessenger(car, language);
    }
  };

  const handleContact = async (method: 'phone' | 'email') => {
    await bulgarianAnalyticsService.trackCarContact({
      carId: car.id,
      contactMethod: method,
      sellerId: car.sellerId,
      timestamp: Date.now()
    });
  };

  return (
    <div className="car-listing">
      <h1>{car.make} {car.model} {car.year}</h1>
      <p>€{car.price.toLocaleString(language === 'bg' ? 'bg-BG' : 'en-EU')}</p>
      
      {/* Share buttons */}
      <div className="share-buttons">
        <button onClick={() => handleShare('facebook')}>
          📘 {language === 'bg' ? 'Сподели в Facebook' : 'Share on Facebook'}
        </button>
        <button onClick={() => handleShare('messenger')}>
          💬 {language === 'bg' ? 'Изпрати в Messenger' : 'Send via Messenger'}
        </button>
      </div>

      {/* Contact buttons */}
      <div className="contact-buttons">
        <button onClick={() => handleContact('phone')}>
          📞 {language === 'bg' ? 'Обади се' : 'Call'}
        </button>
        <button onClick={() => handleContact('email')}>
          📧 {language === 'bg' ? 'Имейл' : 'Email'}
        </button>
      </div>
    </div>
  );
};

export default CarListing;
```

### Facebook Messenger Chat Widget
```tsx
import React from 'react';

const MessengerWidget: React.FC = () => {
  useEffect(() => {
    // Load Facebook Messenger Customer Chat Plugin
    window.fbAsyncInit = function() {
      FB.init({
        xfbml: true,
        version: 'v18.0'
      });
    };

    (function(d, s, id) {
      let js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = 'https://connect.facebook.net/bg_BG/sdk/xfbml.customerchat.js';
      fjs.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  return (
    <>
      <div id="fb-root"></div>
      <div
        className="fb-customerchat"
        data-page-id="100080260449528"
        data-theme-color="#0084ff"
        data-logged-in-greeting="Здравей! Как мога да ти помогна с автомобилите?"
        data-logged-out-greeting="Здравей! Влез във Facebook, за да чатиш с нас."
      />
    </>
  );
};
```

## 🔧 **Configuration Management**

```typescript
// Update configuration
bulgarianFacebookIntegration.updateConfiguration({
  defaultLanguage: 'en',
  environment: 'production'
});

// Get current configuration (without sensitive data)
const config = bulgarianFacebookIntegration.getConfiguration();
console.log('Current config:', config);
```

## ⚠️ **Important Notes | ملاحظات مهمة**

1. **Environment Variables**: Always use environment variables for sensitive data
2. **Rate Limits**: Facebook APIs have rate limits - implement proper error handling
3. **Permissions**: Ensure your Facebook app has all required permissions
4. **Webhooks**: Set up proper webhook endpoints for Messenger integration
5. **Testing**: Use Facebook's development tools for testing
6. **Compliance**: Follow Facebook's platform policies and GDPR requirements
7. **Bulgarian Localization**: All text and currency are properly localized for Bulgaria

## 🐛 **Troubleshooting | استكشاف الأخطاء**

### Common Issues:

1. **"Access token not found"**: Set REACT_APP_FACEBOOK_ACCESS_TOKEN
2. **"Facebook SDK not loaded"**: Check internet connection and App ID
3. **"Webhook verification failed"**: Verify REACT_APP_FACEBOOK_VERIFY_TOKEN
4. **"Ad creation failed"**: Check Ad Account ID and permissions
5. **"Pixel events not tracking"**: Verify Pixel ID and implementation

### Debug Mode:
```typescript
// Enable debug mode
process.env.REACT_APP_FACEBOOK_DEBUG_MODE = 'true';
```

---

**🇧🇬 Bulgarian Car Marketplace Facebook Integration is now complete and ready for professional use! | التكامل مع Facebook لسوق السيارات البلغاري مكتمل الآن وجاهز للاستخدام الاحترافي!**