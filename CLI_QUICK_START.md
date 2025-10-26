# Supabase CLI Setup - Quick Commands

## Current Status
- ✅ CLI installed (`npm install supabase --save-dev`)
- ✅ Project initialized (`npx supabase init`)
- ✅ 42 existing migrations detected

## Next Steps

### 1️⃣ Login to Supabase

**Option A:** Browser login (may have issues in PowerShell)
```powershell
npx supabase login
```

**Option B:** Manual token (recommended for PowerShell)
1. Go to: https://supabase.com/dashboard/account/tokens
2. Generate new token
3. Copy token
4. Run:
```powershell
$env:SUPABASE_ACCESS_TOKEN="your-token-here"
npx supabase login
```

### 2️⃣ Link Your Project
```powershell
npx supabase link --project-ref eremjpneqofidtktsfya
```
*You'll be prompted for database password*

### 3️⃣ Pull Remote Schema
```powershell
npx supabase db pull
```

### 4️⃣ Create Migration for Fix
```powershell
npx supabase migration new add_password_columns_and_fix_trigger
```

Then copy content from `PHASE_2_NUCLEAR_FIX.sql` to the new migration file.

### 5️⃣ Push to Production
```powershell
npx supabase db push
```

## Alternative: Direct Apply (What You've Been Doing)

You can also continue using the Supabase Dashboard SQL Editor:
1. Open: https://supabase.com/dashboard/project/eremjpneqofidtktsfya/sql
2. Paste `PHASE_2_NUCLEAR_FIX.sql`
3. Click Run

Both approaches work! CLI is better for version control.

## What Should You Do Right Now?

**Recommendation:** Since you need to fix the user creation issue **immediately**, I suggest:

1. **Now:** Apply `PHASE_2_NUCLEAR_FIX.sql` via Dashboard SQL Editor (fastest)
2. **Later:** Complete CLI setup for future migrations (proper workflow)

This gets your system working quickly, then you can set up proper tooling.

---

See `SUPABASE_CLI_SETUP.md` for detailed guide.
