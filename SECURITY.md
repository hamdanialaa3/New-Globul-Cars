# Security Policy

## 🔐 Overview

This document outlines security best practices and procedures for the Bulgarian Car Marketplace (Globul Cars) project.

## 🚨 Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it by:
1. **Email**: Contact the project maintainer at [@hamdanialaa3](https://github.com/hamdanialaa3)
2. **GitHub Security**: Use GitHub's private vulnerability reporting feature
3. **DO NOT** create a public GitHub issue for security vulnerabilities

## 🔑 Environment Variables & API Keys

### Required Environment Variables

This project requires the following environment variables to function. **NEVER commit these values to version control.**

#### Firebase Configuration
```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
```

#### Google Services
```
REACT_APP_GOOGLE_MAPS_API_KEY=
REACT_APP_GOOGLE_AI_API_KEY=
```

#### Stripe Payment Processing
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=
```

#### Social Authentication
```
REACT_APP_FACEBOOK_APP_ID=
REACT_APP_FACEBOOK_APP_SECRET=
```

#### Other Services
```
REACT_APP_ALGOLIA_APP_ID=
REACT_APP_ALGOLIA_SEARCH_KEY=
REACT_APP_DEEPSEEK_API_KEY=
```

### Setup Instructions

1. **Copy the template**:
   ```bash
   cp .env.example .env
   ```

2. **Fill in your API keys**:
   - Edit `.env` with your actual API keys
   - Keep `.env` file secure and never commit it

3. **For production deployment**:
   - Use GitHub Secrets for CI/CD
   - Use Firebase environment configuration for Functions
   - Never hardcode credentials in source code

## 🔄 Rotating Compromised API Keys

If API keys have been exposed (e.g., committed to version control), follow these steps immediately:

### Firebase API Keys
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** → **General**
4. Regenerate API keys
5. Update `.env` file with new keys
6. Update GitHub Secrets
7. Redeploy the application

### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Delete the compromised key
4. Create a new API key
5. Add restrictions (HTTP referrers for web apps)
6. Update `.env` with new key

### Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Roll the keys (click "Roll key")
4. Update both publishable and secret keys
5. Update `.env` and server configuration

### Facebook App Secret
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Navigate to **Settings** → **Basic**
4. Click **Reset App Secret**
5. Update `.env` with new secret
6. Regenerate Access Token if needed

### Algolia Keys
1. Go to [Algolia Dashboard](https://www.algolia.com/dashboard)
2. Navigate to **API Keys**
3. Regenerate the compromised key
4. Update `.env` with new key

## 🛡️ Security Best Practices

### For Developers

1. **Never commit sensitive data**:
   - Always check files before committing
   - Use `.gitignore` to exclude environment files
   - Review changes with `git diff` before pushing

2. **Use environment variables**:
   - All secrets must be in `.env` files
   - Never hardcode API keys in source code
   - Use `process.env.REACT_APP_*` pattern

3. **Keep dependencies updated**:
   ```bash
   npm audit
   npm audit fix
   ```

4. **Review third-party packages**:
   - Check package reputation before installing
   - Audit licenses and security reports
   - Use `npm audit` regularly

5. **Secure Firebase Rules**:
   - Review `firestore.rules` regularly
   - Test rules with Firebase Emulator
   - Follow principle of least privilege

### For Production

1. **Use HTTPS everywhere**:
   - Firebase Hosting provides SSL by default
   - Ensure all API calls use HTTPS

2. **Implement rate limiting**:
   - Use Firebase Cloud Functions rate limiting
   - Protect against DDoS attacks

3. **Monitor logs**:
   - Check Firebase Console regularly
   - Set up alerts for suspicious activity

4. **Regular security audits**:
   - Run `npm audit` before deployments
   - Review Firestore security rules quarterly
   - Test authentication flows regularly

## 📋 Incident Response

If a security incident occurs:

1. **Assess the impact**:
   - Identify compromised data/systems
   - Determine the scope of the breach

2. **Contain the threat**:
   - Rotate all affected API keys immediately
   - Revoke compromised access tokens
   - Update security rules if needed

3. **Investigate**:
   - Review logs to understand the attack
   - Identify the attack vector
   - Document findings

4. **Remediate**:
   - Fix the vulnerability
   - Deploy security patches
   - Update documentation

5. **Notify affected parties**:
   - Inform users if personal data was compromised
   - Report to authorities if required by law
   - Document the incident

## 🔍 Security Checklist

Before deploying to production:

- [ ] All environment variables are set correctly
- [ ] No API keys in source code
- [ ] `.env` files are in `.gitignore`
- [ ] Firestore security rules are tested
- [ ] Firebase Authentication is properly configured
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] Dependencies are up to date (`npm audit`)
- [ ] Security headers are configured
- [ ] Error messages don't expose sensitive data
- [ ] Logging doesn't include sensitive information

## 📚 Additional Resources

- [Firebase Security Documentation](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

## 📞 Contact

For security concerns or questions:
- GitHub: [@hamdanialaa3](https://github.com/hamdanialaa3)
- Project: [New-Globul-Cars](https://github.com/hamdanialaa3/New-Globul-Cars)

---

**Last Updated**: December 27, 2025  
**Version**: 1.0.0
