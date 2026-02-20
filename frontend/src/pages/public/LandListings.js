import React, { useState } from 'react';
import { Search, Filter, MapPin, Square, IndianRupee, Compass, Droplets, Zap, Layers, TrendingUp, Heart, Phone } from 'lucide-react';

const LandListings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    landType: 'all',
    minArea: '',
    maxArea: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    features: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [likedLands, setLikedLands] = useState(new Set());

  const lands = [
    {
      id: 1,
      title: 'Premium Agricultural Land',
      type: 'agricultural',
      area: 5,
      unit: 'Acres',
      price: 2500000,
      pricePerUnit: 500000,
      location: 'Halol, Vadodara',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      features: ['Water Source', 'Electricity', 'Road Access', 'Fenced'],
      soilType: 'Black Soil',
      waterSource: 'Canal + Well',
      clearTitle: true,
      distance: '15 km from city',
      broker: 'Rajesh Sharma',
      brokerPhone: '+91 98765 43210'
    },
    {
      id: 2,
      title: 'Commercial Plot - Highway Touch',
      type: 'commercial',
      area: 10000,
      unit: 'Sq.Ft',
      price: 8000000,
      pricePerUnit: 800,
      location: 'NH-8, Vadodara',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
      features: ['Highway Touch', 'Electricity', '60ft Road', 'Corner Plot'],
      soilType: 'Rocky',
      waterSource: 'Municipal',
      clearTitle: true,
      distance: '8 km from city',
      broker: 'Priya Patel',
      brokerPhone: '+91 98765 43211'
    },
    {
      id: 3,
      title: 'Residential Plot - NA Approved',
      type: 'residential',
      area: 3600,
      unit: 'Sq.Ft',
      price: 5400000,
      pricePerUnit: 1500,
      location: 'Waghodia, Vadodara',
      image: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800',
      features: ['NA Approved', 'Gated Community', 'Park View', 'All Utilities'],
      soilType: 'Red Soil',
      waterSource: 'Municipal + Borewell',
      clearTitle: true,
      distance: '12 km from city',
      broker: 'Amit Kumar',
      brokerPhone: '+91 98765 43212'
    },
    {
      id: 4,
      title: 'Industrial Land - SEZ Area',
      type: 'industrial',
      area: 2,
      unit: 'Acres',
      price: 12000000,
      pricePerUnit: 6000000,
      location: 'Savli GIDC, Vadodara',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800',
      features: ['SEZ Benefits', 'Railway Siding', 'Heavy Vehicle Access', '24/7 Security'],
      soilType: 'Mixed',
      waterSource: 'Industrial Supply',
      clearTitle: true,
      distance: '20 km from city',
      broker: 'Suresh Mehta',
      brokerPhone: '+91 98765 43213'
    }
  ];

  const landTypes = [
    { value: 'all', label: 'All Types', icon: '🌍' },
    { value: 'agricultural', label: 'Agricultural', icon: '🌾' },
    { value: 'commercial', label: 'Commercial', icon: '🏢' },
    { value: 'residential', label: 'Residential', icon: '🏠' },
    { value: 'industrial', label: 'Industrial', icon: '🏭' }
  ];

  const toggleLike = (id) => {
    const newLiked = new Set(likedLands);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedLands(newLiked);
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(2)} Lac`;
    return price.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Browse Land Properties
          </h1>
          <p className="text-xl text-gray-300">
            Find the perfect land for your investment
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, land type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl transition-all flex items-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center space-x-3 mt-4 overflow-x-auto">
            {landTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilters({ ...filters, landType: type.value })}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  filters.landType === type.value
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-300">
            <span className="text-white font-bold text-2xl">{lands.length}</span> properties found
          </p>
          <select className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>Sort by: Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Area: Largest First</option>
          </select>
        </div>

        {/* Land Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {lands.map((land) => (
            <div
              key={land.id}
              className="group bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 hover:border-white/30 overflow-hidden transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={land.image}
                  alt={land.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                {/* Type Badge */}
                <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                  {land.type.charAt(0).toUpperCase() + land.type.slice(1)}
                </div>

                {/* Like Button */}
                <button
                  onClick={() => toggleLike(land.id)}
                  className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-xl rounded-full hover:bg-white/30 transition-all"
                >
                  <Heart className={`h-5 w-5 ${likedLands.has(land.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>

                {/* Clear Title Badge */}
                {land.clearTitle && (
                  <div className="absolute bottom-4 left-4 bg-blue-500/80 backdrop-blur-xl text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Layers className="h-3 w-3" />
                    <span>Clear Title</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-3">{land.title}</h3>

                <div className="flex items-center text-gray-300 mb-4">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{land.location}</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm">{land.distance}</span>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <Square className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{land.area}</p>
                    <p className="text-gray-400 text-xs">{land.unit}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <IndianRupee className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <p className="text-white font-bold">{formatPrice(land.price)}</p>
                    <p className="text-gray-400 text-xs">Total</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <p className="text-white font-bold">₹{land.pricePerUnit}</p>
                    <p className="text-gray-400 text-xs">per {land.unit}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {land.features.slice(0, 3).map((feature, i) => (
                    <span
                      key={i}
                      className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30"
                    >
                      {feature}
                    </span>
                  ))}
                  {land.features.length > 3 && (
                    <span className="bg-white/10 text-gray-300 text-xs px-3 py-1 rounded-full">
                      +{land.features.length - 3} more
                    </span>
                  )}
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Compass className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-xs">Soil Type</p>
                      <p className="text-white font-semibold">{land.soilType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-xs">Water</p>
                      <p className="text-white font-semibold">{land.waterSource}</p>
                    </div>
                  </div>
                </div>

                {/* Broker Info */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-gray-400 text-xs">Listed by</p>
                    <p className="text-white font-semibold">{land.broker}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl transition-all">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-12 py-4 rounded-xl font-bold text-lg transition-all">
            Load More Properties
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandListings;