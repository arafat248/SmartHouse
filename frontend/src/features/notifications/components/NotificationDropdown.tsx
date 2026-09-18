import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetNotificationsQuery, 
  useMarkAllAsReadMutation, 
  useMarkAsReadMutation 
} from '../notificationsApi';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: notifications = [] } = useGetNotificationsQuery();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const recentNotifications = notifications.slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (id: number) => {
    await markAsRead(id);
    // You could optionally navigate based on type here
    setIsOpen(false);
    navigate('/notifications');
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-100 transition-colors"
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentNotifications.map(notification => (
                  <div 
                    key={notification.id} 
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-indigo-50/50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm font-medium ${!notification.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-slate-500">No notifications.</p>
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="text-sm font-medium text-slate-900 hover:text-indigo-600 w-full"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
