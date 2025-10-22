# القسم 10: الأمان المتقدم

## 10.1 Two-Factor Authentication (2FA)

```
Requirement:
  • Private: Optional
  • Dealer: Recommended (enforced for Pro/Enterprise)
  • Company: Mandatory

Methods:
  1. SMS OTP (default)
  2. Authenticator App (Google, Microsoft)
  3. Email OTP (backup)
  4. Hardware Keys (FIDO2) - Company Enterprise only

Setup Flow:
  1. Enable 2FA in settings
  2. Choose method
  3. Verify with code
  4. Save backup codes (10 codes)
  5. 2FA active

Recovery:
  • Backup codes
  • SMS to registered phone
  • Email to registered email
  • Admin intervention (last resort)
```

## 10.2 IP Whitelisting (Company Only)

```
Features:
  • Allow login only from specific IPs
  • Office IP ranges
  • VPN support
  • Emergency access (1-time bypass)

UI:
  ┌──────────────────────────────────────┐
  │ IP Whitelist                         │
  ├──────────────────────────────────────┤
  │ 1. 185.43.5.10 (Sofia Office)        │
  │ 2. 185.43.5.11-20 (Range)            │
  │ 3. 92.78.123.45 (Home VPN)           │
  │                                      │
  │ [+ Add IP] [Emergency Access]        │
  └──────────────────────────────────────┘
```

## 10.3 Audit Logging

```typescript
interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string; // 'login', 'profile.update', 'listing.create', etc.
  resource: string; // 'listing:12345'
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ip: string;
  userAgent: string;
  location?: { city: string; country: string; };
  timestamp: Timestamp;
  result: 'success' | 'failed' | 'blocked';
  reason?: string; // if failed/blocked
}

Retention:
  • Dealer: 1 year
  • Company: 2 years
  • Available for export (Excel, JSON)
```
