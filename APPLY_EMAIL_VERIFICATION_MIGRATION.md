# URGENT: Apply Email Verification Migration

## Issue
The email verification system was deployed without the database table, causing the error:
```
Failed to create verification token. Please try again.
```

## Solution
Apply the migration SQL to create the `email_verification_tokens` table.

---

## Step 1: Apply Migration to Supabase

### Option A: Using Supabase Dashboard (RECOMMENDED)

1. **Login to Supabase:**
   - Go to: https://supabase.com/dashboard
   - Select your project: `basic_intelligence_community_school`

2. **Open SQL Editor:**
   - Click on "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Run Migration:**
   - Open file: `supabase/migrations/20250130000001_email_verification_system.sql`
   - Copy ALL contents
   - Paste into SQL Editor
   - Click **"Run"** button

4. **Verify Success:**
   - Check for green success message
   - Look for: "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# If you have Supabase CLI installed
cd "C:\Users\USER\Downloads\BIC github\basic_intelligence_community_school"
supabase db push
```

---

## Step 2: Verify Table Creation

Run this verification query in SQL Editor:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'email_verification_tokens'
) AS table_exists;

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'email_verification_tokens'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT policyname, tablename, cmd, qual
FROM pg_policies
WHERE tablename = 'email_verification_tokens';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'email_verification_tokens';
```

**Expected Results:**
- `table_exists` = `true`
- 12 columns shown (id, email, token, otp_code, etc.)
- 5 RLS policies listed
- 5 indexes created

---

## Step 3: Test Email Verification

After migration is applied:

1. **Go to:** https://www.basicai.fit/signup

2. **Test Registration:**
   - Fill in form with valid email
   - Click "Sign Up"
   - Should see: "Verification code sent to your email"

3. **Check Email:**
   - Look for OTP code (6 digits)
   - Enter code on verification page

4. **Verify Database:**
   ```sql
   -- Check token was created
   SELECT id, email, otp_code, verified_at, created_at
   FROM email_verification_tokens
   ORDER BY created_at DESC
   LIMIT 5;
   ```

---

## Step 4: Check Email Templates

Verify email templates were created:

```sql
-- Check verification templates
SELECT name, subject, category, is_active
FROM notification_templates
WHERE name IN ('Email Verification OTP', 'Registration Thank You');
```

**Expected:** 2 rows returned with `is_active = true`

---

## Troubleshooting

### Error: "relation 'email_verification_tokens' does not exist"
**Solution:** Migration not applied yet. Go to Step 1.

### Error: "permission denied for table email_verification_tokens"
**Solution:** RLS policies not created. Re-run migration.

### Error: "Failed to send verification email"
**Solution:** Check Resend API key in Vercel environment variables:
```
VITE_RESEND_API_KEY=re_xxxxx
```

### Token Created But No Email Received
**Check:**
1. Spam/junk folder
2. Resend dashboard for delivery status
3. `notification_logs` table for errors:
   ```sql
   SELECT status, error_message, created_at
   FROM notification_logs
   WHERE recipient_email = 'your-email@example.com'
   ORDER BY created_at DESC
   LIMIT 5;
   ```

---

## Post-Migration Cleanup

After verifying everything works, commit the migration:

```bash
cd "C:\Users\USER\Downloads\BIC github\basic_intelligence_community_school"
git add supabase/migrations/20250130000001_email_verification_system.sql
git commit -m "Add email verification database migration"
git push origin main
```

---

## Migration Contents Summary

The migration creates:

### Database Objects:
- ✅ `email_verification_tokens` table (12 columns)
- ✅ 5 indexes for performance
- ✅ 5 RLS policies for security
- ✅ `update_verification_tokens_updated_at()` function
- ✅ `cleanup_expired_verification_tokens()` function
- ✅ Trigger for auto-updating `updated_at` column
- ✅ `email_verified` column in `user_profiles`
- ✅ `email_verified_at` column in `user_profiles`
- ✅ 2 email templates (OTP + Thank You)

### Security Features:
- Row Level Security enabled
- Anonymous users can insert (for registration)
- Users can read/update own tokens
- Admins have full access
- Tokens expire after 15 minutes
- Auto-cleanup of old tokens (24 hours)
- Max 5 verification attempts per token

---

## Success Criteria

Migration successful when:
- ✅ Table `email_verification_tokens` exists
- ✅ 5 RLS policies active
- ✅ 5 indexes created
- ✅ 2 email templates in `notification_templates`
- ✅ Registration flow completes without errors
- ✅ OTP emails delivered successfully
- ✅ Users can verify email with OTP code

---

## Priority: HIGH 🔴

**This migration MUST be applied before email verification will work on production.**

**Estimated Time:** 2-3 minutes

**Next Steps After Migration:**
1. Test registration on production
2. Monitor `notification_logs` for email delivery
3. Check `email_verification_tokens` for token creation
4. Verify users receive OTP emails

---

**Questions?** Check migration file at:
`supabase/migrations/20250130000001_email_verification_system.sql`
