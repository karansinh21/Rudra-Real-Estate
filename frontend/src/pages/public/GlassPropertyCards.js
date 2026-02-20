import React, { useState } from 'react';
import { Heart, Share2, Eye, MapPin, Bed, Bath, Square, IndianRupee, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';

const GlassPropertyCards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likedProperties, setLikedProperties] = useState(new Set());
  const [hoveredCard, setHoveredCard] = useState(null);

  const properties = [
    {
      id: 1,
      title: 'Modern Luxury Villa',
      location: 'Alkapuri, Vadodara',
      price: 12500000,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      beds: 4,
      baths: 3,
      area: 2500,
      type: 'Villa',
      featured: true,
      status: 'Hot Deal'
    },
    {
      id: 2,
      title: 'Spacious 3BHK Apartment',
      location: 'Race Course, Vadodara',
      price: 6500000,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      beds: 3,
      baths: 2,
      area: 1800,
      type: 'Apartment',
      featured: false,
      status: 'New'
    },
    {
      id: 3,
      title: 'Commercial Office Space',
      location: 'Gotri, Vadodara',
      price: 8500000,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      beds: null,
      baths: 2,
      area: 3000,
      type: 'Commercial',
      featured: true,
      status: 'Premium'
    }
  ];

  const toggleLike = (id) => {
    const newLiked = new Set(likedProperties);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedProperties(newLiked);
  };

  const handlePropertyClick = (propertyId) => {
    if (!user) {
      // Show alert and redirect to login
      alert('Please login to view property details');
      navigate('/login');
    } else {
      navigate(`/property/${propertyId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-20 px-4 relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 mb-6">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">Featured Properties</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Premium Collections
          </h2>
          <p className="text-xl text-white/80">
            Handpicked properties for discerning buyers
          </p>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <div
              key={property.id}
              className="group relative"
              onMouseEnter={() => setHoveredCard(property.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Glass Card */}
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Status Badge */}
                  {property.status && (
                    <div className={`absolute top-4 left-4 px-4 py-2 rounded-full backdrop-blur-xl border border-white/30 flex items-center space-x-2 ${
                      property.status === 'Hot Deal' ? 'bg-red-500/80' :
                      property.status === 'New' ? 'bg-green-500/80' :
                      'bg-purple-500/80'
                    }`}>
                      <TrendingUp className="h-4 w-4 text-white" />
                      <span className="text-white text-sm font-bold">{property.status}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => toggleLike(property.id)}
                      className="p-3 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          likedProperties.has(property.id) ? 'fill-red-500 text-red-500' : 'text-white'
                        } transition-colors duration-300`}
                      />
                    </button>
                    <button className="p-3 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                      <Share2 className="h-5 w-5 text-white" />
                    </button>
                  </div>

                  {/* Property Type */}
                  <div className="absolute bottom-4 left-4 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-full border border-white/30">
                    <span className="text-white text-sm font-semibold">{property.type}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-white/70 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex items-center justify-between text-white/80">
                    {property.beds && (
                      <div className="flex items-center space-x-1">
                        <Bed className="h-4 w-4" />
                        <span className="text-sm">{property.beds}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Bath className="h-4 w-4" />
                      <span className="text-sm">{property.baths}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Square className="h-4 w-4" />
                      <span className="text-sm">{property.area} sqft</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="flex items-center text-white">
                      <IndianRupee className="h-5 w-5" />
                      <span className="text-2xl font-bold">
                        {(property.price / 10000000).toFixed(2)} Cr
                      </span>
                    </div>
                    <button 
                      onClick={() => handlePropertyClick(property.id)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                  hoveredCard === property.id ? 'animate-pulse' : ''
                }`}></div>
              </div>

              {/* Floating Featured Badge */}
              {property.featured && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg transform rotate-12 animate-bounce">
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  <span className="text-sm font-bold">Featured</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-16">
          <button className="bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 hover:scale-105 transform transition-all duration-300 shadow-2xl">
            View All Properties
          </button>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default GlassPropertyCards;