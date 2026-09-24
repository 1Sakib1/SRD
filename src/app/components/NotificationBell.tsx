import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification, getUnreadNotificationCount } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);
  
  useEffect(() => {
    // Poll for new notifications every 5 seconds
    const interval = setInterval(() => {
      if (user) {
        loadNotifications();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  const loadNotifications = () => {
    if (!user) return;
    
    const userNotifications = getUserNotifications(user.id);
    setNotifications(userNotifications);
    setUnreadCount(getUnreadNotificationCount(user.id));
  };
  
  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    loadNotifications();
  };
  
  const handleMarkAllAsRead = () => {
    if (user) {
      markAllNotificationsAsRead(user.id);
      loadNotifications();
    }
  };
  
  if (!user || user.role === 'admin') {
    return null;
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-[#00B150] transition-colors active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notifications Panel */}
          <div className="fixed lg:absolute inset-x-4 top-20 lg:inset-x-auto lg:right-0 lg:top-full lg:mt-2 w-auto lg:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[calc(100vh-6rem)] lg:max-h-[500px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-[#333333]">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[#00B150] hover:text-green-700 font-medium min-h-[44px] px-3"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#333333] text-sm mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 break-words">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-[#00B150] hover:text-green-700 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};