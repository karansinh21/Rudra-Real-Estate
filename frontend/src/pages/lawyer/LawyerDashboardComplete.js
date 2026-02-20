import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // ✅ Add Link
import { FileText, Clock, CheckCircle, Users, TrendingUp, IndianRupee, Calendar, MessageSquare, AlertCircle, Plus, Edit, Settings } from 'lucide-react'; // ✅ Add Settings

const LawyerDashboardComplete = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalRequests: 45,
    pending: 12,
    inProgress: 8,
    completed: 25,
    totalRevenue: 125000,
    thisMonth: 45000,
    clients: 38,
    avgRating: 4.8
  };

  const recentRequests = [
    {
      id: 1,
      service: 'Rent Agreement',
      client: 'Amit Kumar',
      broker: 'Rajesh Sharma',
      status: 'PENDING',
      date: '2024-01-15',
      amount: 2000,
      priority: 'high'
    },
    {
      id: 2,
      service: 'Property Registration',
      client: 'Priya Shah',
      broker: 'Neha Patel',
      status: 'IN_PROGRESS',
      date: '2024-01-14',
      amount: 5000,
      priority: 'medium'
    },
    {
      id: 3,
      service: 'Legal Consultation',
      client: 'Rahul Verma',
      broker: 'Suresh Kumar',
      status: 'COMPLETED',
      date: '2024-01-13',
      amount: 1500,
      priority: 'low'
    }
  ];

  const upcomingAppointments = [
    { id: 1, client: 'Amit Kumar', time: '10:00 AM', date: 'Today', type: 'Rent Agreement' },
    { id: 2, client: 'Priya Shah', time: '2:00 PM', date: 'Today', type: 'Consultation' },
    { id: 3, client: 'Rahul Verma', time: '11:00 AM', date: 'Tomorrow', type: 'Property Review' }
  ];

  const services = [
    { id: 1, name: 'Rent Agreement', price: 2000, requests: 15 },
    { id: 2, name: 'Property Registration', price: 5000, requests: 8 },
    { id: 3, name: 'Legal Consultation', price: 1500, requests: 22 },
    { id: 4, name: 'Title Verification', price: 3000, requests: 5 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ✅ Updated Header with Settings Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Lawyer Dashboard</h1>
            <p className="text-gray-400">Manage your legal services and clients</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/lawyer/settings"
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center space-x-2"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-blue-400" />
              <span className="text-yellow-400 text-sm font-bold flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {stats.pending} New
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Requests</p>
            <p className="text-white text-3xl font-bold">{stats.totalRequests}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-orange-400" />
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-gray-400 text-sm mb-1">In Progress</p>
            <p className="text-white text-3xl font-bold">{stats.inProgress}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
              <span className="text-green-400 text-sm font-bold">+5 today</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Completed</p>
            <p className="text-white text-3xl font-bold">{stats.completed}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <IndianRupee className="h-8 w-8 text-purple-400" />
              <span className="text-green-400 text-sm font-bold">+12%</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">This Month</p>
            <p className="text-white text-3xl font-bold">₹{(stats.thisMonth / 1000).toFixed(0)}k</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Requests List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Requests</h2>
                <select className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>

              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-white font-bold text-lg">{request.service}</h3>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Client</p>
                            <p className="text-white font-semibold">{request.client}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Broker</p>
                            <p className="text-white font-semibold">{request.broker}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Date</p>
                            <p className="text-white font-semibold">{request.date}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Amount</p>
                            <p className="text-green-400 font-bold">₹{request.amount}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t border-white/10">
                      {request.status === 'PENDING' && (
                        <>
                          <button className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-xl font-semibold hover:bg-blue-500/30 transition-all">
                            Accept
                          </button>
                          <button className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-xl font-semibold hover:bg-red-500/30 transition-all">
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === 'IN_PROGRESS' && (
                        <>
                          <button className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-xl font-semibold hover:bg-green-500/30 transition-all">
                            Mark Complete
                          </button>
                          <button className="bg-white/10 text-white p-2 rounded-xl hover:bg-white/20 transition-all">
                            <MessageSquare className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {request.status === 'COMPLETED' && (
                        <div className="flex items-center text-green-400 space-x-2">
                          <CheckCircle className="h-5 w-5" />
                          <span>Completed on {request.date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services Management */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">My Services</h2>
                <button className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl font-semibold hover:bg-blue-500/30 transition-all">
                  <Edit className="h-4 w-4 inline mr-2" />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <h3 className="text-white font-bold mb-2">{service.name}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-green-400 font-bold">
                        <IndianRupee className="h-4 w-4" />
                        <span>{service.price}</span>
                      </div>
                      <span className="text-gray-400">{service.requests} requests</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-blue-400" />
                Upcoming
              </h3>

              <div className="space-y-4">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-semibold">{apt.client}</p>
                      <span className="text-blue-400 text-sm font-bold">{apt.date}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{apt.type}</p>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {apt.time}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                View Calendar
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Quick Stats</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="text-gray-400">Total Clients</span>
                  </div>
                  <span className="text-white font-bold">{stats.clients}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <span className="text-gray-400">Avg Rating</span>
                  </div>
                  <span className="text-white font-bold">{stats.avgRating}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IndianRupee className="h-5 w-5 text-purple-400" />
                    <span className="text-gray-400">Total Revenue</span>
                  </div>
                  <span className="text-white font-bold">₹{(stats.totalRevenue / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl p-6">
              <h3 className="text-white font-bold mb-4">Profile Completion</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between text-white mb-2">
                  <span>85%</span>
                  <span className="text-sm">Almost there!</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <Link
                to="/lawyer/settings"
                className="block w-full bg-white text-purple-600 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-all text-center"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboardComplete;