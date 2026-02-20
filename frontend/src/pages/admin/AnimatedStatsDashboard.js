import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Building2, DollarSign, Activity, ArrowRight, Zap } from 'lucide-react';

const AnimatedStatsDashboard = () => {
  const [counters, setCounters] = useState({
    users: 0,
    properties: 0,
    revenue: 0,
    growth: 0
  });

  const targetValues = {
    users: 2450,
    properties: 856,
    revenue: 125000000,
    growth: 34
  };

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const timer = setInterval(() => {
      setCounters(prev => ({
        users: Math.min(prev.users + Math.ceil(targetValues.users / steps), targetValues.users),
        properties: Math.min(prev.properties + Math.ceil(targetValues.properties / steps), targetValues.properties),
        revenue: Math.min(prev.revenue + Math.ceil(targetValues.revenue / steps), targetValues.revenue),
        growth: Math.min(prev.growth + Math.ceil(targetValues.growth / steps), targetValues.growth)
      }));
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      id: 'users',
      icon: Users,
      title: 'Total Users',
      value: counters.users.toLocaleString(),
      change: '+12.5%',
      trend: 'up',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      chartData: [40, 60, 45, 70, 55, 80, 65]
    },
    {
      id: 'properties',
      icon: Building2,
      title: 'Properties Listed',
      value: counters.properties.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      chartData: [30, 50, 40, 65, 50, 75, 60]
    },
    {
      id: 'revenue',
      icon: DollarSign,
      title: 'Total Revenue',
      value: `₹${(counters.revenue / 10000000).toFixed(1)}Cr`,
      change: '+23.1%',
      trend: 'up',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      chartData: [50, 65, 55, 80, 70, 90, 85]
    },
    {
      id: 'growth',
      icon: TrendingUp,
      title: 'Growth Rate',
      value: `${counters.growth}%`,
      change: '+5.3%',
      trend: 'up',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      chartData: [20, 35, 30, 50, 45, 60, 55]
    }
  ];

  const MiniChart = ({ data, color }) => {
    const max = Math.max(...data);
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (val / max) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-16 opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-${color}`}
        />
      </svg>
    );
  };

  const activities = [
    { type: 'sale', user: 'John Doe', action: 'purchased villa in Alkapuri', time: '2 min ago', icon: Building2, color: 'text-blue-400' },
    { type: 'signup', user: 'Sarah Smith', action: 'registered as new broker', time: '15 min ago', icon: Users, color: 'text-green-400' },
    { type: 'listing', user: 'Mike Johnson', action: 'listed new property', time: '1 hour ago', icon: Activity, color: 'text-purple-400' },
    { type: 'revenue', user: 'System', action: 'generated ₹5L in commissions', time: '2 hours ago', icon: DollarSign, color: 'text-yellow-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-400 text-lg">Real-time business insights</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 backdrop-blur-xl rounded-2xl px-6 py-3 border border-green-500/30">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="group relative"
              style={{
                animation: `slideUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>

              {/* Card */}
              <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <MiniChart data={stat.chartData} color={stat.color} />
                </div>

                {/* Content */}
                <div className="relative p-6">
                  {/* Icon & Change */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${stat.bgColor}`}>
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`text-sm font-bold ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <p className="text-gray-400 text-sm mb-2">{stat.title}</p>

                  {/* Value with animation */}
                  <div className="flex items-baseline space-x-2">
                    <p className="text-4xl font-bold text-white">
                      {stat.value}
                    </p>
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${(counters[stat.id] / targetValues[stat.id]) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Feed & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Activity className="h-6 w-6 text-blue-400" />
                <span>Recent Activity</span>
              </h2>
              <button className="text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 hover:border-white/30 transition-all duration-300 group"
                  style={{
                    animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${activity.color.replace('text-', 'bg-')}/20 group-hover:scale-110 transition-transform`}>
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium">{activity.user}</p>
                        <span className="text-gray-500 text-xs">{activity.time}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{activity.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-white font-bold text-xl mb-4">Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-white mb-2">
                    <span className="text-sm">Properties Sold</span>
                    <span className="font-bold">87%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-white mb-2">
                    <span className="text-sm">Client Satisfaction</span>
                    <span className="font-bold">94%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-white mb-2">
                    <span className="text-sm">Revenue Target</span>
                    <span className="font-bold">78%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl">
              <h3 className="text-white font-bold text-xl mb-4">Top Performers</h3>
              <div className="space-y-3">
                {['Rajesh Sharma', 'Priya Patel', 'Amit Kumar'].map((name, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{name}</p>
                      <p className="text-gray-400 text-xs">₹{(Math.random() * 10 + 5).toFixed(1)}L</p>
                    </div>
                    <div className="text-green-400 text-sm font-bold">#{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedStatsDashboard;