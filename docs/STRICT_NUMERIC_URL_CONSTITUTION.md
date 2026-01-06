# 🏛️ PROJECT CONSTITUTION - STRICT URL ARCHITECTURE
## Bulgarian Car Marketplace URL Schema

**Last Updated:** January 6, 2026  
**Status:** ✅ ENFORCED - All URLs must follow this pattern

---

## 1️⃣ CORE ROUTING PRINCIPLES

### User Profile URLs
**Pattern:** `/profile/{numericId}`

```
✅ CORRECT: http://localhost:3000/profile/90
❌ WRONG:   http://localhost:3000/profile/uuid-abc-123
❌ WRONG:   http://localhost:3000/user/90
```

**Implementation:**
```typescript
import { getProfileUrl } from '@/utils/routing-utils';

const url = getProfileUrl({ numericId: 90 });
// Returns: "/profile/90"
```

---

### Vehicle Listing URLs (Hierarchical Structure)
**Pattern:** `/car/{sellerNumericId}/{carNumericId}`

The URL contains:
1. **sellerNumericId** - The user's numeric ID who posted the listing
2. **carNumericId** - The sequential car number for that specific user

```
✅ CORRECT: http://localhost:3000/car/90/5
❌ WRONG:   http://localhost:3000/car-details/uuid-abc-123
❌ WRONG:   http://localhost:3000/car/5
```

**Real-World Examples:**
- User 90's first car: `/car/90/1`
- User 90's fifth car: `/car/90/5`
- User 1's first car: `/car/1/1`

**Implementation:**
```typescript
import { getCarDetailsUrl } from '@/utils/routing-utils';

const url = getCarDetailsUrl({ 
  sellerNumericId: 90, 
  carNumericId: 5 
});
// Returns: "/car/90/5"
```

---

### Car Edit URLs
**Pattern:** `/car/{sellerNumericId}/{carNumericId}/edit`

```
✅ CORRECT: http://localhost:3000/car/90/5/edit
❌ WRONG:   http://localhost:3000/edit-car/uuid-abc-123
❌ WRONG:   http://localhost:3000/car/90/5?mode=edit
```

**Implementation:**
```typescript
import { buildStrictEditUrl } from '@/utils/constitution-audit';

const url = buildStrictEditUrl({ 
  sellerNumericId: 90, 
  carNumericId: 5 
});
// Returns: "/car/90/5/edit"
```

---

### Messaging System URLs
**Pattern:** `/messages/{senderNumericId}/{recipientNumericId}`

**Trigger Context:**
- Initiated from Vehicle Page (`/car/90/5`) or Profile Page (`/profile/90`)
- When User B clicks "Message" on User A's listing:
  - Opens dedicated chat context between User A and User B
  - Context preserves reference to specific car

```
✅ CORRECT: http://localhost:3000/messages/1/90
❌ WRONG:   http://localhost:3000/messages?conversation=abc-123
❌ WRONG:   http://localhost:3000/chat/90
```

**Implementation:**
```typescript
import { getMessagesUrl } from '@/utils/routing-utils';

const url = getMessagesUrl(
  { numericId: 1 },  // sender
  { numericId: 90 }  // recipient
);
// Returns: "/messages/1/90"
```

---

## 2️⃣ ENFORCEMENT MECHANISMS

### Validation Tools
```typescript
import { auditUrl, buildStrictCarUrl } from '@/utils/constitution-audit';

// Audit existing URL
const audit = auditUrl('/car/90/5');
// Returns: { compliant: true, type: 'car', issues: [] }

// Build safe URL
const url = buildStrictCarUrl({ 
  sellerNumericId: 90, 
  carNumericId: 5 
});
// Returns: "/car/90/5" or null if invalid
```

### Runtime Validation
The system automatically:
1. **Validates** all numeric IDs before generating URLs
2. **Logs warnings** when legacy UUID patterns are detected
3. **Redirects** malformed URLs to fallback pages
4. **Blocks** URL generation if numeric IDs are missing

---

## 3️⃣ MIGRATION FROM LEGACY PATTERNS

### Legacy Patterns (Deprecated)
```typescript
❌ /car-details/{uuid}          → Use /car/{seller}/{car}
❌ /profile?userId={uuid}       → Use /profile/{numericId}
❌ /messages?conversationId=... → Use /messages/{id1}/{id2}
```

### Automatic Redirects
The `NumericIdGuard` component automatically redirects legacy URLs:

```typescript
// User visits: /car-details/abc-123-uuid
// Resolves numeric IDs and redirects to: /car/90/5
```

---

## 4️⃣ FIRESTORE DATA STRUCTURE

### User Document
```typescript
{
  uid: "firebase-uid-abc-123",        // Firebase Auth ID
  numericId: 90,                      // ✅ Public URL ID
  email: "user@example.com",
  // ... other fields
}
```

### Car Document
```typescript
{
  id: "firestore-doc-id",             // Firestore document ID
  sellerId: "firebase-uid-abc-123",   // Firebase Auth ID
  sellerNumericId: 90,                // ✅ Public URL ID (user)
  carNumericId: 5,                    // ✅ Public URL ID (car sequence)
  // ... other fields
}
```

### ID Assignment
Numeric IDs are assigned automatically during:
1. **User Registration** - `numericId` counter incremented
2. **Car Creation** - `carNumericId` counter incremented per user

**Service:** `numeric-id-assignment.service.ts`

---

## 5️⃣ ROUTING IMPLEMENTATION

### Route Definitions
**File:** `src/routes/MainRoutes.tsx`

```typescript
// ✅ Strict Numeric Car URLs
<Route 
  path="/car/:sellerNumericId/:carNumericId" 
  element={<NumericCarDetailsPage />} 
/>

<Route 
  path="/car/:sellerNumericId/:carNumericId/edit" 
  element={<AuthGuard><EditCarPage /></AuthGuard>} 
/>

<Route 
  path="/car/:sellerNumericId/:carNumericId/not-found" 
  element={<CarNotFoundPage />} 
/>

// ✅ Numeric Profile URLs
<Route 
  path="/profile/*" 
  element={<NumericProfileRouter />} 
/>

// ✅ Numeric Messaging URLs
<Route 
  path="/messages/:id1?/:id2?" 
  element={<AuthGuard><MessagesPage /></AuthGuard>} 
/>
```

---

## 6️⃣ CONSTITUTION VIOLATIONS

### Common Violations
1. **Using UUIDs in URLs** - Always use numeric IDs
2. **Missing numeric ID fields** - Ensure all documents have them
3. **Hardcoding URLs** - Always use routing utilities
4. **Legacy /car-details/ pattern** - Update to /car/{seller}/{car}

### Detection
The logger will warn about violations:
```
CONSTITUTION VIOLATION: Car missing numeric IDs
CONSTITUTION VIOLATION: Invalid user numeric ID
```

### Fix Procedure
1. Check document in Firestore for missing numeric IDs
2. Run migration script if needed: `npm run migrate:legacy-cars`
3. Update code to use routing utilities

---

## 7️⃣ TESTING CONSTITUTION COMPLIANCE

### Manual Testing
```bash
# Valid URLs (should work)
http://localhost:3000/profile/90
http://localhost:3000/car/90/5
http://localhost:3000/car/90/5/edit
http://localhost:3000/messages/1/90

# Invalid URLs (should redirect/fallback)
http://localhost:3000/profile/abc-123-uuid
http://localhost:3000/car-details/abc-123
http://localhost:3000/car/90          # Missing carNumericId
```

### Automated Audit
```typescript
import { logUrlPatterns } from '@/utils/constitution-audit';

// In component
const urls = [
  '/car/90/5',
  '/car/90/5/edit',
  '/profile/90'
];

logUrlPatterns('MyComponent', urls);
// Logs violations in development mode
```

---

## 8️⃣ SUMMARY

| Resource | Pattern | Example |
|----------|---------|---------|
| **User Profile** | `/profile/{numericId}` | `/profile/90` |
| **Car Listing** | `/car/{seller}/{car}` | `/car/90/5` |
| **Edit Car** | `/car/{seller}/{car}/edit` | `/car/90/5/edit` |
| **Messaging** | `/messages/{id1}/{id2}` | `/messages/1/90` |
| **Car Not Found** | `/car/{seller}/{car}/not-found` | `/car/90/5/not-found` |

---

## 9️⃣ CRITICAL FILES

- **Routing Utilities:** `src/utils/routing-utils.ts`
- **Constitution Audit:** `src/utils/constitution-audit.ts`
- **Numeric ID Assignment:** `src/services/numeric-id-assignment.service.ts`
- **Car Service:** `src/services/UnifiedCarService.ts`
- **Route Definitions:** `src/routes/MainRoutes.tsx`
- **Numeric Car Page:** `src/pages/01_main-pages/NumericCarDetailsPage.tsx`
- **Car Not Found:** `src/pages/02_error-pages/CarNotFoundPage.tsx`

---

**AI INSTRUCTION:**  
This constitution is IMMUTABLE. All URLs MUST follow these patterns. Any deviation must be flagged and corrected immediately. Never generate URLs using UUID/UID patterns.
