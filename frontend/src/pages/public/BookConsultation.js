import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, FileText, IndianRupee, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

const BookConsultation = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    lawyerId: '',
    serviceType: '',
    date: '',
    timeSlot: '',
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    description: '',
    documents: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const lawyers = [
    { id: 1, name: 'Adv. Rajesh Mehta', specialization: 'Property Law', rating: 4.9, fee: 2000 },
    { id: 2, name: 'Adv. Priya Sharma', specialization: 'Real Estate Law', rating: 4.8, fee: 1500 },
    { id: 3, name: 'Adv. Amit Patel', specialization: 'Civil & Property Law', rating: 4.9, fee: 3000 }
  ];

  const services = [
    { id: 1, name: 'Rent Agreement', price: 2000, duration: '2-3 days' },
    { id: 2, name: 'Property Registration', price: 5000, duration: '7-10 days' },
    { id: 3, name: 'Legal Consultation', price: 1500, duration: '1 hour' },
    { id: 4, name: 'Title Verification', price: 3000, duration: '5-7 days' }
  ];

  const availableDates = [
    { date: '2024-01-20', slots: ['10:00 AM', '2:00 PM', '4:00 PM'] },
    { date: '2024-01-21', slots: ['10:00 AM', '11:00 AM', '3:00 PM'] },
    { date: '2024-01-22', slots: ['10:00 AM', '2:00 PM', '5:00 PM'] }
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
      setBookingSuccess(true);
    }, 2000);
  };

  const selectedLawyer = lawyers.find(l => l.id === parseInt(formData.lawyerId));
  const selectedService = services.find(s => s.id === parseInt(formData.serviceType));

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-12 text-center">
          <div className="bg-green-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Booking Confirmed!</h2>
          <p className="text-gray-300 text-lg mb-8">
            Your consultation has been booked successfully. You will receive a confirmation email shortly.
          </p>

          <div className="bg-white/5 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-2 gap-6 text-left">
              <div>
                <p className="text-gray-400 text-sm mb-1">Lawyer</p>
                <p className="text-white font-bold">{selectedLawyer?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Service</p>
                <p className="text-white font-bold">{selectedService?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Date & Time</p>
                <p className="text-white font-bold">{formData.date} at {formData.timeSlot}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Consultation Fee</p>
                <p className="text-green-400 font-bold">₹{selectedLawyer?.fee}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Book Legal Consultation
          </h1>
          <p className="text-xl text-gray-300">
            Get expert legal advice for your property matters
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
                  step >= s 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`w-16 h-1 transition-all ${
                    step > s ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-white/10'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8">
          {/* Step 1: Select Lawyer */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Select a Lawyer</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {lawyers.map((lawyer) => (
                  <div
                    key={lawyer.id}
                    onClick={() => setFormData({ ...formData, lawyerId: lawyer.id })}
                    className={`cursor-pointer bg-white/5 rounded-2xl border-2 p-6 transition-all ${
                      formData.lawyerId === lawyer.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                        {lawyer.name.split(' ')[1][0]}
                      </div>
                      <h3 className="text-white font-bold mb-1">{lawyer.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{lawyer.specialization}</p>
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <span className="text-yellow-400">★</span>
                        <span className="text-white font-bold">{lawyer.rating}</span>
                      </div>
                      <div className="flex items-center justify-center text-green-400 font-bold">
                        <IndianRupee className="h-4 w-4" />
                        <span>{lawyer.fee}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Service */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Select Service</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setFormData({ ...formData, serviceType: service.id })}
                    className={`cursor-pointer bg-white/5 rounded-2xl border-2 p-6 transition-all ${
                      formData.serviceType === service.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <h3 className="text-white font-bold text-lg mb-2">{service.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-green-400 font-bold">
                        <IndianRupee className="h-5 w-5" />
                        <span>{service.price}</span>
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{service.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Select Date & Time</h2>
              
              <div className="space-y-6">
                {availableDates.map((dateObj, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-white font-bold mb-4">{dateObj.date}</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {dateObj.slots.map((slot, j) => (
                        <button
                          key={j}
                          onClick={() => setFormData({ ...formData, date: dateObj.date, timeSlot: slot })}
                          className={`py-3 rounded-xl font-semibold transition-all ${
                            formData.date === dateObj.date && formData.timeSlot === slot
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Personal Details */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Your Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-semibold mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select property type</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Describe Your Requirement</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="4"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about your legal requirement..."
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="mt-8 bg-white/5 rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-bold mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lawyer</span>
                    <span className="text-white">{selectedLawyer?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service</span>
                    <span className="text-white">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date & Time</span>
                    <span className="text-white">{formData.date} at {formData.timeSlot}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white font-bold">Total Fee</span>
                    <span className="text-green-400 font-bold">₹{selectedLawyer?.fee}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
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
                disabled={
                  (step === 1 && !formData.lawyerId) ||
                  (step === 2 && !formData.serviceType) ||
                  (step === 3 && (!formData.date || !formData.timeSlot))
                }
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Confirm Booking</span>
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

export default BookConsultation;