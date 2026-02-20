import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, propertyAPI, enquiryAPI, legalAPI } from '../../services/api';
import { Users, Building2, MessageSquare, FileText, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, brokers: 0, lawyers: 0 },
    properties: 0,
    enquiries: 0,
    legalRequests: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, propertiesRes, enquiriesRes, legalRes] = await Promise.all([
        userAPI.getAll(),
        propertyAPI.getAll(),
        enquiryAPI.getAll(),
        legalAPI.getAllRequests()
      ]);

      const users = usersRes.data.users;
      
      setStats({
        users: {
          total: users.length,
          brokers: users.filter(u => u.role === 'BROKER').length,
          lawyers: users.filter(u => u.role === 'LAWYER').length
        },
        properties: propertiesRes.data.count,
        enquiries: enquiriesRes.data.count,
        legalRequests: legalRes.data.count
      });

      setRecentUsers(users.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Link
            to="/admin/users/add"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Add New User
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.users.brokers} Brokers, {stats.users.lawyers} Lawyers
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Properties</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.properties}</p>
              </div>
              <Building2 className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Enquiries</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.enquiries}</p>
              </div>
              <MessageSquare className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Legal Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.legalRequests}</p>
              </div>
              <FileText className="h-12 w-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/admin/users"
            className="bg-blue-600 text-white rounded-lg p-4 flex items-center justify-center space-x-2 hover:bg-blue-700 transition"
          >
            <Users className="h-5 w-5" />
            <span>Manage Users</span>
          </Link>

          <Link
            to="/admin/properties"
            className="bg-green-600 text-white rounded-lg p-4 flex items-center justify-center space-x-2 hover:bg-green-700 transition"
          >
            <Building2 className="h-5 w-5" />
            <span>View All Properties</span>
          </Link>

          <Link
            to="/admin/reports"
            className="bg-purple-600 text-white rounded-lg p-4 flex items-center justify-center space-x-2 hover:bg-purple-700 transition"
          >
            <TrendingUp className="h-5 w-5" />
            <span>View Reports</span>
          </Link>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
            <Link to="/admin/users" className="text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No users yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'BROKER' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Overview */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-blue-100 text-sm mb-1">Platform Status</p>
              <p className="text-2xl font-bold">Operational</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Transactions</p>
              <p className="text-2xl font-bold">{stats.properties + stats.legalRequests}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Active Users</p>
              <p className="text-2xl font-bold">{stats.users.total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;