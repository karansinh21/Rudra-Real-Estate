import React, { useState } from 'react';
import { Search, Star, MapPin, Phone, Mail, Award, Briefcase, CheckCircle, Filter, Calendar } from 'lucide-react';

const LawyerDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const lawyers = [
    {
      id: 1,
      name: 'Adv. Rajesh Mehta',
      specialization: 'Property Law',
      experience: 15,
      rating: 4.9,
      reviews: 234,
      location: 'Alkapuri, Vadodara',
      phone: '+91 98765 43210',
      email: 'rajesh.mehta@legal.com',
      image: 'https://ui-avatars.com/api/?name=Rajesh+Mehta&background=3b82f6&color=fff&size=200',
      languages: ['English', 'Hindi', 'Gujarati'],
      expertise: ['Property Registration', 'Rent Agreement', 'Datavej', 'Property Disputes'],
      availability: 'Available',
      casesHandled: 500,
      successRate: 95,
      fees: '₹2000-5000',
      verified: true
    },
    {
      id: 2,
      name: 'Adv. Priya Sharma',
      specialization: 'Real Estate Law',
      experience: 12,
      rating: 4.8,
      reviews: 189,
      location: 'Race Course, Vadodara',
      phone: '+91 98765 43211',
      email: 'priya.sharma@legal.com',
      image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=8b5cf6&color=fff&size=200',
      languages: ['English', 'Hindi'],
      expertise: ['Property Documentation', 'Legal Consultation', 'Title Verification', 'NOC'],
      availability: 'Available',
      casesHandled: 380,
      successRate: 93,
      fees: '₹1500-4000',
      verified: true
    },
    {
      id: 3,
      name: 'Adv. Amit Patel',
      specialization: 'Civil & Property Law',
      experience: 18,
      rating: 4.9,
      reviews: 312,
      location: 'Manjalpur, Vadodara',
      phone: '+91 98765 43212',
      email: 'amit.patel@legal.com',
      image: 'https://ui-avatars.com/api/?name=Amit+Patel&background=10b981&color=fff&size=200',
      languages: ['English', 'Hindi', 'Gujarati'],
      expertise: ['Commercial Property', 'Lease Agreement', 'Property Tax', 'Legal Notice'],
      availability: 'Busy',
      casesHandled: 650,
      successRate: 97,
      fees: '₹3000-7000',
      verified: true
    },
    {
      id: 4,
      name: 'Adv. Sneha Desai',
      specialization: 'Property & Family Law',
      experience: 10,
      rating: 4.7,
      reviews: 156,
      location: 'Gotri, Vadodara',
      phone: '+91 98765 43213',
      email: 'sneha.desai@legal.com',
      image: 'https://ui-avatars.com/api/?name=Sneha+Desai&background=f59e0b&color=fff&size=200',
      languages: ['English', 'Hindi', 'Gujarati'],
      expertise: ['Property Inheritance', 'Will & Testament', 'Gift Deed', 'Partition'],
      availability: 'Available',
      casesHandled: 280,
      successRate: 91,
      fees: '₹1800-4500',
      verified: true
    }
  ];

  const specializations = ['all', 'Property Law', 'Real Estate Law', 'Civil & Property Law', 'Property & Family Law'];

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lawyer.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpec = selectedSpecialization === 'all' || lawyer.specialization === selectedSpecialization;
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 backdrop-blur-xl rounded-full px-6 py-3 border border-blue-500/30 mb-6">
            <Award className="h-5 w-5 text-blue-400" />
            <span className="text-white font-semibold">Verified Legal Experts</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Find Expert Lawyers
          </h1>
          <p className="text-xl text-gray-300">
            Connect with experienced property lawyers in Vadodara
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Specialization Filter */}
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {specializations.map(spec => (
                <option key={spec} value={spec}>
                  {spec === 'all' ? 'All Specializations' : spec}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="cases">Most Cases</option>
            </select>
          </div>
        </div>

        {/* Lawyers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredLawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="group bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 hover:border-white/30 overflow-hidden transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-start space-x-6">
                  {/* Profile Image */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={lawyer.image}
                      alt={lawyer.name}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                    {lawyer.verified && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold ${
                      lawyer.availability === 'Available' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {lawyer.availability}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{lawyer.name}</h3>
                        <p className="text-blue-400 text-sm font-semibold">{lawyer.specialization}</p>
                      </div>
                      <div className="flex items-center space-x-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 font-bold">{lawyer.rating}</span>
                        <span className="text-gray-400 text-sm">({lawyer.reviews})</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <Briefcase className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                        <p className="text-white font-bold text-sm">{lawyer.experience} Years</p>
                        <p className="text-gray-400 text-xs">Experience</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mx-auto mb-1" />
                        <p className="text-white font-bold text-sm">{lawyer.casesHandled}+</p>
                        <p className="text-gray-400 text-xs">Cases</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <Award className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                        <p className="text-white font-bold text-sm">{lawyer.successRate}%</p>
                        <p className="text-gray-400 text-xs">Success</p>
                      </div>
                    </div>

                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {lawyer.expertise.slice(0, 3).map((exp, i) => (
                        <span
                          key={i}
                          className="bg-blue-500/20 text-blue-400 text-xs px-3 py-1 rounded-full border border-blue-500/30"
                        >
                          {exp}
                        </span>
                      ))}
                      {lawyer.expertise.length > 3 && (
                        <span className="bg-purple-500/20 text-purple-400 text-xs px-3 py-1 rounded-full border border-purple-500/30">
                          +{lawyer.expertise.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-300 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {lawyer.location}
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {lawyer.phone}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">Fees:</span>
                        <span className="text-green-400 font-bold text-sm">{lawyer.fees}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Book Consultation</span>
                      </button>
                      <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-3 rounded-xl transition-all">
                        <Phone className="h-5 w-5" />
                      </button>
                      <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-3 rounded-xl transition-all">
                        <Mail className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredLawyers.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 inline-block">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">No lawyers found matching your criteria</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerDirectory;