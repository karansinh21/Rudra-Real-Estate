import React, { useState } from 'react';
import { MapPin, Bed, Bath, Square, IndianRupee, Heart, Share2, Phone, Mail, User, Calendar, TrendingUp, Award, Shield, CheckCircle } from 'lucide-react';

const Property3DDetail = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  const property = {
    title: 'Luxury Modern Villa',
    location: 'Alkapuri, Vadodara',
    price: 12500000,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200'
    ],
    beds: 4,
    baths: 3,
    area: 2500,
    type: 'Villa',
    status: 'Available',
    yearBuilt: 2023,
    features: [
      'Swimming Pool', 'Garden', 'Parking', 'Security', 'Gym', 'Club House'
    ],
    description: 'A stunning modern villa with state-of-the-art amenities and breathtaking views. Perfect for families looking for luxury living.',
    broker: {
      name: 'Rajesh Sharma',
      phone: '+91 9876543210',
      email: 'rajesh@rudra.com',
      rating: 4.8
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'location', label: 'Location' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section with Image Gallery */}
      <div className="relative h-[70vh] overflow-hidden">
        {/* Main Image */}
        <div className="absolute inset-0">
          <img
            src={property.images[activeImage]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 transform hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute top-8 right-8 flex space-x-3 z-10">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
          >
            <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'} transition-all duration-300 ${isLiked ? 'scale-110' : ''}`} />
          </button>
          <button className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
            <Share2 className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Image Thumbnails */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
          {property.images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                activeImage === index
                  ? 'border-blue-500 scale-110 shadow-2xl'
                  : 'border-white/30 hover:border-white/60'
              }`}
            >
              <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Property Badge */}
        <div className="absolute top-8 left-8 z-10">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg backdrop-blur-xl border border-white/20 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>{property.status}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-3">{property.title}</h1>
                  <div className="flex items-center text-gray-300 text-lg">
                    <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                    {property.location}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-1">Price</p>
                  <div className="flex items-center text-white">
                    <IndianRupee className="h-8 w-8 text-green-400" />
                    <span className="text-4xl font-bold">
                      {(property.price / 10000000).toFixed(2)} Cr
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: Bed, label: 'Bedrooms', value: property.beds },
                  { icon: Bath, label: 'Bathrooms', value: property.baths },
                  { icon: Square, label: 'Area', value: `${property.area} sqft` },
                  { icon: Calendar, label: 'Built', value: property.yearBuilt }
                ].map((stat, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center group hover:bg-white/10 transition-all duration-300">
                    <stat.icon className="h-8 w-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-white text-xl font-bold mb-1">{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="flex border-b border-white/10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                      selectedTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8">
                {selectedTab === 'overview' && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white mb-4">Description</h3>
                    <p className="text-gray-300 leading-relaxed">{property.description}</p>
                  </div>
                )}

                {selectedTab === 'features' && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">Property Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {property.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all duration-300"
                        >
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <span className="text-white font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTab === 'location' && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Location</h3>
                    <div className="bg-white/5 rounded-2xl p-8 text-center border border-white/10">
                      <MapPin className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                      <p className="text-white text-xl">{property.location}</p>
                      <p className="text-gray-400 mt-2">Map integration coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Broker Card */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Contact Broker</h3>
              
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{property.broker.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4 text-yellow-400" />
                      <span className="text-white text-sm">{property.broker.rating} Rating</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`tel:${property.broker.phone}`}
                  className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Phone className="h-5 w-5" />
                  <span>Call Now</span>
                </a>
                <a
                  href={`mailto:${property.broker.email}`}
                  className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 font-semibold transition-all duration-300 border border-white/20"
                >
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Why Trust Us</h3>
              <div className="space-y-4">
                {[
                  { icon: Shield, text: 'Verified Property' },
                  { icon: Award, text: 'Expert Guidance' },
                  { icon: TrendingUp, text: 'Best Market Price' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <item.icon className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-white font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Property3DDetail;