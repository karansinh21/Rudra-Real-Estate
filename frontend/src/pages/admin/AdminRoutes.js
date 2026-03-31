import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin        from './AdminLogin';
import AdminSetup        from './AdminSetup';
import CompleteAdminPanel from './CompleteAdminPanel';

// ── Auth guard ────────────────────────────────────────────
const AdminProtected = ({ children }) => {
  const token     = localStorage.getItem('adminToken');
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  if (!token || adminUser.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AdminRoutes = () => (
  <Routes>
    <Route path="login"  element={<AdminLogin />} />
    <Route path="setup"  element={<AdminSetup />} />
    <Route path="panel"  element={<AdminProtected><CompleteAdminPanel /></AdminProtected>} />
    {/* Redirect /admin → /admin/panel */}
    <Route index element={<Navigate to="panel" replace />} />
  </Routes>
);

export default AdminRoutes;