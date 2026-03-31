import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const UnauthorizedPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
      <p className="text-gray-500 mb-6">Tane aa page joava ni permission nathi.</p>
      <Link to="/" className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition-colors inline-block font-semibold">
        Home Par Jao
      </Link>
    </div>
  </div>
);

// ✅ 'USER' ane 'PUBLIC' — banne same treat karo
const normalizeRole = (role) => {
  if (!role) return '';
  if (role === 'USER') return 'PUBLIC'; // backend 'USER' mokle to bhi chalse
  return role.toUpperCase();
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600" />
      </div>
    );
  }

  // ✅ User logged in nathi → login page par moklo
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // ✅ Role check — normalize karine compare karo
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = normalizeRole(user.role);
    const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));

    if (!normalizedAllowed.includes(userRole)) {
      return <UnauthorizedPage />;
    }
  }

  return children;
};

export default ProtectedRoute;