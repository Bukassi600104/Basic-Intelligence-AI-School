/**
 * Environment variable validation service
 */

const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_SERVICE_ROLE_KEY',
  'VITE_RESEND_API_KEY'
];

export const validateEnv = () => {
  const missing = REQUIRED_VARS.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate Supabase URL format
  if (!import.meta.env.VITE_SUPABASE_URL.startsWith('https://')) {
    throw new Error('VITE_SUPABASE_URL must be a valid HTTPS URL');
  }

  // Validate keys are not default/example values
  const defaultValues = [
    'your-supabase-anon-key',
    'your-resend-api-key',
    'your-supabase-service-role-key'
  ];

  REQUIRED_VARS.forEach(key => {
    const value = import.meta.env[key];
    if (defaultValues.includes(value)) {
      throw new Error(`${key} is still set to a default/example value`);
    }
  });

  return true;
};

export const getRequiredEnvVar = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
};