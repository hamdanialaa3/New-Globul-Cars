# Facebook Groups Service for Bulgarian Car Marketplace
# خدمة مجموعات Facebook لسوق السيارات البلغاري

## Overview
This service provides comprehensive integration with Facebook Groups API for the Bulgarian car marketplace, enabling users to discover, join, and interact with car-related groups in Bulgaria.

## Features

### 🔍 Group Discovery
- **Bulgarian Car Groups**: Search and discover car-related groups in Bulgaria
- **Location-based Search**: Find groups by Bulgarian cities and regions
- **User Groups**: Access user's joined groups

### 📝 Content Management
- **Post to Groups**: Share car listings in relevant groups
- **Group Posts**: Fetch and display group content
- **Trending Discussions**: Identify popular car discussions

### 👥 Group Interaction
- **Join Groups**: Automatically join car-related groups
- **Leave Groups**: Manage group memberships
- **Member Management**: Handle group participation

## API Methods

### Group Discovery
```typescript
// Get user's groups
const userGroups = await bulgarianGroupsService.getUserGroups();

// Find Bulgarian car groups
const carGroups = await bulgarianGroupsService.getBulgarianCarGroups();

// Search groups by location
const sofiaGroups = await bulgarianGroupsService.searchCarGroupsByLocation('София');
```

### Content Management
```typescript
// Get group posts
const posts = await bulgarianGroupsService.getGroupPosts(groupId, 25);

// Post to car group
const postResult = await bulgarianGroupsService.postToCarGroup({
  groupId: '123456789',
  carId: 'car123',
  message: 'Продавам BMW X3 2018 година',
  link: 'https://globul.net/car/car123',
  tags: ['BMW', 'X3', 'продажба']
});

// Get trending discussions
const trending = await bulgarianGroupsService.getTrendingCarDiscussions(10);
```

### Group Interaction
```typescript
// Join a car group
const joined = await bulgarianGroupsService.joinCarGroup(groupId);

// Leave a group
const left = await bulgarianGroupsService.leaveCarGroup(groupId);
```

## Bulgarian Localization

### Search Terms
The service uses Bulgarian search terms for optimal group discovery:
- `автомобили` (automobiles)
- `коли` (cars)
- `продажба коли` (car sale)
- `авто пазар` (car market)
- Popular brands: BMW, Mercedes, Audi, Volkswagen

### Bulgarian Cities
Supports location-based search for major Bulgarian cities:
- София (Sofia)
- Пловдив (Plovdiv)
- Варна (Varna)
- Бургас (Burgas)
- And more...

## Integration

### Facebook Integration Manager
```typescript
import { bulgarianFacebookIntegration } from './facebook-integration';

// Access groups service
const groupsService = bulgarianFacebookIntegration.groups;

// Use service methods
const carGroups = await groupsService.getBulgarianCarGroups();
```

### Configuration
The service is automatically configured with:
- Facebook Graph API v18.0
- Bulgarian marketplace settings
- EUR currency formatting
- Bulgarian language support

## Permissions Required

### Facebook App Permissions
- `groups_access_member_info` - Access group member information
- `publish_to_groups` - Post content to groups
- `groups_show_list` - Show user's groups
- `user_managed_groups` - Manage user's groups

### Bulgarian Marketplace Integration
- Car listing data integration
- Bulgarian user profiles
- Location-based targeting
- Multi-language support (BG/EN)

## Error Handling

The service includes comprehensive error handling for:
- API rate limits
- Permission issues
- Network failures
- Invalid group IDs
- Bulgarian-specific validation

## Usage Examples

### Complete Car Posting Workflow
```typescript
// 1. Find relevant groups
const carGroups = await bulgarianGroupsService.getBulgarianCarGroups();

// 2. Filter by location and size
const targetGroups = carGroups.filter(group =>
  group.name.toLowerCase().includes('софия') &&
  (group.memberCount || 0) > 1000
);

// 3. Post to selected groups
for (const group of targetGroups.slice(0, 3)) {
  try {
    await bulgarianGroupsService.postToCarGroup({
      groupId: group.id,
      carId: carListing.id,
      message: `Продавам ${carListing.make} ${carListing.model} ${carListing.year}`,
      link: `https://globul.net/car/${carListing.id}`,
      tags: [carListing.make, carListing.model, carListing.year.toString()]
    });
  } catch (error) {
    console.warn(`Failed to post to group ${group.name}:`, error);
  }
}
```

### Trending Content Analysis
```typescript
// Get trending car discussions
const trendingPosts = await bulgarianGroupsService.getTrendingCarDiscussions(20);

// Analyze popular topics
const topicAnalysis = trendingPosts.reduce((acc, post) => {
  const topics = extractTopics(post.message || '');
  topics.forEach(topic => {
    acc[topic] = (acc[topic] || 0) + 1;
  });
  return acc;
}, {} as Record<string, number>);
```

## Testing

### Service Tests
Run comprehensive tests for the Groups service:
```bash
npm run test:services
```

### Bulgarian Localization Tests
Test Bulgarian-specific functionality:
- Bulgarian search terms
- Bulgarian city names
- Bulgarian car brands
- EUR currency formatting

## Deployment

The service is automatically deployed with the main application and configured for production use on globul.net domain.

## Support

For issues or questions about the Facebook Groups service:
- Check Facebook API documentation
- Review Bulgarian marketplace requirements
- Contact development team

---
*This service is part of the comprehensive Bulgarian Car Marketplace Facebook integration suite.*</content>
<parameter name="filePath">c:\Users\hamda\Desktop\New Globul Cars\bulgarian-car-marketplace\src\services\FACEBOOK_GROUPS_SERVICE_README.md