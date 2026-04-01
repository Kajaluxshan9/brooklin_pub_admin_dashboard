import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

// Auth pages – small, loaded eagerly for fast login
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import EmailVerificationPage from '../pages/EmailVerificationPage';

// Layout loaded eagerly (always needed for authenticated users)
import DashboardLayout from '../components/DashboardLayout';

// Lazy-loaded page components for code splitting
const Dashboard = lazy(() => import('../pages/Dashboard'));
const MenuManagement = lazy(() => import('../pages/MenuManagement'));
const MeasurementsManagement = lazy(
  () => import('../pages/MeasurementsManagement'),
);
const SpecialsManagement = lazy(() => import('../pages/SpecialsManagement'));
const EventsManagement = lazy(() => import('../pages/EventsManagement'));
const StoriesManagement = lazy(() => import('../pages/StoriesManagement'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const OpeningHours = lazy(() => import('../pages/OpeningHours'));
const Settings = lazy(() => import('../pages/Settings'));
const NewsletterManagement = lazy(
  () => import('../pages/NewsletterManagement'),
);
const AnnouncementsManagement = lazy(
  () => import('../pages/AnnouncementsManagement'),
);
const ScheduledNotifications = lazy(
  () => import('../pages/ScheduledNotifications'),
);

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="measurements" element={<MeasurementsManagement />} />
          <Route path="specials" element={<SpecialsManagement />} />
          <Route path="events" element={<EventsManagement />} />
          <Route path="stories" element={<StoriesManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="hours" element={<OpeningHours />} />
          <Route path="newsletter" element={<NewsletterManagement />} />
          <Route path="announcements" element={<AnnouncementsManagement />} />
          <Route path="notifications" element={<ScheduledNotifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
