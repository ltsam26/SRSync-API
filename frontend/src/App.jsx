import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard pages
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ApiKeys from './pages/ApiKeys';
import Analytics from './pages/Analytics';
import Subscriptions from './pages/Subscriptions';
import Settings from './pages/Settings';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import PlanManagement from './pages/admin/PlanManagement';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* User Dashboard */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="projects"      element={<Projects />} />
          <Route path="keys/:projectId?" element={<ApiKeys />} />
          <Route path="analytics"     element={<Analytics />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="settings"      element={<Settings />} />
        </Route>

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminRoute><DashboardLayout isAdmin /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="plans" element={<PlanManagement />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
