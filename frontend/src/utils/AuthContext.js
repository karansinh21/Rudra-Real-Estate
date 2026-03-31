import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ✅ Use env var — no hardcoded localhost
const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []); // eslint-disable-line

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');

    if (!storedToken || !storedUser) { setLoading(false); return; }

    try {
      const parsedUser = JSON.parse(storedUser);
      // Set from localStorage immediately so UI doesn't flash
      setToken(storedToken);
      setUser(parsedUser);

      // ✅ Verify with backend — correct endpoint is /auth/profile
      try {
        const response = await fetch(`${BASE}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });

        if (response.status === 401 || response.status === 403) {
          console.warn('Token expired — logging out');
          _clearAuth();
          return;
        }

        if (response.ok) {
          const data = await response.json();
          const freshUser = data.user || data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
        // 500 / network errors → silently ignore, use localStorage
      } catch (networkError) {
        console.warn('Backend unreachable — using cached auth:', networkError.message);
      }

    } catch (parseError) {
      console.error('Corrupt auth data:', parseError);
      _clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const _clearAuth = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const login = (userData, authToken) => {
    _clearAuth();
    setUser(userData); setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const loginWithCredentials = async (credentials) => {
    const response = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Login failed');
    login(data.user || data, data.token);
    return data.user || data;
  };

  const register = async (userData) => {
    const response = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Registration failed');
    return data;
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return true;
  };

  const logout = () => {
    _clearAuth();
    window.location.href = '/auth';
  };

  const value = {
    user, token, loading,
    login, loginWithCredentials, register, logout, updateUser,
    isAuthenticated: !!user,
    isAdmin:   user?.role === 'ADMIN',
    isBroker:  user?.role === 'BROKER',
    isLawyer:  user?.role === 'LAWYER',
    isPublic:  user?.role === 'PUBLIC' || user?.role === 'USER',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};