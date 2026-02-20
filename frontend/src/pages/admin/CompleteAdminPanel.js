import React, { useState } from 'react';
import { Users, Building2, Scale, TrendingUp, DollarSign, AlertCircle, CheckCircle, Edit, Trash2, Plus, Search, Filter, Download, BarChart3 } from 'lucide-react';

const CompleteAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUser, setShowAddUser] = useState(false);

  const stats = {
    totalUsers: 156,
    brokers: 45,
    lawyers: 12,
    clients: 99,
    properties: 324,
    activeListings: 287,
    soldProperties: 37,
    revenue: 2450000,
    thisMonth: 450000,
    pendingApprovals: 8
  };

  const users = [
    { id: 1, name: 'Rajesh Sharma', email: 'rajesh@broker.com', role: 'BROKER', status: 'Active', properties: 12, joined: '2024-01-15' },
    { id: 2, name: 'Adv. Priya Mehta', email: 'priya@lawyer.com', role: 'LAWYER', status: 'Active', cases: 45, joined: '2024-01-10' },
    { id: 3, name: 'Amit Kumar', email: 'amit@client.com', role: 'CLIENT', status: 'Active', enquiries: 5, joined: '2024-01-20' }
  ];

  const recentActivity = [
    { id: 1, type: 'property', action: 'New property listed', user: 'Rajesh Sharma', time: '5 min ago' },
    { id: 2, type: 'user', action: 'New broker registered', user: 'Neha Patel', time: '15 min ago' },
    { id: 3, type: 'legal', action: 'Legal request completed', user: 'Adv. Priya Mehta', time: '1 hour ago' },
    { id: 4, type: 'payment', action: 'Payment received', user: 'Amit Kumar', time: '2 hours ago' }
  ];

  const pendingApprovals = [
    { id: 1, type: 'Property', title: 'Luxury Villa in Alkapuri', user: 'Rajesh Sharma', date: '2024-01-20' },
    { id: 2, type: 'User', title: 'Broker Application', user: 'Suresh Kumar', date: '2024-01-19' },
    { id: 3, type: 'Legal', title: 'Datavej Registration', user: 'Adv. Amit Patel', date: '2024-01-18' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'lawyers', label: 'Lawyers', icon: Scale },
    { id: 'approvals', label: 'Approvals', icon: AlertCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Control Panel</h1>
            <p className="text-gray-400">Manage your entire real estate platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl transition-all flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Data</span>
            </button>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <Users className="h-8 w-8 text-blue-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Total Users</p>
            <p className="text-white text-3xl font-bold">{stats.totalUsers}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <Building2 className="h-8 w-8 text-green-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Properties</p>
            <p className="text-white text-3xl font-bold">{stats.properties}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <Scale className="h-8 w-8 text-purple-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Lawyers</p>
            <p className="text-white text-3xl font-bold">{stats.lawyers}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <DollarSign className="h-8 w-8 text-yellow-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Revenue</p>
            <p className="text-white text-3xl font-bold">₹{(stats.thisMonth / 1000).toFixed(0)}k</p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <AlertCircle className="h-8 w-8 text-red-400 mb-3" />
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-white text-3xl font-bold">{stats.pendingApprovals}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] px-6 py-4 font-semibold transition-all flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
              <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      activity.type === 'property' ? 'bg-blue-500/20' :
                      activity.type === 'user' ? 'bg-green-500/20' :
                      activity.type === 'legal' ? 'bg-purple-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      {activity.type === 'property' ? <Building2 className="h-6 w-6 text-blue-400" /> :
                       activity.type === 'user' ? <Users className="h-6 w-6 text-green-400" /> :
                       activity.type === 'legal' ? <Scale className="h-6 w-6 text-purple-400" /> :
                       <DollarSign className="h-6 w-6 text-yellow-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{activity.action}</p>
                      <p className="text-gray-400 text-sm">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
              <h3 className="text-2xl font-bold text-white mb-6">Revenue</h3>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                  <p className="text-white text-2xl font-bold">₹{(stats.revenue / 100000).toFixed(1)}L</p>
                  <div className="flex items-center text-green-400 text-sm mt-2">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>+23% this month</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-gray-400 text-sm mb-1">This Month</p>
                  <p className="text-white text-2xl font-bold">₹{(stats.thisMonth / 1000).toFixed(0)}k</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Property Sales</span>
                    <span className="text-white font-bold">65%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Legal Services</span>
                    <span className="text-white font-bold">35%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">User Management</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-2 rounded-xl transition-all">
                  <Filter className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Activity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-semibold">{user.name}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'BROKER' ? 'bg-blue-500/20 text-blue-400' :
                          user.role === 'LAWYER' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white">
                          {user.properties && `${user.properties} properties`}
                          {user.cases && `${user.cases} cases`}
                          {user.enquiries && `${user.enquiries} enquiries`}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{user.joined}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Pending Approvals</h3>
            
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full">
                          {item.type}
                        </span>
                        <h4 className="text-white font-bold text-lg">{item.title}</h4>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">Submitted by: {item.user}</p>
                      <p className="text-gray-500 text-xs">Date: {item.date}</p>
                    </div>
                  </div>

                  <div className="flex space-x-3 mt-4 pt-4 border-t border-white/10">
                    <button className="flex-1 bg-green-500/20 text-green-400 py-3 rounded-xl font-semibold hover:bg-green-500/30 transition-all flex items-center justify-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Approve</span>
                    </button>
                    <button className="flex-1 bg-red-500/20 text-red-400 py-3 rounded-xl font-semibold hover:bg-red-500/30 transition-all flex items-center justify-center space-x-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteAdminPanel;