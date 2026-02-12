# Security Policy

## Environment Variables Setup

### Required Environment Variables
Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

### Production Deployment
- Never commit `.env` files
- Use GitHub Secrets for CI/CD
- Rotate keys immediately if exposed

### Exposed Credentials - What to Do

If credentials are accidentally exposed in Git history:

#### 1. Firebase
- Go to [Firebase Console](https://console.firebase.google.com/)
- Navigate to: Project Settings → General
- Delete old Web API Key
- Create new Web API Key
- Update in production environment variables

#### 2. Google Maps API
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to: APIs & Services → Credentials
- Restrict old API key (set to "None" for Application restrictions)
- Create new API key with proper restrictions:
  - Application restrictions: HTTP referrers
  - Website restrictions: Your production domain
  - API restrictions: Maps JavaScript API, Places API

#### 3. Stripe
- Go to [Stripe Dashboard](https://dashboard.stripe.com/)
- Navigate to: Developers → API Keys
- Roll both Secret Key and Publishable Key
- Update in production environment

#### 4. Facebook App
- Go to [Facebook Developers](https://developers.facebook.com/)
- Navigate to: App Settings → Basic
- Click "Reset App Secret"
- Regenerate Access Token if used

#### 5. Algolia
- Go to [Algolia Dashboard](https://www.algolia.com/dashboard)
- Navigate to: Settings → API Keys
- Regenerate Search-Only API Key
- Update Admin API Key

### GitHub Secrets Configuration

After rotating keys, update in GitHub repository:

```
Repository → Settings → Secrets and variables → Actions
```

Required secrets:
- `FIREBASE_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `ALGOLIA_APP_ID`
- `ALGOLIA_API_KEY`

### Report Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to: [Your security email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Security Best Practices

#### For Developers
- Never commit `.env` files
- Use `.env.example` as template (with fake values)
- Keep dependencies updated: `npm audit fix`
- Review security alerts in GitHub
- Use strong, unique passwords for all services

#### For Production
- Enable Firebase App Check
- Implement rate limiting on Cloud Functions
- Use Firestore Security Rules (already configured)
- Enable CORS restrictions
- Monitor unusual activity in Firebase Console
- Set up billing alerts to detect abuse

### Automated Security Checks

This repository uses:
- **Husky pre-commit hooks** - Prevents committing sensitive files
- **npm audit** - Checks for vulnerable dependencies
- **GitHub Dependabot** - Automated security updates

### Security Audit Log

| Date       | Action                          | Status |
|------------|---------------------------------|--------|
| 2025-12-28 | Initial security policy created | ✅     |
| 2025-12-28 | Removed exposed .env files      | ✅     |
| 2025-12-28 | Added pre-commit hooks          | ✅     |

### Compliance

This project follows:
- GDPR requirements for EU users
- Firebase Security Best Practices
- OWASP Top 10 guidelines
- Bulgarian Data Protection Laws

---

**Last Updated**: December 28, 2025  
**Version**: 1.0.0
