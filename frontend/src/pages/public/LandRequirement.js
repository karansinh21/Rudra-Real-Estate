import React, { useState } from 'react';
import { MapPin, Square, IndianRupee, FileText, Phone, Mail, User, CheckCircle, AlertCircle, Layers, Compass } from 'lucide-react';

const LandRequirement = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    phone: '',
    
    // Land Requirements
    purposeType: 'buy', // buy, lease, rent
    landType: 'agricultural', // agricultural, commercial, residential, industrial
    minArea: '',
    maxArea: '',
    areaUnit: 'acres', // acres, sq.ft, hectares
    
    // Location Preferences
    preferredLocations: [],
    city: 'Vadodara',
    state: 'Gujarat',
    distance: '10', // km from city center
    
    // Budget
    minBudget: '',
    maxBudget: '',
    
    // Land Features
    features: [],
    soilType: '',
    waterAvailability: '',
    electricityConnection: '',
    roadAccess: '',
    
    // Legal Requirements
    clearTitle: true,
    readyForConstruction: false,
    approvedLayout: false,
    
    // Additional Details
    intendedUse: '',
    timeline: '3months', // immediate, 3months, 6months, 1year
    additionalNotes: ''
  });

  const landTypes = [
    { id: 'agricultural', name: 'Agricultural Land', icon: '🌾', desc: 'For farming and cultivation' },
    { id: 'commercial', name: 'Commercial Land', icon: '🏢', desc: 'For business purposes' },
    { id: 'residential', name: 'Residential Plot', icon: '🏠', desc: 'For building homes' },
    { id: 'industrial', name: 'Industrial Land', icon: '🏭', desc: 'For factories and warehouses' }
  ];

  const features = [
    'Water Source', 'Electricity Available', 'Road Access', 'Fenced', 
    'Flat Terrain', 'Trees/Plantation', 'Well/Borewell', 'Canal Access',
    'Near Highway', 'Approved Layout', 'Clear Title', 'NA Permission'
  ];

  const locations = [
    'Halol', 'Dabhoi', 'Savli', 'Karjan', 'Waghodia', 
    'Sinor', 'Padra', 'Jambusar', 'Vaghodia', 'Ranoli'
  ];

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 2000);
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const toggleLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.includes(location)
        ? prev.preferredLocations.filter(l => l !== location)
        : [...prev.preferredLocations, location]
    }));
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-12 text-center">
          <div className="bg-green-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Requirement Submitted!</h2>
          <p className="text-gray-300 text-lg mb-8">
            Thank you for submitting your land requirement. Our team will contact you within 24 hours with suitable options.
          </p>

          <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-white font-bold mb-4">Your Requirement Summary:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Land Type</span>
                <span className="text-white font-semibold capitalize">{formData.landType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Area Required</span>
                <span className="text-white font-semibold">{formData.minArea}-{formData.maxArea} {formData.areaUnit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Budget Range</span>
                <span className="text-white font-semibold">₹{formData.minBudget}-₹{formData.maxBudget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Preferred Locations</span>
                <span className="text-white font-semibold">{formData.preferredLocations.join(', ')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-green-500/20 backdrop-blur-xl rounded-full px-6 py-3 border border-green-500/30 mb-6">
            <Layers className="h-5 w-5 text-green-400" />
            <span className="text-white font-semibold">Land Requirements</span>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Find Your Perfect Land
          </h1>
          <p className="text-xl text-gray-300">
            Tell us what you're looking for and we'll find the best options
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
                  step >= s 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                    step > s ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-white/10'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Land Type</span>
            <span>Location</span>
            <span>Requirements</span>
            <span>Contact</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8">
          {/* Step 1: Land Type & Purpose */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">What type of land are you looking for?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {landTypes.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setFormData({ ...formData, landType: type.id })}
                      className={`cursor-pointer bg-white/5 rounded-2xl border-2 p-6 transition-all hover:scale-105 ${
                        formData.landType === type.id
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="text-5xl mb-4">{type.icon}</div>
                      <h3 className="text-white font-bold text-lg mb-2">{type.name}</h3>
                      <p className="text-gray-400 text-sm">{type.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Purpose</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['buy', 'lease', 'rent'].map((purpose) => (
                    <button
                      key={purpose}
                      onClick={() => setFormData({ ...formData, purposeType: purpose })}
                      className={`py-4 rounded-xl font-semibold capitalize transition-all ${
                        formData.purposeType === purpose
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {purpose}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location & Area */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Preferred Locations</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => toggleLocation(location)}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        formData.preferredLocations.includes(location)
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">Distance from City Center (km)</label>
                    <select
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="5">Within 5 km</option>
                      <option value="10">Within 10 km</option>
                      <option value="20">Within 20 km</option>
                      <option value="50">Within 50 km</option>
                      <option value="100">Within 100 km</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">Area Unit</label>
                    <select
                      value={formData.areaUnit}
                      onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="acres">Acres</option>
                      <option value="sqft">Square Feet</option>
                      <option value="hectares">Hectares</option>
                      <option value="sqm">Square Meters</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Area Requirement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">Minimum Area</label>
                    <input
                      type="number"
                      value={formData.minArea}
                      onChange={(e) => setFormData({ ...formData, minArea: e.target.value })}
                      placeholder="e.g., 1"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">Maximum Area</label>
                    <input
                      type="number"
                      value={formData.maxArea}
                      onChange={(e) => setFormData({ ...formData, maxArea: e.target.value })}
                      placeholder="e.g., 5"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Budget & Features */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Budget Range</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">Minimum Budget (₹)</label>
                    <input
                      type="number"
                      value={formData.minBudget}
                      onChange={(e) => setFormData({ ...formData, minBudget: e.target.value })}
                      placeholder="e.g., 1000000"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">Maximum Budget (₹)</label>
                    <input
                      type="number"
                      value={formData.maxBudget}
                      onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                      placeholder="e.g., 5000000"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Desired Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {features.map((feature) => (
                    <button
                      key={feature}
                      onClick={() => toggleFeature(feature)}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                        formData.features.includes(feature)
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Timeline</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: 'immediate', label: 'Immediate' },
                    { value: '3months', label: '3 Months' },
                    { value: '6months', label: '6 Months' },
                    { value: '1year', label: '1 Year' }
                  ].map((timeline) => (
                    <button
                      key={timeline.value}
                      onClick={() => setFormData({ ...formData, timeline: timeline.value })}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        formData.timeline === timeline.value
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {timeline.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Intended Use / Additional Requirements</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  rows="4"
                  placeholder="Tell us more about how you plan to use the land..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Contact Details */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="mt-8 bg-white/5 rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-bold mb-4">Requirement Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Land Type</span>
                    <span className="text-white capitalize">{formData.landType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Purpose</span>
                    <span className="text-white capitalize">{formData.purposeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Area</span>
                    <span className="text-white">{formData.minArea}-{formData.maxArea} {formData.areaUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Budget</span>
                    <span className="text-white">₹{formData.minBudget}-₹{formData.maxBudget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Locations</span>
                    <span className="text-white">{formData.preferredLocations.length} selected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Features</span>
                    <span className="text-white">{formData.features.length} selected</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all"
              >
                Back
              </button>
            )}

            <div className="flex-1"></div>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-12 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Submit Requirement</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandRequirement;