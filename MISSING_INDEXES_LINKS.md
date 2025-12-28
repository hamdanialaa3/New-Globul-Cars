# Missing Firestore Indexes - Click Links to Create

Firebase will automatically create these indexes when you first run the queries, but you can create them manually using the links below for faster setup.

## 1. Achievements Index
**Query**: `userId` (ASC) + `unlockedAt` (DESC)
```
https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=ClRwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2FjaGlldmVtZW50cy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoOCgp1bmxvY2tlZEF0EAIaDAoIX19uYW1lX18QAg
```

## 2. Passenger Cars Index (isActive + createdAt)
**Query**: `isActive` (ASC) + `createdAt` (DESC)
```
https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=ClZwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Bhc3Nlbmdlcl9jYXJzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

## 3. SUVs Index (isActive + createdAt)
**Query**: `isActive` (ASC) + `createdAt` (DESC)
```
https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3N1dnMvaW5kZXhlcy9fEAEaDAoIaXNBY3RpdmUQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC
```

## 4. Motorcycles Index (isActive + createdAt)
**Query**: `isActive` (ASC) + `createdAt` (DESC)
```
https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=ClNwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL21vdG9yY3ljbGVzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

## 5. Buses Index (isActive + createdAt)
**Query**: `isActive` (ASC) + `createdAt` (DESC)
```
https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=Ck1wcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2J1c2VzL2luZGV4ZXMvXxABGgwKCGlzQWN0aXZlEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

## 6. Trucks Index (isActive + createdAt)
**Query**: `isActive` (ASC) + `createdAt` (DESC)
```
https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3RydWNrcy9pbmRleGVzL18QARoMCghpc0FjdGl2ZRABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
```

## 7. Vans Index (isActive + createdAt)
**Query**: `isActive` (ASC) + `createdAt` (DESC)
```
https://console.firebase.google.com/v1/r/project/fire-new-globul/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9maXJlLW5ldy1nbG9idWwvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3ZhbnMvaW5kZXhlcy9fEAEaDAoIaXNBY3RpdmUQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC
```

---

## Auto-Creation (Recommended)
Instead of clicking these links, just run your app and perform searches. Firebase will automatically create the missing indexes and provide you with direct links in the console errors. The indexes will be built in the background (usually takes 1-5 minutes depending on collection size).

## Status Check
Run `firebase firestore:indexes` to see all existing indexes and their build status.
