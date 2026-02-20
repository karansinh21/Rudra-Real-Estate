import React, { useState } from 'react';
import { Search, Sparkles, MapPin, IndianRupee, Bed, Bath, Square, Sliders, X, TrendingUp, Heart } from 'lucide-react';

const AIPropertySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: 'all',
    amenities: []
  });

  const properties = [
    {
      id: 1,
      title: 'Luxury Villa with Pool',
      location: 'Alkapuri',
      price: 12500000,
      beds: 4,
      baths: 3,
      area: 2500,
      type: 'Villa',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600',
      amenities: ['Pool', 'Garden', 'Gym'],
      score: 95
    },
    {
      id: 2,
      title: 'Modern 3BHK Apartment',
      location: 'Race Course',
      price: 6500000,
      beds: 3,
      baths: 2,
      area: 1800,
      type: 'Apartment',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600',
      amenities: ['Parking', 'Security', 'Lift'],
      score: 88
    },
    {
      id: 3,
      title: 'Premium Office Space',
      location: 'Gotri',
      price: 8500000,
      beds: null,
      baths: 2,
      area: 3000,
      type: 'Commercial',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
      amenities: ['Parking', 'Cafeteria', 'Conference Room'],
      score: 92
    }
  ];

  const amenitiesList = ['Pool', 'Garden', 'Gym', 'Parking', 'Security', 'Lift', 'Club House', 'Playground'];

  const quickSearches = [
    '3BHK under 50 lakhs',
    'Villa with pool in Alkapuri',
    'Commercial space in Gotri',
    'Apartment near airport'
  ];

  const handleAISearch = () => {
    // Simulate AI processing
    const suggestions = [
      'Based on your search, showing properties in premium locations',
      'Filtered by your budget range',
      'Matched 3 properties with your requirements'
    ];
    setAiSuggestions(suggestions);
  };

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    handleAISearch();
  };

  const toggleAmenity = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Search Section */}
      <div className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* AI Badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 mb-6">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              <span className="text-white font-semibold">AI-Powered Search</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Find Your Perfect Property
            </h1>
            <p className="text-xl text-gray-300">
              Intelligent search powered by artificial intelligence
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="bg-white rounded-3xl shadow-2xl p-3 flex items-center space-x-3">
              <Search className="h-6 w-6 text-gray-400 ml-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                placeholder="Try: '3BHK villa with pool under 1 crore in Alkapuri'"
                className="flex-1 bg-transparent border-none outline-none text-gray-900 text-lg placeholder-gray-400"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
              >
                <Sliders className="h-6 w-6 text-gray-700" />
              </button>
              <button
                onClick={handleAISearch}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick Searches */}
          <div className="flex flex-wrap gap-3 justify-center">
            {quickSearches.map((query, i) => (
              <button
                key={i}
                onClick={() => handleQuickSearch(query)}
                className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all text-sm"
              >
                {query}
              </button>
            ))}
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <h3 className="text-white font-bold">AI Insights</h3>
              </div>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-start space-x-2 text-gray-300 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Advanced Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Price Range */}
              <div>
                <label className="block text-white font-semibold mb-3">Price Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-white font-semibold mb-3">Property Type</label>
                <div className="grid grid-cols-4 gap-3">
                  {['all', 'Villa', 'Apartment', 'Commercial'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilters({ ...filters, propertyType: type })}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        filters.propertyType === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {type === 'all' ? 'All' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-white font-semibold mb-3">Bedrooms</label>
                <div className="grid grid-cols-5 gap-3">
                  {['Any', '1', '2', '3', '4+'].map((beds) => (
                    <button
                      key={beds}
                      onClick={() => setFilters({ ...filters, bedrooms: beds })}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        filters.bedrooms === beds
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {beds}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-white font-semibold mb-3">Amenities</label>
                <div className="grid grid-cols-2 gap-3">
                  {amenitiesList.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                        filters.amenities.includes(amenity)
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => {
                  setShowFilters(false);
                  handleAISearch();
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">
            Search Results ({properties.length})
          </h2>
          <div className="flex items-center space-x-3">
            <select className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Best Match</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div
              key={property.id}
              className="group relative bg-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300"
            >
              {/* AI Match Score */}
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>{property.score}% Match</span>
              </div>

              {/* Like Button */}
              <button className="absolute top-4 right-4 z-10 p-2 bg-white/20 backdrop-blur-xl rounded-full hover:bg-white/30 transition-all">
                <Heart className="h-5 w-5 text-white" />
              </button>

              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{property.title}</h3>
                
                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </div>

                <div className="flex items-center justify-between text-white text-sm mb-4">
                  {property.beds && (
                    <div className="flex items-center space-x-1">
                      <Bed className="h-4 w-4" />
                      <span>{property.beds}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Bath className="h-4 w-4" />
                    <span>{property.baths}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Square className="h-4 w-4" />
                    <span>{property.area} sqft</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center text-green-400 font-bold text-lg">
                    <IndianRupee className="h-5 w-5" />
                    <span>{(property.price / 10000000).toFixed(2)}Cr</span>
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIPropertySearch;