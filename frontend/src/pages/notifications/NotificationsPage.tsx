import { useState } from 'react';
import { 
  useGetNotificationsQuery, 
  useMarkAllAsReadMutation, 
  useMarkAsReadMutation 
} from '../../features/notifications/notificationsApi';
import { 
  Bell, 
  Mail, 
  CreditCard, 
  PiggyBank, 
  Calculator, 
  Wallet,
  Info,
  CheckCircle2
} from 'lucide-react';

export function NotificationsPage() {
  const { data: notifications = [], isLoading, isError, refetch } = useGetNotificationsQuery();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [markAsRead] = useMarkAsReadMutation();
  
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredNotifications = filter === 'UNREAD' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'INVITATION': return <Mail className="h-5 w-5 text-blue-500" />;
      case 'EXPENSE': return <CreditCard className="h-5 w-5 text-rose-500" />;
      case 'DEPOSIT': return <PiggyBank className="h-5 w-5 text-emerald-500" />;
      case 'SETTLEMENT': return <Calculator className="h-5 w-5 text-purple-500" />;
      case 'BALANCE': return <Wallet className="h-5 w-5 text-amber-500" />;
      default: return <Info className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-indigo-600" />
            Notifications
          </h1>
          <p className="text-slate-500 mt-1">Stay updated with your household activities.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'ALL' | 'UNREAD')}
            className="border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
          >
            <option value="ALL">All Notifications</option>
            <option value="UNREAD">Unread Only</option>
          </select>
          <button
            onClick={() => markAllAsRead()}
            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-500" />
            Mark all read
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="h-64 bg-slate-50 rounded-xl border border-slate-100 animate-pulse flex items-center justify-center">
          Loading notifications...
        </div>
      )}

      {isError && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex justify-between items-center">
          <span>Failed to load notifications.</span>
          <button onClick={() => refetch()} className="text-rose-700 font-medium hover:underline">Retry</button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-6 transition-colors flex gap-4 ${!notification.is_read ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      {getIconForType(notification.notification_type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-sm font-semibold ${!notification.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-xs text-slate-400 whitespace-nowrap ml-4">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {notification.message}
                    </p>
                    
                    {!notification.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-3 flex items-center"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">You're all caught up!</h3>
              <p className="text-slate-500">No {filter === 'UNREAD' ? 'unread ' : ''}notifications to display.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
