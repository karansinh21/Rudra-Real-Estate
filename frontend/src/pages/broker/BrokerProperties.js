import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, IndianRupee, Building2, ArrowLeft, MapPin } from 'lucide-react';

const BrokerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/broker/properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/properties/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchProperties();
        } else {
          alert('Failed to delete property');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property');
      }
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
          <p className="mt-4 text-gray-600">Loading properties...</p>
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
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">My Properties ({properties.length})</h1>
          </div>
          <button
            onClick={() => navigateTo('/broker/add-property')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Add Property</span>
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Building2 className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Properties Yet</h3>
            <p className="text-gray-500 text-lg mb-6">Start adding properties to showcase them to potential buyers</p>
            <button
              onClick={() => navigateTo('/broker/add-property')}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Property</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition group">
                <div className="h-48 bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden relative">
                  {property.images?.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%234F46E5" width="400" height="300"/%3E%3Ctext fill="white" font-size="20" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <Building2 className="h-20 w-20 text-white" />
                  )}
                  <div className="absolute top-3 right-3 flex flex-col space-y-2">
                    <span className="bg-white/90 backdrop-blur text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                      {property.propertyType}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      property.isAvailable 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {property.isAvailable ? 'Available' : 'Sold'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {property.purpose}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
                  
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">{property.location}, {property.city}</span>
                  </div>

                  <div className="flex items-center text-blue-600 font-bold text-lg mb-4">
                    <IndianRupee className="h-5 w-5" />
                    <span>{property.price?.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
                    <div>Area: {property.area} sq ft</div>
                    {property.bedrooms && <div>Beds: {property.bedrooms}</div>}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigateTo(`/property/${property.id}`)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition"
                      title="View Property"
                    >
                      <Eye className="h-5 w-5" />
                      <span className="text-sm">View</span>
                    </button>
                    <button
                      onClick={() => navigateTo(`/broker/edit-property/${property.id}`)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-800 transition"
                      title="Edit Property"
                    >
                      <Edit className="h-5 w-5" />
                      <span className="text-sm">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition"
                      title="Delete Property"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerProperties;