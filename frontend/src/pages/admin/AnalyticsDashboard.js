import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Users, Building2, DollarSign, Calendar, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { analyticsAPI } from '../../services/api';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashStats, setDashStats] = useState(null);
  const [propAnalytics, setPropAnalytics] = useState(null);
  const [enqAnalytics, setEnqAnalytics] = useState(null);
  const chartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => { fetchAllAnalytics(); }, []);

  useEffect(() => {
    if (!loading && !error) {
      drawLineChart();
      drawPieChart();
    }
  }, [timeRange, loading, propAnalytics, enqAnalytics]);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true); setError(null);
      const [statsRes, propRes, enqRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getPropertyAnalytics(),
        analyticsAPI.getEnquiryAnalytics()
      ]);
      setDashStats(statsRes.data.stats);
      setPropAnalytics(propRes.data.analytics);
      setEnqAnalytics(enqRes.data.analytics);
    } catch (err) {
      setError('Analytics data load karvama error aavyo.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '₹0';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString()}`;
  };

  const drawLineChart = () => {
    const canvas = chartRef.current;
    if (!canvas || !enqAnalytics) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width; const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const enquiryValues = (enqAnalytics.monthly || []).map(m => m.count);
    const propValues = (propAnalytics?.byType || []).map(p => p.count);
    const maxLen = Math.max(enquiryValues.length, propValues.length, 2);
    while (enquiryValues.length < maxLen) enquiryValues.unshift(0);
    while (propValues.length < maxLen) propValues.unshift(0);
    const max = Math.max(...enquiryValues, ...propValues, 1);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    for (let i = 0; i < height; i += 40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(width,i); ctx.stroke(); }

    const draw = (data, color) => {
      const spacing = width / (maxLen - 1);
      ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath();
      data.forEach((v, i) => {
        const x = i * spacing; const y = height - (v/max)*(height-40) - 20;
        i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      });
      ctx.stroke();
      data.forEach((v, i) => {
        const x = i * spacing; const y = height - (v/max)*(height-40) - 20;
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
      });
    };
    draw(enquiryValues, '#3b82f6');
    draw(propValues, '#8b5cf6');
  };

  const drawPieChart = () => {
    const canvas = pieChartRef.current;
    if (!canvas || !propAnalytics) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width/2; const cy = canvas.height/2; const r = 80;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'];
    const byType = propAnalytics.byType || [];
    if (!byType.length) {
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    } else {
      const total = byType.reduce((s,i) => s+i.count, 0) || 1;
      let angle = -Math.PI/2;
      byType.forEach((item, i) => {
        const slice = (item.count/total)*Math.PI*2;
        ctx.fillStyle = colors[i%colors.length]; ctx.beginPath();
        ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,angle,angle+slice); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.stroke();
        angle += slice;
      });
    }
    ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(cx,cy,40,0,Math.PI*2); ctx.fill();
  };

  const getStats = () => {
    if (!dashStats) return [];
    return [
      { title: 'Total Revenue', value: formatPrice(dashStats.totalRevenue), change: `${dashStats.soldProperties} sold`, trend: dashStats.soldProperties > 0 ? 'up' : 'neutral', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
      { title: 'Properties Listed', value: String(dashStats.totalProperties), change: `${dashStats.availableProperties} available`, trend: 'up', icon: Building2, color: 'from-blue-500 to-cyan-500' },
      { title: 'Total Enquiries', value: String(dashStats.totalEnquiries), change: `+${dashStats.recentEnquiries} this week`, trend: dashStats.recentEnquiries > 0 ? 'up' : 'neutral', icon: Users, color: 'from-purple-500 to-pink-500' },
      { title: 'Avg. Price', value: formatPrice(dashStats.averagePrice), change: `${dashStats.rentedProperties} rented`, trend: 'up', icon: TrendingUp, color: 'from-orange-500 to-red-500' }
    ];
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center"><Loader2 className="h-16 w-16 text-purple-400 animate-spin mx-auto mb-4" /><p className="text-gray-400 text-lg">Loading analytics...</p></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-12 text-center max-w-md">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 text-lg mb-6">{error}</p>
        <button onClick={fetchAllAnalytics} className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 mx-auto">
          <RefreshCw className="h-5 w-5" /><span>Try Again</span>
        </button>
      </div>
    </div>
  );

  const stats = getStats();
  const byType = propAnalytics?.byType || [];
  const byStatus = enqAnalytics?.byStatus || [];
  const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'];
  const totalPropCount = byType.reduce((s,i) => s+i.count, 0) || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Real-time performance insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <button onClick={fetchAllAnalytics} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white p-3 rounded-xl transition-all">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 hover:border-white/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color}`}><stat.icon className="h-6 w-6 text-white" /></div>
                <div className={`flex items-center space-x-1 text-sm font-bold ${stat.trend === 'up' ? 'text-green-400' : 'text-gray-400'}`}>
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
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Enquiries & Properties Trend</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-gray-400">Enquiries</span></div>
                <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div><span className="text-gray-400">By Type</span></div>
              </div>
            </div>
            <canvas ref={chartRef} width="800" height="300" className="w-full"></canvas>
            {enqAnalytics?.monthly?.length === 0 && <p className="text-gray-500 text-sm text-center mt-4">Enquiries aavya pachhi chart show thashe.</p>}
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Property Types</h3>
            <canvas ref={pieChartRef} width="300" height="300" className="w-full mb-6"></canvas>
            <div className="space-y-3">
              {byType.length > 0 ? byType.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{background: colors[i%colors.length]}}></div>
                    <span className="text-gray-400 capitalize">{item.type?.charAt(0) + item.type?.slice(1).toLowerCase()}</span>
                  </div>
                  <span className="text-white font-bold">{Math.round((item.count/totalPropCount)*100)}%</span>
                </div>
              )) : <p className="text-gray-500 text-sm text-center">Haju koi properties nathi</p>}
            </div>
          </div>
        </div>

        {/* Enquiry Status + Purpose */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Enquiry Status</h3>
            {byStatus.length > 0 ? (
              <div className="space-y-4">
                {byStatus.map((item, i) => {
                  const statusColors = {PENDING:'bg-yellow-500',CONTACTED:'bg-blue-500',CLOSED:'bg-green-500',REJECTED:'bg-red-500'};
                  const total = byStatus.reduce((s,x) => s+x.count, 0) || 1;
                  const pct = Math.round((item.count/total)*100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 capitalize">{item.status}</span>
                        <span className="text-white font-bold">{item.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`${statusColors[item.status] || 'bg-purple-500'} h-2 rounded-full transition-all duration-500`} style={{width:`${pct}%`}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-gray-500 text-sm text-center py-8">Haju koi enquiries nathi</p>}
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Properties by Purpose</h3>
            {propAnalytics?.byPurpose?.length > 0 ? (
              <div className="space-y-4">
                {propAnalytics.byPurpose.map((item, i) => {
                  const total = propAnalytics.byPurpose.reduce((s,x) => s+x.count, 0) || 1;
                  const pct = Math.round((item.count/total)*100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">For {item.purpose === 'SALE' ? 'Sale' : 'Rent'}</span>
                        <span className="text-white font-bold">{item.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`${item.purpose === 'SALE' ? 'bg-blue-500' : 'bg-purple-500'} h-2 rounded-full transition-all duration-500`} style={{width:`${pct}%`}}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-gray-500 text-sm text-center py-4">Haju koi properties nathi</p>}
            {propAnalytics?.byCity?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-white font-bold mb-3">Top Cities</h4>
                <div className="space-y-2">
                  {propAnalytics.byCity.slice(0,4).map((item,i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{item.city}</span>
                      <span className="text-white font-bold text-sm">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overview Tiles */}
        {dashStats && (
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Property Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {label:'Available', value:dashStats.availableProperties, color:'text-green-400'},
                {label:'Sold', value:dashStats.soldProperties, color:'text-blue-400'},
                {label:'Rented', value:dashStats.rentedProperties, color:'text-purple-400'},
                {label:'This Week Enquiries', value:dashStats.recentEnquiries, color:'text-yellow-400'}
              ].map((item,i) => (
                <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-6 text-center">
                  <p className={`text-4xl font-bold mb-2 ${item.color}`}>{item.value}</p>
                  <p className="text-gray-400 text-sm">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;