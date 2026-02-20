import React, { useState, useEffect } from 'react';
import { ChevronDown, Play, Search, MapPin, Building2, Users, Award, ArrowRight, Sparkles } from 'lucide-react';

const VideoHeroLanding = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Building2,
      title: '500+ Properties',
      description: 'Curated listings',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Expert Brokers',
      description: 'Professional service',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      title: 'Best Prices',
      description: 'Market competitive',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Property Buyer',
      image: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=3b82f6&color=fff',
      text: 'Found my dream home in just 2 weeks! The service was exceptional.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Investor',
      image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=8b5cf6&color=fff',
      text: 'Professional team and great property selection. Highly recommended!',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'First-time Buyer',
      image: 'https://ui-avatars.com/api/?name=Amit+Patel&background=10b981&color=fff',
      text: 'The legal support made the entire process smooth and hassle-free.',
      rating: 5
    }
  ];

  return (
    <div className="bg-black">
      {/* Video Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {/* Video Background (Simulated) */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-pink-900/50">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `scale(${1 + scrollY * 0.0002})`,
              filter: 'brightness(0.4)'
            }}
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"></div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <div
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 mb-8"
              style={{
                transform: `translateY(${scrollY * -0.3}px)`,
                opacity: 1 - scrollY * 0.002
              }}
            >
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-white text-sm font-medium">Vadodara's Premier Real Estate Platform</span>
            </div>

            {/* Main Heading */}
            <h1
              className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
              style={{
                transform: `translateY(${scrollY * -0.2}px)`,
                opacity: 1 - scrollY * 0.002
              }}
            >
              Find Your
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Perfect Home
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
              style={{
                transform: `translateY(${scrollY * -0.1}px)`,
                opacity: 1 - scrollY * 0.003
              }}
            >
              Discover luxury properties with expert guidance and complete legal support
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
              style={{
                transform: `translateY(${scrollY * -0.05}px)`,
                opacity: 1 - scrollY * 0.003
              }}
            >
              <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <span className="relative z-10 flex items-center space-x-2">
                  <Search className="h-6 w-6" />
                  <span>Browse Properties</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button
                onClick={() => setIsVideoPlaying(true)}
                className="group bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center space-x-3"
              >
                <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span>Watch Video</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { value: '2000+', label: 'Happy Clients' },
                { value: '500+', label: 'Properties' },
                { value: '98%', label: 'Success Rate' }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                  style={{
                    transform: `translateY(${scrollY * -0.02}px)`,
                    opacity: 1 - scrollY * 0.003
                  }}
                >
                  <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          style={{ opacity: 1 - scrollY * 0.01 }}
        >
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-white text-sm mb-2">Scroll Down</span>
            <ChevronDown className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-32 bg-gradient-to-b from-black to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              Why Choose Us?
            </h2>
            <p className="text-gray-400 text-xl">
              Experience excellence in every transaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative"
                style={{
                  transform: `translateY(${Math.max(0, (scrollY - 400) * -0.1)}px)`,
                  opacity: Math.min(1, (scrollY - 200) / 300)
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                
                <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative py-32 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              What Our Clients Say
            </h2>
            <p className="text-gray-400 text-xl">
              Real stories from satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300"
                style={{
                  transform: `translateY(${Math.max(0, (scrollY - 1200) * -0.05)}px)`,
                  opacity: Math.min(1, (scrollY - 1000) / 300)
                }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h4 className="text-white font-bold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>

                <p className="text-gray-300 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl text-white/90 mb-12">
            Join thousands of satisfied customers today
          </p>
          <button className="bg-white text-purple-600 px-12 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 mx-auto">
            <span>Get Started Now</span>
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoHeroLanding;