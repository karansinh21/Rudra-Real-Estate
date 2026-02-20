import React, { useState } from 'react';
import { Plus, X, Check, IndianRupee, Bed, Bath, Square, MapPin, TrendingUp, Award } from 'lucide-react';

const PropertyComparison = () => {
  const [selectedProperties, setSelectedProperties] = useState([]);

  const availableProperties = [
    {
      id: 1,
      title: 'Luxury Villa',
      location: 'Alkapuri',
      price: 12500000,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
      beds: 4,
      baths: 3,
      area: 2500,
      features: ['Swimming Pool', 'Garden', 'Parking', 'Security', 'Gym'],
      rating: 4.8,
      yearBuilt: 2023
    },
    {
      id: 2,
      title: 'Modern Apartment',
      location: 'Race Course',
      price: 6500000,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      beds: 3,
      baths: 2,
      area: 1800,
      features: ['Balcony', 'Parking', 'Security', 'Lift'],
      rating: 4.5,
      yearBuilt: 2022
    },
    {
      id: 3,
      title: 'Commercial Space',
      location: 'Gotri',
      price: 8500000,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      beds: null,
      baths: 2,
      area: 3000,
      features: ['Conference Room', 'Parking', 'Security', 'Cafeteria'],
      rating: 4.6,
      yearBuilt: 2021
    }
  ];

  const addProperty = (property) => {
    if (selectedProperties.length < 3 && !selectedProperties.find(p => p.id === property.id)) {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const removeProperty = (id) => {
    setSelectedProperties(selectedProperties.filter(p => p.id !== id));
  };

  const ComparisonRow = ({ label, icon: Icon, getValue }) => (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
      <div className="flex items-center space-x-2 mb-4">
        {Icon && <Icon className="h-5 w-5 text-blue-400" />}
        <span className="text-gray-300 font-semibold">{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {selectedProperties.map(property => (
          <div key={property.id} className="text-center">
            <p className="text-white font-bold text-lg">{getValue(property)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Compare Properties
          </h1>
          <p className="text-gray-400 text-lg">
            Select up to 3 properties to compare side by side
          </p>
        </div>

        {/* Available Properties */}
        {selectedProperties.length < 3 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Available Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availableProperties.filter(p => !selectedProperties.find(sp => sp.id === p.id)).map(property => (
                <div
                  key={property.id}
                  className="group relative bg-white/5 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer"
                  onClick={() => addProperty(property)}
                >
                  <div className="relative h-48">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{property.title}</h3>
                    <div className="flex items-center text-gray-400 text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </div>
                    <div className="flex items-center text-green-400 font-bold">
                      <IndianRupee className="h-5 w-5" />
                      <span>{(property.price / 10000000).toFixed(2)}Cr</span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 bg-blue-500 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Plus className="h-6 w-6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {selectedProperties.length > 0 && (
          <div className="space-y-6">
            {/* Property Headers */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
              <div className="grid grid-cols-3 gap-6">
                {selectedProperties.map(property => (
                  <div key={property.id} className="relative">
                    <button
                      onClick={() => removeProperty(property.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-white mb-2">{property.title}</h3>
                        <div className="flex items-center text-gray-400 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </div>
                        <div className="flex items-center text-green-400 font-bold">
                          <IndianRupee className="h-5 w-5" />
                          <span className="text-lg">{(property.price / 10000000).toFixed(2)}Cr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Rows */}
            <div className="space-y-4">
              <ComparisonRow
                label="Bedrooms"
                icon={Bed}
                getValue={(p) => p.beds || 'N/A'}
              />
              
              <ComparisonRow
                label="Bathrooms"
                icon={Bath}
                getValue={(p) => p.baths}
              />
              
              <ComparisonRow
                label="Area (sqft)"
                icon={Square}
                getValue={(p) => p.area.toLocaleString()}
              />
              
              <ComparisonRow
                label="Year Built"
                getValue={(p) => p.yearBuilt}
              />
              
              <ComparisonRow
                label="Rating"
                icon={Award}
                getValue={(p) => `${p.rating}/5`}
              />

              {/* Features Comparison */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300 font-semibold">Features</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {selectedProperties.map(property => (
                    <div key={property.id} className="space-y-2">
                      {property.features.map((feature, i) => (
                        <div key={i} className="flex items-center space-x-2 text-gray-300 text-sm">
                          <Check className="h-4 w-4 text-green-400" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Winner Highlight */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center">
              <h3 className="text-3xl font-bold text-white mb-4">Best Value</h3>
              <p className="text-white/90 text-lg mb-6">
                Based on price per square foot
              </p>
              <div className="flex justify-center space-x-4">
                {selectedProperties
                  .map(p => ({ ...p, pricePerSqft: p.price / p.area }))
                  .sort((a, b) => a.pricePerSqft - b.pricePerSqft)
                  .slice(0, 1)
                  .map(property => (
                    <div key={property.id} className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/30">
                      <h4 className="text-2xl font-bold text-white mb-2">{property.title}</h4>
                      <p className="text-white/80">
                        ₹{Math.round(property.pricePerSqft).toLocaleString()} per sqft
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {selectedProperties.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 inline-block">
              <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">
                Select properties above to start comparing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyComparison;