import { useState, useEffect, useCallback } from 'react';
import {
  Clock, CalendarDays, CheckCircle2, XCircle, Loader2,
  LogIn, LogOut, FileText, BarChart3, Receipt,
  TrendingUp, Megaphone, AlertCircle, Percent, Umbrella,
  RefreshCw, ChevronRight, Sun,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import { toast } from '../../hooks/useToast';

/* ── Helpers ── */
function fmtTime(d) {
  if (!d) return '–';
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function fmtDate(d) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(d) {
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
}

/* ── Mini Stat Card ── */
function MiniStat({ label, value, sub, icon: Icon, color = 'primary', loading }) {
  const colorMap = {
    primary: { bg: 'bg-primary-600/10', text: 'text-primary-400', border: 'border-primary-500/20' },
    success: { bg: 'bg-success-500/10', text: 'text-success-500', border: 'border-success-500/20' },
    danger:  { bg: 'bg-danger-500/10',  text: 'text-danger-500',  border: 'border-danger-500/20'  },
    warning: { bg: 'bg-warning-500/10', text: 'text-warning-500', border: 'border-warning-500/20' },
    accent:  { bg: 'bg-accent-500/10',  text: 'text-accent-400',  border: 'border-accent-500/20'  },
  };
  const c = colorMap[color] ?? colorMap.primary;

  if (loading) {
    return (
      <div className="stat-card space-y-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-8 w-16 rounded" />
        <div className="skeleton h-2.5 w-28 rounded opacity-60" />
      </div>
    );
  }

  return (
    <div className={`stat-card border ${c.border}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-display font-bold text-white mt-1.5 truncate">{value ?? '–'}</p>
          {sub && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={c.text} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/* Employee Dashboard                                                  */
/* ─────────────────────────────────────────────────────────────────── */
function EmployeeDashboard() {
  const navigate = useNavigate();

  /* ── Auth ── */
  const userRaw  = localStorage.getItem('user');
  const user     = userRaw ? JSON.parse(userRaw) : null;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  /* ── State ── */
  const [todayAtt,      setTodayAtt]      = useState(null);
  const [balances,      setBalances]      = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [holidays,      setHolidays]      = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [checkingIn,    setCheckingIn]    = useState(false);
  const [checkingOut,   setCheckingOut]   = useState(false);
  const [refreshing,    setRefreshing]    = useState(false);

  /* ── Derived attendance states ── */
  const isCheckedIn  = !!todayAtt?.checkIn  && !todayAtt?.checkOut;
  const isCheckedOut = !!todayAtt?.checkIn  && !!todayAtt?.checkOut;

  /* ── Load all data ── */
  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    const [attRes, balRes, leavesRes, holidayRes, announcRes] = await Promise.allSettled([
      api.get('/attendance/today'),
      api.get('/leaves/balances'),
      api.get('/leaves?status=pending'),
      api.get('/holidays'),
      api.get('/announcements'),
    ]);

    if (attRes.status === 'fulfilled') {
      setTodayAtt(attRes.value.data?.data ?? attRes.value.data ?? null);
    }
    if (balRes.status === 'fulfilled') {
      setBalances(balRes.value.data?.data ?? balRes.value.data ?? null);
    }
    if (leavesRes.status === 'fulfilled') {
      const list = leavesRes.value.data?.data ?? leavesRes.value.data ?? [];
      setPendingLeaves(Array.isArray(list) ? list.length : list.total ?? 0);
    }
    if (holidayRes.status === 'fulfilled') {
      const h = holidayRes.value.data?.data ?? holidayRes.value.data ?? [];
      setHolidays(
        Array.isArray(h)
          ? h.filter((x) => new Date(x.date) >= new Date()).slice(0, 4)
          : []
      );
    }
    if (announcRes.status === 'fulfilled') {
      const a = announcRes.value.data?.data ?? announcRes.value.data ?? [];
      setAnnouncements(
        Array.isArray(a)
          ? a.filter((x) => x.isActive !== false).slice(0, 4)
          : []
      );
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Check In ── */
  const handleCheckIn = async () => {
    if (checkingIn || isCheckedIn || isCheckedOut) return;
    setCheckingIn(true);
    try {
      const { data } = await api.post('/attendance/checkin');
      setTodayAtt(data?.data ?? data);
      toast.success('Checked in successfully! 🎉');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  /* ── Check Out ── */
  const handleCheckOut = async () => {
    if (checkingOut || !isCheckedIn) return;
    setCheckingOut(true);
    try {
      const { data } = await api.post('/attendance/checkout');
      setTodayAtt(data?.data ?? data);
      toast.success('Checked out. Great work today! 👋');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  /* ── Working hours ── */
  const workingHours = (() => {
    if (!todayAtt?.checkIn) return null;
    const end = todayAtt.checkOut ? new Date(todayAtt.checkOut) : new Date();
    const mins = Math.floor((end - new Date(todayAtt.checkIn)) / 60000);
    if (mins < 0) return '0h 0m';
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  })();

  /* ── Attendance % ── */
  const attPct = todayAtt?.attendancePercentage
    ? `${Math.round(todayAtt.attendancePercentage)}%`
    : null;

  /* ── Stats array ── */
  const STATS = [
    {
      label:  'Check In',
      value:  fmtTime(todayAtt?.checkIn),
      sub:    isCheckedIn ? 'Currently working' : isCheckedOut ? 'Done for today' : 'Not checked in',
      icon:   LogIn,
      color:  isCheckedIn ? 'success' : 'accent',
    },
    {
      label:  'Check Out',
      value:  fmtTime(todayAtt?.checkOut),
      sub:    isCheckedOut ? 'Session ended' : isCheckedIn ? 'In progress' : '–',
      icon:   LogOut,
      color:  isCheckedOut ? 'primary' : 'accent',
    },
    {
      label:  'Working Hours',
      value:  workingHours ?? '–',
      sub:    isCheckedIn ? 'Live timer' : 'Today',
      icon:   Clock,
      color:  'warning',
    },
    {
      label:  'Attendance',
      value:  attPct ?? (todayAtt ? '–' : '–'),
      sub:    'This month',
      icon:   Percent,
      color:  'success',
    },
    {
      label:  'Leave Balance',
      value:  balances?.totalRemaining ?? (balances?.paid ?? '–'),
      sub:    `Paid: ${balances?.paid ?? 0}  Sick: ${balances?.sick ?? 0}  Casual: ${balances?.casual ?? 0}`,
      icon:   Umbrella,
      color:  'accent',
    },
    {
      label:  'Pending Leaves',
      value:  pendingLeaves,
      sub:    'Awaiting approval',
      icon:   FileText,
      color:  pendingLeaves > 0 ? 'warning' : 'primary',
    },
  ];

  /* ── Quick Actions ── */
  const ACTIONS = [
    {
      label:    'Check In',
      icon:     LogIn,
      color:    'btn-success',
      disabled: isCheckedIn || isCheckedOut,
      loading:  checkingIn,
      onClick:  handleCheckIn,
    },
    {
      label:    'Check Out',
      icon:     LogOut,
      color:    'btn-danger',
      disabled: !isCheckedIn,
      loading:  checkingOut,
      onClick:  handleCheckOut,
    },
    {
      label:    'Apply Leave',
      icon:     CalendarDays,
      color:    'btn-primary',
      disabled: false,
      loading:  false,
      onClick:  () => navigate('/employee/leaves/apply'),
    },
    {
      label:    'Attendance',
      icon:     BarChart3,
      color:    'btn-secondary',
      disabled: false,
      loading:  false,
      onClick:  () => navigate('/employee/attendance'),
    },
    {
      label:    'Payslip',
      icon:     Receipt,
      color:    'btn-secondary',
      disabled: false,
      loading:  false,
      onClick:  () => navigate('/employee/payslips'),
    },
  ];

  const firstName = user?.firstName ?? user?.name?.split(' ')?.[0] ?? 'there';

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* ── Header ── */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <div className="avatar avatar-lg avatar-gradient shrink-0">
            {(firstName?.[0] ?? '?').toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{greeting} 👋</p>
            <h1 className="text-2xl font-display font-bold text-white">
              {firstName}{' '}
              <span className="text-gradient">{user?.lastName ?? ''}</span>
            </h1>
            <p className="page-subtitle">{user?.designation ?? user?.role ?? 'Employee'} · {user?.department?.name ?? user?.department ?? ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-400 hidden md:block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="btn-secondary"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <SkeletonCard count={6} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {STATS.map((s) => (
            <MiniStat key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* ── Quick Action Buttons ── */}
      <div className="glass p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-primary-400" />
          <h2 className="text-base font-semibold text-white">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {ACTIONS.map(({ label, icon: Icon, color, disabled, loading: ld, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              disabled={disabled || ld}
              className={`${color} ${disabled ? 'opacity-50' : ''}`}
            >
              {ld ? <Loader2 size={15} className="animate-spin" /> : <Icon size={15} />}
              {label}
            </button>
          ))}
        </div>

        {/* Today's status indicator */}
        {!loading && (
          <div className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${
            isCheckedOut
              ? 'bg-success-500/10 border border-success-500/20 text-success-500'
              : isCheckedIn
              ? 'bg-accent-500/10 border border-accent-500/20 text-accent-400'
              : 'bg-warning-500/10 border border-warning-500/20 text-warning-500'
          }`}>
            {isCheckedOut ? (
              <><CheckCircle2 size={16} /> Today's session complete — {workingHours} worked</>
            ) : isCheckedIn ? (
              <><Clock size={16} className="animate-pulse" /> Currently clocked in — {workingHours} elapsed</>
            ) : (
              <><XCircle size={16} /> You haven't checked in today yet</>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming Holidays */}
        <div className="glass overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Sun size={16} className="text-warning-500" />
              <h2 className="text-base font-semibold text-white">Upcoming Holidays</h2>
            </div>
            <button
              onClick={() => navigate('/employee/holidays')}
              className="btn-ghost btn-sm"
            >
              All <ChevronRight size={13} />
            </button>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-2.5 w-1/2 rounded opacity-60" />
                  </div>
                </div>
              ))}
            </div>
          ) : holidays.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No upcoming holidays" description="No holidays scheduled in the near future." className="py-10" />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {holidays.map((h) => (
                <div key={h._id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-warning-500 font-bold text-sm leading-none">
                      {new Date(h.date).getDate()}
                    </span>
                    <span className="text-warning-500/70 text-[9px] uppercase tracking-wide">
                      {new Date(h.date).toLocaleString('en-IN', { month: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{h.name}</p>
                    <p className="text-[11px] text-gray-500">{h.type ?? 'Public Holiday'}</p>
                  </div>
                  <span className="badge-warning shrink-0">{daysUntil(h.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements */}
        <div className="glass overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-accent-400" />
              <h2 className="text-base font-semibold text-white">Announcements</h2>
            </div>
            <button
              onClick={() => navigate('/employee/announcements')}
              className="btn-ghost btn-sm"
            >
              All <ChevronRight size={13} />
            </button>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 p-3 rounded-xl bg-white/[0.02]">
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-2.5 w-full rounded opacity-60" />
                  <div className="skeleton h-2.5 w-2/3 rounded opacity-40" />
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements" description="Nothing new to announce right now." className="py-10" />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {announcements.map((a) => (
                <div key={a._id} className="px-5 py-4">
                  <div className="flex items-start gap-2 mb-1">
                    <span
                      className={
                        a.priority === 'high'
                          ? 'badge-danger'
                          : a.priority === 'medium'
                          ? 'badge-warning'
                          : 'badge-info'
                      }
                    >
                      {a.priority ?? 'info'}
                    </span>
                    {a.isNew && <span className="badge-primary">New</span>}
                  </div>
                  <p className="text-sm font-semibold text-gray-100 mb-0.5 line-clamp-1">
                    {a.title}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {a.content ?? a.message ?? a.description}
                  </p>
                  <p className="text-[11px] text-gray-600 mt-1.5">
                    {fmtDate(a.createdAt)}
                    {a.author && ` · ${a.author}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
