import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { legalAPI } from '../../services/api';
import { FileText, Clock, CheckCircle, AlertCircle, Settings } from 'lucide-react'; // ✅ Add Settings

const LawyerDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await legalAPI.getAllRequests();
      const allRequests = response.data.requests;
      
      setRequests(allRequests.slice(0, 10));
      setStats({
        total: allRequests.length,
        pending: allRequests.filter(r => r.status === 'PENDING').length,
        inProgress: allRequests.filter(r => r.status === 'IN_PROGRESS').length,
        completed: allRequests.filter(r => r.status === 'COMPLETED').length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id, newStatus) => {
    try {
      await legalAPI.updateRequest(id, { status: newStatus });
      fetchData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ✅ Updated Header with Settings Button */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lawyer Dashboard</h1>
          <Link
            to="/lawyer/settings"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            <Settings className="w-5 h-5" />
            <span>Account Settings</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <FileText className="h-12 w-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <AlertCircle className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</p>
              </div>
              <Clock className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/lawyer/services"
            className="bg-purple-600 text-white rounded-lg p-4 flex items-center justify-center space-x-2 hover:bg-purple-700 transition"
          >
            <FileText className="h-5 w-5" />
            <span>Manage Services</span>
          </Link>
          
          <Link
            to="/lawyer/requests"
            className="bg-blue-600 text-white rounded-lg p-4 flex items-center justify-center space-x-2 hover:bg-blue-700 transition"
          >
            <Clock className="h-5 w-5" />
            <span>View All Requests</span>
          </Link>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
            <Link to="/lawyer/requests" className="text-purple-600 hover:underline">
              View All
            </Link>
          </div>

          {requests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No requests yet</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{request.service.serviceName}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Client: <span className="font-medium">{request.clientName}</span> | 
                        Phone: <span className="font-medium">{request.clientPhone}</span>
                      </p>

                      <p className="text-sm text-gray-600 mb-2">
                        Broker: <span className="font-medium">{request.broker.name}</span>
                      </p>

                      {request.agreementPeriod && (
                        <p className="text-sm text-gray-600">
                          Agreement Period: <span className="font-medium">{request.agreementPeriod} months</span>
                        </p>
                      )}

                      {request.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">Note: {request.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Update Status:</span>
                    
                    {request.status === 'PENDING' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'IN_PROGRESS')}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 text-sm font-semibold"
                      >
                        Start Work
                      </button>
                    )}
                    
                    {request.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'COMPLETED')}
                        className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 text-sm font-semibold flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Complete
                      </button>
                    )}

                    {request.status === 'COMPLETED' && (
                      <span className="text-green-600 text-sm font-semibold flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;