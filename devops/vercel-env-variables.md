# Vercel Environment Variables Configuration

## Required Environment Variables for Basic Intelligence AI School

### Essential Supabase Configuration
- `VITE_SUPABASE_URL` - Your Supabase project URL (from Supabase dashboard → Settings → API)
- `VITE_SUPABASE_ANON_KEY` - Public anon key (from Supabase dashboard → Settings → API)
- `VITE_SUPABASE_SERVICE_ROLE_KEY` - Service role key (from Supabase dashboard → Settings → API) - **Mark as Sensitive**

### Application Configuration
- `VITE_APP_NAME` - "Basic Intelligence Community School" (or your preferred name)
- `VITE_SUPPORT_EMAIL` - Your support email address
- `VITE_API_URL` - Your backend API URL (if applicable)
- `VITE_BASE_PATH` - "/" (default for root deployment, or "/app" for subdirectory)

### Optional Environment Variables

#### Email Service (if using email features)
- `EMAIL_SERVICE_API_KEY` - API key for Resend, SendGrid, etc.

#### Payment Providers (if implementing payments)
- `PAYSTACK_SECRET` - Paystack secret key for Nigerian payments
- `STRIPE_SECRET` - Stripe secret key for international payments

#### Security & Admin
- `JWT_SECRET` - Secret key for JWT token generation
- `ENCRYPTION_KEY` - Key for data encryption
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password

#### Monitoring
- `SENTRY_DSN` - Sentry DSN for error tracking

## How to Add to Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add each variable with its actual value
4. **Mark sensitive variables as "Sensitive"** (API keys, secrets, etc.)
5. Deploy your application

## Important Notes:

- **VITE_ prefix**: All client-side variables must start with `VITE_` for Vite to expose them to the browser
- **Security**: Never commit actual values to your repository
- **Base Path**: The `VITE_BASE_PATH` is now configured in your project and will work with both Vite and React Router
- **Default Value**: If `VITE_BASE_PATH` is not set, it defaults to `/` for root deployment

## Testing:

Your application has been successfully built with the VITE_BASE_PATH configuration. The build completed without errors, confirming that the base path setup is working correctly.

## Next Steps:

1. Add the required environment variables to Vercel
2. Deploy your application
3. Test all functionality in the production environment
4. Monitor for any issues and adjust environment variables as needed
