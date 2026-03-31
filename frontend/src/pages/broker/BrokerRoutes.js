import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BrokerDashboard   from './BrokerDashboard';
import BrokerProperties  from './BrokerProperties';
import AddProperty       from './AddProperty';
import BrokerEnquiries   from './BrokerEnquiries';
import BrokerProfile     from './BrokerProfile';
import RequestLegalService from './RequestLegalService';

/**
 * BrokerRoutes — All broker panel routes
 *
 * Mount in your App.jsx like:
 *   <Route path="/broker/*" element={<ProtectedRoute role="BROKER"><BrokerRoutes /></ProtectedRoute>} />
 */
const BrokerRoutes = () => {
  return (
    <Routes>
      {/* Default → Dashboard */}
      <Route index                       element={<Navigate to="dashboard" replace />} />

      {/* Dashboard */}
      <Route path="dashboard"            element={<BrokerDashboard />} />

      {/* Properties */}
      <Route path="properties"           element={<BrokerProperties />} />
      <Route path="properties/add"       element={<AddProperty />} />
      <Route path="properties/edit/:id"  element={<AddProperty />} />

      {/* Enquiries */}
      <Route path="enquiries"            element={<BrokerEnquiries />} />

      {/* Legal */}
      <Route path="legal/request"        element={<RequestLegalService />} />

      {/* Profile */}
      <Route path="profile"              element={<BrokerProfile />} />

      {/* Fallback */}
      <Route path="*"                    element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default BrokerRoutes;