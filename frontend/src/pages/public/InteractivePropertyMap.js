import React, { useState, useEffect } from 'react';
import { MapPin, Home, IndianRupee, X, Navigation, Search, Filter, Maximize2 } from 'lucide-react';

const InteractivePropertyMap = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 22.3072, lng: 73.1812 });
  const [zoom, setZoom] = useState(13);
  const [filters, setFilters] = useState({ type: 'all', priceRange: 'all' });
  const [searchTerm, setSearchTerm] = useState('');

  const properties = [
    {
      id: 1,
      title: 'Luxury Villa',
      location: 'Alkapuri',
      price: 12500000,
      type: 'Villa',
      coordinates: { lat: 22.3072, lng: 73.1812 },
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
      beds: 4,
      baths: 3,
      area: 2500
    },
    {
      id: 2,
      title: 'Modern Apartment',
      location: 'Race Course',
      price: 6500000,
      type: 'Apartment',
      coordinates: { lat: 22.2950, lng: 73.1900 },
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      beds: 3,
      baths: 2,
      area: 1800
    },
    {
      id: 3,
      title: 'Commercial Space',
      location: 'Gotri',
      price: 8500000,
      type: 'Commercial',
      coordinates: { lat: 22.2850, lng: 73.1650 },
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      beds: null,
      baths: 2,
      area: 3000
    },
    {
      id: 4,
      title: 'Penthouse Suite',
      location: 'Manjalpur',
      price: 15000000,
      type: 'Penthouse',
      coordinates: { lat: 22.3150, lng: 73.2000 },
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
      beds: 5,
      baths: 4,
      area: 3500
    }
  ];

  // Simple map visualization
  const MapCanvas = () => {
    const canvasRef = React.useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw map background (grid)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      
      for (let i = 0; i < height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Draw roads
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 3;
      
      // Horizontal roads
      [150, 300, 450].forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      });
      
      // Vertical roads
      [200, 400, 600].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      });

      // Convert coordinates to canvas position
      const toCanvasPos = (coords) => {
        const latRange = 0.05;
        const lngRange = 0.05;
        const x = ((coords.lng - (mapCenter.lng - lngRange / 2)) / lngRange) * width;
        const y = ((mapCenter.lat + latRange / 2 - coords.lat) / latRange) * height;
        return { x, y };
      };

      // Draw property pins
      properties.forEach(property => {
        const pos = toCanvasPos(property.coordinates);
        
        // Pin shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 25, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pin body
        const isSelected = selectedProperty?.id === property.id;
        ctx.fillStyle = isSelected ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
        ctx.fill();

        // Pin outline
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pin point
        ctx.fillStyle = isSelected ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y + 12);
        ctx.lineTo(pos.x - 6, pos.y + 22);
        ctx.lineTo(pos.x + 6, pos.y + 22);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.stroke();

        // Ripple effect for selected property
        if (isSelected) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

    }, [selectedProperty]);

    return (
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Check if clicked on a property pin
          properties.forEach(property => {
            const latRange = 0.05;
            const lngRange = 0.05;
            const width = 800;
            const height = 600;
            const px = ((property.coordinates.lng - (mapCenter.lng - lngRange / 2)) / lngRange) * width;
            const py = ((mapCenter.lat + latRange / 2 - property.coordinates.lat) / latRange) * height;
            
            const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
            if (distance < 20) {
              setSelectedProperty(property);
            }
          });
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-96 bg-black/40 backdrop-blur-2xl border-r border-white/10 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Property Map</h1>
              <p className="text-gray-400">Explore properties in Vadodara</p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
              </select>

              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Prices</option>
                <option value="low">Under 50L</option>
                <option value="mid">50L - 1Cr</option>
                <option value="high">Above 1Cr</option>
              </select>
            </div>

            {/* Property List */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Properties ({properties.length})</h3>
              
              {properties.map(property => (
                <div
                  key={property.id}
                  onClick={() => setSelectedProperty(property)}
                  className={`cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
                    selectedProperty?.id === property.id
                      ? 'bg-blue-500/20 border-2 border-blue-500'
                      : 'bg-white/5 border border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center space-x-4 p-4">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">{property.title}</h4>
                      <div className="flex items-center text-gray-400 text-sm mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.location}
                      </div>
                      <div className="flex items-center text-green-400 font-bold">
                        <IndianRupee className="h-4 w-4" />
                        <span className="text-sm">{(property.price / 10000000).toFixed(2)}Cr</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          {/* Map Controls */}
          <div className="absolute top-6 right-6 z-10 space-y-3">
            <button className="p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/20 transition-all">
              <Navigation className="h-6 w-6 text-white" />
            </button>
            <button className="p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/20 transition-all">
              <Maximize2 className="h-6 w-6 text-white" />
            </button>
            <button className="p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/20 transition-all">
              <Filter className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Map Canvas */}
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900">
            <MapCanvas />
          </div>

          {/* Property Info Card */}
          {selectedProperty && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-[500px] bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <button
                onClick={() => setSelectedProperty(null)}
                className="absolute top-4 right-4 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-10"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              <div className="flex">
                <img
                  src={selectedProperty.image}
                  alt={selectedProperty.title}
                  className="w-48 h-full object-cover"
                />
                <div className="flex-1 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedProperty.title}</h3>
                  <div className="flex items-center text-gray-300 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedProperty.location}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-green-400 font-bold text-xl">
                      <IndianRupee className="h-5 w-5" />
                      <span>{(selectedProperty.price / 10000000).toFixed(2)}Cr</span>
                    </div>
                    <div className="flex space-x-4 text-white text-sm">
                      {selectedProperty.beds && (
                        <span>{selectedProperty.beds} Beds</span>
                      )}
                      <span>{selectedProperty.baths} Baths</span>
                      <span>{selectedProperty.area} sqft</span>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4">
            <h4 className="text-white font-semibold mb-3">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Selected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractivePropertyMap;