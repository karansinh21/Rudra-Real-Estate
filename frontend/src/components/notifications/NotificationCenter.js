import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, MessageSquare, Building2, Scale, Eye, RefreshCw, Loader2 } from 'lucide-react';

const BASE  = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

// Map backend data → notification format
const enquiryToNotif = (e) => ({
  id:      `enq-${e.id}`,
  type:    'enquiry',
  title:   'New Enquiry Received',
  message: `${e.clientName || 'Someone'} enquired about "${e.property?.title || 'a property'}"`,
  time:    timeAgo(e.createdAt),
  read:    e.status !== 'PENDING',
  icon:    MessageSquare,
  color:   'text-blue-400',
  raw:     e,
});

const propertyToNotif = (p) => ({
  id:      `prop-${p.id}`,
  type:    'property',
  title:   'Property Listed',
  message: `"${p.title}" is ${p.status === 'AVAILABLE' ? 'live and visible' : p.status?.toLowerCase()}`,
  time:    timeAgo(p.createdAt),
  read:    true,
  icon:    Building2,
  color:   'text-green-400',
  raw:     p,
});

const legalToNotif = (r) => ({
  id:      `legal-${r.id}`,
  type:    'legal',
  title:   'Legal Request',
  message: `New ${r.serviceType || 'legal'} request from ${r.clientName || 'a client'}`,
  time:    timeAgo(r.createdAt),
  read:    r.status !== 'PENDING',
  icon:    Scale,
  color:   'text-purple-400',
  raw:     r,
});

function timeAgo(dateStr) {
  if (!dateStr) return 'recently';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)} hr ago`;
  return `${Math.floor(diff/86400)} day${Math.floor(diff/86400)>1?'s':''} ago`;
}

const NotificationCenter = () => {
  const [isOpen,         setIsOpen]         = useState(false);
  const [notifications,  setNotifications]  = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [lastFetched,    setLastFetched]    = useState(null);

  const fetchNotifications = useCallback(async () => {
    const tok = token();
    if (!tok) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${tok}` };
      const all = [];

      // 1. Enquiries (broker/admin)
      try {
        const r = await fetch(`${BASE}/enquiries/my-enquiries`, { headers });
        if (r.ok) {
          const d = await r.json();
          const list = d.enquiries || d.data || (Array.isArray(d) ? d : []);
          list.slice(0,10).forEach(e => all.push(enquiryToNotif(e)));
        }
      } catch {}

      // 2. My properties
      try {
        const r = await fetch(`${BASE}/properties/my/properties`, { headers });
        if (r.ok) {
          const d = await r.json();
          const list = d.properties || (Array.isArray(d) ? d : []);
          list.slice(0,5).forEach(p => all.push(propertyToNotif(p)));
        }
      } catch {}

      // 3. Legal requests (lawyer/admin)
      try {
        const r = await fetch(`${BASE}/legal/requests/my-requests`, { headers });
        if (r.ok) {
          const d = await r.json();
          const list = d.requests || d.data || (Array.isArray(d) ? d : []);
          list.slice(0,5).forEach(lr => all.push(legalToNotif(lr)));
        }
      } catch {}

      // Sort by raw createdAt desc
      all.sort((a,b) => new Date(b.raw?.createdAt||0) - new Date(a.raw?.createdAt||0));
      setNotifications(all);
      setLastFetched(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on open
  useEffect(() => { if (isOpen) fetchNotifications(); }, [isOpen, fetchNotifications]);

  // ✅ Auto-refresh every 60s when panel is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isOpen, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) =>
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllAsRead = () =>
    setNotifications(p => p.map(n => ({ ...n, read: true })));

  const deleteNotif = (id) =>
    setNotifications(p => p.filter(n => n.id !== id));

  return (
    <div className="relative">
      {/* Bell */}
      <button onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-16 w-96 max-h-[600px] bg-slate-900 rounded-3xl border border-white/20 shadow-2xl z-50 overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-white" />
                  <h3 className="text-white font-bold text-lg">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* ✅ Refresh button */}
                  <button onClick={fetchNotifications} disabled={loading}
                    className="text-white/80 hover:text-white p-1 rounded-full transition-all">
                    {loading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <RefreshCw className="h-4 w-4" />
                    }
                  </button>
                  <button onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 p-1 rounded-full transition-all">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead}
                  className="text-white/80 hover:text-white text-sm flex items-center space-x-1">
                  <Check className="h-4 w-4" /><span>Mark all as read</span>
                </button>
              )}
              {lastFetched && (
                <p className="text-white/40 text-xs mt-1">
                  Updated {timeAgo(lastFetched)}
                </p>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[500px]">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 text-blue-400 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-400 text-sm">Loading notifications…</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">No notifications yet</p>
                  <p className="text-gray-500 text-xs mt-1">Enquiries and updates will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map(n => (
                    <div key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 hover:bg-white/5 transition-all cursor-pointer ${!n.read ? 'bg-blue-500/5' : ''}`}>
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-white/10 ${n.color}`}>
                          <n.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-white font-semibold text-sm mb-1">{n.title}</h4>
                            <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                              className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0 ml-2">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{n.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">{n.time}</span>
                            {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-3 bg-white/5">
              <button onClick={fetchNotifications}
                className="w-full text-center text-blue-400 hover:text-blue-300 font-semibold text-sm py-2 flex items-center justify-center gap-2">
                <RefreshCw className="h-3 w-3" /> Refresh Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;