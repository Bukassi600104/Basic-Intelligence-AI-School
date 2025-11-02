import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";

// Static imports for critical pages (homepage, auth, core)
import HomePage from './pages/home-page';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ForcePasswordChangePage from './pages/auth/ForcePasswordChangePage';
import AboutPage from './pages/about-page';
import PricingPlansPage from './pages/pricing-plans-page';
import JoinMembershipPage from './pages/join-membership-page';
import CoursesPage from './pages/courses';

// Lazy load admin pages (reduces initial bundle)
const AdminDashboard = lazy(() => import('./pages/admin-dashboard'));
const AdminUsersPage = lazy(() => import('./pages/admin-users'));
const AdminCourses = lazy(() => import('./pages/admin-courses'));
const AdminContentPage = lazy(() => import('./pages/admin-content'));
const AdminSettings = lazy(() => import('./pages/admin-settings'));
const AdminSettingsNew = lazy(() => import('./pages/admin-dashboard/Settings'));
const AdminAnalytics = lazy(() => import('./pages/admin-analytics'));
const AdminNotifications = lazy(() => import('./pages/admin-notifications'));
const AdminNotificationWizard = lazy(() => import('./pages/admin-notification-wizard'));
const AdminReviews = lazy(() => import('./pages/admin-reviews'));

// Lazy load student pages (reduces initial bundle)
const StudentDashboard = lazy(() => import('./pages/student-dashboard'));
const StudentPDFs = lazy(() => import('./pages/student-dashboard/pdfs'));
const StudentVideos = lazy(() => import('./pages/student-dashboard/videos'));
const StudentPrompts = lazy(() => import('./pages/student-dashboard/prompts'));
const StudentSubscription = lazy(() => import('./pages/student-dashboard/subscription'));
const StudentSettings = lazy(() => import('./pages/student-dashboard/settings'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-foreground font-medium">Loading page...</p>
    </div>
  </div>
);


const Routes = () => {
  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <RouterRoutes>
            {/* Core Pages - Static Imports */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home-page" element={<HomePage />} />
            <Route path="/about-page" element={<AboutPage />} />
            <Route path="/contact" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPlansPage />} />
            <Route path="/pricing-plans-page" element={<PricingPlansPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/join-membership-page" element={<JoinMembershipPage />} />
            
            {/* Auth Pages - Static Imports */}
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/force-password-change" element={<ForcePasswordChangePage />} />
            
            {/* Admin Dashboard Routes - Lazy Loaded */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-users" element={<AdminUsersPage />} />
            <Route path="/admin-courses" element={<AdminCourses />} />
            <Route path="/admin-content" element={<AdminContentPage />} />
            <Route path="/admin-settings" element={<AdminSettings />} />
            <Route path="/admin-dashboard/settings" element={<AdminSettingsNew />} />
            <Route path="/admin-analytics" element={<AdminAnalytics />} />
            <Route path="/admin/reports" element={<AdminAnalytics />} />
            <Route path="/admin-notifications" element={<AdminNotifications />} />
            <Route path="/admin-notification-wizard" element={<AdminNotificationWizard />} />
            <Route path="/admin-reviews" element={<AdminReviews />} />
            
            {/* Student Dashboard Routes - Lazy Loaded */}
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student-dashboard/pdfs" element={<StudentPDFs />} />
            <Route path="/student-dashboard/videos" element={<StudentVideos />} />
            <Route path="/student-dashboard/prompts" element={<StudentPrompts />} />
            <Route path="/student-dashboard/subscription" element={<StudentSubscription />} />
            <Route path="/student-dashboard/settings" element={<StudentSettings />} />
            
            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
