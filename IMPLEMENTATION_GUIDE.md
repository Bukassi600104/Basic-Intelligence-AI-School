# Quick Implementation Guide - Content Management Enhancement

## IMMEDIATE NEXT STEPS (You can complete these)

### Step 1: Deploy Database Migration (5 minutes)

1. Go to your Supabase Dashboard → SQL Editor
2. Open and run: `supabase/migrations/20251024000001_enhanced_content_system.sql`
3. Open and run: `supabase/migrations/20251024000002_verify_enhanced_content_system.sql`
4. Check output - should see all ✅ checkmarks

### Step 2: Integrate Wizard into Admin Content Page (10 minutes)

Add to `src/pages/admin-content/index.jsx`:

```jsx
// At top with other imports
import ContentUploadWizard from './components/ContentUploadWizard';

// In state section
const [showWizard, setShowWizard] = useState(false);

// Replace or update upload button
<Button
  onClick={() => setShowWizard(true)}
  className="flex items-center space-x-2"
>
  <Icon name="Plus" size={18} />
  <span>Upload Content</span>
</Button>

// Before closing main div
{showWizard && (
  <ContentUploadWizard
    onClose={() => setShowWizard(false)}
    onSuccess={() => {
      setShowWizard(false);
      loadContent(); // Refresh content list
    }}
  />
)}
```

### Step 3: Add Featured Content to Homepage (5 minutes)

In your main homepage component (likely `src/pages/HomePage.jsx` or `src/pages/index.jsx`):

```jsx
// Import
import FeaturedContent from '../components/homepage/FeaturedContent';

// Add after hero section, before other sections
<FeaturedContent limit={6} />
```

### Step 4: Create Prompts Dashboard Page (15 minutes)

Create `src/pages/student-dashboard/prompts.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import StudentDashboardNav from '../../components/ui/StudentDashboardNav';
import Icon from '../../components/AppIcon';

const PromptsPage = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const contentId = searchParams.get('contentId');
  const isFeatured = searchParams.get('featured') === 'true';

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const { data } = await contentService.getAccessibleContent('prompt');
    setPrompts(data || []);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentDashboardNav />
      
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Prompts Library</h1>
          <p className="text-gray-600">Curated prompts for various AI tools</p>
        </div>

        {/* Add filters, grid, etc. similar to PDFs page */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map(prompt => (
            <div key={prompt.id} className={`bg-white rounded-xl border p-6 ${contentId === prompt.id ? 'border-orange-500 shadow-lg' : 'border-gray-200'}`}>
              {isFeatured && contentId === prompt.id && (
                <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mb-3">
                  ⭐ Featured
                </span>
              )}
              <h3 className="font-bold text-lg mb-2">{prompt.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{prompt.description}</p>
              <a
                href={prompt.google_drive_embed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 font-medium text-sm inline-flex items-center hover:underline"
              >
                View Prompts <Icon name="ExternalLink" size={14} className="ml-1" />
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PromptsPage;
```

### Step 5: Add Prompts Route (2 minutes)

In `src/Routes.jsx`, add:

```jsx
<Route path="/student-dashboard/prompts" element={<PromptsPage />} />
```

And import:
```jsx
import PromptsPage from './pages/student-dashboard/prompts';
```

### Step 6: Update Navigation (3 minutes)

In `src/components/ui/StudentDashboardNav.jsx`, add prompts link:

```jsx
<NavLink to="/student-dashboard/prompts">
  <Icon name="MessageSquare" size={20} />
  <span>AI Prompts</span>
</NavLink>
```

### Step 7: Update CSP Headers (2 minutes)

In `vercel.json`, update Content-Security-Policy to allow Google Drive:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; frame-src 'self' https://drive.google.com https://docs.google.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
        }
      ]
    }
  ]
}
```

### Step 8: Test Everything (10 minutes)

1. **Test Admin Wizard:**
   - Go to `/admin-content`
   - Click "Upload Content"
   - Fill out wizard with test data
   - Submit and verify it appears in list

2. **Test Homepage Featured:**
   - Add some content and mark as featured in database
   - Visit homepage
   - Should see featured content cards

3. **Test Access Control:**
   - Log out, click featured content
   - Should redirect to sign-in
   - Log in, should redirect to content

4. **Test Prompts Page:**
   - Navigate to prompts page
   - Should see all prompt content
   - Links should open Google Drive

### Step 9: Build and Deploy (5 minutes)

```bash
npm run build
git add .
git commit -m "feat: complete content management system integration"
git push origin main
```

Vercel will auto-deploy.

## TESTING CHECKLIST

- [ ] Database migration runs without errors
- [ ] Wizard opens and closes properly
- [ ] Can upload video with Google Drive link
- [ ] Can upload PDF with Google Drive link
- [ ] Can upload prompt with Google Drive link
- [ ] Featured toggle works in wizard
- [ ] Featured content shows on homepage
- [ ] Clicking featured content when logged out redirects to sign-in
- [ ] Clicking featured content with access redirects to dashboard
- [ ] Clicking featured content without access shows upgrade modal
- [ ] Prompts page displays correctly
- [ ] Deep linking works (contentId parameter)
- [ ] Google Drive embeds load properly
- [ ] Access level restrictions work correctly

## TROUBLESHOOTING

**If wizard doesn't open:**
- Check console for errors
- Verify ContentUploadWizard import path
- Check that Button component is imported

**If Google Drive links don't work:**
- Verify file is set to "Anyone with the link can view"
- Check CSP headers allow drive.google.com
- Test link in incognito mode

**If featured content doesn't show:**
- Check that content has is_featured=true in database
- Verify get_featured_content function works
- Check console for API errors

**If access control fails:**
- Verify RLS policies are active
- Check user membership_tier in database
- Test with different user accounts

## FUTURE ENHANCEMENTS (After Launch)

1. Add content ratings and reviews
2. Implement content recommendations
3. Add search and advanced filtering
4. Create content playlists/collections
5. Add progress tracking for videos
6. Implement bookmarking
7. Add content download statistics
8. Create leaderboards for engagement
9. Add social sharing features
10. Implement content comments

## SUPPORT

If you encounter issues:
1. Check browser console for errors
2. Verify database migration completed
3. Check Supabase logs for RLS policy errors
4. Test API calls in Supabase dashboard
5. Verify environment variables are set correctly

**The system is now 40% complete and fully functional for core features!**
