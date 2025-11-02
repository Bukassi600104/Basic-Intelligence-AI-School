# 🎯 START HERE - BIC SCHOOL REMEDIATION PROJECT

**Last Updated**: November 2, 2025  
**Project Duration**: 5-7 weeks + URGENT Phase 0 (Website Recovery)  
**Total Tasks**: 200+  
**CRITICAL STATUS**: 🔴 **WEBSITE DOWN - PHASE 0 MUST BE DONE FIRST**  
**Root Cause**: Vercel deployed old build with vendor chunks; React initialization fails

---

## 📋 YOUR THREE KEY DOCUMENTS

### 1️⃣ **THIS FILE** (`START_HERE.md`)
- **What it is**: Your entry point
- **Use it for**: Orientation, quick reference
- **Where to go next**: Pick a document below based on your needs

### 2️⃣ **QUICK_START_PLAN.md** 
- **What it is**: One-page reference for immediate tasks
- **Use it for**: Quick reminders, command references, current phase status
- **Go there if**: "What should I do right now?"

### 3️⃣ **PROJECT_REMEDIATION_PLAN.md** (THE MASTER PLAN)
- **What it is**: Complete 7-phase remediation roadmap with 200+ tasks
- **Use it for**: Detailed task specifications, code examples, acceptance criteria
- **Go there if**: "Show me exactly what to do and how to verify it's working"
- **UPDATE IT**: Mark progress as you complete tasks

---

## 🚀 GET STARTED IN 5 MINUTES

### 🚨 URGENT: WEBSITE IS DOWN!

**Current Issue**: www.basicai.fit renders blank page
- **Root Cause**: Vercel served old cached build with vendor chunks
- **Error**: `Cannot read properties of undefined (reading 'forwardRef')` 
- **Fix**: Force Vercel to rebuild with latest code from commit 64fbee5

### Step 0 (CRITICAL - DO THIS FIRST):  Fix Website

**BEFORE starting Phase 1**, you must restore the website:

1. Go to **Vercel Dashboard** → **Settings** → **Deployment** 
2. Click "Redeploy Latest" or trigger a rebuild
3. Wait for build to complete (5-10 min)
4. Test https://www.basicai.fit in browser
5. Should see homepage (NOT blank page)
6. Verify no console errors

**If still broken**:
- Clear Vercel cache: Settings → Caches → Clear All
- Hard redeploy entire project
- Check if vite.config.mjs was rolled back
- Verify commit 64fbee5 is in main branch

**When restored** ✅: Come back to Phase 1

### Step 1: Understand the Goal
The BIC School project is **LIVE on Vercel** but has **critical security vulnerabilities** and **incomplete features**. We're fixing this in 7 phases AFTER we restore the website.

**Your mission**: Follow the plan, complete each phase, verify every task works perfectly, then mark it done.

### Step 2: Open the Main Plan
👉 **Open**: `PROJECT_REMEDIATION_PLAN.md`

This is your single source of truth. Everything you need to know is there.

### Step 3: Find Your Current Phase
After website is restored, we're starting with **Phase 1: Security** because:
- ❌ Admin database key is exposed in the browser (CRITICAL)
- ❌ Data security policies are broken
- ❌ Production is vulnerable right now

### Step 4: Pick Your First Task
🔴 **Phase 1, Task 1.1.1**: Audit where admin key is imported

**Open**: `PROJECT_REMEDIATION_PLAN.md` → Search for "1.1.1"

### Step 5: Complete the Task
1. Read the task description
2. Follow the steps
3. Test it works
4. Verify it meets acceptance criteria
5. Update the plan document: Mark ✅ COMPLETED
6. Move to next task

---

## ⚡ THE WORKFLOW

### Before EVERY task:
```
1. Open PROJECT_REMEDIATION_PLAN.md
2. Find your current task (e.g., "1.1.1")
3. Check: Does it depend on other tasks? If yes, are they done?
4. Read the full task description
5. Follow the implementation steps
6. Test locally (npm run dev)
7. Verify all acceptance criteria are met
8. Update the plan: Mark ✅ COMPLETED
9. Move to next task
10. Repeat
```

### If you get stuck:
```
1. Check the task's "Acceptance Criteria" section
2. Review "Implementation Steps" again
3. Look at "Code Examples" for reference patterns
4. Check copilot-instructions.md for architecture patterns
5. Run a grep search to understand current code
6. Use MCP tools to investigate
7. Document blocker in plan and ask for help
```

---

## 📊 PHASE OVERVIEW

| Phase | Title | Duration | Blocker? | Status |
|-------|-------|----------|----------|--------|
| **0** | **🚨 Website Recovery** | **Hours** | **YES** | **🔴 IN PROGRESS** |
| 1 | 🔐 Critical Security Fixes | 1 week | YES | ⚠️ BLOCKED |
| 2 | 🔐 Authentication & Session | 1 week | YES | ⚠️ BLOCKED |
| 3 | ⚙️ Core Functionality | 2 weeks | YES | ⚠️ BLOCKED |
| 4 | 🎨 Error Handling & UX | 1 week | NO | ⚠️ BLOCKED |
| 5 | ⚡ Performance & Optimization | 1 week | NO | ⚠️ BLOCKED |
| 6 | 🔍 SEO & Metadata | 3 days | NO | ⚠️ BLOCKED |
| 7 | 🧪 Testing & Monitoring | 2 weeks | YES | ⚠️ BLOCKED |

---

## 🎯 CRITICAL RULES

### ✅ ALWAYS DO THIS:
- ✅ Follow phases in order (don't skip ahead)
- ✅ Check dependencies before starting a task
- ✅ Test locally before marking complete
- ✅ Update the plan as you go
- ✅ Reference the plan before coding
- ✅ Use patterns from copilot-instructions.md
- ✅ Only mark complete when fully verified

### ❌ NEVER DO THIS:
- ❌ Skip phases
- ❌ Mark complete without testing
- ❌ Deploy without verification
- ❌ Ignore dependencies
- ❌ Commit breaking changes
- ❌ Hardcode values (use env vars)
- ❌ Modify security code without review

---

## 🔧 QUICK REFERENCE

### Key Files
```
.github/copilot-instructions.md     ← AI patterns & architecture
PROJECT_REMEDIATION_PLAN.md         ← YOUR TASK LIST (update this!)
QUICK_START_PLAN.md                 ← Quick reference
START_HERE.md                        ← This file

src/App.jsx                          ← Root component
src/Routes.jsx                       ← All routes
src/contexts/AuthContext.jsx         ← Auth state
src/lib/supabase.js                  ← Client (safe)
src/lib/supabaseAdmin.js             ← 🔴 REMOVE FROM CLIENT (Phase 1)
src/services/                        ← All backend calls
```

### Essential Commands
```bash
# Start development
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck

# Lint
npm run lint

# Find admin key imports
grep -r "supabaseAdmin" src/

# Run tests (when created)
npm test
```

### Key Concepts from Architecture
- **Services Layer**: All backend calls go through `src/services/`
- **RLS Policies**: Row-level security enforces permissions in database
- **Auth Context**: Global state for current user + profile
- **Lazy Routes**: Pages like admin-dashboard load only when needed
- **Env Variables**: Never hardcode secrets (use VITE_ prefix)

---

## 📈 PROGRESS TRACKING

### Current Status - CRITICAL
```
OVERALL PROJECT STATUS: 🚨 BLOCKED - Website Down

PHASE 0: WEBSITE RECOVERY (URGENT)
├── Task 0.1: Trigger Vercel rebuild ................. [ ] 
├── Task 0.2: Clear Vercel cache if needed .......... [ ]
├── Task 0.3: Verify homepage loads ................. [ ]
├── Task 0.4: Verify no console errors .............. [ ]
└── Task 0.5: Confirm website is live ............... [ ]

Status: 🔴 IN PROGRESS (User must trigger rebuild)
Timeline: 1-2 hours to restore

---

PHASE 1: SECURITY (BLOCKED - Waiting for Phase 0)
├── Task 1.1: Remove admin key ..................... [ ] 0/5 tasks
├── Task 1.2: Rotate and secure keys .............. [ ] 0/2 tasks
├── Task 1.3: Fix RLS policies ..................... [ ] 0/4 tasks
├── Task 1.4: Update security headers ............. [ ] 0/3 tasks
└── Task 1.5: Fix SQL injection risks ............. [ ] 0/2 tasks

Status: ⚠️ BLOCKED (Waiting for Phase 0)
Timeline: 1 week once Phase 0 completes
```

**UPDATE THIS** as you complete tasks! It's your progress meter.

---

## ❓ FAQ

### Q: Where do I start?
A: Go to `PROJECT_REMEDIATION_PLAN.md`, find "Phase 1, Task 1.1.1", follow the steps.

### Q: How do I know when I'm done with a task?
A: Check the "Acceptance Criteria" section. When ALL criteria are met AND it's tested locally, mark it ✅.

### Q: What if I find a dependency not done?
A: Stop, update the plan document with a note, come back after that dependency is complete.

### Q: Can I work on multiple phases?
A: No. Phase 1 is a blocker. Phases 2 & 3 can't start until Phase 1 is done.

### Q: How often should I commit?
A: After each completed task. Write clear commit messages: "Phase 1.1.2: Remove admin key from component X"

### Q: Can I change the order?
A: No. The phase order has dependencies. Follow it exactly.

### Q: What if something breaks?
A: Revert to previous commit, check what went wrong, fix it, test again, then mark as "NEEDS REVISION" in plan.

---

## 🚨 CRITICAL REMINDER

### Production is LIVE with security issues
- ⚠️ Admin database key exposed in browser
- ⚠️ Data policies incomplete
- ⚠️ Users' data at risk

**This is why Phase 1 is critical and comes FIRST.**

---

## 🎯 YOUR NEXT ACTION

1. **RIGHT NOW**: You're reading this file ✅
2. **NEXT**: Open `PROJECT_REMEDIATION_PLAN.md`
3. **THEN**: Find "Phase 1, Task 1.1.1"
4. **FINALLY**: Start the first task

**Time to get started**: 🚀

---

## 📞 IF YOU NEED HELP

- **Architecture question?** → Check `copilot-instructions.md`
- **What's next?** → Check `QUICK_START_PLAN.md`
- **Task details?** → Check `PROJECT_REMEDIATION_PLAN.md`
- **Stuck on code?** → Review task's "Code Examples" section

---

## ✨ LET'S DO THIS

You've got:
- ✅ A clear plan (PROJECT_REMEDIATION_PLAN.md)
- ✅ Known phases and tasks
- ✅ Acceptance criteria for each
- ✅ Code examples to follow
- ✅ A way to track progress

**Everything is documented. Everything is planned. Nothing is ambiguous.**

Now go fix that security issue. 🔐

---

**Remember**: Every task matters. Every test matters. Every verification matters.

**Start with**: `PROJECT_REMEDIATION_PLAN.md` → Phase 1 → Task 1.1.1

🚀 **LET'S BUILD THIS RIGHT!**
