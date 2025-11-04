# 🚨 IMMEDIATE ACTION REQUIRED - ADD VERCEL ENV VARS

## ⏰ THIS WILL TAKE 8 MINUTES

---

## THE PROBLEM

Your website shows **401 errors** because Vercel doesn't have the Supabase authentication key.

```
❌ https://www.basicai.fit → Blank or broken
❌ DevTools: 401 Unauthorized on all API calls
❌ Vercel env vars missing
```

---

## THE SOLUTION (5 Steps)

### 1. Open Vercel Dashboard
```
https://vercel.com/dashboard
Click: "Basic-Intelligence-AI-School" project
```

### 2. Go to Settings
```
Top navigation: [Settings]
Left sidebar: Environment Variables
```

### 3. Add VITE_SUPABASE_URL
```
Name: VITE_SUPABASE_URL
Value: https://eremjpneqofidtktsfya.supabase.co
Environments: ☑ Production ☑ Preview ☑ Development
Click: SAVE
```

### 4. Add VITE_SUPABASE_ANON_KEY
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZW1qcG5lcW9maWR0a3RzZnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY3NDEwMzMsImV4cCI6MjA0MjMxNzAzM30.v5V8P9SiLGQh8g7JovwiX0vVt0vvJHUMTzGCLbDKm8o
Environments: ☑ Production ☑ Preview ☑ Development
Click: SAVE
```

### 5. Add VITE_RESEND_API_KEY
```
Name: VITE_RESEND_API_KEY
Value: re_ggm9rXgX_GdqwmWmQVe6hNnUBmFaTkqiG
Environments: ☑ Production ☑ Preview ☑ Development
Click: SAVE
```

---

## ✅ VERIFICATION (After ~3 min redeploy)

### Visit: https://www.basicai.fit

### Open DevTools (F12) → Network Tab

**Look for**:
```
✅ No 401 errors
✅ Courses section loads
✅ Homepage displays
✅ All API calls → 200 OK
```

---

## 📝 WHAT HAPPENS NEXT

1. **Env vars saved** → Vercel auto-redeploys
2. **Build completes** → Website deployed with env vars
3. **Website loads** → Supabase auth works, no more 401 errors
4. **You report back** → "FIXED" or "Still broken"
5. **Then we design** → Homepage revamp with 10-section blueprint

---

## 🎯 AFTER FIXED, WE'LL BUILD:

✅ Navigation Bar (Section 0)  
✅ Hero Section (Section 1)  
✅ Social Proof (Section 2)  
✅ Problem & Solution (Section 3)  
✅ How It Works (Section 4)  
✅ Prompt Library Spotlight (Section 5)  
✅ Testimonials (Section 6)  
✅ Pricing Section (Section 7)  
✅ Closing CTA (Section 8)  
✅ Footer (Section 9)  

All with **React/Vite + Tailwind + framer-motion**

---

## ⏳ DO THIS NOW

**Time**: 8 minutes  
**Impact**: Website fixed, ready for design work  
**Difficulty**: Copy-paste env vars  

**→ Go to Vercel and add env vars now!**

Report back when done with either:
- ✅ "FIXED - website loads correctly"
- ❌ "Still broken - getting 401 errors"
