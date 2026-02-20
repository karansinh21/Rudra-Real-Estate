import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

// ✅ Unauthorized Page - directly yahan j banavi didhi
const UnauthorizedPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        Tane aa page joava ni permission nathi.
      </p>
      <Link
        to="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
      >
        Home Par Jao
      </Link>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ Fixed: /login ni jagah /auth par moklo
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // ✅ Fixed: /unauthorized ni jagah UnauthorizedPage show karo
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  return children;
};

export default ProtectedRoute;