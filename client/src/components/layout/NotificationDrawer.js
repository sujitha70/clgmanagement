import React from 'react';
import { useRouter } from 'next/router';
import { useNotifications } from '../../context/NotificationContext';
import {
  X,
  Bell,
  CheckCheck,
  Clock,
  ArrowRight,
  ShieldAlert,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export const NotificationDrawer = () => {
  const { notifications, unreadCount, isDrawerOpen, setIsDrawerOpen, markAsRead, markAllRead } = useNotifications();
  const router = useRouter();

  if (!isDrawerOpen) return null;

  const handleTicketClick = (ticketId, notifId) => {
    markAsRead(notifId);
    setIsDrawerOpen(false);
    if (ticketId) {
      router.push(`/student/${ticketId}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ESCALATION':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'ASSIGNMENT':
        return <ArrowRight className="w-4 h-4 text-indigo-400" />;
      case 'COMMENT':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'FEEDBACK':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full pl-10 flex">
        <div className="w-full glass-card border-l border-white/10 flex flex-col shadow-2xl bg-slate-950/95">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Notification Center</h3>
                <p className="text-[11px] text-slate-400">{unreadCount} unread update(s)</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition px-2 py-1 rounded bg-blue-500/10"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark All Read
                </button>
              )}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-400">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No new alerts at the moment.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleTicketClick(notif.ticketId, notif.id)}
                  className={`pt-2.5 p-3 rounded-xl transition cursor-pointer flex items-start gap-3 ${
                    !notif.read
                      ? 'bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/15'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-900 border border-white/5 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                    {notif.ticketId && (
                      <span className="inline-block mt-1.5 text-[10px] font-mono text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/30">
                        {notif.ticketId}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
