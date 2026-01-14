# Security Best Practices Guide
**Bulgarian Car Marketplace - Security Documentation**

## Overview
This document outlines the security measures implemented in the project to protect sensitive data and ensure safe operations.

## 1. Environment Variables

### Protected Files
All sensitive configuration is stored in environment files that are **never committed to Git**:
- `.env.local` - Local development secrets
- `.env.production.local` - Production secrets
- `.env.test.local` - Test environment secrets

### Template
Use `.env.example` as a template. Copy it to `.env.local` and fill in your actual values.

### Critical Variables
- `REACT_APP_FIREBASE_API_KEY` - Firebase API key
- `GITHUB_TOKEN` - GitHub personal access token (for automation)
- `STRIPE_SECRET_KEY` - Stripe payment processing
- `SENDGRID_API_KEY` - Email service

## 2. Git Security

### .gitignore Protection
The following are automatically excluded from Git:
```
.env*
*.key
*.json (except config files)
.github/secrets/
secrets/
keys/
service-account/
```

### GitHub Tokens
- **Never** commit GitHub tokens to the repository
- Use fine-grained tokens with expiration dates
- Rotate tokens every 30-60 days
- Delete unused tokens immediately

## 3. Firebase Security

### Realtime Database Rules
Current rules enforce:
- Authentication required for all operations
- Users can only access their own data
- Channel participants can only read/write their messages
- Validation of all data structures

**File**: `database.rules.json`

### Firestore Rules
- User documents: Owner read/write only
- Car listings: Public read, owner write
- Messages: Participants only

## 4. API Keys

### Public vs Private Keys
**Public** (can be in frontend code):
- Firebase API Key (REACT_APP_FIREBASE_API_KEY)
- Algolia Search Key (read-only)
- Google Maps API Key (with domain restrictions)

**Private** (server-side only):
- Stripe Secret Key
- SendGrid API Key
- Firebase Admin SDK keys

### API Key Restrictions
All public API keys should have restrictions:
- **Firebase**: Enable App Check
- **Google Maps**: Restrict to domain (mobilebg.eu)
- **Algolia**: Use search-only key, not admin key

## 5. Authentication

### Firebase Auth
- Email verification required
- Password strength: minimum 8 characters
- Rate limiting on login attempts
- Session management with secure tokens

### Custom Claims
- `numericId`: User's public identifier
- `profileType`: 'private' | 'dealer' | 'company'
- Never expose Firebase UIDs in URLs

## 6. Data Protection

### Sensitive Data
Never log or expose:
- Full email addresses in public views
- Phone numbers (show only to authenticated users)
- Payment information
- Firebase UIDs

### URL Structure
Always use numeric IDs per CONSTITUTION.md:
- `/profile/80` (not `/profile/firebase-uid`)
- `/car/90/5` (not `/car/firebase-uid/car-id`)

## 7. Dependencies

### Regular Audits
Run security audits regularly:
```bash
npm audit
npm audit fix
```

### Update Strategy
- Review updates weekly
- Test in development before production
- Keep critical packages up-to-date

## 8. Deployment Security

### GitHub Actions
- Use GitHub Secrets for all sensitive data
- Never echo secrets in logs
- Rotate service account keys quarterly

### Firebase Hosting
- Enable HTTPS only
- Set security headers
- Configure CORS properly

## 9. Monitoring

### Error Tracking
- Sentry for error monitoring
- Filter sensitive data from error reports
- Alert on security-related errors

### Access Logs
- Monitor Firebase Auth logs
- Review unusual access patterns
- Set up alerts for failed login attempts

## 10. Incident Response

### If a Secret is Exposed
1. **Immediately** revoke the exposed key/token
2. Generate a new key
3. Update all environments
4. Review git history for exposure
5. Document the incident

### Emergency Contacts
- Firebase Support: https://firebase.google.com/support
- GitHub Support: https://support.github.com

## 11. Checklist for New Developers

- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all required environment variables
- [ ] Never commit `.env.local` to Git
- [ ] Use numeric IDs in all URLs
- [ ] Review Firebase security rules
- [ ] Enable 2FA on GitHub account
- [ ] Use strong passwords
- [ ] Keep dependencies updated

## 12. Security Contacts

**Project Owner**: @hamdanialaa3
**Repository**: https://github.com/hamdanialaa3/New-Globul-Cars

---

**Last Updated**: January 15, 2026
**Next Review**: February 15, 2026
