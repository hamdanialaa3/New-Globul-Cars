# 🔢 Strict Numeric ID System - Complete Implementation

## 📋 Overview

This document describes the strict numeric ID system implemented in the Bulgarian Car Marketplace. All URLs use numeric IDs only, ensuring clean, SEO-friendly, and error-free URLs.

## 🎯 URL Structure

### Profile URLs
- Format: `/profile/{numericId}`
- Example: `/profile/1` (First user)
- Example: `/profile/18` (User 18)

### Car URLs
- Format: `/car/{sellerNumericId}/{carNumericId}`
- Example: `/car/1/1` (User 1's first car)
- Example: `/car/2/5` (User 2's fifth car)

### Messaging URLs
- Format: `/messages/{senderNumericId}/{recipientNumericId}`
- Example: `/messages/1/2` (Conversation between User 1 and User 2)

## ✅ Implementation Details

### 1. Car Creation (sellWorkflowService.ts)
- Automatically assigns `sellerNumericId` and `carNumericId`
- Validates numeric IDs are positive integers
- Throws error if numeric ID assignment fails
- Returns redirect URL: `/car/{sellerNumericId}/{carNumericId}`

### 2. Firestore Rules
- All collections (cars, passenger_cars, suvs, vans, motorcycles, trucks, buses) have strict rules
- Validates `isActive`, `status`, and listing limits
- Prevents changing `sellerId`, `carNumericId`, and `sellerNumericId` after creation

### 3. Unified Limits
- Free plan: 3 listings (unified across all services)
- Dealer plan: 10 listings
- Company plan: Unlimited

### 4. Validation
- Numeric IDs must be positive integers (> 0)
- Year must be between 1900 and current year + 1
- Make must be non-empty string

## 🔧 Migration

Run the migration script to fix `isActive` in old cars:
```bash
npx ts-node scripts/migrate-isActive.ts
```

## 📝 Notes

- All car links automatically use numeric URLs if available
- Fallback to legacy URLs for backward compatibility
- Messaging system uses numeric IDs for all conversations
- Profile pages support both numeric IDs and Firebase UIDs (with auto-redirect)

