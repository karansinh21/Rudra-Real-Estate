import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Users, Building2, DollarSign, Calendar } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  const chartRef = useRef(null);
  const pieChartRef = useRef(null);

  const data = {
    revenue: [45, 52, 48, 65, 58, 72, 68, 75, 82, 78, 85, 92],
    properties: [12, 15, 18, 16, 22, 25, 28, 30, 27, 32, 35, 38],
    users: [8, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45]
  };

  useEffect(() => {
    drawLineChart();
    drawPieChart();
  }, [timeRange]);

  const drawLineChart = () => {
    const canvas = chartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw revenue line
    const revenueData = data.revenue;
    const max = Math.max(...revenueData);
    const pointSpacing = width / (revenueData.length - 1);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    revenueData.forEach((value, index) => {
      const x = index * pointSpacing;
      const y = height - (value / max) * (height - 40) - 20;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw point
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.stroke();

    // Draw properties line
    const propertiesData = data.properties;
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    propertiesData.forEach((value, index) => {
      const x = index * pointSpacing;
      const y = height - (value / max) * (height - 40) - 20;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.stroke();
  };

  const drawPieChart = () => {
    const canvas = pieChartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pieData = [
      { value: 45, color: '#3b82f6', label: 'Residential' },
      { value: 30, color: '#8b5cf6', label: 'Commercial' },
      { value: 25, color: '#10b981', label: 'Land' }
    ];

    const total = pieData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2;

    pieData.forEach((item) => {
      const sliceAngle = (item.value / total) * Math.PI * 2;

      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });

    // Center circle
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.fill();
  };

  const stats = [
    { 
      title: 'Total Revenue', 
      value: '₹24.5L', 
      change: '+23.5%', 
      trend: 'up',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'Properties Listed', 
      value: '324', 
      change: '+12.3%', 
      trend: 'up',
      icon: Building2,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'Active Users', 
      value: '1,245', 
      change: '+8.7%', 
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'Conversion Rate', 
      value: '3.2%', 
      change: '-2.1%', 
      trend: 'down',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const topPerformers = [
    { name: 'Rajesh Sharma', role: 'Broker', deals: 28, revenue: 450000 },
    { name: 'Priya Patel', role: 'Broker', deals: 24, revenue: 380000 },
    { name: 'Adv. Amit Kumar', role: 'Lawyer', deals: 45, revenue: 225000 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Track performance and insights</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 hover:border-white/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-bold ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <p className="text-white text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Line Chart */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Revenue & Properties Trend</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-400">Revenue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-400">Properties</span>
                </div>
              </div>
            </div>
            <canvas ref={chartRef} width="800" height="300" className="w-full"></canvas>
          </div>

          {/* Pie Chart */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Property Types</h3>
            <canvas ref={pieChartRef} width="300" height="300" className="w-full mb-6"></canvas>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-400">Residential</span>
                </div>
                <span className="text-white font-bold">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-400">Commercial</span>
                </div>
                <span className="text-white font-bold">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400">Land</span>
                </div>
                <span className="text-white font-bold">25%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Top Performers</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPerformers.map((performer, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {index + 1}
                </div>
                <h4 className="text-white font-bold text-lg mb-1">{performer.name}</h4>
                <p className="text-gray-400 text-sm mb-4">{performer.role}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Deals</p>
                    <p className="text-white font-bold text-xl">{performer.deals}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Revenue</p>
                    <p className="text-green-400 font-bold text-xl">₹{(performer.revenue / 1000).toFixed(0)}k</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;