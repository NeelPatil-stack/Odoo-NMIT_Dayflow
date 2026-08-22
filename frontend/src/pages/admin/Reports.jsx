import { useState, useEffect } from 'react';
import { BarChart3, Download, Calendar, Users, DollarSign, PieChart as PieIcon, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

function fmtTime(d) {
  if (!d) return '—';
  try {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return String(d);
    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return String(d);
  }
}

function fmtDate(d) {
  if (!d) return '—';
  try {
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return String(d);
    return dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
      console.error('Error fetching report:', err);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data.length) return toast.error('No data to export');
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
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported to CSV');
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'present' || s === 'active' || s === 'paid' || s === 'approved' || s === 'hired') {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">{s}</span>;
    }
    if (s === 'absent' || s === 'inactive' || s === 'rejected' || s === 'failed') {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 capitalize">{s}</span>;
    }
    if (s === 'late' || s === 'pending' || s === 'screening' || s === 'interviewing' || s === 'processed') {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 capitalize">{s}</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 capitalize">{s || 'info'}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Generate, view, and export comprehensive HR system reports.</p>
        </div>

        <button onClick={exportCSV} className="btn-primary py-2 px-4 text-xs shadow-xs">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'attendance', label: 'Attendance Report', icon: Calendar },
          { id: 'leave', label: 'Leave Report', icon: PieIcon },
          { id: 'employees', label: 'Headcount & Employees', icon: Users },
          { id: 'payroll', label: 'Payroll Summary', icon: DollarSign },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              reportType === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              {reportType === 'attendance' ? (
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Emp ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Check In</th>
                  <th className="py-3.5 px-4">Check Out</th>
                  <th className="py-3.5 px-4">Working Hours</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              ) : reportType === 'leave' ? (
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Start Date</th>
                  <th className="py-3.5 px-4">End Date</th>
                  <th className="py-3.5 px-4">Days</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              ) : reportType === 'payroll' ? (
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Month/Year</th>
                  <th className="py-3.5 px-4">Basic</th>
                  <th className="py-3.5 px-4">HRA</th>
                  <th className="py-3.5 px-4">Allowances</th>
                  <th className="py-3.5 px-4">Gross Salary</th>
                  <th className="py-3.5 px-4">Net Salary</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              ) : (
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Emp ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400 font-medium">
                    Generating report data...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400 font-medium">
                    No records found for this report.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  if (reportType === 'attendance') {
                    const empName = row.employee?.name || `${row.employee?.firstName || row.employee?.first_name || ''} ${row.employee?.lastName || row.employee?.last_name || ''}`.trim() || 'Employee';
                    const empId = row.employee?.employeeId || row.employee?.employee_id || row.employeeId || '—';
                    const checkInTime = fmtTime(row.checkIn || row.check_in);
                    const checkOutTime = fmtTime(row.checkOut || row.check_out);
                    const hrs = row.workingHours || row.working_hours ? `${row.workingHours || row.working_hours} hrs` : '—';

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{empName}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{empId}</td>
                        <td className="py-3 px-4 text-slate-600">{fmtDate(row.date)}</td>
                        <td className="py-3 px-4 text-slate-800 font-semibold">{checkInTime}</td>
                        <td className="py-3 px-4 text-slate-800 font-semibold">{checkOutTime}</td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{hrs}</td>
                        <td className="py-3 px-4">{getStatusBadge(row.status)}</td>
                      </tr>
                    );
                  }

                  if (reportType === 'leave') {
                    const empName = row.employee?.name || `${row.employee?.firstName || row.employee?.first_name || ''} ${row.employee?.lastName || row.employee?.last_name || ''}`.trim() || 'Employee';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{empName}</td>
                        <td className="py-3 px-4 text-slate-700 capitalize font-medium">{row.leaveType || row.leave_type || '—'}</td>
                        <td className="py-3 px-4 text-slate-600">{fmtDate(row.startDate || row.start_date)}</td>
                        <td className="py-3 px-4 text-slate-600">{fmtDate(row.endDate || row.end_date)}</td>
                        <td className="py-3 px-4 text-slate-700 font-mono">{row.totalDays || row.total_days || '1'} days</td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{row.reason || '—'}</td>
                        <td className="py-3 px-4">{getStatusBadge(row.status)}</td>
                      </tr>
                    );
                  }

                  if (reportType === 'payroll') {
                    const empName = row.employee?.name || `${row.employee?.firstName || row.employee?.first_name || ''} ${row.employee?.lastName || row.employee?.last_name || ''}`.trim() || 'Employee';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{empName}</td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{row.month}/{row.year}</td>
                        <td className="py-3 px-4 text-slate-700 font-mono">₹{(row.basicSalary || row.basic_salary || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-slate-700 font-mono">₹{(row.hra || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-slate-700 font-mono">₹{(row.allowances || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-slate-900 font-mono font-semibold">₹{(row.grossSalary || row.gross_salary || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-emerald-700 font-mono font-bold">₹{(row.netSalary || row.net_salary || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">{getStatusBadge(row.status)}</td>
                      </tr>
                    );
                  }

                  // Default Employees report
                  const empName = row.name || `${row.firstName || row.first_name || ''} ${row.lastName || row.last_name || ''}`.trim() || 'Employee';
                  const dept = row.department?.name || row.department || '—';
                  const desig = row.designation?.title || row.designation || '—';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{empName}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{row.employeeId || row.employee_id || '—'}</td>
                      <td className="py-3 px-4 text-slate-700">{dept}</td>
                      <td className="py-3 px-4 text-slate-600">{desig}</td>
                      <td className="py-3 px-4 text-slate-500">{fmtDate(row.joiningDate || row.joining_date)}</td>
                      <td className="py-3 px-4">{getStatusBadge(row.status)}</td>
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
