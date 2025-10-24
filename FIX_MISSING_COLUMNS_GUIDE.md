# URGENT: Fix Missing Database Columns

**Issue**: Multiple Supabase 400/404 errors due to missing columns in `user_profiles` table and missing `referral_analytics` table.

## Errors Identified

1. ❌ `referral_code`, `referral_count`, `referred_by` columns missing from `user_profiles`
2. ❌ `subscription_plan`, `subscription_end_date` columns missing from `user_profiles`
3. ❌ `referral_analytics` table doesn't exist (404 errors)
4. ❌ Foreign key syntax issues in queries

---

## STEP 1: Apply Database Migration (REQUIRED)

### Copy and Run in Supabase SQL Editor

1. **Go to**: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → SQL Editor
2. **Click**: "New Query"
3. **Copy and paste** the entire contents of: `supabase/migrations/20251024000001_fix_missing_columns.sql`
4. **Click**: "Run" (or press Ctrl+Enter)
5. **Verify**: You should see "Success. No rows returned"

### What This Migration Does

✅ Adds `referral_code`, `referred_by`, `referral_count` to `user_profiles`  
✅ Adds `subscription_plan`, `subscription_end_date` to `user_profiles`  
✅ Creates `referral_analytics` table  
✅ Sets up proper indexes for performance  
✅ Configures Row Level Security (RLS) policies  

---

## STEP 2: Verify Migration Success

Run this verification query in Supabase SQL Editor:

\`\`\`sql
-- Check if all columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN (
    'referral_code', 
    'referred_by', 
    'referral_count', 
    'subscription_plan', 
    'subscription_end_date'
  )
ORDER BY column_name;

-- Check if referral_analytics table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'referral_analytics'
) as table_exists;
\`\`\`

**Expected Result**: Should show all 5 columns and `table_exists = true`

---

## STEP 3: Fix Frontend Query Syntax Issues

After the database migration is applied, I need to fix the remaining query syntax issues in the frontend code:

### Issues to Fix:

1. **referralService.js**: Fix `referral_analytics` foreign key syntax
2. **systemService.js**: Handle missing `subscription_plan` gracefully
3. **Error handling**: Add fallbacks for optional referral features

---

## Why This Happened

The migrations `20250116000012_member_reviews_and_referrals.sql` was supposed to add these columns, but it appears it was never run in your production database. This is common when:

1. Migrations are added after the database was already deployed
2. Migrations were run locally but not in production
3. Migration files were created but not executed

---

## Quick Test After Migration

After running the SQL migration, refresh your admin dashboard. The errors should reduce significantly. Then I'll fix any remaining query syntax issues in the code.

---

## If You Still See Errors After Migration

Let me know what errors remain, and I'll fix the corresponding service files to handle the data correctly.
