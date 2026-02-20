import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Heart, Calendar, Calculator, User, Mail, Phone, FileText, Clock, Settings } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';

const PublicUserDashboard = () => {
  const { user } = useAuth();
  
  // Mock data - તમે આને API થી fetch કરી શકો
  const [stats] = useState({
    savedProperties: 12,
    scheduledTours: 3,
    enquiriesSent: 8,
    consultationsBooked: 2
  });

  const [recentActivity] = useState([
    { id: 1, type: 'wishlist', action: 'Saved 3BHK Apartment to wishlist', time: '2 hours ago' },
    { id: 2, type: 'tour', action: 'Scheduled tour for Villa in Gorwa', time: '1 day ago' },
    { id: 3, type: 'enquiry', action: 'Sent enquiry for Commercial Space', time: '2 days ago' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}!</h1>
              <p className="text-gray-600 mb-4">Your property search dashboard</p>
              <div className="flex gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
            {/* 🆕 CHANGED - Navigate to /account/settings instead of /profile */}
            <Link
              to="/account/settings"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.savedProperties}</span>
            </div>
            <h3 className="text-gray-600 font-semibold">Saved Properties</h3>
            <Link to="/wishlist" className="text-blue-600 text-sm hover:underline mt-2 block">
              View Wishlist →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.scheduledTours}</span>
            </div>
            <h3 className="text-gray-600 font-semibold">Scheduled Tours</h3>
            <Link to="/schedule-tour" className="text-blue-600 text-sm hover:underline mt-2 block">
              View Tours →
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.enquiriesSent}</span>
            </div>
            <h3 className="text-gray-600 font-semibold">Enquiries Sent</h3>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Calculator className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900">{stats.consultationsBooked}</span>
            </div>
            <h3 className="text-gray-600 font-semibold">Consultations</h3>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/glass-cards"
                className="flex flex-col items-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Home className="w-8 h-8 text-blue-600 mb-3" />
                <span className="font-semibold text-gray-900">Browse Properties</span>
              </Link>

              <Link
                to="/schedule-tour"
                className="flex flex-col items-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <Calendar className="w-8 h-8 text-green-600 mb-3" />
                <span className="font-semibold text-gray-900">Schedule Tour</span>
              </Link>

              <Link
                to="/calculators"
                className="flex flex-col items-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <Calculator className="w-8 h-8 text-purple-600 mb-3" />
                <span className="font-semibold text-gray-900">Calculators</span>
              </Link>

              <Link
                to="/lawyers"
                className="flex flex-col items-center p-6 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
              >
                <User className="w-8 h-8 text-pink-600 mb-3" />
                <span className="font-semibold text-gray-900">Find Lawyers</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
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

export default PublicUserDashboard;