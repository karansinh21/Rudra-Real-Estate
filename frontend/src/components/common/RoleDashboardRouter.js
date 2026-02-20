import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const RoleDashboardRouter = () => {
  const { user } = useAuth();

  // Redirect based on role
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  if (user?.role === 'BROKER') {
    return <Navigate to="/broker/dashboard" replace />;
  }
  
  if (user?.role === 'LAWYER') {
    return <Navigate to="/lawyer/dashboard" replace />;
  }
  
  if (user?.role === 'PUBLIC') {
    return <Navigate to="/public/dashboard" replace />;
  }

  // Default fallback
  return <Navigate to="/" replace />;
};

export default RoleDashboardRouter;