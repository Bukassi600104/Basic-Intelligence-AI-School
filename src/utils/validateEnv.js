/**
 * Environment variable validation service
 */

// Client-side only variables (safe to expose)
const CLIENT_SIDE_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_NAME',
  'VITE_SUPPORT_EMAIL',
  'VITE_BASE_PATH',
  'VITE_RESEND_API_KEY' // Only for local development
];

// Server-side only variables (never expose to client)
const SERVER_SIDE_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET',
  'PAYSTACK_SECRET',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'SESSION_SECRET',
  'COOKIE_SECRET',
  'DATABASE_URL'
];

// Default values that indicate development configuration
const DEVELOPMENT_DEFAULTS = [
  'your-supabase-anon-key',
  'your-resend-api-key',
  'your_supabase_project_url_here',
  'your_supabase_anon_key_here',
  'support@example.com',
  'your_email_service_key_here'
];

export const validateEnv = () => {
  // Only validate client-side variables in browser
  const missing = CLIENT_SIDE_VARS.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate Supabase URL format
  if (import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.startsWith('https://')) {
    throw new Error('VITE_SUPABASE_URL must be a valid HTTPS URL');
  }

  // Check for development/default values in production
  if (import.meta.env.PROD) {
    const devValuesFound = CLIENT_SIDE_VARS.filter(key => {
      const value = import.meta.env[key];
      return DEVELOPMENT_DEFAULTS.includes(value);
    });

    if (devValuesFound.length > 0) {
      throw new Error(`Production environment still has default values: ${devValuesFound.join(', ')}`);
    }
  }

  // Security: Warn if server-side variables are accidentally exposed
  const exposedServerVars = SERVER_SIDE_VARS.filter(key => {
    const clientKey = key.startsWith('VITE_') ? key : `VITE_${key}`;
    return import.meta.env[clientKey];
  });

  if (exposedServerVars.length > 0) {
    console.warn('⚠️ SECURITY WARNING: Server-side variables detected on client:', exposedServerVars);
  }

  return true;
};

export const getRequiredEnvVar = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
};

// Security: Check if we're in a secure environment
export const checkEnvironmentSecurity = () => {
  const issues = [];

  // Check for HTTP in production
  if (import.meta.env.PROD && window.location.protocol === 'http:') {
    issues.push('Production site should use HTTPS');
  }

  // Check for console exposure in production
  if (import.meta.env.PROD && typeof console !== 'undefined') {
    console.warn('⚠️ Console is available in production - ensure sensitive data is not logged');
  }

  // Check for development tools in production
  if (import.meta.env.PROD && (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || window.__REDUX_DEVTOOLS_EXTENSION__)) {
    issues.push('Development tools detected in production');
  }

  return {
    isSecure: issues.length === 0,
    issues
  };
};