import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Maximize, Info, Home, Building } from 'lucide-react';

const Property3DViewer = () => {
  const canvasRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);
  const [propertyInfo, setPropertyInfo] = useState({
    name: 'Modern Villa',
    type: '3D Model',
    rooms: 4,
    area: 2500
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let rotation = 0;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    // Simple 3D house structure (vertices for a basic house shape)
    const vertices = [
      // Base (floor)
      [-100, 100, -100], [100, 100, -100], [100, 100, 100], [-100, 100, 100],
      // Walls
      [-100, -50, -100], [100, -50, -100], [100, -50, 100], [-100, -50, 100],
      // Roof peak
      [0, -150, 0]
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Base
      [4, 5], [5, 6], [6, 7], [7, 4], // Top
      [0, 4], [1, 5], [2, 6], [3, 7], // Vertical edges
      [4, 8], [5, 8], [6, 8], [7, 8]  // Roof edges
    ];

    const faces = [
      [0, 1, 5, 4], // Front
      [2, 3, 7, 6], // Back
      [1, 2, 6, 5], // Right
      [3, 0, 4, 7], // Left
      [4, 5, 8], [5, 6, 8], [6, 7, 8], [7, 4, 8] // Roof faces
    ];

    // Projection function
    const project = (vertex) => {
      const [x, y, z] = vertex;
      const distance = 500;
      const factor = distance / (distance + z);
      return [
        x * factor * scale + canvas.width / 2 + offsetX,
        y * factor * scale + canvas.height / 2 + offsetY
      ];
    };

    // Rotate vertices
    const rotateY = (vertex, angle) => {
      const [x, y, z] = vertex;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [
        x * cos - z * sin,
        y,
        x * sin + z * cos
      ];
    };

    const rotateX = (vertex, angle) => {
      const [x, y, z] = vertex;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [
        x,
        y * cos - z * sin,
        y * sin + z * cos
      ];
    };

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isRotating) {
        rotation += 0.01;
      }

      // Transform vertices
      const rotatedVertices = vertices.map(v => {
        let vertex = rotateY(v, rotation);
        vertex = rotateX(vertex, 0.3);
        return vertex;
      });

      // Sort faces by average Z (painter's algorithm)
      const sortedFaces = faces.map((face, i) => {
        const avgZ = face.reduce((sum, idx) => sum + rotatedVertices[idx][2], 0) / face.length;
        return { face, avgZ, index: i };
      }).sort((a, b) => a.avgZ - b.avgZ);

      // Draw faces
      sortedFaces.forEach(({ face, index }) => {
        const projectedFace = face.map(idx => project(rotatedVertices[idx]));
        
        ctx.beginPath();
        ctx.moveTo(projectedFace[0][0], projectedFace[0][1]);
        projectedFace.forEach(point => ctx.lineTo(point[0], point[1]));
        ctx.closePath();

        // Color based on face
        const hue = (index * 40) % 360;
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.3)`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${hue}, 70%, 50%, 0.8)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw edges for better definition
      edges.forEach(([start, end]) => {
        const p1 = project(rotatedVertices[start]);
        const p2 = project(rotatedVertices[end]);
        
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isRotating]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            3D Property Viewer
          </h1>
          <p className="text-gray-400 text-lg">
            Interactive 3D model visualization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Canvas */}
          <div className="lg:col-span-3">
            <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <canvas
                ref={canvasRef}
                className="w-full h-[600px]"
                style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 58, 138, 0.8))' }}
              />

              {/* Controls Overlay */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                <button
                  onClick={() => setIsRotating(!isRotating)}
                  className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                >
                  <RotateCw className={`h-6 w-6 text-white ${isRotating ? 'animate-spin' : ''}`} />
                </button>
                <button className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <ZoomIn className="h-6 w-6 text-white" />
                </button>
                <button className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <ZoomOut className="h-6 w-6 text-white" />
                </button>
                <button className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <Maximize className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Info Badge */}
              <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4">
                <div className="flex items-center space-x-2">
                  <Info className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-medium">Interactive 3D Model</span>
                </div>
              </div>
            </div>
          </div>

          {/* Property Info Sidebar */}
          <div className="space-y-6">
            {/* Property Details */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Property Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Home className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Property Type</p>
                    <p className="text-white font-bold">{propertyInfo.type}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Building className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Bedrooms</p>
                    <p className="text-white font-bold">{propertyInfo.rooms}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Maximize className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Area</p>
                    <p className="text-white font-bold">{propertyInfo.area} sqft</p>
                  </div>
                </div>
              </div>
            </div>

            {/* View Controls */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">View Controls</h3>
              
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3 font-semibold hover:shadow-lg transition-all duration-300">
                  Front View
                </button>
                <button className="w-full bg-white/10 border border-white/20 text-white rounded-xl py-3 font-semibold hover:bg-white/20 transition-all duration-300">
                  Top View
                </button>
                <button className="w-full bg-white/10 border border-white/20 text-white rounded-xl py-3 font-semibold hover:bg-white/20 transition-all duration-300">
                  Side View
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Features</h3>
              
              <div className="space-y-2">
                {['Swimming Pool', 'Garden', 'Parking', 'Security'].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-2 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 text-center shadow-2xl">
          <p className="text-gray-300">
            <span className="text-blue-400 font-semibold">Tip:</span> Click the rotation button to pause/resume the 3D animation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Property3DViewer;