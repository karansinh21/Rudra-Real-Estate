import React, { useState, useEffect } from 'react';
import { Phone, Mail, MessageSquare, CheckCircle, ArrowLeft, Filter, Building2, Calendar } from 'lucide-react';

const BrokerEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchEnquiries();
  }, [filter]);

  const fetchEnquiries = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter ? `?status=${filter}` : '';
      const response = await fetch(`http://localhost:5000/api/enquiries${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setEnquiries(data.enquiries || []);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/enquiries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchEnquiries();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONTACTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CLOSED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const navigateTo = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigateTo('/broker/dashboard')}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Enquiries ({enquiries.length})</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {enquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <MessageSquare className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Enquiries Found</h3>
            <p className="text-gray-500 text-lg">
              {filter ? `No ${filter.toLowerCase()} enquiries at the moment` : 'You have no enquiries yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {enquiries.map((enquiry) => (
              <div key={enquiry.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{enquiry.clientName}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-600 mb-3">
                      <Building2 className="h-4 w-4" />
                      <span className="font-semibold">Property:</span>
                      <span>{enquiry.property?.title || 'N/A'}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center text-gray-700">
                        <Phone className="h-4 w-4 mr-2 text-blue-600" />
                        <a href={`tel:${enquiry.clientPhone}`} className="hover:underline hover:text-blue-600">
                          {enquiry.clientPhone}
                        </a>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <Mail className="h-4 w-4 mr-2 text-blue-600" />
                        <a href={`mailto:${enquiry.clientEmail}`} className="hover:underline hover:text-blue-600">
                          {enquiry.clientEmail}
                        </a>
                      </div>
                    </div>

                    {enquiry.message && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                          <MessageSquare className="h-5 w-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{enquiry.message}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Received: {new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600 font-medium">Update Status:</span>
                  
                  {enquiry.status !== 'CONTACTED' && (
                    <button
                      onClick={() => updateStatus(enquiry.id, 'CONTACTED')}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 text-sm font-semibold transition"
                    >
                      Mark as Contacted
                    </button>
                  )}
                  
                  {enquiry.status !== 'CLOSED' && (
                    <button
                      onClick={() => updateStatus(enquiry.id, 'CLOSED')}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 text-sm font-semibold flex items-center transition"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Close Enquiry
                    </button>
                  )}

                  {enquiry.status === 'CLOSED' && (
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Enquiry Closed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerEnquiries;