# ⚖️ Legal Compliance & Safety Documentation
## الامتثال القانوني والأمان - حماية المستخدم والالتزام بالمعايير الدولية والبلغارية

> **Last Updated:** January 23, 2026  
> **Version:** 0.4.0  
> **Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [GDPR Compliance (EU Standards)](#gdpr)
3. [Bulgarian Commercial Adherence](#bulgarian-law)
4. [User Safety & Verification](#user-safety)
5. [Listing Moderation & Integrity](#moderation)
6. [Data Protection Infrastructure](#data-protection)

---

## 🎯 Overview

Koli One operates under a strict legal framework designed to protect both the consumer and the platform. We integrate international standards (GDPR) with local Bulgarian regulations to ensure a safe, transparent, and legally sound marketplace.

### Core Values
- **Integrity**: Verified business registration for all dealerships.
- **Privacy**: Full control over personal data and the "Right to be Forgotten".
- **Trust**: Tiered verification badges for sellers.

---

## 🇪🇺 GDPR Compliance (EU Standards) {#gdpr}

The `BulgarianComplianceService` provides automated tools to uphold the General Data Protection Regulation (GDPR).

### 1. Right to Erasure (Article 17)
Users can request the complete deletion of their digital footprint.
- **Service**: `deleteAllUserData(userId)`
- **Scope**: Deletes profile, all car listings, private messages, favorites, saved searches, and analytics data across all database collections.

### 2. Right to Data Portability (Article 20)
Users can export their data in a machine-readable format.
- **Service**: `exportAllUserData(userId)`
- **Format**: Consolidated JSON payload containing all interactions and profile data.

### 3. Consent Management
Automated tracking of user consent for:
- Terms of Service.
- Marketing communications.
- Cookie policy and tracking.

---

## 🇧🇬 Bulgarian Commercial Adherence {#bulgarian-law}

Tailored logic to meet the specific requirements of the Bulgarian marketplace and the Tax Authorities (NAP).

### 1. EIK/VAT Verification
For dealerships and professional sellers:
- Verification of **Bulgarian Commercial Register** data.
- VAT registration tracking (Required for turnover > BGN 50,000).
- Automatic application of 20% VAT in financial calculations where applicable.

### 2. Financial Transparency
- **FinancialComplianceService**: Tracks business registration numbers, tax numbers, and audit dates.
- Compliant with **Bulgarian Accounting Law** and VAT Act (ZDDS).

---

## 🛡️ User Safety & Verification {#user-safety}

Trust is built through a sophisticated verification and interaction system.

### Verification Badges
- **EIK Verified**: Business authenticity confirmed via official records.
- **ID Verified**: Individual identity confirmed through secure verification providers.
- **Premium Seller**: High-rating history and active subscription.

### Secure Communication
- Integration with `realtimeMessagingService` ensures that early-stage negotiations happen within the platform.
- **Blocking System**: Integrated "Block User" functionality to prevent harassment.
- **Redirection**: Links to malicious domains are automatically flagged.

---

## 🔍 Listing Moderation & Integrity {#moderation}

Ensuring that our inventory is free from scams and duplicates.

### Automated Checks
- **VIN Analysis**: Extracting data from VIN numbers to verify vehicle authenticity.
- **Duplicate Detection**: AI-driven comparisons to prevent multi-listing of the same vehicle.
- **Content Filtering**: Automatic removal of offensive language or inappropriate imagery.

### Manual Moderation
Administrators use a dedicated dashboard (see [08_Admin_Panel_and_Moderation.md](./08_Admin_Panel_and_Moderation.md)) to review reported listings and flagged users.

---

## 🔒 Data Protection Infrastructure {#data-protection}

Our technical stack is hardened against external threats:
- **Encryption**: All data in transit (TLS 1.3) and at rest (AES-256).
- **Rate Limiting**: Protection against scraping and brute-force attacks.
- **Audit Trails**: Every sensitive action is logged (see [10_Performance_Monitoring_and_Audit.md](./10_Performance_Monitoring_and_Audit.md)).

---

## 🔗 Related Documentation

- [02_User_Authentication_and_Profile.md](./02_User_Authentication_and_Profile.md) - User data structures.
- [10_Performance_Monitoring_and_Audit.md](./10_Performance_Monitoring_and_Audit.md) - Technical security logging.

---

**Last Updated:** January 23, 2026  
**Maintained By:** Legal & Compliance Team  
**Status:** ✅ Active Documentation
