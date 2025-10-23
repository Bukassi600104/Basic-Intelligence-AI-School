# Resend Email Service Setup Guide

## Overview
This project uses [Resend](https://resend.com) for sending transactional emails and notifications. The Resend API key is configured in Vercel environment variables for security.

## Prerequisites
- A Resend account (sign up at https://resend.com)
- Access to Vercel project settings

## Production Setup (Vercel)

### 1. Resend API Key (Already Configured ✅)

The production Resend API key is already configured in Vercel:
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Select your project
- Navigate to **Settings** → **Environment Variables**
- The `VITE_RESEND_API_KEY` is already set

**Note**: The API key is NOT stored in the repository for security reasons.

### 2. Local Development Setup

For local development, create a `.env` file:

1. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```

2. Get your Resend API key:
   - Go to [Resend Dashboard](https://resend.com/login)
   - Navigate to **API Keys** section
   - Create a test/development API key
   - Copy the API key (starts with `re_`)

3. Add to your local `.env` file:
   ```bash
   VITE_RESEND_API_KEY=re_your_development_api_key_here
   ```

4. **Important**: Never commit your `.env` file to version control!

### 3. Verify Domain (for Production)

For production use, you need to verify your sending domain:

1. In Resend Dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `basicintelligence.ng`)
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

### 4. Configure Sender Email

Update the default sender email in `src/services/emailService.js`:

```javascript
from: 'Your Name <noreply@yourdomain.com>'
```

Replace with your verified domain email.

### 5. Test Email Sending

1. Restart your development server after adding the API key
2. Go to **Admin Dashboard** → **Notification Wizard**
3. Try sending a test email to yourself
4. Check the Resend Dashboard for delivery status

## Environment Configuration

### Production (Vercel)
- ✅ API key configured in Vercel environment variables
- ✅ Automatically loaded by Vite during build
- ✅ Secure - not exposed in repository
- Emails are actually sent to recipients
- Monitor usage in Resend Dashboard

### Local Development
- Create `.env` file with development API key
- Use separate API key for development/testing
- Restart dev server after adding API key
- Useful for testing without affecting production quota

## Free Tier Limits

Resend free tier includes:
- 100 emails per day
- 3,000 emails per month
- Rate limit: 10 emails per second

For higher volume, consider upgrading to a paid plan.

## Troubleshooting

### "Resend API key is not configured" Error

**Production**: This should not happen as the key is configured in Vercel. If you see this error in production, verify the environment variable is set in Vercel settings.

**Local Development**: Ensure you've added `VITE_RESEND_API_KEY` to your local `.env` file and restarted the development server.

### Emails Not Sending

1. **Check API key**: Verify it's correct in `.env`
2. **Check domain verification**: For production, domain must be verified
3. **Check rate limits**: Free tier has daily/monthly limits
4. **Check console**: Look for detailed error messages in browser console

### "Invalid API key" Error

**Solution**: Your API key might be expired or incorrect. Generate a new one from Resend Dashboard.

### CSP (Content Security Policy) Errors

If you see CSP errors in console, they're unrelated to Resend. The email service itself works fine.

## Email Templates

The notification system supports template variables:

- `{{full_name}}` - User's full name
- `{{email}}` - User's email
- `{{member_id}}` - User's member ID
- `{{membership_tier}}` - User's membership level
- `{{subscription_expiry}}` - Subscription end date
- `{{dashboard_url}}` - Link to user dashboard

## Monitoring

Monitor email delivery in:
1. **Resend Dashboard** - Real-time delivery status
2. **Database** - Check `notification_logs` and `email_logs` tables
3. **Application Logs** - Check console for detailed error messages

## Security Best Practices

1. ✅ Never commit API keys to Git
2. ✅ Use environment variables for all secrets
3. ✅ Rotate API keys periodically
4. ✅ Use different API keys for dev/staging/production
5. ✅ Monitor API usage for suspicious activity

## Support

- **Resend Documentation**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **Project Issues**: Check GitHub Issues for common problems

## Quick Reference

```bash
# Check if Resend is configured
echo $VITE_RESEND_API_KEY

# Test email service (in browser console)
await emailService.sendEmailViaResend({
  from: 'noreply@yourdomain.com',
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>This is a test</p>'
})
```

---

**Last Updated**: October 23, 2025
