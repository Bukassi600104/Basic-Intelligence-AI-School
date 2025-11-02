# Quick Development Reference - Nov 2, 2025

## 🚀 Quick Start

```bash
# Start development
npm run dev                    # Runs on http://localhost:4028

# Build for production
npm run build                  # Creates optimized dist/

# Preview production build
npm run preview
```

---

## 🔧 When Adding New Features

### Step 1: Check Latest Docs
```
Use Context7 MCP:
1. mcp_upstash_conte_resolve-library-id with package name
2. mcp_upstash_conte_get-library-docs with returned ID
```

### Step 2: Database Changes
```
Use Supabase MCP:
1. mcp_supabase_list_tables to check schema
2. mcp_supabase_apply_migration to add RLS policies
3. mcp_supabase_execute_query to test
```

### Step 3: UI Components
```
Use shadcn MCP:
1. mcp_shadcn_search_items_in_registries to find components
2. mcp_shadcn_get_item_examples_from_registries to see usage
3. mcp_shadcn_get_add_command_for_items to install
```

### Step 4: Code Locally
```
1. Create component/page in src/
2. Add route to Routes.jsx with lazy loading
3. Add RLS policies if database accessed
4. Use service layer for API calls
```

### Step 5: Test & Deploy
```bash
npm run dev                    # Test locally
npm run build                  # Verify build
git add . && git commit -m "..." && git push
# Vercel auto-deploys!
```

---

## 📁 Project Structure

```
src/
├── components/               # React components
│   ├── ui/                  # shadcn + custom components
│   ├── homepage/            # Homepage-specific
│   └── errors/              # Error boundaries
├── pages/                    # Page components
│   ├── admin-dashboard/     # Admin pages (protected)
│   ├── student-dashboard/   # Student pages (protected)
│   ├── auth/                # Authentication pages
│   └── home-page/           # Public pages
├── services/                # API communication layer
│   ├── adminService.js
│   ├── userService.js
│   ├── courseService.js
│   └── ...
├── contexts/                # React Context (Auth)
├── lib/                      # Supabase clients
│   ├── supabase.js         # Anon key (client-side)
│   └── supabaseAdmin.js    # Service role key (server-side)
└── utils/                    # Utilities (cn.js, logger.js)
```

---

## 🔐 Key Files

| File | Purpose |
|------|---------|
| `src/Routes.jsx` | All app routes with lazy loading |
| `src/contexts/AuthContext.jsx` | User auth state management |
| `src/services/*Service.js` | Backend API communication |
| `src/lib/supabase.js` | Supabase client (anon) |
| `src/lib/supabaseAdmin.js` | Supabase client (service role) |
| `.github/copilot-instructions.md` | Development guidelines |
| `tailwind.config.js` | Design tokens & customization |

---

## 🎯 Common Tasks

### Add Admin Page
```jsx
// 1. Create file: src/pages/admin-dashboard/NewPage.jsx
const NewAdminPage = () => {
  const { userProfile } = useAuth();
  useEffect(() => {
    if (userProfile?.role !== 'admin') navigate('/');
  }, [userProfile]);
  return <div>Admin Content</div>;
};

// 2. Add route to Routes.jsx
<Route path="/admin-new-page" element={<NewAdminPage />} />

// 3. Add to AdminSidebar.jsx navigation
{ name: 'New Page', href: '/admin-new-page' }
```

### Add Student Feature
```jsx
// 1. Create: src/pages/student-dashboard/NewFeature.jsx
// 2. Add route: /student-dashboard/new-feature
// 3. Add to StudentDashboardNav.jsx
// Use: isMember && canAccessContent(tierLevel) for gating
```

### Create Database Table with RLS
```sql
-- Create table
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  data TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- User can read own data
CREATE POLICY "users_read_own" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can do anything
CREATE POLICY "admins_all_access" ON table_name
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Send Notification
```javascript
await notificationService.sendNotification({
  userId: userId,
  templateName: 'template_name',  // Must exist in DB
  variables: { 
    full_name: 'John',
    custom_field: 'value'
  },
  recipientType: 'email'
});
```

---

## 🧪 Testing Checklist

Before committing:
- [ ] `npm run dev` works without errors
- [ ] Component renders correctly
- [ ] No console errors
- [ ] `npm run build` succeeds
- [ ] Tested on http://localhost:4028
- [ ] Verified RLS policies if database accessed

---

## 🚨 Important DO's & DON'Ts

### ✅ DO
- Use service layer for all API calls
- Add RLS policies for new tables
- Protect admin routes with role checks
- Use Context API for state management
- Lazy load routes for code splitting
- Test locally before pushing

### ❌ DON'T
- Don't expose service role key client-side
- Don't skip RLS on database tables
- Don't hardcode API keys
- Don't use Redux (use Context API)
- Don't forget to add routes to Routes.jsx
- Don't commit environment files

---

## 📊 Current Status

- **Build**: ✅ 2707 modules, 0 errors
- **Site**: ✅ Live on Vercel
- **Database**: ✅ Secure with RLS
- **Dev Server**: ✅ Running on 4028
- **Auth**: ✅ Supabase configured
- **Notifications**: ✅ Resend API ready

---

## 🔗 Useful Links

- **Dev URL**: http://localhost:4028
- **Production**: Check Vercel deployment URL
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub**: https://github.com/Bukassi600104/Basic-Intelligence-AI-School
- **Vercel**: https://vercel.com

---

## 📞 Getting Help

Consult these files in order:
1. `.github/copilot-instructions.md` - Comprehensive guide
2. `PRODUCTION_VERIFICATION_REPORT.md` - Current status
3. `SESSION_COMPLETION_REPORT.md` - Recent changes

---

**Last Updated**: November 2, 2025  
**Status**: ✅ Production Ready
