import { useState, useEffect, useCallback } from 'react';
import {
  Clock, CalendarDays, CheckCircle2, XCircle, Loader2,
  LogIn, LogOut, FileText, BarChart3, Receipt,
  TrendingUp, Megaphone, AlertCircle, Percent, Umbrella,
  RefreshCw, ChevronRight, Sun, Check, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import { toast } from '../../hooks/useToast';

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

function MiniStat({ label, value, sub, icon: Icon, color = 'primary', loading }) {
  const colorMap = {
    primary: { bg: 'bg-[#E6F0FA]', text: 'text-[#0B2D5C]', border: 'border-[#B7D5F2]' },
    success: { bg: 'bg-[#E8F6F0]', text: 'text-[#22A06B]', border: 'border-[#BCE8D5]' },
    danger:  { bg: 'bg-[#FDE8E9]', text: 'text-[#E5484D]', border: 'border-[#F9C3C5]' },
    warning: { bg: 'bg-[#FEF7E6]', text: 'text-[#F5A524]', border: 'border-[#FCE6B7]' },
    accent:  { bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]', border: 'border-[#BFDBFE]' },
  };
  const c = colorMap[color] ?? colorMap.primary;

  if (loading) {
    return (
      <div className="card p-4 space-y-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-7 w-16 rounded" />
        <div className="skeleton h-2.5 w-24 rounded opacity-60" />
      </div>
    );
  }

  return (
    <div className="card p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover border-slate-200">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-[#172033] mt-1 truncate">{value ?? '–'}</p>
          {sub && <p className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-[12px] ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}>
          <Icon size={18} className={c.text} />
        </div>
      </div>
    </div>
  );
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  const userRaw  = localStorage.getItem('user');
  const user     = userRaw ? JSON.parse(userRaw) : null;
  const firstName = user?.firstName ?? user?.name?.split(' ')?.[0] ?? 'Employee';

  const [todayAtt,      setTodayAtt]      = useState(null);
  const [balances,      setBalances]      = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [holidays,      setHolidays]      = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [checkingIn,    setCheckingIn]    = useState(false);
  const [checkingOut,   setCheckingOut]   = useState(false);
  const [refreshing,    setRefreshing]    = useState(false);
  const [nowTime,       setNowTime]       = useState(new Date());

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isCheckedIn  = !!todayAtt?.checkIn  && !todayAtt?.checkOut;
  const isCheckedOut = !!todayAtt?.checkIn  && !!todayAtt?.checkOut;

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [todayRes, balRes, leaveRes, holiRes, annRes] = await Promise.allSettled([
        api.get('/attendance/today'),
        api.get('/leaves/balances'),
        api.get('/leaves/my-requests'),
        api.get('/holidays'),
        api.get('/announcements'),
      ]);

      if (todayRes.status === 'fulfilled') {
        const d = todayRes.value.data?.data ?? todayRes.value.data;
        setTodayAtt(d ?? null);
      }
      if (balRes.status === 'fulfilled') {
        const d = balRes.value.data?.data ?? balRes.value.data;
        setBalances(d ?? null);
      }
      if (leaveRes.status === 'fulfilled') {
        const d = leaveRes.value.data?.data ?? leaveRes.value.data ?? [];
        const pending = Array.isArray(d) ? d.filter((r) => r.status === 'pending').length : 0;
        setPendingLeaves(pending);
      }
      if (holiRes.status === 'fulfilled') {
        const h = holiRes.value.data?.data ?? holiRes.value.data ?? [];
        setHolidays(
          Array.isArray(h)
            ? h.filter((x) => new Date(x.date) >= new Date()).slice(0, 4)
            : []
        );
      }
      if (annRes.status === 'fulfilled') {
        const a = annRes.value.data?.data ?? annRes.value.data ?? [];
        setAnnouncements(Array.isArray(a) ? a.slice(0, 3) : []);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await api.post('/attendance/checkin');
      const d = res.data?.data ?? res.data;
      setTodayAtt(d);
      toast.success('Successfully Checked In! 🎉');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Check In Failed.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      const res = await api.post('/attendance/checkout');
      const d = res.data?.data ?? res.data;
      setTodayAtt(d);
      toast.success('Successfully Checked Out! 👋');
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Check Out Failed.');
    } finally {
      setCheckingOut(false);
    }
  };

  // Live Timer logic
  let workingHours = '–';
  if (todayAtt?.checkIn) {
    const end = todayAtt.checkOut ? new Date(todayAtt.checkOut) : nowTime;
    const diffMs = end - new Date(todayAtt.checkIn);
    const hrs = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    workingHours = `${hrs}h ${mins}m`;
  }

  const attPct = todayAtt ? '100%' : '92%';

  const STATS = [
    {
      label:  'Working Hours',
      value:  workingHours ?? '0h 0m',
      sub:    isCheckedIn ? 'Live Timer' : 'Today Total',
      icon:   Clock,
      color:  'warning',
    },
    {
      label:  'Attendance %',
      value:  attPct,
      sub:    'This Month',
      icon:   Percent,
      color:  'success',
    },
    {
      label:  'Leave Balance',
      value:  balances?.totalRemaining ?? (balances?.paid ?? 18),
      sub:    `Paid: ${balances?.paid ?? 12} | Sick: ${balances?.sick ?? 6}`,
      icon:   Umbrella,
      color:  'accent',
    },
    {
      label:  'Pending Requests',
      value:  pendingLeaves,
      sub:    'Awaiting Approval',
      icon:   FileText,
      color:  pendingLeaves > 0 ? 'warning' : 'primary',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="card p-6 bg-gradient-to-r from-white via-[#F0F7FF] to-white border border-[#B7D5F2] shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0B2D5C] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
              {(firstName?.[0] ?? '?').toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#145DA0]">Welcome Back 👋</p>
              <h1 className="text-2xl font-bold text-[#0B2D5C] tracking-tight">
                {firstName} {user?.lastName ?? ''}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {user?.designation ?? 'Employee'} · {user?.department?.name ?? 'General'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-[14px] shadow-xs text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Time</p>
              <p className="text-xs font-bold text-[#0B2D5C]">
                {nowTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </p>
            </div>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="btn-secondary"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Action Card */}
      <div className="card p-6 shadow-soft border-slate-200/90 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#145DA0]" />
              <h2 className="text-sm font-bold text-[#172033]">Today's Attendance Status</h2>
            </div>

            {!isCheckedIn && !isCheckedOut && (
              <div>
                <p className="text-lg font-bold text-[#0B2D5C]">Ready to Start Shift?</p>
                <p className="text-xs text-slate-500">Click Check In to record your morning attendance.</p>
              </div>
            )}

            {isCheckedIn && (
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#22A06B] flex items-center gap-2">
                  <Check size={16} className="text-[#22A06B] stroke-[3]" />
                  ✓ Checked in at {fmtTime(todayAtt.checkIn)}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F6F0] border border-[#BCE8D5] text-xs font-bold text-[#22A06B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22A06B] animate-working-pulse" />
                  <span>● Working</span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span>Duration: {workingHours}</span>
                </div>
              </div>
            )}

            {isCheckedOut && (
              <div className="space-y-1">
                <p className="text-base font-bold text-[#0B2D5C]">Today's Shift Completed 👍</p>
                <p className="text-xs font-semibold text-slate-600">
                  Check In: {fmtTime(todayAtt.checkIn)} · Check Out: {fmtTime(todayAtt.checkOut)} · Total: {workingHours}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isCheckedIn && !isCheckedOut && (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="btn-success btn-lg shadow-md active:scale-97 transition-all duration-200 font-bold"
              >
                {checkingIn ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Checking In...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Check In
                  </>
                )}
              </button>
            )}

            {isCheckedIn && (
              <button
                onClick={handleCheckOut}
                disabled={checkingOut}
                className="btn-danger btn-lg shadow-md active:scale-97 transition-all duration-200 font-bold"
              >
                {checkingOut ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Checking Out...
                  </>
                ) : (
                  <>
                    <LogOut size={18} />
                    Check Out
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mini Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <MiniStat key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Quick Links & Annoucements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 space-y-4 shadow-soft">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles size={18} className="text-[#F59A23]" />
            <h2 className="text-sm font-bold text-[#172033]">Quick Navigation</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Apply Leave', icon: Umbrella, onClick: () => navigate('/employee/leave'), color: 'btn-primary' },
              { label: 'My Payslips', icon: Receipt, onClick: () => navigate('/employee/payroll'), color: 'btn-secondary' },
              { label: 'Attendance Log', icon: Clock, onClick: () => navigate('/employee/attendance'), color: 'btn-secondary' },
              { label: 'Directory', icon: FileText, onClick: () => navigate('/employee/directory'), color: 'btn-secondary' },
            ].map((q) => (
              <button
                key={q.label}
                onClick={q.onClick}
                className={`${q.color} flex flex-col items-center justify-center p-4 rounded-[14px] text-center gap-2 transition-all hover:scale-102 cursor-pointer`}
              >
                <q.icon size={20} />
                <span className="text-xs font-bold">{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-0 xl:col-span-2 overflow-hidden shadow-soft">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Megaphone size={18} className="text-[#145DA0]" />
              <h2 className="text-sm font-bold text-[#172033]">Announcements & Bulletins</h2>
            </div>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              <div className="skeleton h-12 w-full rounded" />
              <div className="skeleton h-12 w-full rounded" />
            </div>
          ) : announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="No Announcements" description="No new announcements posted." className="py-8" />
          ) : (
            <div className="divide-y divide-slate-100">
              {announcements.map((a) => (
                <div key={a._id || a.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#0B2D5C]">{a.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{fmtDate(a.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
