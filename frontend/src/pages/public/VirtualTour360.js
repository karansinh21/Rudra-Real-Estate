import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, RotateCw, ZoomIn, ZoomOut, Navigation, ChevronLeft, ChevronRight, MapPin, Info } from 'lucide-react';

const VirtualTour360 = () => {
  const [currentRoom, setCurrentRoom] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const rooms = [
    { 
      name: 'Living Room', 
      description: 'Spacious living area with modern furnishings',
      hotspots: [
        { x: 30, y: 50, label: 'Premium Sofa Set' },
        { x: 70, y: 40, label: '4K Smart TV' }
      ]
    },
    { 
      name: 'Master Bedroom', 
      description: 'Elegant bedroom with king-size bed',
      hotspots: [
        { x: 40, y: 55, label: 'King Size Bed' },
        { x: 80, y: 45, label: 'Wardrobe' }
      ]
    },
    { 
      name: 'Kitchen', 
      description: 'Modern kitchen with latest appliances',
      hotspots: [
        { x: 25, y: 60, label: 'Modular Kitchen' },
        { x: 60, y: 50, label: 'Breakfast Counter' }
      ]
    },
    { 
      name: 'Balcony', 
      description: 'Beautiful view of the city skyline',
      hotspots: [
        { x: 50, y: 30, label: 'City View' }
      ]
    }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create 360° panorama effect
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    
    // Room-specific colors
    const roomColors = [
      ['#1e3a8a', '#3b82f6'], // Living Room - Blue
      ['#581c87', '#a855f7'], // Bedroom - Purple
      ['#15803d', '#22c55e'], // Kitchen - Green
      ['#ea580c', '#fb923c']  // Balcony - Orange
    ];

    const colors = roomColors[currentRoom];
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[0]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add perspective grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Horizontal lines with perspective
    for (let i = 0; i < height; i += 40) {
      const curveFactor = (i - height / 2) * 0.1;
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.quadraticCurveTo(width / 2, i + curveFactor, width, i);
      ctx.stroke();
    }

    // Vertical lines with rotation effect
    const offset = (rotation * 2) % 100;
    for (let i = -100; i < width + 100; i += 80) {
      ctx.beginPath();
      ctx.moveTo(i + offset, 0);
      ctx.lineTo(i + offset, height);
      ctx.stroke();
    }

    // Draw room elements (simulated furniture/features)
    const drawElement = (x, y, size, color) => {
      ctx.fillStyle = color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      ctx.shadowBlur = 0;
    };

    // Room-specific elements
    if (currentRoom === 0) { // Living Room
      drawElement(200 + offset * 0.5, 300, 100, 'rgba(139, 92, 246, 0.6)'); // Sofa
      drawElement(600 + offset * 0.3, 250, 80, 'rgba(59, 130, 246, 0.6)'); // TV
    } else if (currentRoom === 1) { // Bedroom
      drawElement(400 + offset * 0.4, 350, 120, 'rgba(168, 85, 247, 0.6)'); // Bed
    } else if (currentRoom === 2) { // Kitchen
      drawElement(300 + offset * 0.5, 320, 90, 'rgba(34, 197, 94, 0.6)'); // Counter
    } else if (currentRoom === 3) { // Balcony
      // View simulation
      ctx.fillStyle = 'rgba(251, 146, 60, 0.3)';
      ctx.fillRect(0, 0, width, height / 2);
    }

    // Draw hotspots
    rooms[currentRoom].hotspots.forEach(hotspot => {
      const x = (hotspot.x / 100) * width;
      const y = (hotspot.y / 100) * height;

      // Hotspot circle
      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Hotspot ring animation
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.stroke();
    });

  }, [currentRoom, rotation, zoom]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - startPos.x;
      setRotation(prev => prev + deltaX * 0.5);
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const nextRoom = () => {
    setCurrentRoom((prev) => (prev + 1) % rooms.length);
  };

  const prevRoom = () => {
    setCurrentRoom((prev) => (prev - 1 + rooms.length) % rooms.length);
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="w-full h-screen cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 px-6 py-3">
            <h1 className="text-white font-bold text-xl">Virtual Property Tour</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              className="p-3 bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/10 transition-all"
            >
              <ZoomOut className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
              className="p-3 bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/10 transition-all"
            >
              <ZoomIn className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => setRotation(0)}
              className="p-3 bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/10 transition-all"
            >
              <RotateCw className="h-5 w-5 text-white" />
            </button>
            <button className="p-3 bg-black/40 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/10 transition-all">
              <Maximize2 className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Room Navigation */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-32">
        <div className="flex items-center space-x-4">
          <button
            onClick={prevRoom}
            className="p-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 px-8 py-4">
            <h3 className="text-white font-bold text-xl text-center mb-1">
              {rooms[currentRoom].name}
            </h3>
            <p className="text-gray-300 text-sm text-center">
              {rooms[currentRoom].description}
            </p>
          </div>

          <button
            onClick={nextRoom}
            className="p-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/10 transition-all"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Room Thumbnails */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-3">
          {rooms.map((room, index) => (
            <button
              key={index}
              onClick={() => setCurrentRoom(index)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                currentRoom === index
                  ? 'bg-blue-500 text-white scale-110'
                  : 'bg-black/40 backdrop-blur-xl text-white border border-white/20 hover:bg-white/10'
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute top-24 right-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 max-w-xs">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="h-5 w-5 text-blue-400" />
          <h3 className="text-white font-bold">Tour Guide</h3>
        </div>
        
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
            <span>Drag to rotate the view</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
            <span>Click hotspots for details</span>
          </li>
          <li className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
            <span>Use arrows to change rooms</span>
          </li>
        </ul>

        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center space-x-2 text-white mb-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span className="text-sm">Alkapuri, Vadodara</span>
          </div>
          <p className="text-xs text-gray-400">
            4 BHK Luxury Villa • 2500 sq ft
          </p>
        </div>
      </div>

      {/* Compass */}
      <div className="absolute top-24 left-6 bg-black/40 backdrop-blur-xl rounded-full p-4 border border-white/20">
        <div className="relative w-16 h-16">
          <Navigation 
            className="h-16 w-16 text-white absolute inset-0"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold">N</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTour360;