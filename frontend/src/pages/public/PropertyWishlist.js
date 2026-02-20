import React, { useState } from 'react';
import { Heart, Trash2, Eye, MapPin, Home, DollarSign, TrendingUp, Share2, Filter, Grid, List, X } from 'lucide-react';

const PropertyWishlist = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState([]);
  
  const [wishlistProperties, setWishlistProperties] = useState([
    {
      id: 1,
      title: '3BHK Luxury Apartment',
      location: 'Alkapuri, Vadodara',
      price: 8500000,
      type: 'Apartment',
      area: 1850,
      bedrooms: 3,
      bathrooms: 2,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      addedOn: '2024-01-15',
      priceChange: '+2.5%',
      status: 'Available',
      tags: ['New', 'Premium']
    },
    {
      id: 2,
      title: 'Commercial Office Space',
      location: 'Race Course, Vadodara',
      price: 12000000,
      type: 'Commercial',
      area: 2500,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
      addedOn: '2024-01-10',
      priceChange: '-1.5%',
      status: 'Under Negotiation',
      tags: ['Prime Location']
    },
    {
      id: 3,
      title: 'Villa with Garden',
      location: 'Gorwa, Vadodara',
      price: 15000000,
      type: 'Villa',
      area: 3200,
      bedrooms: 4,
      bathrooms: 3,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
      addedOn: '2024-01-05',
      priceChange: '0%',
      status: 'Available',
      tags: ['Luxury', 'Garden']
    },
    {
      id: 4,
      title: 'Agricultural Land',
      location: 'Dabhoi Road, Vadodara',
      price: 3500000,
      type: 'Land',
      area: 5000,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
      addedOn: '2023-12-28',
      priceChange: '+5%',
      status: 'Available',
      tags: ['Investment']
    }
  ]);

  const removeFromWishlist = (id) => {
    setWishlistProperties(wishlistProperties.filter(p => p.id !== id));
  };

  const toggleSelectProperty = (id) => {
    setSelectedProperties(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const shareWishlist = () => {
    alert('Wishlist shared successfully!');
  };

  const PropertyCard = ({ property, mode }) => {
    const isSelected = selectedProperties.includes(property.id);
    
    if (mode === 'list') {
      return (
        <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
          <div className="flex">
            <img 
              src={property.image} 
              alt={property.title}
              className="w-48 h-full object-cover"
            />
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    {property.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {tag}
                      </span>
                    ))}
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      property.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h3>
                  <p className="text-gray-600 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4" />
                    {property.location}
                  </p>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {property.area} sq.ft
                    </span>
                    {property.bedrooms && (
                      <span>{property.bedrooms} BHK</span>
                    )}
                    {property.bathrooms && (
                      <span>{property.bathrooms} Bath</span>
                    )}
                    <span className="capitalize">{property.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ₹{(property.price / 10000000).toFixed(2)} Cr
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    property.priceChange.startsWith('+') ? 'text-green-600' : 
                    property.priceChange.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <TrendingUp className="w-4 h-4" />
                    {property.priceChange}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Added: {property.addedOn}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => toggleSelectProperty(property.id)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => removeFromWishlist(property.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="relative">
          <img 
            src={property.image} 
            alt={property.title}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {property.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-semibold rounded-full shadow-md">
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => removeFromWishlist(property.id)}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
          >
            <Heart className="w-5 h-5 fill-red-500 text-red-500 hover:fill-white" />
          </button>
          <div className={`absolute bottom-4 right-4 px-3 py-1 backdrop-blur-sm text-white text-xs font-semibold rounded-full ${
            property.status === 'Available' ? 'bg-green-500/80' : 'bg-yellow-500/80'
          }`}>
            {property.status}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
          <p className="text-gray-600 flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4" />
            {property.location}
          </p>
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-blue-600">
              ₹{(property.price / 10000000).toFixed(2)} Cr
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              property.priceChange.startsWith('+') ? 'text-green-600' : 
              property.priceChange.startsWith('-') ? 'text-red-600' : 'text-gray-600'
            }`}>
              <TrendingUp className="w-4 h-4" />
              {property.priceChange}
            </div>
          </div>
          
          <div className="flex gap-4 text-sm text-gray-600 mb-4 pb-4 border-b">
            <span className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              {property.area} sq.ft
            </span>
            {property.bedrooms && <span>{property.bedrooms} BHK</span>}
            <span className="capitalize">{property.type}</span>
          </div>

          <div className="text-xs text-gray-500 mb-4">Added on: {property.addedOn}</div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => toggleSelectProperty(property.id)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                isSelected 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Heart className="w-10 h-10 fill-red-500 text-red-500" />
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {wishlistProperties.length} properties saved • 
                {selectedProperties.length > 0 && ` ${selectedProperties.length} selected`}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filter
              </button>
              
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-md' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-md' : 'hover:bg-gray-200'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <button 
                onClick={shareWishlist}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share Wishlist
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Filter Properties</h3>
                <button 
                  onClick={() => setFilterOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Types</option>
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Commercial</option>
                  <option>Land</option>
                </select>
                
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Status</option>
                  <option>Available</option>
                  <option>Under Negotiation</option>
                </select>
                
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Sort by: Recent</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Area: Large to Small</option>
                </select>
                
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Selected Actions */}
          {selectedProperties.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl flex justify-between items-center">
              <span className="font-semibold text-blue-900">
                {selectedProperties.length} properties selected
              </span>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Compare Selected
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Remove Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Properties Grid/List */}
        {wishlistProperties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding properties you love to your wishlist</p>
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
              Browse Properties
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {wishlistProperties.map(property => (
              <PropertyCard key={property.id} property={property} mode={viewMode} />
            ))}
          </div>
        )}

        {/* Summary Card */}
        {wishlistProperties.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Wishlist Summary</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold mb-2">{wishlistProperties.length}</div>
                <div className="text-blue-100">Total Properties</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">
                  ₹{(wishlistProperties.reduce((sum, p) => sum + p.price, 0) / 10000000).toFixed(2)} Cr
                </div>
                <div className="text-blue-100">Total Value</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">
                  ₹{(wishlistProperties.reduce((sum, p) => sum + p.price, 0) / wishlistProperties.length / 10000000).toFixed(2)} Cr
                </div>
                <div className="text-blue-100">Average Price</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">
                  {Math.round(wishlistProperties.reduce((sum, p) => sum + p.area, 0) / wishlistProperties.length)}
                </div>
                <div className="text-blue-100">Avg. Area (sq.ft)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyWishlist;