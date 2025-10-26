# 🚀 Supabase CLI Setup Guide

## ✅ What's Already Done

1. ✅ Supabase CLI installed as dev dependency
2. ✅ `supabase init` executed - created `supabase/` directory
3. ✅ Existing migrations detected (42 migration files)

## 📋 Next Steps to Complete Setup

### Step 1: Login to Supabase

You have two options:

#### Option A: Browser Login (Recommended)
```powershell
npx supabase login
```
**Then press Enter** when prompted. This will open your browser.

**If this fails**, try Option B:

#### Option B: Manual Access Token
1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Name it: "Local Development"
4. Copy the token
5. Run:
```powershell
npx supabase login --token YOUR_TOKEN_HERE
```

---

### Step 2: Link Your Project

Once logged in, link to your production project:

```powershell
npx supabase link --project-ref eremjpneqofidtktsfya
```

You'll be asked for your database password. This is the password you set when creating the project.

**Where to find your project ref:**
- It's in your Supabase dashboard URL
- Format: `https://supabase.com/dashboard/project/eremjpneqofidtktsfya`
- Your project ref: `eremjpneqofidtktsfya`

---

### Step 3: Pull Remote Schema

Since you have an existing production database, pull the current schema:

```powershell
npx supabase db pull
```

This creates a new migration file with your current production schema.

---

### Step 4: Create New Migration for Password Fix

Now create a new migration for the nuclear fix:

```powershell
npx supabase migration new password_columns_and_trigger_fix
```

This creates a new file like: `supabase/migrations/20251026XXXXXX_password_columns_and_trigger_fix.sql`

**Copy the contents of `PHASE_2_NUCLEAR_FIX.sql` into this new migration file.**

---

### Step 5: Test Locally (Optional but Recommended)

Start a local Supabase instance:

```powershell
npx supabase start
```

This will:
- Download Docker images (first time only)
- Start local PostgreSQL database
- Start local Supabase Studio at http://localhost:54323
- Apply all migrations from `supabase/migrations/`

**Verify it works:**
```powershell
npx supabase status
```

You should see services running with local URLs.

---

### Step 6: Push Migration to Production

Once tested locally (or if you want to push directly):

```powershell
npx supabase db push
```

This applies all new migrations to your linked production database.

---

## 🎯 Quick Commands Reference

```powershell
# Check CLI version
npx supabase --version

# Login
npx supabase login

# Link project
npx supabase link --project-ref eremjpneqofidtktsfya

# Pull remote schema
npx supabase db pull

# Create new migration
npx supabase migration new migration_name

# List migrations (local vs remote)
npx supabase migration list

# Start local development
npx supabase start

# Stop local development
npx supabase stop

# Reset local database (reapply all migrations)
npx supabase db reset

# Push migrations to production
npx supabase db push

# Generate TypeScript types from database
npx supabase gen types typescript --local > src/types/database.types.ts
```

---

## 🔧 Why Use Supabase CLI?

### Benefits:
1. **Version Control**: All schema changes tracked in git
2. **Safe Migrations**: Test locally before production
3. **Rollback**: Easy to revert bad migrations
4. **Team Collaboration**: Share migrations via git
5. **Type Safety**: Auto-generate TypeScript types
6. **CI/CD Ready**: Integrate with GitHub Actions

### Workflow:
```
Local Dev → Test Migration → Commit to Git → Push to Production
```

---

## 🚨 Important Notes

### Database Password
When linking your project, you need your **database password**. This is:
- NOT your Supabase dashboard password
- The password you set when creating the project
- Can be reset in: Dashboard → Settings → Database → Database Password

### Service Role Key
For some operations, you may need the service role key:
- Dashboard → Settings → API → `service_role` key
- This is different from `anon` key
- **Never commit this to git!**

### Migration Files
- Located in: `supabase/migrations/`
- Named with timestamp: `YYYYMMDDHHMMSS_description.sql`
- Applied in order (oldest first)
- Once pushed to production, **never modify** existing migration files

---

## 📊 Current Project Status

### Existing Migrations (42 files):
- ✅ Initial platform setup
- ✅ Content management system
- ✅ Admin dashboard enhancements
- ✅ Email notifications
- ✅ Member reviews and referrals
- ✅ User deletion functions
- ✅ Payment confirmation workflow
- ✅ Enhanced content system
- ✅ Member ID system
- ✅ Admin table separation
- ✅ Force password change (partially implemented)

### Pending:
- ⏳ Password columns need to be added via migration
- ⏳ Trigger function needs error handling update
- ⏳ RLS policies need cleanup

---

## 🎬 Complete Setup Now

### Quick Setup (5 minutes):

```powershell
# 1. Login (opens browser)
npx supabase login

# 2. Link project (enter database password when prompted)
npx supabase link --project-ref eremjpneqofidtktsfya

# 3. Pull current schema
npx supabase db pull

# 4. Create new migration
npx supabase migration new password_columns_and_trigger_fix

# 5. Copy PHASE_2_NUCLEAR_FIX.sql content to the new migration file

# 6. Push to production
npx supabase db push
```

---

## 🆘 Troubleshooting

### "failed to scan line: expected newline"
**Solution**: Use manual token login:
```powershell
npx supabase login --token YOUR_ACCESS_TOKEN
```

### "Database password incorrect"
**Solution**: Reset in Dashboard → Settings → Database → Reset Database Password

### "Project not found"
**Solution**: Verify project ref is correct (`eremjpneqofidtktsfya`)

### "Permission denied"
**Solution**: You need to be project owner or have admin access

### Docker not installed (for local development)
- Download: https://www.docker.com/products/docker-desktop
- Required only for `npx supabase start`
- Not required for pushing to production

---

## ✅ Success Criteria

You'll know setup is complete when:

1. ✅ `npx supabase login` succeeds
2. ✅ `npx supabase link` succeeds
3. ✅ `npx supabase migration list` shows your migrations
4. ✅ `npx supabase db push` applies migrations without errors

---

## 🔄 Alternative: Apply Fix Directly

If you prefer not to use CLI for now, you can still:

1. **Manual approach** (what you've been doing):
   - Open Supabase Dashboard → SQL Editor
   - Paste `PHASE_2_NUCLEAR_FIX.sql`
   - Run it

2. **Then later setup CLI** for future changes

Both approaches work! CLI is better for long-term maintenance.

---

## 📚 Additional Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Managing Environments](https://supabase.com/docs/guides/deployment/managing-environments)
- [Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Local Development](https://supabase.com/docs/guides/cli/local-development)
- [CI/CD with GitHub Actions](https://supabase.com/docs/guides/deployment/ci)

---

**Ready to proceed?** Start with Step 1 above! 🚀
