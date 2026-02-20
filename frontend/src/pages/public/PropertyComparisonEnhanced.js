import React, { useState } from 'react';
import { Plus, X, Check, IndianRupee, Bed, Bath, Square, MapPin, TrendingUp, Award, Download, Share2 } from 'lucide-react';

const PropertyComparisonEnhanced = () => {
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
      yearBuilt: 2023,
      parking: 2,
      floors: 2,
      rating: 4.8,
      roi: 12,
      features: ['Swimming Pool', 'Garden', 'Gym', 'Security', 'Parking'],
      pros: ['Prime location', 'Modern amenities', 'High resale value'],
      cons: ['High maintenance', 'Far from metro'],
      pricePerSqft: 5000
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
      yearBuilt: 2022,
      parking: 1,
      floors: 1,
      rating: 4.5,
      roi: 10,
      features: ['Balcony', 'Parking', 'Security', 'Lift'],
      pros: ['Good connectivity', 'Affordable', 'Ready to move'],
      cons: ['Limited amenities', 'Smaller area'],
      pricePerSqft: 3611
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
      yearBuilt: 2021,
      parking: 5,
      floors: 1,
      rating: 4.6,
      roi: 15,
      features: ['Conference Room', 'Parking', 'Security', 'Cafeteria'],
      pros: ['High ROI', 'Commercial hub', 'Good rental demand'],
      cons: ['Commercial tax', 'Business hours only'],
      pricePerSqft: 2833
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

  const ComparisonRow = ({ label, getValue, icon: Icon, highlight = false }) => (
    <div className={`grid grid-cols-${selectedProperties.length + 1} gap-4 p-4 ${highlight ? 'bg-blue-500/10' : 'bg-white/5'} rounded-xl`}>
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="h-5 w-5 text-blue-400" />}
        <span className="text-gray-300 font-semibold">{label}</span>
      </div>
      {selectedProperties.map(property => (
        <div key={property.id} className="text-center">
          <p className="text-white font-bold">{getValue(property)}</p>
        </div>
      ))}
    </div>
  );

  const getBestValue = (properties, getValue) => {
    if (properties.length === 0) return null;
    return properties.reduce((best, current) => {
      const bestVal = getValue(best);
      const currentVal = getValue(current);
      return currentVal < bestVal ? current : best;
    });
  };

  const bestValue = getBestValue(selectedProperties, (p) => p.pricePerSqft);

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

        {/* Selected Properties Count */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 text-blue-400 px-6 py-3 rounded-xl font-bold">
              {selectedProperties.length}/3 Selected
            </div>
            {bestValue && (
              <div className="flex items-center space-x-2 text-green-400">
                <Award className="h-5 w-5" />
                <span className="font-semibold">Best Value: {bestValue.title}</span>
              </div>
            )}
          </div>
          {selectedProperties.length > 0 && (
            <div className="flex space-x-3">
              <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export</span>
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2">
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>
          )}
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
          <div className="space-y-4">
            {/* Property Headers */}
            <div className={`grid grid-cols-${selectedProperties.length + 1} gap-4`}>
              <div></div>
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

            {/* Comparison Rows */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 space-y-3">
              <h3 className="text-2xl font-bold text-white mb-6">Detailed Comparison</h3>

              <ComparisonRow
                label="Price per Sqft"
                icon={TrendingUp}
                getValue={(p) => `₹${p.pricePerSqft}`}
                highlight={true}
              />
              
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
                label="Parking"
                getValue={(p) => `${p.parking} ${p.parking === 1 ? 'spot' : 'spots'}`}
              />

              <ComparisonRow
                label="Rating"
                icon={Award}
                getValue={(p) => `${p.rating}/5`}
              />

              <ComparisonRow
                label="ROI Potential"
                getValue={(p) => `${p.roi}%`}
                highlight={true}
              />

              {/* Features Comparison */}
              <div className="bg-white/5 rounded-xl p-4 mt-6">
                <h4 className="text-white font-bold mb-4">Features Comparison</h4>
                <div className={`grid grid-cols-${selectedProperties.length + 1} gap-4`}>
                  <div className="text-gray-400 font-semibold">Available Features</div>
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

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                  <h4 className="text-green-400 font-bold mb-4 flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    Advantages
                  </h4>
                  <div className={`grid grid-cols-${selectedProperties.length} gap-4`}>
                    {selectedProperties.map(property => (
                      <div key={property.id} className="space-y-2">
                        {property.pros.map((pro, i) => (
                          <p key={i} className="text-gray-300 text-sm">• {pro}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                  <h4 className="text-red-400 font-bold mb-4 flex items-center">
                    <X className="h-5 w-5 mr-2" />
                    Considerations
                  </h4>
                  <div className={`grid grid-cols-${selectedProperties.length} gap-4`}>
                    {selectedProperties.map(property => (
                      <div key={property.id} className="space-y-2">
                        {property.cons.map((con, i) => (
                          <p key={i} className="text-gray-300 text-sm">• {con}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Winner Highlight */}
            {bestValue && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center">
                <h3 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 mr-3 text-yellow-400" />
                  Best Value for Money
                </h3>
                <p className="text-white/90 text-lg mb-6">
                  Based on price per square foot analysis
                </p>
                <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 inline-block">
                  <h4 className="text-2xl font-bold text-white mb-2">{bestValue.title}</h4>
                  <p className="text-white/80">
                    ₹{Math.round(bestValue.pricePerSqft).toLocaleString()} per sqft
                  </p>
                </div>
              </div>
            )}
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

export default PropertyComparisonEnhanced;