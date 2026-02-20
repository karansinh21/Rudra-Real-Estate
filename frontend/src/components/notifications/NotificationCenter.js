import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, MessageSquare, Building2, Scale, DollarSign, Eye } from 'lucide-react';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'enquiry',
      title: 'New Enquiry Received',
      message: 'Amit Kumar enquired about your 3BHK property in Alkapuri',
      time: '2 min ago',
      read: false,
      icon: MessageSquare,
      color: 'text-blue-400'
    },
    {
      id: 2,
      type: 'property',
      title: 'Property Approved',
      message: 'Your luxury villa listing has been approved and is now live',
      time: '1 hour ago',
      read: false,
      icon: Building2,
      color: 'text-green-400'
    },
    {
      id: 3,
      type: 'legal',
      title: 'Legal Document Ready',
      message: 'Rent agreement for client Priya Shah is ready for review',
      time: '3 hours ago',
      read: false,
      icon: Scale,
      color: 'text-purple-400'
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment Received',
      message: 'Commission of ₹25,000 has been credited to your account',
      time: '5 hours ago',
      read: true,
      icon: DollarSign,
      color: 'text-yellow-400'
    },
    {
      id: 5,
      type: 'view',
      title: 'Property Views Update',
      message: 'Your property has received 45 views in the last 24 hours',
      time: '1 day ago',
      read: true,
      icon: Eye,
      color: 'text-cyan-400'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
      >
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount}
          </div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Panel */}
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
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-white/80 hover:text-white text-sm flex items-center space-x-1"
                >
                  <Check className="h-4 w-4" />
                  <span>Mark all as read</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[500px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-white/5 transition-all cursor-pointer ${
                        !notification.read ? 'bg-blue-500/5' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-white/10 ${notification.color}`}>
                          <notification.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="text-white font-semibold text-sm mb-1">
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">{notification.time}</span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-3 bg-white/5">
              <button className="w-full text-center text-blue-400 hover:text-blue-300 font-semibold text-sm py-2">
                View All Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;