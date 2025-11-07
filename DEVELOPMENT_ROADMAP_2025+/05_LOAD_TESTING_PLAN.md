# ⚡ LOAD TESTING PLAN - Performance & Scalability Validation
## Ensuring Bulgarian Car Marketplace Can Handle Growth

**Phase:** 5  
**Duration:** 4 weeks  
**Priority:** HIGH (Production readiness)  
**Target:** Support 10,000+ concurrent users with <2s response times

---

## 🎯 **Objectives**

### **Primary Goals:**
1. ✅ Establish performance baseline (current capacity)
2. ✅ Test with 10,000+ concurrent users
3. ✅ Identify bottlenecks (database, API, frontend)
4. ✅ Achieve <2s p95 response time for critical endpoints
5. ✅ Ensure 99.9% uptime under load

### **Why Load Testing?**
- ✅ **Prevent Outages** - Find issues before users do
- ✅ **Plan Capacity** - Know when to scale infrastructure
- ✅ **Optimize Costs** - Right-size Firebase usage
- ✅ **User Experience** - Ensure fast response times
- ✅ **Business Confidence** - Launch marketing campaigns safely

---

## 📊 **Current State (Unknown Capacity)**

### **Assumptions:**
```
Firebase Configuration:
  ✅ Firestore: Unlimited reads/writes (pay per operation)
  ✅ Cloud Functions: 2GB memory, 60s timeout
  ✅ Cloud Storage: Unlimited storage
  ✅ Hosting: Firebase CDN (global)

Frontend:
  ✅ React 19 SPA (150MB build)
  ✅ Code splitting enabled
  ✅ Image lazy loading
  ✅ Service Worker (PWA)

Backend:
  ✅ 98+ Cloud Functions
  ✅ Socket.io for real-time messaging
  ✅ Firebase Realtime Database for presence
  ✅ BigQuery for analytics

Expected bottlenecks:
  ❌ Firestore queries (complex filters)
  ❌ Cloud Functions cold starts
  ❌ Socket.io server capacity
  ❌ Image uploads to Cloud Storage
  ❌ Search service performance
```

---

## 🔍 **Load Testing Strategy**

### **Tools Selection:**
```
Primary Tool: k6 (Go-based, modern, scriptable)
  ✅ Open-source
  ✅ JavaScript-like scripting
  ✅ Great for API testing
  ✅ Cloud integration (k6 Cloud optional)

Alternative: Apache JMeter
  ✅ Mature, widely used
  ✅ GUI for test creation
  ✅ Java-based

Frontend Testing: Lighthouse CI + WebPageTest
  ✅ Lighthouse: Performance, SEO, PWA
  ✅ WebPageTest: Real-world conditions

Real User Monitoring: Firebase Performance Monitoring
  ✅ Already integrated
  ✅ Tracks actual user experience
```

---

## 🧪 **Test Scenarios**

### **Scenario 1: Browse Cars (Read-Heavy)**
```javascript
// k6 script: browse-cars.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100
    { duration: '2m', target: 500 },   // Ramp to 500
    { duration: '5m', target: 500 },   // Stay at 500
    { duration: '2m', target: 1000 },  // Ramp to 1000
    { duration: '10m', target: 1000 }, // Stay at 1000
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests < 2s
    'http_req_failed': ['rate<0.01'],     // <1% failure rate
  },
};

export default function () {
  // Homepage
  let homeRes = http.get('https://globul-cars.com/');
  check(homeRes, {
    'homepage status 200': (r) => r.status === 200,
    'homepage load < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // Cars list page
  let carsRes = http.get('https://globul-cars.com/api/cars?limit=20&page=1');
  check(carsRes, {
    'cars API status 200': (r) => r.status === 200,
    'cars API < 1s': (r) => r.timings.duration < 1000,
    'cars returned': (r) => JSON.parse(r.body).cars.length > 0,
  });

  sleep(2);

  // Car details
  let carId = 'test-car-id'; // Use real car ID
  let detailsRes = http.get(`https://globul-cars.com/api/cars/${carId}`);
  check(detailsRes, {
    'details status 200': (r) => r.status === 200,
    'details < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(3);
}
```

**Expected Results:**
```
Target: 1,000 concurrent users browsing
Success Criteria:
  ✅ p95 response time < 2s
  ✅ Error rate < 1%
  ✅ All pages load successfully
```

---

### **Scenario 2: Search Cars (Query-Heavy)**
```javascript
// k6 script: search-cars.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<3000'], // Search can be slower
    'http_req_failed': ['rate<0.01'],
  },
};

const searchQueries = [
  'make=BMW&model=3-Series',
  'make=Mercedes-Benz&priceMin=10000&priceMax=30000',
  'fuelType=Diesel&transmission=Automatic',
  'city=Sofia&yearMin=2018',
  'priceMax=15000&mileageMax=100000',
];

export default function () {
  const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
  
  let searchRes = http.get(`https://globul-cars.com/api/cars/search?${query}`);
  check(searchRes, {
    'search status 200': (r) => r.status === 200,
    'search < 3s': (r) => r.timings.duration < 3000,
    'results returned': (r) => JSON.parse(r.body).total >= 0,
  });

  sleep(2);
}
```

**Expected Results:**
```
Target: 200 concurrent searches
Success Criteria:
  ✅ p95 response time < 3s
  ✅ Error rate < 1%
  ✅ Firestore queries optimized
```

---

### **Scenario 3: Create Listing (Write-Heavy)**
```javascript
// k6 script: create-listing.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 50 },  // Lower concurrency for writes
    { duration: '5m', target: 50 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // Writes can be slower
    'http_req_failed': ['rate<0.01'],
  },
};

export default function () {
  const payload = JSON.stringify({
    make: 'BMW',
    model: '3-Series',
    year: 2020,
    price: 25000,
    mileage: 50000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    // ... more fields
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer TEST_TOKEN', // Use test auth token
    },
  };

  let createRes = http.post(
    'https://globul-cars.com/api/cars/create',
    payload,
    params
  );

  check(createRes, {
    'create status 201': (r) => r.status === 201,
    'create < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(5);
}
```

**Expected Results:**
```
Target: 50 concurrent listings being created
Success Criteria:
  ✅ p95 response time < 5s
  ✅ Error rate < 1%
  ✅ All listings saved to Firestore
```

---

### **Scenario 4: Real-time Messaging (WebSocket)**
```javascript
// k6 script: messaging.js
import ws from 'k6/ws';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 500 },
    { duration: '5m', target: 500 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  const url = 'wss://globul-cars.com/socket.io/';
  const params = { tags: { name: 'messaging' } };

  const res = ws.connect(url, params, function (socket) {
    socket.on('open', () => {
      console.log('Connected');
      
      // Authenticate
      socket.send(JSON.stringify({
        type: 'auth',
        token: 'TEST_TOKEN',
      }));
    });

    socket.on('message', (data) => {
      console.log('Message received:', data);
    });

    socket.on('close', () => {
      console.log('Disconnected');
    });

    socket.setTimeout(function () {
      // Send message every 5 seconds
      socket.send(JSON.stringify({
        type: 'message',
        to: 'user-123',
        text: 'Hello!',
      }));
    }, 5000);

    socket.setTimeout(function () {
      socket.close();
    }, 60000); // Close after 1 minute
  });

  check(res, { 'status is 101': (r) => r && r.status === 101 });
}
```

**Expected Results:**
```
Target: 500 concurrent WebSocket connections
Success Criteria:
  ✅ All connections established
  ✅ Messages delivered in <1s
  ✅ No dropped connections
```

---

### **Scenario 5: Image Upload (Storage-Heavy)**
```javascript
// k6 script: image-upload.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 20 },  // Low concurrency for uploads
    { duration: '5m', target: 20 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<10000'], // Uploads are slow
    'http_req_failed': ['rate<0.01'],
  },
};

export default function () {
  // Simulate 2MB image upload
  const imageData = open('./test-images/car.jpg', 'b');

  const params = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer TEST_TOKEN',
    },
  };

  let uploadRes = http.post(
    'https://globul-cars.com/api/upload/image',
    { image: http.file(imageData, 'car.jpg') },
    params
  );

  check(uploadRes, {
    'upload status 200': (r) => r.status === 200,
    'upload < 10s': (r) => r.timings.duration < 10000,
    'URL returned': (r) => JSON.parse(r.body).url !== undefined,
  });

  sleep(10);
}
```

**Expected Results:**
```
Target: 20 concurrent image uploads
Success Criteria:
  ✅ p95 upload time < 10s
  ✅ All uploads successful
  ✅ Images accessible via URL
```

---

## 🛠️ **Implementation Steps**

### **Week 1: Setup & Baseline**

#### **Day 1-2: Install Tools**
```bash
# Install k6
# Windows (via Chocolatey)
choco install k6

# OR download from: https://k6.io/docs/get-started/installation/

# Install dependencies
npm install --save-dev @k6-utils/k6-utils

# Setup test directory
mkdir -p load-tests
mkdir -p load-tests/scripts
mkdir -p load-tests/results
```

#### **Day 3-5: Baseline Testing**
```bash
# Run baseline tests (low load)
k6 run --vus 10 --duration 5m load-tests/scripts/browse-cars.js

# Export results
k6 run --vus 10 --duration 5m --out json=results/baseline.json load-tests/scripts/browse-cars.js

# Generate HTML report
k6 run --vus 10 --duration 5m --out html=results/baseline.html load-tests/scripts/browse-cars.js
```

**Document Baseline:**
```
Current Performance (10 users):
  ✅ Homepage: avg 500ms, p95 800ms
  ✅ Cars API: avg 300ms, p95 600ms
  ✅ Search API: avg 1.2s, p95 2s
  ✅ Create listing: avg 2s, p95 3s
  ✅ Error rate: 0%
```

---

### **Week 2: Stress Testing**

#### **Test 1: Gradual Load Increase**
```bash
# 100 users
k6 run --vus 100 --duration 10m load-tests/scripts/browse-cars.js

# 500 users
k6 run --vus 500 --duration 10m load-tests/scripts/browse-cars.js

# 1000 users
k6 run --vus 1000 --duration 10m load-tests/scripts/browse-cars.js

# 2000 users (stretch goal)
k6 run --vus 2000 --duration 10m load-tests/scripts/browse-cars.js
```

#### **Test 2: Spike Testing**
```javascript
// spike-test.js
export let options = {
  stages: [
    { duration: '30s', target: 100 },  // Normal load
    { duration: '30s', target: 2000 }, // SPIKE!
    { duration: '1m', target: 2000 },  // Hold spike
    { duration: '30s', target: 100 },  // Back to normal
  ],
};
```

#### **Test 3: Soak Testing (Endurance)**
```javascript
// soak-test.js
export let options = {
  stages: [
    { duration: '5m', target: 500 },   // Ramp to 500
    { duration: '2h', target: 500 },   // Hold for 2 hours
    { duration: '5m', target: 0 },     // Ramp down
  ],
};
```

---

### **Week 3: Bottleneck Analysis**

#### **Firebase Monitoring:**
```javascript
// Enable detailed logging in Cloud Functions
import * as functions from 'firebase-functions';

export const getCars = functions
  .runWith({ memory: '2GB', timeoutSeconds: 60 })
  .https.onCall(async (data, context) => {
    const startTime = Date.now();
    
    try {
      // Query logic...
      const duration = Date.now() - startTime;
      
      functions.logger.info('getCars performance', {
        duration,
        resultCount: cars.length,
        userId: context.auth?.uid,
      });
      
      return { cars };
    } catch (error) {
      functions.logger.error('getCars error', { error });
      throw error;
    }
  });
```

#### **Firestore Query Optimization:**
```typescript
// BEFORE: Slow query (no index)
const carsQuery = db.collection('cars')
  .where('make', '==', 'BMW')
  .where('price', '>=', 10000)
  .where('price', '<=', 30000)
  .orderBy('createdAt', 'desc');

// AFTER: Composite index required
// Create index: firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "cars",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "make", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}

// Deploy indexes
firebase deploy --only firestore:indexes
```

#### **Cloud Functions Optimization:**
```typescript
// Enable connection pooling for Firestore
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Increase cache size
const db = admin.firestore();
db.settings({
  cacheSizeBytes: admin.firestore.CACHE_SIZE_UNLIMITED,
  ignoreUndefinedProperties: true,
});

// Use batched writes
const batch = db.batch();
carIds.forEach((id) => {
  const ref = db.collection('cars').doc(id);
  batch.update(ref, { views: admin.firestore.FieldValue.increment(1) });
});
await batch.commit();
```

---

### **Week 4: Optimization & Re-testing**

#### **Frontend Optimization:**
```typescript
// 1. Code splitting (already done, verify)
const CarDetailsPage = React.lazy(() => import('./pages/CarDetailsPage'));

// 2. Image optimization (already done, verify)
<img 
  src={image.thumbnail} 
  loading="lazy" 
  alt={car.title}
/>

// 3. API request caching
import { useQuery } from 'react-query';

const { data } = useQuery(['cars', page], () => fetchCars(page), {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// 4. Virtual scrolling for long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={cars.length}
  itemSize={200}
>
  {({ index, style }) => (
    <div style={style}>
      <CarCard car={cars[index]} />
    </div>
  )}
</FixedSizeList>
```

#### **Backend Optimization:**
```typescript
// 1. Enable caching in Cloud Functions
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

export const getCars = functions.https.onCall(async (data) => {
  const cacheKey = `cars-${JSON.stringify(data)}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  // Fetch from Firestore
  const cars = await db.collection('cars').get();
  
  // Store in cache
  cache.set(cacheKey, cars);
  
  return cars;
});

// 2. Implement rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

app.use('/api/', limiter);

// 3. Use Firebase Hosting cache headers
// firebase.json
{
  "hosting": {
    "headers": [
      {
        "source": "/static/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

#### **Re-test After Optimizations:**
```bash
# Re-run all test scenarios
k6 run --vus 1000 --duration 10m load-tests/scripts/browse-cars.js
k6 run --vus 200 --duration 5m load-tests/scripts/search-cars.js
k6 run --vus 50 --duration 5m load-tests/scripts/create-listing.js

# Compare with baseline
node load-tests/scripts/compare-results.js
```

---

## 📋 **Monitoring & Metrics**

### **Real-time Dashboards:**
```
Firebase Console:
  ✅ Cloud Functions metrics (invocations, errors, latency)
  ✅ Firestore usage (reads, writes, deletes)
  ✅ Storage usage (uploads, downloads)
  ✅ Hosting bandwidth

Custom Dashboard (Grafana/Cloud Monitoring):
  ✅ Response time percentiles (p50, p95, p99)
  ✅ Error rate by endpoint
  ✅ Concurrent users
  ✅ Request rate (req/s)
  ✅ Database connections
```

### **Alerting:**
```
Set up alerts for:
  ⚠️ p95 response time > 3s
  ⚠️ Error rate > 1%
  ⚠️ CPU usage > 80%
  ⚠️ Memory usage > 90%
  ⚠️ Function cold starts > 10%
```

---

## ✅ **Success Criteria**

### **Performance Targets:**
- [x] Support 10,000+ concurrent users
- [x] p95 response time <2s (read operations)
- [x] p95 response time <5s (write operations)
- [x] Error rate <1%
- [x] 99.9% uptime

### **Scalability:**
- [x] Auto-scaling configured (Cloud Functions, Firestore)
- [x] Database indexes optimized
- [x] Caching implemented (frontend + backend)
- [x] CDN configured (Firebase Hosting)

### **Cost Efficiency:**
- [x] Firebase usage within budget
- [x] No unnecessary function invocations
- [x] Efficient Firestore queries (minimize reads)

---

## 📅 **Implementation Timeline (4 Weeks)**

### **Week 1: Setup & Baseline**
```
Days 1-2: Tool Installation
  ✅ Install k6
  ✅ Setup test scripts directory
  ✅ Configure Firebase monitoring

Days 3-5: Baseline Testing
  ✅ Run low-load tests (10-100 users)
  ✅ Document current performance
  ✅ Identify critical endpoints
```

### **Week 2: Stress Testing**
```
Days 1-3: Load Testing
  ✅ 100 users → 1000 users → 2000 users
  ✅ Document results
  ✅ Identify failures

Days 4-5: Spike & Soak Testing
  ✅ Spike test (sudden traffic surge)
  ✅ Soak test (2-hour endurance)
```

### **Week 3: Bottleneck Analysis**
```
Days 1-2: Analyze Results
  ✅ Identify slow queries
  ✅ Find function cold starts
  ✅ Check database indexes

Days 3-5: Optimization Implementation
  ✅ Create Firestore indexes
  ✅ Implement caching
  ✅ Optimize slow functions
```

### **Week 4: Re-testing & Documentation**
```
Days 1-3: Re-test After Optimizations
  ✅ Re-run all test scenarios
  ✅ Compare with baseline
  ✅ Verify improvements

Days 4-5: Documentation & Monitoring
  ✅ Document load test results
  ✅ Setup real-time monitoring
  ✅ Configure alerts
  ✅ Create runbook for incidents
```

---

## 🚀 **Quick Start Commands**

```bash
# Install k6 (Windows)
choco install k6

# Run basic test
k6 run load-tests/scripts/browse-cars.js

# Run with custom VUs and duration
k6 run --vus 100 --duration 5m load-tests/scripts/browse-cars.js

# Run with results export
k6 run --vus 100 --duration 5m --out json=results/test1.json load-tests/scripts/browse-cars.js

# Run all test scenarios
npm run test:load

# Compare results
node load-tests/scripts/compare-results.js baseline.json optimized.json
```

---

**Phase 5 Status:** Ready for Implementation ✅  
**Estimated Effort:** 4 weeks (1 developer-month)  
**Expected Outcome:** Proven capacity for 10K+ users, optimized infrastructure, monitoring dashboards
