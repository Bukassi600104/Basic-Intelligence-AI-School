# 🏗️ HOMEPAGE ARCHITECTURE DIAGRAM

## Complete Component Tree

```
HomePage.jsx (Main page composition)
│
├─ Navbar.jsx (Section 0)
│  ├─ Logo
│  ├─ Desktop Nav Links
│  ├─ Hamburger Menu (mobile)
│  ├─ Login Link
│  └─ Join Now Button
│
├─ Hero.jsx (Section 1)
│  ├─ Headline
│  ├─ Subheadline
│  ├─ Primary CTA Button
│  └─ Secondary CTA Button
│
├─ SocialProof.jsx (Section 2)
│  ├─ Title Bar
│  ├─ ChatGPT Logo
│  ├─ Google Gemini Logo
│  ├─ Google Studio Logo
│  └─ Midjourney Logo
│
├─ ProblemSolution.jsx (Section 3)
│  ├─ Problem Cards Grid
│  │  ├─ Card 1: Feeling Left Behind?
│  │  ├─ Card 2: Don't Know Where to Start?
│  │  └─ Card 3: Wasting Time on Bad Prompts?
│  └─ Solution Section
│     ├─ Headline
│     ├─ Check Item 1
│     ├─ Check Item 2
│     └─ Check Item 3
│
├─ HowItWorks.jsx (Section 4)
│  ├─ Timeline/Tabs Container
│  ├─ Step 1: BASIC
│  ├─ Step 2: INTERMEDIATE
│  ├─ Step 3: ADVANCED
│  ├─ Step 4: PRO
│  └─ CTA Button: Explore Curriculum
│
├─ PromptLibrarySpotlight.jsx (Section 5)
│  ├─ Left Column (Text)
│  │  ├─ Headline
│  │  ├─ Subheadline
│  │  └─ Feature List (3 items)
│  └─ Right Column (Visual)
│     └─ Mockup/Placeholder
│
├─ Testimonials.jsx (Section 6)
│  ├─ Headline: "Don't Just Take Our Word"
│  └─ Cards Container
│     ├─ Card 1: Quote + Photo + Name + Title
│     ├─ Card 2: Quote + Photo + Name + Title
│     └─ Card 3: Quote + Photo + Name + Title
│
├─ PricingSection.jsx (Section 7)
│  ├─ Headline
│  ├─ Monthly Box
│  │  ├─ Price
│  │  ├─ Features List
│  │  ├─ CTA Button
│  │  └─ Money-back guarantee
│  └─ Annual Box
│     ├─ "Best Value" Badge
│     ├─ Price
│     ├─ Features List
│     ├─ CTA Button
│     └─ Money-back guarantee
│
├─ ClosingCTA.jsx (Section 8)
│  ├─ Background (bold color)
│  ├─ Headline
│  ├─ Subheadline
│  └─ CTA Button: "Join Basic AI School Now"
│
└─ Footer.jsx (Section 9)
   ├─ Column 1: Logo + Mission
   ├─ Column 2: School Links
   │  ├─ Courses
   │  ├─ Prompt Library
   │  └─ Pricing
   ├─ Column 3: Company Links
   │  ├─ About
   │  ├─ Blog
   │  └─ Contact
   ├─ Column 4: Legal Links
   │  ├─ Terms of Service
   │  └─ Privacy Policy
   └─ Bottom Bar
      ├─ Copyright
      └─ Social Icons
```

---

## Responsive Behavior

### Desktop (>1024px)
```
Full-width layouts
3-4 column grids side-by-side
Navbar: Full menu visible
Hero: Large text, landscape aspect
Pricing: Side-by-side boxes
```

### Tablet (640-1024px)
```
2-column grids
Navbar: Hamburger appears at ~1000px
Hero: Medium text, adjusted spacing
Pricing: Still side-by-side or flex
```

### Mobile (<640px)
```
1-column stacked layouts
Navbar: Hamburger menu required
Hero: Stacked text, centered
Pricing: Stacked boxes
All full-width with padding
```

---

## Animation Flow

```
Page Load:
  ↓
Hero (fade-in + slide-up)
  ↓
User scrolls down
  ↓
SocialProof (fade-in, logo color on hover)
  ↓
ProblemSolution (staggered card animations)
  ↓
HowItWorks (timeline steps light up)
  ↓
PromptLibrary (left/right slide animations)
  ↓
Testimonials (fade-in + scale)
  ↓
Pricing (fade-in + hover lift)
  ↓
ClosingCTA (fade-in, button scale on hover)
  ↓
Footer (fade-in on scroll)
```

---

## Navbar Behavior

```
Initial State:
  - Background: transparent
  - Text: white/dark
  - Fixed to top
  
On Scroll (scrollY > 50):
  - Background: bg-white/70 with backdrop-blur
  - Shadow: drop-shadow-md
  - Text: adjust for contrast
  
Mobile (<640px):
  - Hamburger icon visible
  - Links hidden
  - Menu opens on hamburger click
```

---

## Color & Styling Strategy

### Tailwind Classes Used:
- **Backgrounds**: `bg-gradient-to-r`, `bg-white`, `bg-slate-900`
- **Text**: `text-2xl`, `text-slate-700`, `font-semibold`
- **Spacing**: `px-6`, `py-12`, `gap-4`, `space-y-4`
- **Borders**: `border`, `rounded-lg`, `border-slate-200`
- **Shadows**: `shadow-lg`, `shadow-md`
- **Hover**: `hover:scale-105`, `hover:text-blue-600`
- **Responsive**: `md:flex`, `md:grid-cols-3`, `lg:text-xl`

### Color Palette:
```
Primary: Blue (#3B82F6 - tailwind blue-500)
Secondary: Slate (#1E293B - slate-900)
Accent: Emerald (for success/checkmarks)
Background: White/Light Gray
Text: Slate-700 to Slate-900
```

---

## State Management

### Navbar.jsx
```javascript
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [isScrolled, setIsScrolled] = useState(false);
```

### Other Components
- No complex state needed
- All animations handled by framer-motion
- No API calls in design components
- Data fetching in parent or service layer

---

## File Dependencies

```
HomePage.jsx
  ├─ imports Navbar from components/layout/
  ├─ imports Hero from components/home/
  ├─ imports SocialProof from components/home/
  ├─ imports ProblemSolution from components/home/
  ├─ imports HowItWorks from components/home/
  ├─ imports PromptLibrarySpotlight from components/home/
  ├─ imports Testimonials from components/home/
  ├─ imports PricingSection from components/home/
  ├─ imports ClosingCTA from components/home/
  └─ imports Footer from components/layout/

Routes.jsx
  ├─ imports HomePage
  └─ routes to / (home page)
```

---

## Testing Checklist

- [ ] Navbar: Scroll behavior correct
- [ ] Hamburger: Opens/closes on mobile
- [ ] Hero: Animations smooth on load
- [ ] Social Proof: Logos color on hover
- [ ] Problem Cards: Staggered animation
- [ ] Timeline: Steps light up on scroll
- [ ] Testimonials: Cards fade in
- [ ] Pricing: Boxes lift on hover
- [ ] Buttons: Scale/tap effects smooth
- [ ] Footer: Mobile friendly

---

## Build & Deploy

```bash
# Development
npm run dev
# Visit http://localhost:4028

# Production build
npm run build

# Push to GitHub
git add .
git commit -m "feat: revamp homepage with 10-section design"
git push origin main

# Vercel auto-deploys
# Check deployment at https://www.basicai.fit
```

---

## 🎯 READY FOR CODING?

This architecture is complete and production-ready.

**Next step**: Say **"CONTINUE"** and I'll provide Section 0 (Navbar) full code.

---
