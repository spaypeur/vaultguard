import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  BellIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'security' | 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'threat' | 'transaction' | 'system' | 'compliance' | 'portfolio';
  metadata?: {
    walletAddress?: string;
    amount?: string;
    threatType?: string;
    actionRequired?: boolean;
  };
}

interface NotificationSystemProps {
  className?: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [preferences, setPreferences] = useState({
    securityAlerts: true,
    transactionAlerts: true,
    systemUpdates: false,
    portfolioUpdates: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
  });

  // Mock notifications data
  const initialNotifications: Notification[] = [
    {
      id: '1',
      type: 'security',
      title: 'Suspicious Transaction Blocked',
      message: 'Large outbound transaction to mixer address automatically blocked for security.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false,
      priority: 'high',
      category: 'threat',
      metadata: {
        walletAddress: '0x742d35Cc6634C0532925a3b8D8C5c5c8F8E3C4f',
        amount: '$12,450',
        threatType: 'mixer-detected',
        actionRequired: true,
      },
    },
    {
      id: '2',
      type: 'success',
      title: 'Portfolio Rebalanced',
      message: 'Your portfolio has been automatically rebalanced based on risk assessment.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: true,
      priority: 'low',
      category: 'portfolio',
      metadata: {
        amount: '$2,340',
      },
    },
    {
      id: '3',
      type: 'warning',
      title: 'Dark Web Exposure Detected',
      message: 'One of your wallet addresses was found on a dark web forum.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: false,
      priority: 'medium',
      category: 'threat',
      metadata: {
        walletAddress: '0x8f3d2c1e6b7a4c9d5e8f2a1c3b5d7e9f',
        threatType: 'dark-web-exposure',
        actionRequired: true,
      },
    },
    {
      id: '4',
      type: 'info',
      title: 'KYC Verification Complete',
      message: 'Your enhanced KYC verification has been successfully completed.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      read: true,
      priority: 'low',
      category: 'compliance',
    },
    {
      id: '5',
      type: 'security',
      title: 'New Device Login Detected',
      message: 'A new device has accessed your account from New York, US.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
      read: true,
      priority: 'medium',
      category: 'system',
      metadata: {
        actionRequired: false,
      },
    },
  ];

  useEffect(() => {
    setNotifications(initialNotifications);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        generateRandomNotification();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const generateRandomNotification = () => {
    const notificationTypes = [
      {
        type: 'security' as const,
        title: 'Security Alert',
        message: 'Unusual activity detected in your portfolio.',
        priority: 'high' as const,
        category: 'threat' as const,
      },
      {
        type: 'success' as const,
        title: 'Transaction Complete',
        message: 'Your recent transaction has been confirmed.',
        priority: 'low' as const,
        category: 'transaction' as const,
      },
      {
        type: 'info' as const,
        title: 'Portfolio Update',
        message: 'Your portfolio value has increased by 2.5%.',
        priority: 'low' as const,
        category: 'portfolio' as const,
      },
    ];

    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

    const newNotification: Notification = {
      id: Date.now().toString(),
      ...randomType,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    if (preferences.securityAlerts && randomType.type === 'security') {
      showToastNotification(newNotification);
    }
  };

  const showToastNotification = (notification: Notification) => {
    const icon = getNotificationIcon(notification.type);
    const color = getNotificationColor(notification.type);

    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.3 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
          className={`${color} max-w-md w-full bg-gray-800 border border-gray-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {icon}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-600">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      ),
      {
        duration: 6000,
        position: 'top-right',
      }
    );
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'security': return <ShieldCheckIcon className="w-5 h-5 text-red-400" />;
      case 'success': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'error': return <XMarkIcon className="w-5 h-5 text-red-400" />;
      default: return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'security': return 'border-red-500';
      case 'success': return 'border-green-500';
      case 'warning': return 'border-yellow-500';
      case 'error': return 'border-red-500';
      default: return 'border-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-900/30 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-900/30 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-900/30 text-green-400 border-green-500/50';
      default: return 'bg-gray-900/30 text-gray-400 border-gray-500/50';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || notif.type === filterType;
    const matchesPriority = filterPriority === 'all' || notif.priority === filterPriority;

    return matchesSearch && matchesType && matchesPriority;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'transparent',
            border: 'none',
            padding: 0,
            boxShadow: 'none',
          },
        }}
      />

      {/* Notification Bell */}
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowNotificationCenter(!showNotificationCenter)}
          className="relative p-2 text-gray-400 hover:text-white transition-colors"
        >
          <BellIcon className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Center Panel */}
        <AnimatePresence>
          {showNotificationCenter && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowNotificationCenter(false)}
              />

              {/* Notification Panel */}
              <motion.div
                initial={{ opacity: 0, x: 300, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 300, scale: 0.95 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute right-0 top-full mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotificationCenter(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="mt-3 space-y-2">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="all">All Types</option>
                        <option value="security">Security</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                      </select>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="all">All Priority</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No notifications found</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-900/10' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-white truncate">
                                {notification.title}
                              </p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <ClockIcon className="w-3 h-3" />
                                {new Date(notification.timestamp).toLocaleDateString()}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-700 bg-gray-900/50">
                  <button className="w-full text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2 justify-center">
                    <CogIcon className="w-4 h-4" />
                    Notification Preferences
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default NotificationSystem;