# `.github/copilot-instructions.md` - Generation Summary

**Date**: November 2, 2025  
**Status**: ✅ Complete and Ready for Review

---

## What Was Generated

A comprehensive **405-line AI Agent instruction document** designed to make AI coding agents immediately productive in the Basic Intelligence Community School codebase.

**Location**: `.github/copilot-instructions.md`

---

## Key Sections Included

### 1. **MCP Servers Integration** (Critical for AI Agents)
- Context7 for documentation lookups
- Supabase MCP for database operations
- Chrome DevTools MCP for debugging
- Shadcn MCP for component discovery

### 2. **Architecture Deep Dive**
- Frontend structure with routing strategy (static vs lazy-loaded routes)
- Backend architecture (Supabase, RLS, functions)
- **Critical Vite build config** - Explains why NO vendor chunks (prevents React init errors)

### 3. **Authentication & Authorization Patterns**
- `useAuth()` hook usage with proper examples
- 3-layer RBAC pattern (client → RLS → service layer)
- Admin vs Regular user access patterns
- `AuthContext` fire-and-forget profile loading caveat

### 4. **Services Layer Conventions**
- Consistent `{ success, data, error }` return pattern
- Table of all 6 critical services with purposes
- When/why to use each service

### 5. **Implementation Patterns** (Copy-Paste Ready)
- Adding admin features (4 steps)
- Adding student features (4 steps)
- Creating RLS policies (3 patterns)
- Adding shadcn UI components (5-step workflow)

### 6. **Build & Deployment**
- Dev commands (`npm run dev` on port 4028)
- Production build notes (sourcemaps enabled, chunk warnings)
- Vercel deployment config (SPA routing, CSP headers)

### 7. **Environment Variables**
- All 4 required vars documented
- Examples and production context

### 8. **Code Organization Conventions**
- Component file naming (.tsx vs .jsx rules)
- Import path patterns (absolute vs relative)
- File organization examples

### 9. **Common Issues & Debugging**
- Blank page resolution (4-step debugging flow)
- Auth state loading issues
- Content access denied troubleshooting
- File upload failures
- Migration issues
- Notification send failures

### 10. **Quick Reference**
- Key files map (Core, Auth, Clients, UI, Pages, Services, Build, DB)
- New feature checklist (10 steps)
- Critical constraints (5 live production rules)

---

## Discovery Process

### Files Analyzed
- `src/Routes.jsx` - Routing strategy (static + lazy-loaded)
- `src/contexts/AuthContext.jsx` - Auth patterns and fire-and-forget loading
- `vite.config.mjs` - Critical build insights (NO vendor chunks!)
- `src/services/*Service.js` - Service layer patterns (18 services, 6 critical)
- `src/App.jsx` - Environment validation approach
- `src/lib/supabase.js` & `supabaseAdmin.js` - Dual client pattern
- `package.json` - Stack validation (React 18, Vite 5.4.20, Supabase, TailwindCSS 3.4.6)
- `vercel.json` - Deployment configuration
- `tailwind.config.js` - Design token reference
- Component directory structure (60+ shadcn-based components)

### Architectural Insights Discovered

1. **Build System**: The codebase has a CRITICAL constraint - `vite.config.mjs` must NOT split vendor chunks. Any async chunk trying to import React before it loads = blank page. This is explicitly documented in comments in the config.

2. **Auth Pattern**: `AuthContext.jsx` uses a fire-and-forget profile loading pattern. The `setProfileLoading(false)` is called before state updates complete. This is intentional and must NEVER be modified with `await`.

3. **Routing Strategy**: Routes split into:
   - Static imports: Core pages (home, auth, pricing) - immediate availability
   - Lazy-loaded: Admin/student pages - bundle optimization
   - This reduces initial bundle while keeping critical paths fast

4. **Dual Supabase Clients**: 
   - `supabase.js`: Anonymous key for user operations (client-side safe)
   - `supabaseAdmin.js`: Service role key for admin ops (server-side only)
   - This pattern is correctly implemented but must be maintained

5. **Service Layer Pattern**: All 18 services follow consistent `{ success, data, error }` return pattern. Never call Supabase directly from components - always route through services.

6. **RLS Security**: Every table MUST have RLS enabled. The codebase enforces this strictly. Three-layer RBAC (client redirects → RLS policies → service checks) is the standard.

---

## What AI Agents Will Use This For

1. **Immediate Context**: Instead of reading 10 files, agents get the "why" in one structured doc
2. **Pattern Recognition**: Copy-paste ready code examples for common tasks
3. **MCP Integration**: Know to use 4 MCP servers before coding
4. **Debugging**: Systematic troubleshooting flows for 6 common issues
5. **Constraints**: Know what NOT to do (no Redux, no vendor chunks, etc.)
6. **File Navigation**: Quick reference map of what's where

---

## Strengths of This Document

✅ **Discoverable**: Covers "why" behind structural decisions, not just "what"  
✅ **Actionable**: Step-by-step patterns ready to implement  
✅ **Project-Specific**: References actual files, configs, and table names  
✅ **Production-Safe**: Emphasizes live environment risks and constraints  
✅ **MCP-First**: Guides agents to use available tools before coding  
✅ **Comprehensive**: Covers architecture, patterns, build, deployment, debugging  

---

## Potential Feedback Areas

Please review these sections and let me know if:

1. **MCP Servers Section** - Is the workflow clear enough for agents to follow?
2. **Build Configuration** - Is the NO vendor chunks explanation explicit enough? (This is critical!)
3. **Auth Patterns** - Are the fire-and-forget profile loading caveats clear?
4. **Services Layer** - Should I add more service examples?
5. **Debugging** - Are there missing common issues?
6. **Code Examples** - Are the code snippets accurate and helpful?

---

## Next Steps (If Needed)

- [ ] Review sections marked above for clarity
- [ ] Add any missing patterns specific to your workflow
- [ ] Update with any recent architectural changes
- [ ] Test by having agents use it for new features

---
