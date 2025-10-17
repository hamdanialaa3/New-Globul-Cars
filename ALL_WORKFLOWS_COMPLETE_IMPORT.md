# 🚀 جميع الـ Workflows الجديدة - استيراد شامل

---

## 🔥 **Workflow 3: Complete Sell Workflow**

### انسخ هذا الكود:

```json
{
  "name": "Globul Cars - Complete Sell Workflow",
  "nodes": [
    {
      "parameters": {
        "path": "seller-type-selected",
        "options": {}
      },
      "id": "webhook-seller-type",
      "name": "Webhook - Seller Type Selected",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "webhookId": "seller-type-webhook"
    },
    {
      "parameters": {
        "path": "vehicle-data-entered",
        "options": {}
      },
      "id": "webhook-vehicle-data",
      "name": "Webhook - Vehicle Data Entered",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 500],
      "webhookId": "vehicle-data-webhook"
    },
    {
      "parameters": {
        "path": "equipment-selected",
        "options": {}
      },
      "id": "webhook-equipment",
      "name": "Webhook - Equipment Selected",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 700],
      "webhookId": "equipment-webhook"
    },
    {
      "parameters": {
        "path": "images-uploaded",
        "options": {}
      },
      "id": "webhook-images",
      "name": "Webhook - Images Uploaded",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 900],
      "webhookId": "images-webhook"
    },
    {
      "parameters": {
        "path": "price-set",
        "options": {}
      },
      "id": "webhook-price",
      "name": "Webhook - Price Set",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 1100],
      "webhookId": "price-webhook"
    },
    {
      "parameters": {
        "path": "contact-info-entered",
        "options": {}
      },
      "id": "webhook-contact",
      "name": "Webhook - Contact Info Entered",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 1300],
      "webhookId": "contact-webhook"
    },
    {
      "parameters": {
        "path": "listing-published",
        "options": {}
      },
      "id": "webhook-published",
      "name": "Webhook - Listing Published",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 1500],
      "webhookId": "published-webhook"
    },
    {
      "parameters": {
        "functionCode": "const inputData = items[0].json;\nconst { step, userId, data, timestamp } = inputData;\n\nconst sellSteps = {\n  'seller_type': { stepNumber: 2, completion: 20, nextStep: 'vehicle_data', criticalData: ['sellerType', 'businessInfo'] },\n  'vehicle_data': { stepNumber: 3, completion: 40, nextStep: 'equipment', criticalData: ['make', 'model', 'year', 'mileage'] },\n  'equipment': { stepNumber: 4, completion: 60, nextStep: 'images', criticalData: ['safety', 'comfort', 'tech'] },\n  'images': { stepNumber: 5, completion: 75, nextStep: 'price', criticalData: ['imageCount', 'mainImage'] },\n  'price': { stepNumber: 6, completion: 90, nextStep: 'contact', criticalData: ['price', 'currency', 'negotiable'] },\n  'contact': { stepNumber: 7, completion: 95, nextStep: 'publish', criticalData: ['name', 'phone', 'location'] },\n  'published': { stepNumber: 8, completion: 100, nextStep: 'complete', criticalData: ['listingId', 'publicUrl'] }\n};\n\nconst stepInfo = sellSteps[step] || { stepNumber: 1, completion: 10, nextStep: 'unknown', criticalData: [] };\nconst dataQuality = { complete: stepInfo.criticalData.every(field => data && data[field]), missing: stepInfo.criticalData.filter(field => !data || !data[field]), score: data ? (Object.keys(data).length / stepInfo.criticalData.length) * 100 : 0 };\nconst dropOffRisk = { high: stepInfo.completion > 80 && dataQuality.score < 70, medium: stepInfo.completion > 50 && dataQuality.score < 50, low: dataQuality.score > 80 };\n\nlet interventions = [];\nif (dropOffRisk.high) { interventions.push('Send urgent assistance offer'); interventions.push('Activate customer support chat'); }\nif (dataQuality.missing.length > 0) { interventions.push(`Help with: ${dataQuality.missing.join(', ')}`); }\nif (stepInfo.completion > 70) { interventions.push('Send completion encouragement'); }\n\nreturn [{ json: { userId, step, stepInfo, dataQuality, dropOffRisk, interventions, processedAt: new Date().toISOString(), needsAttention: dropOffRisk.high || dataQuality.score < 50 } }];"
      },
      "id": "analyze-sell-funnel",
      "name": "Analyze Sell Funnel",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [600, 800]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.needsAttention}}",
              "value2": true
            }
          ]
        }
      },
      "id": "needs-attention-check",
      "name": "Needs Attention?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [820, 800]
    },
    {
      "parameters": {
        "url": "https://fire-new-globul.firebaseapp.com/api/urgent-intervention",
        "authentication": "none",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"userId\": \"{{$json.userId}}\",\n  \"step\": \"{{$json.step}}\",\n  \"riskLevel\": \"high\",\n  \"interventions\": {{JSON.stringify($json.interventions)}},\n  \"dataQuality\": {{$json.dataQuality.score}},\n  \"timestamp\": \"{{$json.processedAt}}\"\n}",
        "options": {}
      },
      "id": "urgent-intervention",
      "name": "Send Urgent Intervention",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1040, 700],
      "continueOnFail": true
    },
    {
      "parameters": {
        "url": "https://fire-new-globul.firebaseapp.com/api/sell-funnel-analytics",
        "authentication": "none",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"userId\": \"{{$json.userId}}\",\n  \"step\": \"{{$json.step}}\",\n  \"completion\": {{$json.stepInfo.completion}},\n  \"dataQuality\": {{$json.dataQuality.score}},\n  \"timestamp\": \"{{$json.processedAt}}\"\n}",
        "options": {}
      },
      "id": "log-analytics",
      "name": "Log Sell Analytics",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [1040, 900],
      "continueOnFail": true
    }
  ],
  "connections": {
    "Webhook - Seller Type Selected": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Vehicle Data Entered": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Equipment Selected": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Images Uploaded": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Price Set": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Contact Info Entered": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Webhook - Listing Published": { "main": [[ { "node": "Analyze Sell Funnel", "type": "main", "index": 0 } ]] },
    "Analyze Sell Funnel": { "main": [[ { "node": "Needs Attention?", "type": "main", "index": 0 } ]] },
    "Needs Attention?": { "main": [[ { "node": "Send Urgent Intervention", "type": "main", "index": 0 } ], [ { "node": "Log Sell Analytics", "type": "main", "index": 0 } ]] },
    "Send Urgent Intervention": { "main": [[ { "node": "Log Sell Analytics", "type": "main", "index": 0 } ]] }
  },
  "active": false,
  "settings": {},
  "versionId": "00000000-0000-0000-0000-000000000000"
}
```

---

## 👤 **Workflow 4: User Tracking & Management**

### انسخ هذا الكود:

```json
{
  "name": "Globul Cars - User Tracking & Management",
  "nodes": [
    {
      "parameters": {
        "path": "user-registered",
        "options": {}
      },
      "id": "webhook-user-registered",
      "name": "Webhook - User Registered",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "webhookId": "user-registered-webhook"
    },
    {
      "parameters": {
        "path": "user-logged-in",
        "options": {}
      },
      "id": "webhook-user-login",
      "name": "Webhook - User Logged In",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 500],
      "webhookId": "user-login-webhook"
    },
    {
      "parameters": {
        "path": "profile-updated",
        "options": {}
      },
      "id": "webhook-profile-updated",
      "name": "Webhook - Profile Updated",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 700],
      "webhookId": "profile-updated-webhook"
    },
    {
      "parameters": {
        "path": "listing-created",
        "options": {}
      },
      "id": "webhook-listing-created",
      "name": "Webhook - Listing Created",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 900],
      "webhookId": "listing-created-webhook"
    },
    {
      "parameters": {
        "functionCode": "const inputData = items[0].json;\nconst { action, userId, userData, timestamp } = inputData;\n\nconst actionTypes = {\n  'user_registered': { category: 'acquisition', priority: 'high', followUp: 'welcome_sequence', kpi: 'new_users' },\n  'user_logged_in': { category: 'engagement', priority: 'medium', followUp: 'session_tracking', kpi: 'active_users' },\n  'profile_updated': { category: 'activation', priority: 'high', followUp: 'completion_check', kpi: 'profile_completion' },\n  'listing_created': { category: 'conversion', priority: 'very_high', followUp: 'listing_optimization', kpi: 'listings_created' }\n};\n\nconst actionInfo = actionTypes[action] || { category: 'other', priority: 'low', followUp: 'basic_tracking', kpi: 'misc_actions' };\nconst userAnalysis = { isNewUser: action === 'user_registered', hasCompletProfile: userData && userData.name && userData.phone && userData.location, preferredLanguage: userData?.language || 'bg', accountType: userData?.accountType || 'individual', verificationStatus: userData?.emailVerified || false };\n\nlet userLevel = 'basic';\nif (userAnalysis.hasCompletProfile && userAnalysis.verificationStatus) { userLevel = 'verified'; }\nif (userData?.listingCount > 5) { userLevel = 'power_user'; }\nif (userData?.accountType === 'dealer') { userLevel = 'business'; }\n\nlet recommendations = [];\nif (!userAnalysis.hasCompletProfile) { recommendations.push('Complete profile for better visibility'); }\nif (!userAnalysis.verificationStatus) { recommendations.push('Verify email for full access'); }\nif (userLevel === 'basic' && action === 'listing_created') { recommendations.push('Consider upgrading to premium features'); }\n\nlet automatedActions = [];\nif (action === 'user_registered') { automatedActions.push('send_welcome_email'); automatedActions.push('setup_onboarding_sequence'); }\nif (action === 'listing_created') { automatedActions.push('send_listing_confirmation'); automatedActions.push('start_promotion_campaign'); }\nif (!userAnalysis.verificationStatus && userLevel !== 'basic') { automatedActions.push('send_verification_reminder'); }\n\nconst businessValue = { ltv_potential: userLevel === 'business' ? 'high' : userLevel === 'verified' ? 'medium' : 'low', engagement_score: (userAnalysis.hasCompletProfile ? 30 : 0) + (userAnalysis.verificationStatus ? 40 : 0) + (userData?.listingCount || 0) * 10, conversion_likelihood: actionInfo.category === 'conversion' ? 'high' : actionInfo.category === 'activation' ? 'medium' : 'low' };\n\nlet userSegment = 'new_visitor';\nif (userLevel === 'business') userSegment = 'business_user';\nelse if (userLevel === 'power_user') userSegment = 'power_user';\nelse if (userLevel === 'verified') userSegment = 'active_user';\nelse if (userAnalysis.isNewUser) userSegment = 'new_user';\n\nreturn [{ json: { userId, action, actionInfo, userAnalysis, userLevel, userSegment, recommendations, automatedActions, businessValue, processedAt: new Date().toISOString(), requiresFollowUp: actionInfo.priority === 'high' || actionInfo.priority === 'very_high' } }];"
      },
      "id": "analyze-user-behavior",
      "name": "Analyze User Behavior",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [500, 600]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.action}}",
              "value2": "user_registered"
            }
          ]
        }
      },
      "id": "is-new-user",
      "name": "Is New User?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [720, 600]
    },
    {
      "parameters": {
        "url": "https://fire-new-globul.firebaseapp.com/api/welcome-sequence",
        "authentication": "none",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"userId\": \"{{$json.userId}}\",\n  \"userLevel\": \"{{$json.userLevel}}\",\n  \"language\": \"{{$json.userAnalysis.preferredLanguage}}\",\n  \"recommendations\": {{JSON.stringify($json.recommendations)}},\n  \"timestamp\": \"{{$json.processedAt}}\"\n}",
        "options": {}
      },
      "id": "trigger-welcome-sequence",
      "name": "Trigger Welcome Sequence",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [940, 500],
      "continueOnFail": true
    },
    {
      "parameters": {
        "url": "https://fire-new-globul.firebaseapp.com/api/user-analytics",
        "authentication": "none",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"userId\": \"{{$json.userId}}\",\n  \"action\": \"{{$json.action}}\",\n  \"userLevel\": \"{{$json.userLevel}}\",\n  \"userSegment\": \"{{$json.userSegment}}\",\n  \"businessValue\": {{JSON.stringify($json.businessValue)}},\n  \"automatedActions\": {{JSON.stringify($json.automatedActions)}},\n  \"timestamp\": \"{{$json.processedAt}}\"\n}",
        "options": {}
      },
      "id": "log-user-analytics",
      "name": "Log User Analytics",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [940, 700],
      "continueOnFail": true
    }
  ],
  "connections": {
    "Webhook - User Registered": { "main": [[ { "node": "Analyze User Behavior", "type": "main", "index": 0 } ]] },
    "Webhook - User Logged In": { "main": [[ { "node": "Analyze User Behavior", "type": "main", "index": 0 } ]] },
    "Webhook - Profile Updated": { "main": [[ { "node": "Analyze User Behavior", "type": "main", "index": 0 } ]] },
    "Webhook - Listing Created": { "main": [[ { "node": "Analyze User Behavior", "type": "main", "index": 0 } ]] },
    "Analyze User Behavior": { "main": [[ { "node": "Is New User?", "type": "main", "index": 0 } ]] },
    "Is New User?": { "main": [[ { "node": "Trigger Welcome Sequence", "type": "main", "index": 0 } ], [ { "node": "Log User Analytics", "type": "main", "index": 0 } ]] },
    "Trigger Welcome Sequence": { "main": [[ { "node": "Log User Analytics", "type": "main", "index": 0 } ]] }
  },
  "active": false,
  "settings": {},
  "versionId": "00000000-0000-0000-0000-000000000000"
}
```

---

## 💬 **Workflow 5: User Engagement & Interaction**

### انسخ هذا الكود:

```json
{
  "name": "Globul Cars - User Engagement & Interaction",
  "nodes": [
    {
      "parameters": {
        "path": "car-viewed",
        "options": {}
      },
      "id": "webhook-car-viewed",
      "name": "Webhook - Car Viewed",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "webhookId": "car-viewed-webhook"
    },
    {
      "parameters": {
        "path": "favorite-added",
        "options": {}
      },
      "id": "webhook-favorite-added",
      "name": "Webhook - Favorite Added",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 500],
      "webhookId": "favorite-added-webhook"
    },
    {
      "parameters": {
        "path": "message-sent",
        "options": {}
      },
      "id": "webhook-message-sent",
      "name": "Webhook - Message Sent",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 700],
      "webhookId": "message-sent-webhook"
    },
    {
      "parameters": {
        "path": "search-performed",
        "options": {}
      },
      "id": "webhook-search-performed",
      "name": "Webhook - Search Performed",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 900],
      "webhookId": "search-performed-webhook"
    },
    {
      "parameters": {
        "functionCode": "const inputData = items[0].json;\nconst { action, userId, data, timestamp } = inputData;\n\nconst engagementTypes = {\n  'car_viewed': { category: 'browsing', value: 1, intent: 'discovery', conversionPotential: 'low' },\n  'favorite_added': { category: 'interest', value: 5, intent: 'consideration', conversionPotential: 'medium' },\n  'message_sent': { category: 'contact', value: 10, intent: 'purchase', conversionPotential: 'high' },\n  'search_performed': { category: 'exploration', value: 2, intent: 'research', conversionPotential: 'low' }\n};\n\nconst engagementInfo = engagementTypes[action] || { category: 'other', value: 1, intent: 'unknown', conversionPotential: 'very_low' };\n\nconst carAnalysis = { carId: data?.carId, brand: data?.brand, model: data?.model, price: data?.price, year: data?.year, location: data?.location, priceRange: data?.price ? (data.price < 10000 ? 'budget' : data.price < 25000 ? 'mid-range' : data.price < 50000 ? 'premium' : 'luxury') : 'unknown' };\n\nlet buyerJourneyStage = 'awareness';\nif (action === 'search_performed' && data?.filters && Object.keys(data.filters).length > 0) { buyerJourneyStage = 'consideration'; }\nif (action === 'favorite_added') { buyerJourneyStage = 'consideration'; }\nif (action === 'message_sent') { buyerJourneyStage = 'decision'; }\n\nconst timeAnalysis = { timestamp: new Date(timestamp), hour: new Date(timestamp).getHours(), dayOfWeek: new Date(timestamp).getDay(), isBusinessHours: new Date(timestamp).getHours() >= 9 && new Date(timestamp).getHours() <= 17, isWeekend: [0, 6].includes(new Date(timestamp).getDay()), isPeakHours: [19, 20, 21].includes(new Date(timestamp).getHours()) };\n\nlet automatedActions = [];\nif (action === 'favorite_added') { automatedActions.push('send_price_drop_alert_subscription'); automatedActions.push('suggest_similar_cars'); }\nif (action === 'message_sent') { automatedActions.push('notify_seller_immediately'); automatedActions.push('track_response_time'); }\n\nconst engagementScore = { baseScore: engagementInfo.value, timeBonus: timeAnalysis.isPeakHours ? 2 : timeAnalysis.isBusinessHours ? 1 : 0, intentBonus: engagementInfo.conversionPotential === 'high' ? 5 : engagementInfo.conversionPotential === 'medium' ? 3 : 1, totalScore: engagementInfo.value + (timeAnalysis.isPeakHours ? 2 : timeAnalysis.isBusinessHours ? 1 : 0) + (engagementInfo.conversionPotential === 'high' ? 5 : engagementInfo.conversionPotential === 'medium' ? 3 : 1) };\n\nconst followUpPriority = { score: engagementScore.totalScore, level: engagementScore.totalScore > 15 ? 'urgent' : engagementScore.totalScore > 10 ? 'high' : engagementScore.totalScore > 5 ? 'medium' : 'low', timeframe: engagementScore.totalScore > 15 ? '1 hour' : engagementScore.totalScore > 10 ? '4 hours' : engagementScore.totalScore > 5 ? '24 hours' : '1 week' };\n\nreturn [{ json: { userId, action, engagementInfo, carAnalysis, buyerJourneyStage, timeAnalysis, automatedActions, engagementScore, followUpPriority, processedAt: new Date().toISOString(), requiresUrgentAction: followUpPriority.level === 'urgent' } }];"
      },
      "id": "analyze-engagement",
      "name": "Analyze User Engagement",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [500, 650]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.action}}",
              "value2": "message_sent"
            }
          ]
        }
      },
      "id": "is-message-sent",
      "name": "Is Message Sent?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [720, 650]
    },
    {
      "parameters": {
        "url": "https://fire-new-globul.firebaseapp.com/api/seller-notification",
        "authentication": "none",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"sellerId\": \"{{$json.carAnalysis.sellerId}}\",\n  \"carId\": \"{{$json.carAnalysis.carId}}\",\n  \"buyerId\": \"{{$json.userId}}\",\n  \"urgencyLevel\": \"high\",\n  \"timestamp\": \"{{$json.processedAt}}\"\n}",
        "options": {}
      },
      "id": "notify-seller",
      "name": "Notify Seller",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [940, 550],
      "continueOnFail": true
    },
    {
      "parameters": {
        "url": "https://fire-new-globul.firebaseapp.com/api/engagement-analytics",
        "authentication": "none",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"userId\": \"{{$json.userId}}\",\n  \"action\": \"{{$json.action}}\",\n  \"carAnalysis\": {{JSON.stringify($json.carAnalysis)}},\n  \"buyerJourneyStage\": \"{{$json.buyerJourneyStage}}\",\n  \"engagementScore\": {{JSON.stringify($json.engagementScore)}},\n  \"followUpPriority\": {{JSON.stringify($json.followUpPriority)}},\n  \"timestamp\": \"{{$json.processedAt}}\"\n}",
        "options": {}
      },
      "id": "log-engagement-analytics",
      "name": "Log Engagement Analytics",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [940, 750],
      "continueOnFail": true
    }
  ],
  "connections": {
    "Webhook - Car Viewed": { "main": [[ { "node": "Analyze User Engagement", "type": "main", "index": 0 } ]] },
    "Webhook - Favorite Added": { "main": [[ { "node": "Analyze User Engagement", "type": "main", "index": 0 } ]] },
    "Webhook - Message Sent": { "main": [[ { "node": "Analyze User Engagement", "type": "main", "index": 0 } ]] },
    "Webhook - Search Performed": { "main": [[ { "node": "Analyze User Engagement", "type": "main", "index": 0 } ]] },
    "Analyze User Engagement": { "main": [[ { "node": "Is Message Sent?", "type": "main", "index": 0 } ]] },
    "Is Message Sent?": { "main": [[ { "node": "Notify Seller", "type": "main", "index": 0 } ], [ { "node": "Log Engagement Analytics", "type": "main", "index": 0 } ]] },
    "Notify Seller": { "main": [[ { "node": "Log Engagement Analytics", "type": "main", "index": 0 } ]] }
  },
  "active": false,
  "settings": {},
  "versionId": "00000000-0000-0000-0000-000000000000"
}
```

---

## 📊 **Workflow 6: Business Intelligence & Admin**

### انسخ هذا الكود:

```json
{
  "name": "Globul Cars - Business Intelligence & Admin",
  "nodes": [
    {
      "parameters": {
        "path": "admin-login",
        "options": {}
      },
      "id": "webhook-admin-login",
      "name": "Webhook - Admin Login",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "webhookId": "admin-login-webhook"
    },
    {
      "parameters": {
        "path": "admin-action",
        "options": {}
      },
      "id": "webhook-admin-action",
      "name": "Webhook - Admin Action",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 500],
      "webhookId": "admin-action-webhook"
    },
    {
      "parameters": {
        "path": "analytics-viewed",
        "options": {}
      },
      "id": "webhook-analytics-viewed",
      "name": "Webhook - Analytics Viewed",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 700],
      "webhookId": "analytics-viewed-webhook"
    },
    {
      "parameters": {
        "path": "system-alert",
        "options": {}
      },
      "id": "webhook-system-alert",
      "name": "Webhook - System Alert",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 900],
      "webhookId": "system-alert-webhook"
    },
    {
      "parameters": {
        "functionCode": "const inputData = items[0].json;\nconst { action, adminId, data, timestamp } = inputData;\n\nconst adminActionTypes = {\n  'admin_login': { category: 'security', riskLevel: 'medium', requiresLogging: true, alertThreshold: 5 },\n  'admin_action': { category: 'management', riskLevel: 'high', requiresLogging: true, alertThreshold: 1 },\n  'analytics_viewed': { category: 'monitoring', riskLevel: 'low', requiresLogging: true, alertThreshold: 50 },\n  'system_alert': { category: 'incident', riskLevel: 'critical', requiresLogging: true, alertThreshold: 1 }\n};\n\nconst actionInfo = adminActionTypes[action] || { category: 'unknown', riskLevel: 'medium', requiresLogging: true, alertThreshold: 10 };\n\nconst adminAnalysis = { adminId, role: data?.role || 'admin', department: data?.department || 'general', accessLevel: data?.accessLevel || 'standard', loginMethod: data?.loginMethod || 'password', ipAddress: data?.ipAddress, userAgent: data?.userAgent, location: data?.location };\n\nconst securityAnalysis = { isNewLocation: data?.isNewLocation || false, isNewDevice: data?.isNewDevice || false, suspiciousActivity: data?.multipleFailedAttempts || false, outsideBusinessHours: new Date(timestamp).getHours() < 8 || new Date(timestamp).getHours() > 18, isWeekend: [0, 6].includes(new Date(timestamp).getDay()), riskScore: 0 };\n\nsecurityAnalysis.riskScore = (securityAnalysis.isNewLocation ? 20 : 0) + (securityAnalysis.isNewDevice ? 30 : 0) + (securityAnalysis.suspiciousActivity ? 50 : 0) + (securityAnalysis.outsideBusinessHours ? 10 : 0) + (securityAnalysis.isWeekend ? 5 : 0);\n\nconst businessImpact = { severity: actionInfo.riskLevel, usersAffected: data?.affectedUsers || 0, systemsAffected: data?.systemsAffected || [], downtime: data?.downtime || 0, revenueImpact: data?.affectedUsers > 100 ? 'high' : data?.affectedUsers > 10 ? 'medium' : 'low' };\n\nlet alertsRequired = [];\nif (securityAnalysis.riskScore > 50) { alertsRequired.push('high_risk_admin_activity'); }\nif (actionInfo.riskLevel === 'critical') { alertsRequired.push('critical_system_event'); }\nif (businessImpact.usersAffected > 100) { alertsRequired.push('high_impact_change'); }\n\nlet automatedActions = [];\nif (securityAnalysis.riskScore > 70) { automatedActions.push('require_additional_verification'); automatedActions.push('log_detailed_session'); }\nif (actionInfo.riskLevel === 'critical') { automatedActions.push('notify_all_admins'); automatedActions.push('create_incident_ticket'); }\n\nconst responseLevel = { priority: securityAnalysis.riskScore > 70 ? 'urgent' : actionInfo.riskLevel === 'critical' ? 'high' : securityAnalysis.riskScore > 30 ? 'medium' : 'low', timeframe: securityAnalysis.riskScore > 70 ? 'immediate' : actionInfo.riskLevel === 'critical' ? '15 minutes' : securityAnalysis.riskScore > 30 ? '1 hour' : '24 hours', escalation: securityAnalysis.riskScore > 90 || businessImpact.usersAffected > 500 };\n\nreturn [{ json: { adminId, action, actionInfo, adminAnalysis, securityAnalysis, businessImpact, alertsRequired, automatedActions, responseLevel, processedAt: new Date().toISOString(), requiresImmediateAction: responseLevel.priority === 'urgent' || responseLevel.escalation } }];"
      },
      "id": "analyze-admin-activity",
      "name": "Analyze Admin Activity",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [500, 650]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.actionInfo.riskLevel}}",
              "value2": "critical"
            }
          ]
        }
      },
      "id": "is-critical-event",
      "name": "Is Critical Event?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [720, 650]
    },
    {
      "parameters": {
        "url": "https://fire-new-globul.firebaseapp.com/api/critical-incident",
        "authentication": "none",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"adminId\": \"{{$json.adminId}}\",\n  \"action\": \"{{$json.action}}\",\n  \"severity\": \"{{$json.actionInfo.riskLevel}}\",\n  \"businessImpact\": {{JSON.stringify($json.businessImpact)}},\n  \"securityRisk\": {{$json.securityAnalysis.riskScore}},\n  \"alertsRequired\": {{JSON.stringify($json.alertsRequired)}},\n  \"responseLevel\": {{JSON.stringify($json.responseLevel)}},\n  \"timestamp\": \"{{$json.processedAt}}\"\n}",
        "options": {}
      },
      "id": "handle-critical-incident",
      "name": "Handle Critical Incident",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [940, 550],
      "continueOnFail": true
    },
    {
      "parameters": {
        "url": "https://fire-new-globul.firebaseapp.com/api/admin-analytics",
        "authentication": "none",
        "requestMethod": "POST",
        "jsonParameters": true,
        "bodyParametersJson": "={\n  \"adminId\": \"{{$json.adminId}}\",\n  \"action\": \"{{$json.action}}\",\n  \"securityAnalysis\": {{JSON.stringify($json.securityAnalysis)}},\n  \"businessImpact\": {{JSON.stringify($json.businessImpact)}},\n  \"responseLevel\": {{JSON.stringify($json.responseLevel)}},\n  \"timestamp\": \"{{$json.processedAt}}\"\n}",
        "options": {}
      },
      "id": "log-admin-analytics",
      "name": "Log Admin Analytics",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 1,
      "position": [940, 750],
      "continueOnFail": true
    }
  ],
  "connections": {
    "Webhook - Admin Login": { "main": [[ { "node": "Analyze Admin Activity", "type": "main", "index": 0 } ]] },
    "Webhook - Admin Action": { "main": [[ { "node": "Analyze Admin Activity", "type": "main", "index": 0 } ]] },
    "Webhook - Analytics Viewed": { "main": [[ { "node": "Analyze Admin Activity", "type": "main", "index": 0 } ]] },
    "Webhook - System Alert": { "main": [[ { "node": "Analyze Admin Activity", "type": "main", "index": 0 } ]] },
    "Analyze Admin Activity": { "main": [[ { "node": "Is Critical Event?", "type": "main", "index": 0 } ]] },
    "Is Critical Event?": { "main": [[ { "node": "Handle Critical Incident", "type": "main", "index": 0 } ], [ { "node": "Log Admin Analytics", "type": "main", "index": 0 } ]] },
    "Handle Critical Incident": { "main": [[ { "node": "Log Admin Analytics", "type": "main", "index": 0 } ]] }
  },
  "active": false,
  "settings": {},
  "versionId": "00000000-0000-0000-0000-000000000000"
}
```

---

## 🚀 **خطوات الاستيراد السريع**

### للـ 4 workflows:

1. **اذهب إلى**: https://globul-cars-bg.app.n8n.cloud
2. **كرر 4 مرات**:
   - `+ New Workflow`
   - `⋯` → `Import from JSON`
   - انسخ الكود
   - `Import` → `Save` → `Active`

### ✅ **النتيجة النهائية:**
- **6 workflows شاملة** (2 موجودة + 4 جديدة)
- **25+ webhook endpoints** نشطة
- **تغطية شاملة** لجميع جوانب المشروع
- **نظام أتمتة على مستوى عالمي** 🏆

---

**🎉 بعد الانتهاء ستحصل على أقوى نظام أتمتة لمشروع Globul Cars!** 🚀