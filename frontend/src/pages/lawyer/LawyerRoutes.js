// frontend/src/pages/lawyer/LawyerRoutes.jsx
// REPLACE your existing LawyerRoutes.jsx with this
//
// CHANGES:
//   - Removed /services and /requests separate routes
//     (LawyerDashboard now handles both internally via sidebar)
//   - Kept /settings route pointing to LawyerAccountSettings
//   - All unknown paths redirect to dashboard

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LawyerDashboard from './LawyerDashboard';
import LawyerAccountSettings from './LawyerAccountSettings';

const LawyerRoutes = () => {
  return (
    <Routes>
      {/* Default → dashboard */}
      <Route path="/"          element={<Navigate to="/lawyer/dashboard" replace />} />

      {/* Main dashboard — includes Requests & Services as internal views */}
      <Route path="/dashboard" element={<LawyerDashboard />} />

      {/* Account settings (separate page — heavier form, ok to keep) */}
      <Route path="/settings"  element={<LawyerAccountSettings />} />

      {/* Catch-all */}
      <Route path="*"          element={<Navigate to="/lawyer/dashboard" replace />} />
    </Routes>
  );
};

export default LawyerRoutes;