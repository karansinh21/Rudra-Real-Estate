import React, { useState, useEffect } from 'react';
import { Building2, MessageSquare, FileText, TrendingUp, Plus, Eye, DollarSign, Users, Activity, LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const BrokerDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    properties: 0,
    enquiries: 0,
    legalRequests: 0,
    revenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchDashboardData();
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // ✅ Fixed: /api/broker/properties → /api/properties/my/properties
      const propertiesRes = await fetch('http://localhost:5000/api/properties/my/properties', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const propertiesData = await propertiesRes.json();

      // Fetch enquiries
      const enquiriesRes = await fetch('http://localhost:5000/api/enquiries/my-enquiries', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const enquiriesData = await enquiriesRes.json();

      // Fetch legal requests
      const legalRes = await fetch('http://localhost:5000/api/legal/requests/my-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const legalData = await legalRes.json();

      setStats({
        properties: propertiesData.properties?.length || propertiesData.length || 0,
        enquiries: enquiriesData.enquiries?.length || enquiriesData.length || 0,
        legalRequests: legalData.requests?.length || legalData.length || 0,
        revenue: 2500000
      });

      const activities = [
        { type: 'enquiry', message: 'New enquiry received', time: '5 min ago', icon: MessageSquare, color: 'text-green-500' },
        { type: 'property', message: 'Property listed successfully', time: '1 hour ago', icon: Building2, color: 'text-blue-500' },
        { type: 'legal', message: 'Legal document processed', time: '2 hours ago', icon: FileText, color: 'text-purple-500' },
        { type: 'enquiry', message: 'Client visit scheduled', time: '3 hours ago', icon: Users, color: 'text-yellow-500' }
      ];
      setRecentActivity(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed: logout properly using AuthContext
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  const statCards = [
    {
      id: 'properties',
      icon: Building2,
      title: 'Properties',
      value: stats.properties,
      change: '+12%',
      color: 'from-blue-500 to-cyan-500',
      path: '/broker/properties'  // ✅ Fixed
    },
    {
      id: 'enquiries',
      icon: MessageSquare,
      title: 'Enquiries',
      value: stats.enquiries,
      change: '+23%',
      color: 'from-green-500 to-emerald-500',
      path: '/broker/enquiries'  // ✅ Fixed
    },
    {
      id: 'legal',
      icon: FileText,
      title: 'Legal Docs',
      value: stats.legalRequests,
      change: '+8%',
      color: 'from-purple-500 to-pink-500',
      path: '/broker/legal/request'  // ✅ Fixed
    },
    {
      id: 'revenue',
      icon: DollarSign,
      title: 'Revenue',
      value: `₹${(stats.revenue / 100000).toFixed(1)}L`,
      change: '+34%',
      color: 'from-orange-500 to-red-500',
      path: '/broker/dashboard'  // ✅ Fixed (analytics nathi to dashboard j rakhyu)
    }
  ];

  const quickActions = [
    { title: 'Add Property', icon: Plus, gradient: 'from-blue-600 to-cyan-600', path: '/broker/properties/add' },      // ✅ Fixed
    { title: 'View Enquiries', icon: Eye, gradient: 'from-green-600 to-emerald-600', path: '/broker/enquiries' },       // ✅ Fixed
    { title: 'Legal Request', icon: FileText, gradient: 'from-purple-600 to-pink-600', path: '/broker/legal/request' }, // ✅ Fixed
    { title: 'My Properties', icon: Building2, gradient: 'from-orange-600 to-red-600', path: '/broker/properties' }     // ✅ Fixed
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Cursor Glow Effect */}
      <div
        className="fixed w-96 h-96 rounded-full pointer-events-none transition-all duration-200 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          zIndex: 1
        }}
      ></div>

      {/* Top Navigation */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Broker Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateTo('/')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Welcome Back! 👋
              </h1>
              <p className="text-gray-400 text-lg">Here's what's happening with your properties today</p>
            </div>
            <div className="hidden md:block bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Today</p>
                  <p className="text-white font-bold">{new Date().toLocaleDateString()}</p>
                </div>
                <Activity className="h-8 w-8 text-green-400 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card) => (
            <div
              key={card.id}
              className="group relative cursor-pointer"
              onMouseEnter={() => setHoveredStat(card.id)}
              onMouseLeave={() => setHoveredStat(null)}
              onClick={() => navigateTo(card.path)}
              style={{
                transform: hoveredStat === card.id ? 'translateY(-8px)' : 'translateY(0)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 overflow-hidden shadow-2xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className={`absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br ${card.color} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${card.color} rounded-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-green-400 text-sm font-bold flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {card.change}
                    </span>
                  </div>
                  <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
                  <p className="text-4xl font-bold text-white mb-2">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigateTo(action.path)}
                    className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                    <div className="relative flex items-center space-x-4">
                      <div className={`p-3 bg-gradient-to-br ${action.gradient} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-white font-semibold group-hover:translate-x-1 transition-transform duration-300">
                        {action.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Performance Overview</h2>
              <div className="h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-400">Your properties are performing well!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="group bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-xl ${activity.color.replace('text-', 'bg-')}/20`}>
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium group-hover:text-blue-400 transition-colors">
                        {activity.message}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;