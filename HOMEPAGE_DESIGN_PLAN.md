# 🎨 HOMEPAGE REVAMP DESIGN PLAN - 10-Section Blueprint

**Date**: November 4, 2025  
**Status**: ✅ READY FOR CONFIRMATION  
**Tech Stack**: React 18 + Vite 5.4 + Tailwind CSS 3.4 + framer-motion  
**Process**: Section-by-section implementation (never full page at once)

---

## 📋 COMPLETE COMPONENT ARCHITECTURE

### Folder Structure (To Create)

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx                 (Section 0 - Header)
│   │   └── Footer.jsx                 (Section 9 - Footer)
│   └── home/
│       ├── Hero.jsx                   (Section 1 - Above the fold)
│       ├── SocialProof.jsx            (Section 2 - Tools bar)
│       ├── ProblemSolution.jsx        (Section 3 - 3-column grid + checklist)
│       ├── HowItWorks.jsx             (Section 4 - 4-step timeline)
│       ├── PromptLibrarySpotlight.jsx (Section 5 - 2-column layout)
│       ├── Testimonials.jsx           (Section 6 - Carousel/grid)
│       ├── PricingSection.jsx         (Section 7 - 2 pricing tiers)
│       └── ClosingCTA.jsx             (Section 8 - Final call-to-action)
└── pages/
    └── home-page/
        └── HomePage.jsx               (Main page that composes all sections)
```

---

## 🎯 COMPONENT BREAKDOWN

### **Section 0: Navbar** (`src/components/layout/Navbar.jsx`)
- **Type**: Layout/Reusable
- **Props**: None (uses React Router)
- **State**: `isMenuOpen` (for hamburger menu)
- **Features**:
  - Logo on left (links to home)
  - Desktop nav: Courses, Prompt Library, Pricing, Community
  - Mobile: Hamburger menu → dropdown
  - Login (text link) & Join Now (pill button) on right
  - Sticky header with transparent→blurred background on scroll
  - Animated transitions (framer-motion)

---

### **Section 1: Hero** (`src/components/home/Hero.jsx`)
- **Type**: Landing section
- **Props**: None
- **Features**:
  - Large headline + subheading
  - 2 CTA buttons (Primary: "Start Learning Now", Secondary: "Explore Prompt Library")
  - Background visual (gradient or subtle image)
  - Fade-in + slide-up animations on mount
  - Hover scale effects on buttons

---

### **Section 2: Social Proof** (`src/components/home/SocialProof.jsx`)
- **Type**: Trust builder
- **Props**: None
- **Features**:
  - Full-width bar with light background
  - "Master the Tools..." headline
  - 4 greyscale logos: ChatGPT, Google Gemini, Google Studio, Midjourney
  - Logo hover → full color transition
  - Fade-in on scroll

---

### **Section 3: Problem & Solution** (`src/components/home/ProblemSolution.jsx`)
- **Type**: Value prop section
- **Props**: None
- **Features**:
  - 3-column grid (responsive → stacked on mobile):
    - Card 1: Icon + "Feeling Left Behind?"
    - Card 2: Icon + "Don't Know Where to Start?"
    - Card 3: Icon + "Wasting Time on Bad Prompts?"
  - Staggered fade-in on scroll
  - Solution section below:
    - Headline: "The 'Basic Intelligence' Path..."
    - Vertical checklist (3 items with check icons)

---

### **Section 4: How It Works** (`src/components/home/HowItWorks.jsx`)
- **Type**: Learning journey
- **Props**: None
- **Features**:
  - 4-step vertical timeline (or horizontal tabs)
  - Steps: BASIC, INTERMEDIATE, ADVANCED, PRO
  - Each step has icon + 1-sentence description
  - Steps animate/light up on scroll
  - CTA button: "Explore the Full Curriculum" → /courses

---

### **Section 5: Prompt Library Spotlight** (`src/components/home/PromptLibrarySpotlight.jsx`)
- **Type**: Feature spotlight
- **Props**: None
- **Features**:
  - 2-column layout (responsive)
  - Left: Text content
    - Headline: "Never Write a Bad Prompt Again"
    - Sub-headline + 3 feature bullets
  - Right: Visual mockup/placeholder
  - Left text slides in from left, right visual slides from right
  - Scroll animation: `whileInView`

---

### **Section 6: Testimonials** (`src/components/home/Testimonials.jsx`)
- **Type**: Social proof carousel
- **Props**: None
- **Features**:
  - Headline: "Don't Just Take Our Word For It"
  - 3 placeholder testimonial cards (static for MVP, can upgrade to carousel)
  - Each card: Large quote, photo placeholder, name, title
  - Cards fade-in and scale on scroll
  - (Future: Add swipe carousel with react-slick or Embla)

---

### **Section 7: Pricing** (`src/components/home/PricingSection.jsx`)
- **Type**: Conversion section
- **Props**: None
- **Features**:
  - Headline: "Become a Member. Get Instant Access."
  - 2 pricing boxes: Monthly & Annual
  - Annual box: "Best Value" badge + highlighted border
  - Feature list in each box (4 features)
  - "30-Day Money-Back Guarantee" text
  - Fade-in and hover lift effect on boxes
  - CTA buttons link to signup

---

### **Section 8: Closing CTA** (`src/components/home/ClosingCTA.jsx`)
- **Type**: Final conversion push
- **Props**: None
- **Features**:
  - Bold background (dark or gradient)
  - Centered text:
    - Headline: "Stop Guessing. Start Mastering AI Today."
    - Sub-headline: "The next wave of business..."
  - Large prominent button: "Join Basic AI School Now"
  - Fade-in on scroll

---

### **Section 9: Footer** (`src/components/layout/Footer.jsx`)
- **Type**: Layout/Reusable
- **Props**: None
- **Features**:
  - Multi-column layout:
    - Col 1: Logo + mission statement
    - Col 2 (School): Courses, Prompt Library, Pricing
    - Col 3 (Company): About, Blog, Contact
    - Col 4 (Legal): Terms, Privacy
  - Bottom bar: Copyright + social media icons
  - Responsive: Stacks on mobile

---

### **Main Page** (`src/pages/home-page/HomePage.jsx`)
- **Type**: Composition page
- **Features**:
  - Imports all section components
  - Renders in order: Navbar → Hero → SocialProof → ... → Footer
  - Scroll-to-top on mount (using existing ScrollToTop component)
  - Error boundary wrapper

---

## 🛠️ TECH STACK CONFIRMATION

| Tool | Purpose | Usage |
|------|---------|-------|
| **React 18** | Framework | Functional components, hooks (useState, useEffect) |
| **Vite 5.4** | Build tool | Already configured, npm run dev |
| **Tailwind CSS 3.4** | Styling | All classes in JSX (no custom CSS) |
| **framer-motion** | Animations | motion.div, whileInView, staggerChildren, etc. |
| **React Router** | Navigation | Navigation links in Navbar |

---

## 📐 RESPONSIVE DESIGN STRATEGY

**Breakpoints** (Tailwind defaults):
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

**Key Responsive Points**:
- Hero: Full width, centered text on mobile
- 3-column grids: Stack to 1 column on mobile
- 2-column layouts: Stack to 1 column on tablet
- Navbar: Desktop nav → hamburger on mobile
- Pricing: Side-by-side on desktop, stacked on mobile

---

## 🎬 ANIMATION STRATEGY

**framer-motion Patterns** (Used across all sections):

1. **Fade-in on scroll**:
   ```jsx
   <motion.div whileInView={{ opacity: 1 }} initial={{ opacity: 0 }}>
   ```

2. **Slide-up on scroll**:
   ```jsx
   <motion.div 
     whileInView={{ y: 0, opacity: 1 }} 
     initial={{ y: 20, opacity: 0 }}
   >
   ```

3. **Staggered children** (Problem/Solution cards):
   ```jsx
   <motion.div variants={containerVariants}>
     {items.map((item) => (
       <motion.div key={item.id} variants={itemVariants}>
   ```

4. **Button hover scale**:
   ```jsx
   <motion.button
     whileHover={{ scale: 1.05 }}
     whileTap={{ scale: 0.98 }}
   >
   ```

5. **Sticky header on scroll**:
   ```jsx
   useEffect(() => {
     window.addEventListener('scroll', () => {
       setIsScrolled(window.scrollY > 50);
     });
   }, []);
   ```

---

## 📦 DEPENDENCIES (Already Installed)

✅ React 18.2.0  
✅ Vite 5.4.20  
✅ Tailwind CSS 3.4.6  
✅ framer-motion 11.3.29  
✅ React Router 6.28.0  
✅ TypeScript (tsconfig)  

**No additional packages needed!**

---

## 🔄 BUILD PROCESS

**Section-by-Section Workflow**:

1. **Plan** (This document) ← We are here
2. **Confirm** (Wait for your "CONTINUE")
3. **Code Section 0** (Navbar full code)
4. **You implement** (Create file, copy code)
5. **Test locally** (npm run dev)
6. **Repeat for Section 1-9**
7. **Final test**: npm run build
8. **Commit to GitHub**: git push
9. **Deploy**: Vercel auto-deploys

---

## 📋 FILES TO CREATE (Order)

1. `src/components/home/Hero.jsx`
2. `src/components/home/SocialProof.jsx`
3. `src/components/home/ProblemSolution.jsx`
4. `src/components/home/HowItWorks.jsx`
5. `src/components/home/PromptLibrarySpotlight.jsx`
6. `src/components/home/Testimonials.jsx`
7. `src/components/home/PricingSection.jsx`
8. `src/components/home/ClosingCTA.jsx`
9. `src/components/layout/Navbar.jsx` (or update existing)
10. `src/components/layout/Footer.jsx` (or update existing)
11. `src/pages/home-page/HomePage.jsx` (compose all sections)

---

## 🎯 SUCCESS CRITERIA

**After completing all 10 sections**:

✅ Navbar: Sticky, transparent→blurred, hamburger menu on mobile  
✅ Hero: Fade-in animation, 2 CTAs  
✅ Social Proof: Greyscale logos, hover to color  
✅ Problem/Solution: 3-column grid, staggered animations  
✅ How It Works: 4-step timeline, scroll animation  
✅ Prompt Library: 2-column layout, slide-in animations  
✅ Testimonials: 3 cards, fade-in on scroll  
✅ Pricing: 2 tiers, "Best Value" highlight, hover lift  
✅ Closing CTA: Bold background, prominent button  
✅ Footer: Multi-column, responsive  

**Performance**:
✅ No Lighthouse errors  
✅ No console warnings  
✅ Smooth 60fps animations  
✅ Mobile responsive (tested on 375px, 768px, 1440px)  

---

## 🚀 NEXT STEP

**I will now ask for your confirmation**:

---

## ✅ CONFIRMATION NEEDED

Please review and confirm:

1. ✅ **File structure** makes sense?
2. ✅ **10-section breakdown** is clear?
3. ✅ **Tech stack** (React + Vite + Tailwind + framer-motion) approved?
4. ✅ **Section-by-section process** works for you?
5. ✅ **Responsive strategy** (mobile-first, stacked on small screens)?

**When ready, reply**: 

```
CONTINUE
```

**Then I will provide**:
- Section 0 (Navbar) - **FULL PRODUCTION CODE** ready to copy-paste
- Instructions for creating the component file
- How to test it locally
- Then we move to Section 1 (Hero)

---
