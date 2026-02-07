// src/config/azure-config.ts
// Azure (Microsoft Entra) Authentication Configuration
// Project: Koli One - Bulgaria

/**
 * Azure (Microsoft Entra ID) Configuration
 * 
 * This configuration enables Azure AD authentication for the application.
 * Users can log in using their Microsoft accounts.
 * 
 * Region: Bulgaria
 * Tenant: Default Directory
 * License: Microsoft Entra ID Free
 */

export const AZURE_CONFIG = {
  // ✅ Azure Tenant Information
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID || 'fdb9a393-7d60-4dae-b17b-0bb89edad2fe',
  tenantName: 'hamdanialaahotmail.onmicrosoft.com',
  tenantRegion: 'Bulgaria',
  
  // ✅ Application Registration (To be created in Azure Portal)
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '', // Will be filled after app registration
  
  // ✅ Redirect URIs
  redirectUri: process.env.NODE_ENV === 'production' 
    ? 'https://koli.one/auth/azure/callback'
    : 'http://localhost:3000/auth/azure/callback',
  
  postLogoutRedirectUri: process.env.NODE_ENV === 'production'
    ? 'https://koli.one'
    : 'http://localhost:3000',
  
  // ✅ Azure AD Authority
  authority: `https://login.microsoftonline.com/fdb9a393-7d60-4dae-b17b-0bb89edad2fe`,
  
  // ✅ Scopes (Permissions)
  scopes: [
    'openid',           // Required for authentication
    'profile',          // User profile information
    'email',            // User email
    'User.Read',        // Read user profile from Microsoft Graph
  ],
  
  // ✅ Cache Configuration
  cache: {
    cacheLocation: 'sessionStorage', // or 'localStorage'
    storeAuthStateInCookie: false,   // Set to true for IE11 or Edge
  },
  
  // ✅ System Configuration
  system: {
    loggerOptions: {
      loggerCallback: (level: number, message: string, containsPii: boolean) => {
        if (containsPii) return;
        
        if (process.env.NODE_ENV === 'development') {
          switch (level) {
            case 0: // Error
              console.error('[Azure MSAL]', message);
              break;
            case 1: // Warning
              console.warn('[Azure MSAL]', message);
              break;
            case 2: // Info
              console.info('[Azure MSAL]', message);
              break;
            case 3: // Verbose
              console.debug('[Azure MSAL]', message);
              break;
          }
        }
      },
      piiLoggingEnabled: false,
    },
    allowNativeBroker: false, // Disables WAM Broker for web apps
  },
};

/**
 * Azure Integration Status
 */
export const AZURE_INTEGRATION = {
  enabled: true, // Force enabled for production readiness
  requiresSetup: false, // Let Firebase handle the errors if config is missing
};

/**
 * Microsoft Graph API Configuration
 * Used to fetch user profile information
 */
export const MICROSOFT_GRAPH_CONFIG = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphUsersEndpoint: 'https://graph.microsoft.com/v1.0/users',
};

/**
 * Validation: Check if Azure is properly configured
 */
export const validateAzureConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!AZURE_CONFIG.clientId) {
    errors.push('Azure Client ID is missing. Please register the app in Azure Portal.');
  }
  
  if (!AZURE_CONFIG.tenantId) {
    errors.push('Azure Tenant ID is missing.');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Helper: Get Azure login URL for manual redirects
 */
export const getAzureLoginUrl = (): string => {
  const params = new URLSearchParams({
    client_id: AZURE_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: AZURE_CONFIG.redirectUri,
    scope: AZURE_CONFIG.scopes.join(' '),
    response_mode: 'query',
  });
  
  return `${AZURE_CONFIG.authority}/oauth2/v2.0/authorize?${params.toString()}`;
};

export default AZURE_CONFIG;
