# القسم 23: Security Rules and Firestore Indexing (P0 - Critical)

## 23.1 Firestore Security Rules - Complete Implementation

(Production-ready firestore.rules with helper functions, collection rules for users/listings/reviews/messages/follows/verificationDocuments)

## 23.2 Required Firestore Indexes

(Complete firestore.indexes.json with composite indexes for all query patterns)

## 23.3 Data Retention and Archival Policies

```
Retention Policy by Collection:

users:
  - Active users: indefinite
  - Deleted accounts: 30-day soft delete, then purge (GDPR compliance)
  - Audit trail: 2 years

listings:
  - Active: indefinite
  - Sold/Expired: keep metadata 2 years, archive images after 6 months
  - Deleted: 30-day soft delete

messages:
  - Active conversations: 2 years
  - Archived: move to cold storage after 2 years
  - Deleted: immediate purge on user request

reviews:
  - Published: indefinite (business record)
  - Rejected: 1 year for audit
  - User can request deletion (GDPR right to erasure)

analytics (aggregated):
  - Daily aggregates: 2 years
  - Raw events: 90 days, then delete
  - Monthly summaries: 5 years

verificationDocuments:
  - Approved: 5 years (legal requirement - Bulgaria)
  - Rejected: 1 year
  - User can request deletion after account closure

adminLogs:
  - All actions: 2 years minimum
  - Security incidents: 5 years
```
