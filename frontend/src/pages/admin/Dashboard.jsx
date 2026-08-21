import { useState, useEffect } from 'react';
import {
  Users, UserCheck, UserX, Plane, Clock, AlertCircle,
  TrendingUp, Plus, RefreshCw, ChevronRight, CalendarDays,
  Zap, BarChart3, PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { SkeletonCard, SkeletonTable } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';

/* ── Design tokens for recharts ── */
const CHART_COLORS = ['#5840f0', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'];
const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#16162e',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    color: '#e2e8f0',
    fontSize: 12,
  },
  cursor: { fill: 'rgba(88,64,240,0.06)' },
};

/* ── Stat Card ── */
function StatCard({ label, value, icon: Icon, trend, color = 'primary', loading }) {
  const colorMap = {
    primary: { bg: 'bg-primary-600/10', text: 'text-primary-400', border: 'border-primary-500/20' },
    success: { bg: 'bg-success-500/10', text: 'text-success-500', border: 'border-success-500/20' },
    danger:  { bg: 'bg-danger-500/10',  text: 'text-danger-500',  border: 'border-danger-500/20'  },
    warning: { bg: 'bg-warning-500/10', text: 'text-warning-500', border: 'border-warning-500/20' },
    accent:  { bg: 'bg-accent-500/10',  text: 'text-accent-400',  border: 'border-accent-500/20'  },
    gray:    { bg: 'bg-white/5',         text: 'text-gray-400',    border: 'border-white/10'        },
  };
  const c = colorMap[color] ?? colorMap.primary;

  if (loading) {
    return (
      <div className="stat-card space-y-3">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-8 w-16 rounded" />
        <div className="skeleton h-2.5 w-32 rounded opacity-60" />
      </div>
    );
  }

  return (
    <div className={`stat-card border ${c.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-display font-bold text-white mt-1.5">{value ?? '–'}</p>
          {trend !== undefined && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp size={11} />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
          <Icon size={20} className={c.text} />
        </div>
      </div>
    </div>
  );
}

/* ── Custom Tooltip for BarChart ── */
function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE.contentStyle} className="px-3 py-2 shadow-card">
      <p className="font-semibold mb-1 text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* ── Custom Tooltip for PieChart ── */
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={TOOLTIP_STYLE.contentStyle} className="px-3 py-2 shadow-card">
      <p className="font-semibold text-white">{item.name}</p>
      <p className="text-xs text-gray-400">{item.value} employees</p>
    </div>
  );
}

/* ── Format date ── */
function fmtDate(d) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─────────────────────────────────────────────────────────────────── */
/* Admin Dashboard                                                     */
/* ─────────────────────────────────────────────────────────────────── */
function AdminDashboard() {
  const navigate = useNavigate();

  const [stats,      setStats]      = useState(null);
  const [trend,      setTrend]      = useState([]);
  const [deptData,   setDeptData]   = useState([]);
  const [recentEmps, setRecentEmps] = useState([]);
  const [holidays,   setHolidays]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [dashRes, trendRes, holidayRes] = await Promise.allSettled([
        api.get('/reports/dashboard'),
        api.get('/reports/attendance-trend'),
        api.get('/holidays'),
      ]);

      if (dashRes.status === 'fulfilled') {
        const d = dashRes.value.data?.data ?? dashRes.value.data ?? {};
        setStats(d.stats ?? d);
        setRecentEmps(d.recentEmployees ?? []);
        setDeptData(d.departmentBreakdown ?? []);
      }
      if (trendRes.status === 'fulfilled') {
        const t = trendRes.value.data?.data ?? trendRes.value.data ?? [];
        setTrend(Array.isArray(t) ? t : []);
      }
      if (holidayRes.status === 'fulfilled') {
        const h = holidayRes.value.data?.data ?? holidayRes.value.data ?? [];
        setHolidays(
          Array.isArray(h)
            ? h.filter((x) => new Date(x.date) >= new Date()).slice(0, 5)
            : []
        );
      }
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── Quick actions ── */
  const QUICK_ACTIONS = [
    { label: 'Add Employee',       icon: Plus,         onClick: () => navigate('/admin/employees/new'),    color: 'btn-primary'   },
    { label: 'Approve Leaves',     icon: UserCheck,    onClick: () => navigate('/admin/leaves'),            color: 'btn-secondary' },
    { label: 'View Reports',       icon: BarChart3,    onClick: () => navigate('/admin/reports'),           color: 'btn-secondary' },
    { label: 'Manage Holidays',    icon: CalendarDays, onClick: () => navigate('/admin/holidays'),          color: 'btn-secondary' },
  ];

  /* ── Stats config ── */
  const STAT_ITEMS = [
    { key: 'totalEmployees',    label: 'Total Employees',    icon: Users,       color: 'primary' },
    { key: 'presentToday',      label: 'Present Today',      icon: UserCheck,   color: 'success' },
    { key: 'absentToday',       label: 'Absent Today',       icon: UserX,       color: 'danger'  },
    { key: 'onLeave',           label: 'On Leave',           icon: Plane,       color: 'accent'  },
    { key: 'pendingLeaves',     label: 'Pending Leaves',     icon: Clock,       color: 'warning' },
    { key: 'pendingCorrections',label: 'Pending Corrections',icon: AlertCircle, color: 'gray'    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="Failed to load dashboard"
          description={error}
          action="Retry"
          onAction={() => loadData()}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <span className="text-gradient">Admin</span> Dashboard
          </h1>
          <p className="page-subtitle">Real-time HR overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="btn-secondary"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <SkeletonCard count={6} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAT_ITEMS.map(({ key, label, icon, color }) => (
            <StatCard
              key={key}
              label={label}
              value={stats?.[key] ?? '–'}
              icon={icon}
              color={color}
            />
          ))}
        </div>
      )}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar Chart — Attendance Trend */}
        <div className="glass p-5 xl:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-primary-400" />
            <h2 className="text-base font-semibold text-white">Monthly Attendance Trend</h2>
            <span className="badge-gray ml-auto">Last 6 months</span>
          </div>
          {trend.length === 0 ? (
            <EmptyState icon={BarChart3} title="No trend data" description="Attendance trend data is not available." className="py-10" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trend} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTooltip />} cursor={TOOLTIP_STYLE.cursor} />
                <Bar dataKey="present" name="Present" fill="#5840f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent"  name="Absent"  fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leave"   name="Leave"   fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart — Employees by Department */}
        <div className="glass p-5 space-y-4">
          <div className="flex items-center gap-2">
            <PieIcon size={18} className="text-accent-400" />
            <h2 className="text-base font-semibold text-white">By Department</h2>
          </div>
          {deptData.length === 0 ? (
            <EmptyState icon={PieIcon} title="No department data" description="Department breakdown not available." className="py-10" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={deptData}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {deptData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Employees */}
        <div className="glass xl:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary-400" />
              <h2 className="text-base font-semibold text-white">Recent Employees</h2>
            </div>
            <button
              onClick={() => navigate('/admin/employees')}
              className="btn-ghost btn-sm"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>
          {loading ? (
            <div className="p-4">
              <SkeletonTable rows={5} columns={4} />
            </div>
          ) : recentEmps.length === 0 ? (
            <EmptyState icon={Users} title="No employees found" description="No employees have been added yet." />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEmps.map((emp) => (
                    <tr
                      key={emp._id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/admin/employees/${emp._id}`)}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar avatar-sm avatar-gradient shrink-0">
                            {(emp.firstName?.[0] ?? emp.name?.[0] ?? '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-100">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[11px] text-gray-500">{emp.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-primary">{emp.department?.name ?? '–'}</span>
                      </td>
                      <td className="text-gray-400">{emp.designation ?? emp.role ?? '–'}</td>
                      <td className="text-gray-400 text-xs">{fmtDate(emp.joiningDate ?? emp.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Upcoming Holidays */}
          <div className="glass overflow-hidden flex-1">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
              <CalendarDays size={16} className="text-accent-400" />
              <h2 className="text-base font-semibold text-white">Upcoming Holidays</h2>
            </div>
            {holidays.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No upcoming holidays" description="No holidays scheduled soon." className="py-8" />
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {holidays.map((h) => (
                  <div key={h._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-accent-400 font-bold text-sm leading-none">
                        {new Date(h.date).getDate()}
                      </span>
                      <span className="text-accent-500 text-[9px] uppercase tracking-wide">
                        {new Date(h.date).toLocaleString('en-IN', { month: 'short' })}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{h.name}</p>
                      <p className="text-[11px] text-gray-500 capitalize">{h.type ?? 'Public Holiday'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-warning-500" />
              <h2 className="text-base font-semibold text-white">Quick Actions</h2>
            </div>
            {QUICK_ACTIONS.map(({ label, icon: Icon, onClick, color }) => (
              <button
                key={label}
                onClick={onClick}
                className={`${color} w-full justify-start`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
