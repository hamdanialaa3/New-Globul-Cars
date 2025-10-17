# 🔗 Globul Cars - n8n Webhooks Complete Reference

**Base URL:** `https://globul-cars-bg.app.n8n.cloud/webhook`

**Method for all:** `POST`  
**Content-Type:** `application/json`

---

## 📦 Workflow 1: Sell Process Started

### Endpoint: `/sell-started`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/sell-started`

**Body:**
```json
{
  "userId": "user-123",
  "timestamp": "2025-10-16T10:00:00Z",
  "source": "web_app",
  "userProfile": {
    "displayName": "أحمد محمد",
    "email": "ahmad@example.com",
    "language": "ar",
    "location": "София"
  }
}
```

---

## 🚗 Workflow 2: Vehicle Type Selected

### Endpoint: `/vehicle-type-selected`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/vehicle-type-selected`

**Body:**
```json
{
  "userId": "user-123",
  "vehicleType": "car",
  "timestamp": "2025-10-16T10:01:00Z",
  "sessionId": "session-456",
  "metadata": {
    "source": "sell_flow",
    "step": 1
  }
}
```

**Vehicle Types:** `car`, `truck`, `motorcycle`, `suv`, `van`, `bus`

---

## 📋 Workflow 3: Complete Sell Workflow

### 3.1 Endpoint: `/seller-type-selected`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/seller-type-selected`

**Body:**
```json
{
  "userId": "user-123",
  "sellerType": "private",
  "timestamp": "2025-10-16T10:02:00Z",
  "sessionId": "session-456"
}
```

**Seller Types:** `private`, `dealer`, `company`

---

### 3.2 Endpoint: `/vehicle-data-entered`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/vehicle-data-entered`

**Body:**
```json
{
  "userId": "user-123",
  "sessionId": "session-456",
  "vehicleData": {
    "make": "BMW",
    "model": "X5",
    "year": 2020,
    "mileage": 45000,
    "fuelType": "diesel",
    "transmission": "automatic",
    "color": "black",
    "vin": "WBAXXXXX123456789"
  },
  "timestamp": "2025-10-16T10:03:00Z"
}
```

---

### 3.3 Endpoint: `/equipment-selected`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/equipment-selected`

**Body:**
```json
{
  "userId": "user-123",
  "sessionId": "session-456",
  "equipment": [
    "air_conditioning",
    "navigation",
    "leather_seats",
    "sunroof",
    "parking_sensors",
    "cruise_control"
  ],
  "timestamp": "2025-10-16T10:04:00Z"
}
```

---

### 3.4 Endpoint: `/images-uploaded`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/images-uploaded`

**Body:**
```json
{
  "userId": "user-123",
  "sessionId": "session-456",
  "images": [
    {
      "url": "https://storage.googleapis.com/globul-cars/car-front.jpg",
      "type": "exterior",
      "order": 1
    },
    {
      "url": "https://storage.googleapis.com/globul-cars/car-interior.jpg",
      "type": "interior",
      "order": 2
    },
    {
      "url": "https://storage.googleapis.com/globul-cars/car-engine.jpg",
      "type": "engine",
      "order": 3
    }
  ],
  "totalImages": 3,
  "timestamp": "2025-10-16T10:05:00Z"
}
```

---

### 3.5 Endpoint: `/price-set`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/price-set`

**Body:**
```json
{
  "userId": "user-123",
  "sessionId": "session-456",
  "price": 35000,
  "currency": "EUR",
  "negotiable": true,
  "timestamp": "2025-10-16T10:06:00Z"
}
```

---

### 3.6 Endpoint: `/contact-info-entered`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/contact-info-entered`

**Body:**
```json
{
  "userId": "user-123",
  "sessionId": "session-456",
  "contactInfo": {
    "name": "أحمد محمد",
    "phone": "+359888123456",
    "email": "ahmad@example.com",
    "preferredContact": "phone",
    "availableHours": "09:00-18:00"
  },
  "timestamp": "2025-10-16T10:07:00Z"
}
```

---

### 3.7 Endpoint: `/listing-published`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/listing-published`

**Body:**
```json
{
  "userId": "user-123",
  "sessionId": "session-456",
  "listingId": "listing-789",
  "status": "published",
  "publishedAt": "2025-10-16T10:08:00Z",
  "autoRenew": true,
  "expiresAt": "2025-11-16T10:08:00Z"
}
```

---

## 👤 Workflow 4: User Tracking & Management

### 4.1 Endpoint: `/user-registered`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/user-registered`

**Body:**
```json
{
  "userId": "user-123",
  "email": "ahmad@example.com",
  "displayName": "أحمد محمد",
  "registrationMethod": "email",
  "timestamp": "2025-10-16T10:00:00Z",
  "profile": {
    "language": "ar",
    "currency": "EUR",
    "location": "София",
    "phoneVerified": false
  }
}
```

**Registration Methods:** `email`, `google`, `facebook`, `phone`

---

### 4.2 Endpoint: `/user-logged-in`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/user-logged-in`

**Body:**
```json
{
  "userId": "user-123",
  "timestamp": "2025-10-16T10:10:00Z",
  "loginMethod": "email",
  "deviceInfo": {
    "type": "desktop",
    "os": "Windows",
    "browser": "Chrome",
    "ip": "203.0.113.10"
  },
  "sessionId": "session-789"
}
```

---

### 4.3 Endpoint: `/profile-updated`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/profile-updated`

**Body:**
```json
{
  "userId": "user-123",
  "timestamp": "2025-10-16T10:15:00Z",
  "updatedFields": [
    "phone",
    "location",
    "language"
  ],
  "changes": {
    "phone": {
      "old": null,
      "new": "+359888123456"
    },
    "location": {
      "old": "София",
      "new": "Пловдив"
    }
  }
}
```

---

### 4.4 Endpoint: `/listing-created`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/listing-created`

**Body:**
```json
{
  "userId": "user-123",
  "listingId": "listing-789",
  "vehicleType": "car",
  "make": "BMW",
  "model": "X5",
  "year": 2020,
  "price": 35000,
  "currency": "EUR",
  "timestamp": "2025-10-16T10:20:00Z",
  "status": "draft"
}
```

---

## 💬 Workflow 5: User Engagement & Interaction

### 5.1 Endpoint: `/car-viewed`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/car-viewed`

**Body:**
```json
{
  "userId": "user-123",
  "carId": "car-456",
  "timestamp": "2025-10-16T10:25:00Z",
  "viewDuration": 45,
  "source": "search_results",
  "deviceType": "mobile",
  "sessionId": "session-789"
}
```

**Sources:** `search_results`, `homepage`, `category`, `direct_link`, `favorites`

---

### 5.2 Endpoint: `/favorite-added`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/favorite-added`

**Body:**
```json
{
  "userId": "user-123",
  "carId": "car-456",
  "timestamp": "2025-10-16T10:26:00Z",
  "source": "listing_page",
  "totalFavorites": 5
}
```

---

### 5.3 Endpoint: `/message-sent`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/message-sent`

**Body:**
```json
{
  "event": "message_sent",
  "messageId": "msg-001",
  "chatId": "chat-123",
  "carId": "car-456",
  "senderId": "user-123",
  "receiverId": "seller-789",
  "text": "مرحبا، هل السيارة متاحة؟",
  "language": "ar",
  "timestamp": "2025-10-16T10:27:00Z",
  "priceOffer": 32000,
  "attachments": []
}
```

---

### 5.4 Endpoint: `/search-performed`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/search-performed`

**Body:**
```json
{
  "userId": "user-123",
  "timestamp": "2025-10-16T10:28:00Z",
  "searchQuery": {
    "make": "BMW",
    "model": "X5",
    "yearFrom": 2018,
    "yearTo": 2023,
    "priceFrom": 25000,
    "priceTo": 40000,
    "location": "София"
  },
  "resultsCount": 15,
  "sessionId": "session-789"
}
```

---

## 🔐 Workflow 6: Business Intelligence & Admin

### 6.1 Endpoint: `/admin-login`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/admin-login`

**Body:**
```json
{
  "action": "admin_login",
  "adminId": "admin-1",
  "timestamp": "2025-10-16T10:00:00Z",
  "data": {
    "isNewLocation": false,
    "isNewDevice": false,
    "multipleFailedAttempts": false,
    "ip": "203.0.113.10",
    "location": "София"
  }
}
```

---

### 6.2 Endpoint: `/admin-action`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/admin-action`

**Body:**
```json
{
  "action": "admin_action",
  "adminId": "admin-1",
  "timestamp": "2025-10-16T10:30:00Z",
  "data": {
    "operation": "delete_listing",
    "targetId": "listing-789",
    "reason": "spam",
    "ip": "203.0.113.10",
    "isNewDevice": false
  }
}
```

**Operations:** `delete_listing`, `ban_user`, `approve_listing`, `edit_user`, `system_config_change`

---

### 6.3 Endpoint: `/analytics-viewed`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/analytics-viewed`

**Body:**
```json
{
  "action": "analytics_viewed",
  "adminId": "admin-1",
  "timestamp": "2025-10-16T10:35:00Z",
  "data": {
    "view": "sales_dashboard",
    "filters": {
      "period": "7d",
      "metrics": ["revenue", "active_listings", "new_users"]
    },
    "exportedData": false
  }
}
```

---

### 6.4 Endpoint: `/system-alert`
**Full URL:** `https://globul-cars-bg.app.n8n.cloud/webhook/system-alert`

**Body:**
```json
{
  "action": "system_alert",
  "adminId": "admin-1",
  "timestamp": "2025-10-16T10:40:00Z",
  "data": {
    "severity": "critical",
    "alertType": "security_breach",
    "message": "Multiple failed admin login attempts detected",
    "multipleFailedAttempts": true,
    "affectedUsers": ["admin-1", "admin-2"],
    "autoResolved": false
  }
}
```

**Severity Levels:** `low`, `medium`, `high`, `critical`  
**Alert Types:** `security_breach`, `system_down`, `data_anomaly`, `performance_issue`

---

## 📊 Testing Tips

### Using Apidog/Postman:
1. Set base URL variable: `baseUrl = https://globul-cars-bg.app.n8n.cloud/webhook`
2. Use `{{baseUrl}}/endpoint-name` in requests
3. Set Method to POST
4. Set Content-Type to `application/json`
5. Paste the body examples above

### Verify in n8n:
- Open: https://globul-cars-bg.app.n8n.cloud
- Go to: Executions
- Check for new entries after each POST request
- Click on execution to see flow details

### Expected Results:
- **Status 200** from webhook
- **Execution appears** in n8n Executions
- **Nodes execute** (Analyze → IF → HTTP)
- **0% failure rate** (check Dashboard)

---

## 🔗 Quick Reference URLs

```
# Sell Flow
POST https://globul-cars-bg.app.n8n.cloud/webhook/sell-started
POST https://globul-cars-bg.app.n8n.cloud/webhook/vehicle-type-selected
POST https://globul-cars-bg.app.n8n.cloud/webhook/seller-type-selected
POST https://globul-cars-bg.app.n8n.cloud/webhook/vehicle-data-entered
POST https://globul-cars-bg.app.n8n.cloud/webhook/equipment-selected
POST https://globul-cars-bg.app.n8n.cloud/webhook/images-uploaded
POST https://globul-cars-bg.app.n8n.cloud/webhook/price-set
POST https://globul-cars-bg.app.n8n.cloud/webhook/contact-info-entered
POST https://globul-cars-bg.app.n8n.cloud/webhook/listing-published

# User Management
POST https://globul-cars-bg.app.n8n.cloud/webhook/user-registered
POST https://globul-cars-bg.app.n8n.cloud/webhook/user-logged-in
POST https://globul-cars-bg.app.n8n.cloud/webhook/profile-updated
POST https://globul-cars-bg.app.n8n.cloud/webhook/listing-created

# Engagement
POST https://globul-cars-bg.app.n8n.cloud/webhook/car-viewed
POST https://globul-cars-bg.app.n8n.cloud/webhook/favorite-added
POST https://globul-cars-bg.app.n8n.cloud/webhook/message-sent
POST https://globul-cars-bg.app.n8n.cloud/webhook/search-performed

# Admin & BI
POST https://globul-cars-bg.app.n8n.cloud/webhook/admin-login
POST https://globul-cars-bg.app.n8n.cloud/webhook/admin-action
POST https://globul-cars-bg.app.n8n.cloud/webhook/analytics-viewed
POST https://globul-cars-bg.app.n8n.cloud/webhook/system-alert
```

---

## 📝 Notes

- All timestamps should be ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- User IDs, session IDs, and other IDs should be unique strings
- Currency is always `EUR` for Bulgarian market
- Phone numbers use `+359` prefix for Bulgaria
- Language codes: `bg` (Bulgarian), `en` (English), `ar` (Arabic)

---

**Total Endpoints:** 21  
**Active Workflows:** 6  
**Success Rate:** 100% ✅
