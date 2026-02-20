import React, { useState } from 'react';
import { 
  Scale, Award, BookOpen, Star, Phone, Mail, MapPin, 
  Calendar, Clock, CheckCircle, TrendingUp, Users, FileText,
  MessageCircle, Video, Shield, DollarSign
} from 'lucide-react';

const LawyerProfile = () => {
  const [activeTab, setActiveTab] = useState('about');

  const lawyer = {
    id: '1',
    name: 'Adv. Rajesh Sharma',
    designation: 'Senior Advocate',
    specializations: ['Property Law', 'Real Estate', 'Civil Law', 'Contract Law'],
    experience: 15,
    rating: 4.8,
    totalReviews: 127,
    totalCases: 450,
    successRate: 92,
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lawyer1',
    email: 'rajesh.sharma@rudralegal.com',
    phone: '+91 98765 43210',
    location: 'Vadodara, Gujarat',
    education: [
      { degree: 'LLM', institution: 'Gujarat University', year: 2010 },
      { degree: 'LLB', institution: 'MS University', year: 2008 },
      { degree: 'BA', institution: 'MS University', year: 2005 }
    ],
    certifications: [
      'Property Law Specialist',
      'Real Estate Legal Advisor',
      'Notary Public'
    ],
    about: 'With over 15 years of experience in property and real estate law, I specialize in helping clients navigate complex legal matters related to property transactions, land disputes, and contract negotiations. My approach is client-focused, ensuring transparency and clarity throughout the legal process.',
    services: [
      { name: 'Property Documentation', price: 5000, duration: '2-3 days' },
      { name: 'Rent Agreement', price: 2000, duration: '1 day' },
      { name: 'Property Registration', price: 8000, duration: '5-7 days' },
      { name: 'Legal Consultation', price: 1500, duration: '1 hour' },
      { name: 'Title Verification', price: 6000, duration: '3-5 days' },
      { name: 'Sale Deed', price: 10000, duration: '7-10 days' }
    ],
    availability: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 2:00 PM',
      sunday: 'Closed'
    },
    reviews: [
      { 
        name: 'Amit Patel', 
        rating: 5, 
        date: '2 weeks ago',
        comment: 'Excellent service! Very professional and handled my property registration smoothly.' 
      },
      { 
        name: 'Priya Shah', 
        rating: 5, 
        date: '1 month ago',
        comment: 'Highly recommended for property matters. Clear communication and fair pricing.' 
      },
      { 
        name: 'Kiran Mehta', 
        rating: 4, 
        date: '2 months ago',
        comment: 'Good experience overall. Documentation was done efficiently.' 
      }
    ]
  };

  const StarRating = ({ rating }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              {/* Profile Image */}
              <div className="relative">
                <img 
                  src={lawyer.photo} 
                  alt={lawyer.name}
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl bg-white"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 pt-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{lawyer.name}</h1>
                    <p className="text-lg text-gray-600 mb-3">{lawyer.designation}</p>
                    <div className="flex flex-wrap gap-2">
                      {lawyer.specializations.map((spec, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                      Book Consultation
                    </button>
                    <button className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                      <MessageCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{lawyer.experience}</div>
                    <div className="text-sm text-gray-600">Years Exp.</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{lawyer.totalCases}+</div>
                    <div className="text-sm text-gray-600">Cases</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{lawyer.successRate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                    <Star className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{lawyer.rating}</div>
                    <div className="text-sm text-gray-600">{lawyer.totalReviews} Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {['about', 'services', 'education', 'reviews', 'availability'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-semibold capitalize whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About Me</h3>
                  <p className="text-gray-700 leading-relaxed">{lawyer.about}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                    <Phone className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Phone</div>
                      <div className="font-semibold text-gray-900">{lawyer.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                    <Mail className="w-6 h-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Email</div>
                      <div className="font-semibold text-gray-900 break-all">{lawyer.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-pink-50 rounded-xl">
                    <MapPin className="w-6 h-6 text-pink-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Location</div>
                      <div className="font-semibold text-gray-900">{lawyer.location}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Legal Services</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {lawyer.services.map((service, idx) => (
                    <div key={idx} className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Clock className="w-4 h-4" />
                              {service.duration}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">₹{service.price}</div>
                        </div>
                      </div>
                      <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Education</h3>
                  <div className="space-y-4">
                    {lawyer.education.map((edu, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                        <div className="p-3 bg-white rounded-xl shadow-md">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                          <p className="text-gray-700">{edu.institution}</p>
                          <p className="text-sm text-gray-600 mt-1">{edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Certifications</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {lawyer.certifications.map((cert, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <Award className="w-6 h-6 text-green-600" />
                        <span className="font-semibold text-gray-900">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Client Reviews</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold text-gray-900">{lawyer.rating}</span>
                    <span className="text-gray-600">({lawyer.totalReviews} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {lawyer.reviews.map((review, idx) => (
                    <div key={idx} className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{review.name}</h4>
                          <StarRating rating={review.rating} />
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Tab */}
            {activeTab === 'availability' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Office Hours</h3>
                <div className="space-y-3">
                  {Object.entries(lawyer.availability).map(([day, time]) => (
                    <div key={day} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <span className="font-semibold text-gray-900 capitalize">{day}</span>
                      <span className={`font-medium ${time === 'Closed' ? 'text-red-600' : 'text-green-600'}`}>
                        {time}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3">Need urgent consultation?</h4>
                  <p className="text-gray-700 mb-4">Call us directly for emergency appointments</p>
                  <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    <Phone className="w-5 h-5" />
                    Call Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerProfile;