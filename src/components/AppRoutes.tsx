import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginPage from "../pages/LoginPage";
import DashboardLayout from "../components/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import MenuManagement from "../pages/MenuManagement";
import SpecialsManagement from "../pages/SpecialsManagement";
import EventsManagement from "../pages/EventsManagement";
import UserManagement from "../pages/UserManagement";
import OpeningHours from "../pages/OpeningHours";
import Settings from "../pages/Settings";
import LoadingScreen from "../components/LoadingScreen";

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="specials" element={<SpecialsManagement />} />
        <Route path="events" element={<EventsManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="hours" element={<OpeningHours />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
