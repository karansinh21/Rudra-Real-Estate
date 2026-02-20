import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LawyerDashboard from './LawyerDashboard';
import LawyerDashboardComplete from './LawyerDashboardComplete';
import LawyerAccountSettings from './LawyerAccountSettings';

const LawyerRoutes = () => {
  return (
    <Routes>
      {/* Default route - redirects to main dashboard */}
      <Route path="/" element={<Navigate to="/lawyer/dashboard" replace />} />
      
      {/* Main Dashboard - Simple version with request management */}
      <Route path="/dashboard" element={<LawyerDashboard />} />
      
      {/* Complete Dashboard - Enhanced version with appointments and analytics */}
      <Route path="/dashboard-complete" element={<LawyerDashboardComplete />} />
      
      {/* Account Settings */}
      <Route path="/settings" element={<LawyerAccountSettings />} />
      
      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/lawyer/dashboard" replace />} />
    </Routes>
  );
};

export default LawyerRoutes;