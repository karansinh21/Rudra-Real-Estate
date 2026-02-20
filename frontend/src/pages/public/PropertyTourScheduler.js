import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, X, ChevronLeft, ChevronRight, Home } from 'lucide-react';

const PropertyTourScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    propertyId: '',
    name: '',
    email: '',
    phone: '',
    tourType: 'in-person',
    notes: ''
  });

  const [scheduledTours, setScheduledTours] = useState([
    {
      id: 1,
      property: '3BHK Luxury Apartment',
      location: 'Alkapuri, Vadodara',
      date: '2024-01-20',
      time: '10:00 AM',
      type: 'in-person',
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'
    },
    {
      id: 2,
      property: 'Commercial Office Space',
      location: 'Race Course, Vadodara',
      date: '2024-01-22',
      time: '2:00 PM',
      type: 'virtual',
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'
    }
  ]);

  const properties = [
    { id: 1, name: '3BHK Luxury Apartment', location: 'Alkapuri' },
    { id: 2, name: 'Commercial Office Space', location: 'Race Course' },
    { id: 3, name: 'Villa with Garden', location: 'Gorwa' },
    { id: 4, name: 'Agricultural Land', location: 'Dabhoi Road' }
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const selectDate = (day) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const newTour = {
        id: scheduledTours.length + 1,
        property: properties.find(p => p.id === parseInt(formData.propertyId))?.name,
        location: properties.find(p => p.id === parseInt(formData.propertyId))?.location,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        type: formData.tourType,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'
      };
      setScheduledTours([...scheduledTours, newTour]);
      setStep(4);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Schedule Property Tour</h1>
          <p className="text-xl text-gray-600">Book your visit in just a few steps</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              <div>
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Property & Tour Type</h2>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Property</label>
                      <select
                        value={formData.propertyId}
                        onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      >
                        <option value="">Select a property</option>
                        {properties.map(prop => (
                          <option key={prop.id} value={prop.id}>
                            {prop.name} - {prop.location}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Tour Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setFormData({...formData, tourType: 'in-person'})}
                          className={`p-6 border-2 rounded-xl transition-all ${
                            formData.tourType === 'in-person'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Home className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                          <div className="font-bold text-gray-900">In-Person</div>
                          <div className="text-sm text-gray-600">Visit the property</div>
                        </button>
                        <button
                          onClick={() => setFormData({...formData, tourType: 'virtual'})}
                          className={`p-6 border-2 rounded-xl transition-all ${
                            formData.tourType === 'virtual'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Calendar className="w-8 h-8 mx-auto mb-3 text-purple-600" />
                          <div className="font-bold text-gray-900">Virtual Tour</div>
                          <div className="text-sm text-gray-600">Video call tour</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Date & Time</h2>
                    
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <div className="flex justify-between items-center mb-6">
                        <button
                          onClick={() => navigateMonth(-1)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold text-gray-900">
                          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                        </h3>
                        <button
                          onClick={() => navigateMonth(1)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {dayNames.map(day => (
                          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {[...Array(startingDayOfWeek)].map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {[...Array(daysInMonth)].map((_, i) => {
                          const day = i + 1;
                          const isSelected = selectedDate.getDate() === day;
                          const isToday = new Date().getDate() === day && 
                                         new Date().getMonth() === selectedDate.getMonth();
                          
                          return (
                            <button
                              key={day}
                              onClick={() => selectDate(day)}
                              className={`aspect-square rounded-lg font-semibold transition-all ${
                                isSelected
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                  : isToday
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-white hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Available Time Slots</label>
                      <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map(time => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                              selectedTime === time
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Information</h2>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes (Optional)</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        rows="4"
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="text-center py-8">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Tour Scheduled!</h2>
                    <p className="text-gray-600 mb-8">
                      Your property tour has been scheduled successfully. We'll send you a confirmation email shortly.
                    </p>
                    <div className="bg-gray-50 p-6 rounded-xl text-left max-w-md mx-auto mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Home className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">
                          {properties.find(p => p.id === parseInt(formData.propertyId))?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span>{selectedDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-green-600" />
                        <span>{selectedTime}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setStep(1);
                        setFormData({ propertyId: '', name: '', email: '', phone: '', tourType: 'in-person', notes: '' });
                        setSelectedTime('');
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Schedule Another Tour
                    </button>
                  </div>
                )}

                {step < 4 && (
                  <div className="flex gap-4 mt-8">
                    {step > 1 && (
                      <button
                        onClick={() => setStep(step - 1)}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Back
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={step === 2 && !selectedTime}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {step === 3 ? 'Schedule Tour' : 'Continue'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Scheduled Tours</h3>
              
              {scheduledTours.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No tours scheduled yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledTours.map(tour => (
                    <div key={tour.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 transition-all">
                      <img 
                        src={tour.image} 
                        alt={tour.property}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-bold text-gray-900 mb-1">{tour.property}</h4>
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {tour.location}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                        <Calendar className="w-4 h-4" />
                        {tour.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                        <Clock className="w-4 h-4" />
                        {tour.time}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tour.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tour.status}
                        </span>
                        <span className="text-xs text-gray-600 capitalize">{tour.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyTourScheduler;