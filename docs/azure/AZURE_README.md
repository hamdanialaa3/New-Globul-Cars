# Azure Integration - README

## 📁 Files Created

This integration adds Microsoft Azure (Entra ID) authentication to Koli One.

### Configuration Files
- `src/config/azure-config.ts` - Azure configuration (Tenant ID, Client ID, Scopes)
- `.env.azure.example` - Environment variables template

### Service Files
- `src/services/auth/azure-auth.service.ts` - Azure authentication service using MSAL

### Component Files
- `src/components/auth/AzureLoginButton.tsx` - Microsoft login button component
- `src/pages/auth/AzureCallbackPage.tsx` - OAuth callback handler page

### Documentation
- `AZURE_SETUP_GUIDE.md` - Complete setup guide (English)
- `AZURE_QUICK_START_AR.md` - Quick start guide (Arabic)
- `AZURE_SETUP.ps1` - Automated setup script (PowerShell)

---

## 🚀 Quick Start

### 1. Run Setup Script
```powershell
.\AZURE_SETUP.ps1
```

### 2. Register App in Azure Portal
1. Go to: https://portal.azure.com
2. Navigate to: Microsoft Entra ID → App registrations
3. Create new registration with:
   - Name: `Koli One - Car Marketplace`
   - Account type: Personal Microsoft accounts
   - Redirect URI (SPA): `http://localhost:3000/auth/azure/callback`

### 3. Configure Environment
```env
# .env.local
REACT_APP_AZURE_TENANT_ID=fdb9a393-7d60-4dae-b17b-0bb89edad2fe
REACT_APP_AZURE_CLIENT_ID=<your_client_id_from_azure>
REACT_APP_AZURE_AUTH_ENABLED=true
```

### 4. Add Route
```typescript
// src/App.tsx
import AzureCallbackPage from '@/pages/auth/AzureCallbackPage';

<Route path="/auth/azure/callback" element={<AzureCallbackPage />} />
```

### 5. Use Login Button
```typescript
import AzureLoginButton from '@/components/auth/AzureLoginButton';

<AzureLoginButton
  mode="popup"
  onSuccess={(user) => console.log('Logged in:', user)}
/>
```

---

## 📚 Documentation

- **Quick Guide (Arabic):** [AZURE_QUICK_START_AR.md](AZURE_QUICK_START_AR.md)
- **Complete Guide:** [AZURE_SETUP_GUIDE.md](AZURE_SETUP_GUIDE.md)

---

## ✅ Status

- ✅ Configuration files created
- ✅ Service layer implemented
- ✅ UI components ready
- ✅ Documentation complete
- ⏳ Waiting for Azure App Registration
- ⏳ Waiting for Client ID configuration

---

## 🔗 Azure Tenant Info

- **Tenant ID:** `fdb9a393-7d60-4dae-b17b-0bb89edad2fe`
- **Domain:** `hamdanialaahotmail.onmicrosoft.com`
- **Region:** Bulgaria
- **License:** Microsoft Entra ID Free

---

**Created:** January 24, 2026  
**Status:** Ready for Configuration
