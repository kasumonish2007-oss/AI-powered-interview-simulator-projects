import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import {
  Bell,
  CheckCheck,
  Sparkles,
  Layers,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface NotificationsPageProps {
  setActiveTab: (tab: string) => void;
  onSelectItem?: (id: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  setActiveTab,
  onSelectItem,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500">
            Real-time updates regarding your lost items, AI matches, and mock interview reports
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading alerts...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">All caught up!</h3>
          <p className="text-xs text-slate-400">No unread notifications at this time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                handleMarkRead(n.id);
                if (n.relatedItemId && onSelectItem) {
                  onSelectItem(n.relatedItemId);
                  setActiveTab('item-detail');
                } else if (n.type === 'system') {
                  setActiveTab('dashboard');
                }
              }}
              className={`p-5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                !n.read ? 'bg-emerald-50/40' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    n.type === 'match'
                      ? 'bg-emerald-100 text-emerald-700'
                      : n.type === 'return'
                      ? 'bg-blue-100 text-blue-700'
                      : n.type === 'verification'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {n.type === 'match' && <Sparkles className="w-5 h-5" />}
                  {n.type === 'return' && <CheckCircle2 className="w-5 h-5" />}
                  {n.type === 'verification' && <ShieldCheck className="w-5 h-5" />}
                  {n.type === 'system' && <Bot className="w-5 h-5" />}
                  {n.type === 'message' && <Bell className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(n.id);
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
