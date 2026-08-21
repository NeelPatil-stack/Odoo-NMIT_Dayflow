import { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, Users, DollarSign, PieChart as PieIcon, RefreshCw, TrendingUp, Activity, UserPlus } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/ui/EmptyState';

const CHART_COLORS = ['#0B2D5C', '#145DA0', '#F59A23', '#22A06B', '#3B82F6', '#E7B44A'];

const sampleGrowthData = [
  { month: 'Jan', employees: 120, hires: 10, turnover: 2 },
  { month: 'Feb', employees: 128, hires: 9, turnover: 1 },
  { month: 'Mar', employees: 135, hires: 12, turnover: 3 },
  { month: 'Apr', employees: 142, hires: 8, turnover: 1 },
  { month: 'May', employees: 150, hires: 11, turnover: 2 },
  { month: 'Jun', employees: 158, hires: 10, turnover: 1 },
];

const sampleAttendanceRate = [
  { month: 'Jan', rate: 96, absenteeism: 4 },
  { month: 'Feb', rate: 94, absenteeism: 6 },
  { month: 'Mar', rate: 97, absenteeism: 3 },
  { month: 'Apr', rate: 95, absenteeism: 5 },
  { month: 'May', rate: 98, absenteeism: 2 },
  { month: 'Jun', rate: 96, absenteeism: 4 },
];

function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(d);
  }
}

export default function Reports() {
  const [reportType, setReportType] = useState('attendance');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/${reportType}`);
      setData(res.data?.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load report dataset.');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data.length) return toast.error('No report data available to export.');
    const sample = data[0];
    const keys = Object.keys(sample).filter(k => k !== '_id' && k !== 'id');
    const headers = keys.join(',');
    const rows = data.map(row =>
      keys.map(k => {
        const val = row[k];
        if (typeof val === 'object' && val !== null) {
          return `"${val.name || val.title || val.first_name || ''}"`;
        }
        return `"${val ?? ''}"`;
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kaaryasetu_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported to CSV successfully!');
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'present' || s === 'active' || s === 'paid' || s === 'approved' || s === 'hired') {
      return <span className="badge-success">{s}</span>;
    }
    if (s === 'absent' || s === 'inactive' || s === 'rejected' || s === 'failed') {
      return <span className="badge-danger font-semibold">{s}</span>;
    }
    if (s === 'late' || s === 'pending' || s === 'screening' || s === 'interviewing') {
      return <span className="badge-warning font-semibold">{s}</span>;
    }
    return <span className="badge-gray">{s || 'info'}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Comprehensive headcount metrics, attendance history, leave trends, and payroll expense breakdown.
          </p>
        </div>

        <button onClick={exportCSV} className="btn-primary py-2.5 px-4 text-xs font-bold shadow-soft flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Growth & Turnover Line Chart */}
        <div className="card p-5 space-y-3 shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#145DA0]" />
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">Employee Growth & New Hires</h3>
            </div>
            <span className="badge-primary">Last 6 Months</span>
          </div>
          <div className="w-full h-[220px] relative">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sampleGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="employees" name="Total Headcount" stroke="#0B2D5C" strokeWidth={3} isAnimationActive={true} animationDuration={800} />
                <Line type="monotone" dataKey="hires" name="New Hires" stroke="#22A06B" strokeWidth={2} isAnimationActive={true} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance & Absenteeism Rate Bar Chart */}
        <div className="card p-5 space-y-3 shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#F59A23]" />
              <h3 className="text-xs font-bold text-[#172033] uppercase tracking-wider">Attendance & Absenteeism Trends</h3>
            </div>
            <span className="badge-warning">Rate %</span>
          </div>
          <div className="w-full h-[220px] relative">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sampleAttendanceRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="rate" name="Attendance %" fill="#145DA0" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={800} />
                <Bar dataKey="absenteeism" name="Absenteeism %" fill="#E5484D" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
        {[
          { id: 'attendance', label: 'Attendance Report', icon: Calendar },
          { id: 'leave', label: 'Leave Trends', icon: PieIcon },
          { id: 'employees', label: 'Headcount Directory', icon: Users },
          { id: 'payroll', label: 'Payroll Expense Summary', icon: DollarSign },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              reportType === tab.id
                ? 'bg-[#0B2D5C] text-white shadow-soft'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B2D5C]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Report Data Table */}
      <div className="card p-0 shadow-soft overflow-hidden">
        <div className="table-container border-none rounded-none">
          <table className="data-table">
            <thead>
              {reportType === 'attendance' ? (
                <tr>
                  <th>Employee</th>
                  <th>Emp ID</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              ) : reportType === 'leave' ? (
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              ) : reportType === 'payroll' ? (
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                </tr>
              ) : (
                <tr>
                  <th>Employee</th>
                  <th>Emp ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                </tr>
              )}
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400 font-medium">Generating report dataset...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8">
                    <EmptyState
                      icon={BarChart3}
                      title="No Report Data Available"
                      description="No records found for this report filter."
                    />
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const empName = row.employee?.name || row.name || `${row.employee?.firstName || row.firstName || ''} ${row.employee?.lastName || row.lastName || ''}`.trim() || 'Employee';
                  const empId = row.employee?.employeeId || row.employeeId || '—';

                  return (
                    <tr key={idx} className="hover:bg-[#F0F7FF]/50 transition-colors">
                      <td className="font-bold text-[#172033] text-xs">{empName}</td>
                      <td className="font-mono text-slate-500 text-xs">{empId}</td>
                      <td className="text-slate-600 text-xs font-medium">{fmtDate(row.date || row.startDate || row.joiningDate)}</td>
                      <td className="text-slate-700 text-xs font-medium font-mono">{row.checkIn || row.month || '—'}</td>
                      <td className="text-slate-700 text-xs font-medium font-mono">{row.checkOut || row.year || '—'}</td>
                      <td className="text-slate-700 text-xs font-mono font-bold">{row.workingHours || row.totalDays || '—'}</td>
                      <td>{getStatusBadge(row.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
