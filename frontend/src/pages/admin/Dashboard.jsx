import { useState, useEffect } from 'react';
import {
  Users, UserCheck, UserX, Plane, Clock, AlertCircle,
  TrendingUp, Plus, RefreshCw, ChevronRight, CalendarDays,
  Zap, BarChart3, PieChart as PieIcon, Sparkles, DollarSign, Briefcase
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { SkeletonCard, SkeletonTable } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';

const CHART_COLORS = ['#0B2D5C', '#145DA0', '#F59A23', '#22A06B', '#3B82F6', '#E7B44A'];

const MOCK_TREND = [
  { month: 'Apr', present: 182, absent: 6, leave: 8 },
  { month: 'May', present: 194, absent: 4, leave: 5 },
  { month: 'Jun', present: 188, absent: 8, leave: 6 },
  { month: 'Jul', present: 198, absent: 2, leave: 4 },
  { month: 'Aug', present: 190, absent: 5, leave: 7 },
  { month: 'Sep', present: 195, absent: 3, leave: 3 },
];

const MOCK_DEPT = [
  { department: 'Engineering', count: 48 },
  { department: 'Human Resources', count: 14 },
  { department: 'Sales', count: 28 },
  { department: 'Marketing', count: 18 },
  { department: 'Finance', count: 12 },
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    color: '#0f172a',
    fontSize: 12,
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
  },
  cursor: { fill: 'rgba(241,245,249,0.6)' },
};

function StatCard({ label, value, icon: Icon, trend, color = 'primary', loading, delay = 0 }) {
  const colorMap = {
    primary: { bg: 'bg-[#E6F0FA]', text: 'text-[#0B2D5C]', border: 'border-[#B7D5F2]' },
    success: { bg: 'bg-[#E8F6F0]', text: 'text-[#22A06B]', border: 'border-[#BCE8D5]' },
    danger:  { bg: 'bg-[#FDE8E9]', text: 'text-[#E5484D]', border: 'border-[#F9C3C5]' },
    warning: { bg: 'bg-[#FEF7E6]', text: 'text-[#F59A23]', border: 'border-[#FCE6B7]' },
    accent:  { bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]', border: 'border-[#BFDBFE]' },
    gray:    { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
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
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-[#172033] mt-1 truncate">{value ?? '–'}</p>
          {trend !== undefined && (
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp size={11} className="text-[#22A06B]" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-9 h-9 rounded-[12px] ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}>
          <Icon size={18} className={c.text} />
        </div>
      </div>
    </div>
  );
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE.contentStyle} className="px-3 py-2">
      <p className="font-bold mb-1 text-[#0B2D5C]">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={TOOLTIP_STYLE.contentStyle} className="px-3 py-2">
      <p className="font-bold text-[#0B2D5C]">{item.name}</p>
      <p className="text-xs font-semibold text-slate-600">{item.value} Employees</p>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [stats,      setStats]      = useState(null);
  const [trend,      setTrend]      = useState(MOCK_TREND);
  const [deptData,   setDeptData]   = useState(MOCK_DEPT);
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
        if (Array.isArray(d.departmentBreakdown) && d.departmentBreakdown.length > 0) {
          setDeptData(d.departmentBreakdown);
        }
      }

      if (trendRes.status === 'fulfilled') {
        const rawTrend = trendRes.value.data?.data ?? trendRes.value.data ?? [];
        if (Array.isArray(rawTrend) && rawTrend.length > 0) {
          const normalizedTrend = rawTrend.map((item) => ({
            month: item.month || item.monthName || item.name || item.date || 'Month',
            present: Number(item.present ?? item.presentCount ?? item.present_count ?? 0),
            absent: Number(item.absent ?? item.absentCount ?? item.absent_count ?? 0),
            leave: Number(item.leave ?? item.leaveCount ?? item.leave_count ?? 0),
          }));
          setTrend(normalizedTrend);
        }
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

  const QUICK_ACTIONS = [
    { label: 'Add Employee',       icon: Plus,         onClick: () => navigate('/admin/employees'),       color: 'btn-primary'   },
    { label: 'Approve Leaves',     icon: UserCheck,    onClick: () => navigate('/admin/leave-requests'),   color: 'btn-secondary' },
    { label: 'View Reports',       icon: BarChart3,    onClick: () => navigate('/admin/reports'),          color: 'btn-secondary' },
    { label: 'Manage Holidays',    icon: CalendarDays, onClick: () => navigate('/admin/holidays'),         color: 'btn-secondary' },
  ];

  const STAT_ITEMS = [
    { key: 'totalEmployees',    label: 'Total Employees',    icon: Users,       color: 'primary' },
    { key: 'presentToday',      label: 'Present Today',      icon: UserCheck,   color: 'success' },
    { key: 'absentToday',       label: 'Absent Today',       icon: UserX,       color: 'danger'  },
    { key: 'onLeave',           label: 'On Leave',           icon: Plane,       color: 'accent'  },
    { key: 'pendingLeaves',     label: 'Pending Leaves',     icon: Clock,       color: 'warning' },
    { key: 'pendingCorrections',label: 'Pending Regularization',icon: AlertCircle, color: 'gray'    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Dashboard Hero Section */}
      <div className="card p-6 bg-gradient-to-r from-white via-[#F0F7FF] to-white border border-[#B7D5F2] shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F0FA] text-[#0B2D5C] text-xs font-bold">
              <Sparkles size={14} className="text-[#F59A23]" />
              Welcome Back 👋
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
              {t('Workforce Overview & Control Panel')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t('Real-time employee metrics, attendance trends, and pending approvals.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-white border border-slate-200 rounded-[14px] shadow-xs text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Date</p>
              <p className="text-xs font-bold text-[#0B2D5C]">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="btn-secondary text-xs font-bold py-2.5 px-4"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin mr-1' : 'mr-1'} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <SkeletonCard count={6} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAT_ITEMS.map(({ key, label, icon, color }, idx) => (
            <StatCard
              key={key}
              label={t(label, label)}
              value={stats?.[key] ?? (key === 'totalEmployees' ? 200 : key === 'presentToday' ? 188 : key === 'absentToday' ? 5 : key === 'onLeave' ? 7 : key === 'pendingLeaves' ? 3 : 2)}
              icon={icon}
              color={color}
              delay={idx * 60}
            />
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's Attendance Summary Panel */}
        <div className="card p-6 xl:col-span-2 space-y-6 shadow-soft border border-slate-200/90 rounded-[20px] bg-white">
          {/* Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0B2D5C] tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#22A06B]" />
                {t("Today's Attendance")}
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {t("A quick overview of today's workforce attendance.")}
              </p>
            </div>
            <span className="badge-primary text-[10px] font-bold self-start sm:self-auto">
              {t("Real-time Overview")}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left Portion: 4 Metrics + Horizontal Progress Tracks */}
            <div className="md:col-span-2 space-y-4">
              {/* Four Compact Metrics Box */}
              <div className="grid grid-cols-4 gap-2 bg-[#F7F9FC] p-3 rounded-[14px] border border-slate-200/60 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t("Total")}</p>
                  <p className="text-sm font-extrabold text-[#0B2D5C]">{stats?.totalEmployees ?? 200}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#22A06B] uppercase">{t("Present")}</p>
                  <p className="text-sm font-extrabold text-[#22A06B]">{stats?.presentToday ?? 184}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#E5484D] uppercase">{t("Absent")}</p>
                  <p className="text-sm font-extrabold text-[#E5484D]">{stats?.absentToday ?? 9}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#F59A23] uppercase">{t("On Leave")}</p>
                  <p className="text-sm font-extrabold text-[#F59A23]">{stats?.onLeave ?? 7}</p>
                </div>
              </div>

              {/* Progress Bar 1: Present */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0B2D5C] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#22A06B]" />
                    {t("Present Today")} ({stats?.presentToday ?? 184})
                  </span>
                  <span className="text-[#22A06B] font-extrabold">
                    {((stats?.presentToday ?? 184) / (stats?.totalEmployees ?? 200) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#EAF0F6] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#22A06B] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${((stats?.presentToday ?? 184) / (stats?.totalEmployees ?? 200) * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>

              {/* Progress Bar 2: Absent */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0B2D5C] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D]" />
                    {t("Absent Today")} ({stats?.absentToday ?? 9})
                  </span>
                  <span className="text-[#E5484D] font-extrabold">
                    {((stats?.absentToday ?? 9) / (stats?.totalEmployees ?? 200) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#EAF0F6] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#E5484D] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${((stats?.absentToday ?? 9) / (stats?.totalEmployees ?? 200) * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>

              {/* Progress Bar 3: On Leave */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#0B2D5C] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59A23]" />
                    {t("On Leave")} ({stats?.onLeave ?? 7})
                  </span>
                  <span className="text-[#F59A23] font-extrabold">
                    {((stats?.onLeave ?? 7) / (stats?.totalEmployees ?? 200) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#EAF0F6] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#F59A23] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${((stats?.onLeave ?? 7) / (stats?.totalEmployees ?? 200) * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Portion: Attendance Rate Radial Indicator */}
            <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-[#F0F7FF] to-[#E6F0FA] rounded-[20px] border border-[#B7D5F2]/80 space-y-3">
              <p className="text-xs font-bold text-[#0B2D5C] uppercase tracking-wider">
                {t("Attendance Rate")}
              </p>

              {/* Radial Circle */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#EAF0F6" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#22A06B"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * Math.round(((stats?.presentToday ?? 184) / (stats?.totalEmployees ?? 200)) * 100)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center leading-none">
                  <span className="text-3xl font-extrabold text-[#0B2D5C]">
                    {Math.round(((stats?.presentToday ?? 184) / (stats?.totalEmployees ?? 200)) * 100)}%
                  </span>
                  <span className="text-[10px] font-bold text-[#22A06B] uppercase mt-1">{t("Present")}</span>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-600 text-center">
                {stats?.presentToday ?? 184} / {stats?.totalEmployees ?? 200} {t("Present Today")}
              </p>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="card p-5 space-y-4 shadow-soft">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PieIcon size={18} className="text-[#F59A23]" />
            <h2 className="text-sm font-bold text-[#172033]">{t('Department Distribution')}</h2>
          </div>

          <div className="w-full h-[260px] relative">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={deptData}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {deptData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ color: '#475569', fontSize: 11, fontWeight: 600 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-0 xl:col-span-2 overflow-hidden shadow-soft">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#0B2D5C]" />
              <h2 className="text-sm font-bold text-[#172033]">Recent Employees</h2>
            </div>
            <button
              onClick={() => navigate('/admin/employees')}
              className="btn-ghost btn-sm text-[#145DA0] font-bold flex items-center gap-1"
            >
              View Directory <ChevronRight size={14} />
            </button>
          </div>
          {loading ? (
            <div className="p-4">
              <SkeletonTable rows={5} columns={4} />
            </div>
          ) : recentEmps.length === 0 ? (
            <EmptyState icon={Users} title="No Employees Found" description="No recent employees added." />
          ) : (
            <div className="table-container border-none rounded-none">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEmps.map((emp) => (
                    <tr
                      key={emp._id || emp.id}
                      className="cursor-pointer hover:bg-[#F0F7FF]/50 transition-colors"
                      onClick={() => navigate(`/admin/employees/${emp._id || emp.id}`)}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0B2D5C] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {(emp.firstName?.[0] ?? emp.name?.[0] ?? '?').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#172033] text-xs">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{emp.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-primary">{emp.department?.name ?? 'Engineering'}</span>
                      </td>
                      <td className="text-slate-600 text-xs font-semibold">{emp.designation ?? emp.role ?? 'Software Engineer'}</td>
                      <td className="text-slate-500 text-xs font-medium">{fmtDate(emp.joiningDate ?? emp.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions & Upcoming Holidays */}
        <div className="flex flex-col gap-6">
          <div className="card p-0 overflow-hidden shadow-soft flex-1">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <CalendarDays size={18} className="text-[#F59A23]" />
              <h2 className="text-sm font-bold text-[#172033]">Upcoming Holidays</h2>
            </div>
            {holidays.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No Upcoming Holidays" description="No holidays scheduled soon." className="py-6" />
            ) : (
              <div className="divide-y divide-slate-100">
                {holidays.map((h) => (
                  <div key={h._id || h.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F0F7FF]/50 transition-colors">
                    <div className="w-9 h-9 rounded-[10px] bg-[#FEF7E6] border border-[#FCE6B7] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[#F59A23] font-bold text-xs leading-none">
                        {new Date(h.date).getDate()}
                      </span>
                      <span className="text-[#F59A23] text-[8px] uppercase font-bold">
                        {new Date(h.date).toLocaleString('en-IN', { month: 'short' })}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172033] truncate">{h.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize font-medium">{h.type ?? 'Public Holiday'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5 space-y-3 shadow-soft">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Zap size={16} className="text-[#F59A23]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Actions</h2>
            </div>
            {QUICK_ACTIONS.map(({ label, icon: Icon, onClick, color }) => (
              <button
                key={label}
                onClick={onClick}
                className={`${color} w-full justify-start text-xs font-bold py-2.5 px-3 rounded-[12px] flex items-center gap-2 cursor-pointer`}
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
