import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, Clock, X, AlertCircle, Info, Megaphone } from 'lucide-react';
import api from '../services/api';

const POLL_INTERVAL_MS = 30_000;

const TYPE_CONFIG = {
  leave:        { icon: Clock,       color: 'text-accent-400',   bg: 'bg-accent-500/10'    },
  attendance:   { icon: Check,       color: 'text-success-500',  bg: 'bg-success-500/10'   },
  announcement: { icon: Megaphone,   color: 'text-warning-500',  bg: 'bg-warning-500/10'   },
  alert:        { icon: AlertCircle, color: 'text-danger-500',   bg: 'bg-danger-500/10'    },
  info:         { icon: Info,        color: 'text-primary-400',  bg: 'bg-primary-600/10'   },
};

function typeConfig(type) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.info;
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * NotificationBell — Topnav notification bell with live polling, unread badge,
 * mark-as-read and mark-all-read functionality.
 */
function NotificationBell() {
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifs]    = useState([]);
  const [loading, setLoading]         = useState(true);
  const [markingAll, setMarkingAll]   = useState(false);
  const panelRef                      = useRef(null);
  const btnRef                        = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ── Fetch ── */
  const fetchNotifs = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      const list = data?.data ?? data ?? [];
      setNotifs(Array.isArray(list) ? list.slice(0, 8) : []);
    } catch {
      // silent fail; don't spam errors in topnav
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Polling ── */
  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchNotifs]);

  /* ── Close on outside click ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* ── Mark single as read ── */
  const markRead = async (id) => {
    setNotifs((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      // optimistic — don't revert
    }
  };

  /* ── Mark all as read ── */
  const markAllRead = async () => {
    if (markingAll || unreadCount === 0) return;
    setMarkingAll(true);
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.patch('/notifications/read-all');
    } catch {
      // optimistic
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="btn-icon relative"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-glow-primary animate-pulse-glow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-80 glass shadow-card-hover border border-white/[0.08] z-50 overflow-hidden animate-slide-up"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-primary-400" />
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="badge-primary text-[10px]">{unreadCount} new</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={markingAll}
                  className="btn-ghost btn-sm text-[11px] py-1 px-2"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="btn-icon p-1">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-3/4 rounded" />
                      <div className="skeleton h-2.5 w-full rounded opacity-60" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 px-4 text-center">
                <Bell size={28} className="text-gray-600 mb-2" strokeWidth={1.5} />
                <p className="text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const cfg = typeConfig(notif.type);
                const TypeIcon = cfg.icon;
                return (
                  <button
                    key={notif._id}
                    onClick={() => markRead(notif._id)}
                    className={`w-full text-left flex gap-3 px-4 py-3.5 border-b border-white/[0.04] last:border-0 transition-colors duration-150 hover:bg-white/[0.04] ${
                      !notif.isRead ? 'bg-primary-600/[0.06]' : ''
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}
                    >
                      <TypeIcon size={16} className={cfg.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-100 leading-snug line-clamp-2">
                        {notif.message ?? notif.title}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{timeAgo(notif.createdAt)}</p>
                    </div>

                    {/* Unread dot */}
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary-400 shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.06] bg-dark-900/40">
            <a
              href="/notifications"
              className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
              onClick={() => setOpen(false)}
            >
              View all notifications →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
