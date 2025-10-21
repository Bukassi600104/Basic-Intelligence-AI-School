import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AdminDashboard from './pages/admin-dashboard';
import AdminUsersPage from './pages/admin-users';
import JoinMembershipPage from './pages/join-membership-page';
import AdminCourses from './pages/admin-courses';
import AdminContentPage from './pages/admin-content';
import AdminSettings from './pages/admin-settings';
import AdminAnalytics from './pages/admin-analytics';
import AdminNotifications from './pages/admin-notifications';
import AdminNotificationWizard from './pages/admin-notification-wizard';
import AdminReviews from './pages/admin-reviews';
import AboutPage from './pages/about-page';
import HomePage from './pages/home-page';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import PricingPlansPage from './pages/pricing-plans-page';
import StudentDashboard from './pages/student-dashboard';
import StudentPDFs from './pages/student-dashboard/pdfs';
import StudentVideos from './pages/student-dashboard/videos';
import StudentPrompts from './pages/student-dashboard/prompts';
import StudentSubscription from './pages/student-dashboard/subscription';
import StudentSettings from './pages/student-dashboard/settings';
import CoursesPage from './pages/courses';
import TestPage from './pages/test-page';
import TestAuthState from './pages/test-auth-state';

const Routes = () => {
  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || '/'}>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<HomePage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-users" element={<AdminUsersPage />} />
        <Route path="/admin-courses" element={<AdminCourses />} />
        <Route path="/admin-content" element={<AdminContentPage />} />
        <Route path="/admin-settings" element={<AdminSettings />} />
        <Route path="/admin-analytics" element={<AdminAnalytics />} />
        <Route path="/admin-notifications" element={<AdminNotifications />} />
        <Route path="/admin-notification-wizard" element={<AdminNotificationWizard />} />
        <Route path="/admin-reviews" element={<AdminReviews />} />
        <Route path="/test-reviews" element={<TestPage />} />
        <Route path="/test-auth-state" element={<TestAuthState />} />
        <Route path="/join-membership-page" element={<JoinMembershipPage />} />
        <Route path="/about-page" element={<AboutPage />} />
        <Route path="/home-page" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/pricing" element={<PricingPlansPage />} />
        <Route path="/pricing-plans-page" element={<PricingPlansPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/contact" element={<AboutPage />} />
        
        {/* Student Dashboard Routes */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-dashboard/pdfs" element={<StudentPDFs />} />
        <Route path="/student-dashboard/videos" element={<StudentVideos />} />
        <Route path="/student-dashboard/prompts" element={<StudentPrompts />} />
        <Route path="/student-dashboard/subscription" element={<StudentSubscription />} />
        <Route path="/student-dashboard/settings" element={<StudentSettings />} />
        
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
