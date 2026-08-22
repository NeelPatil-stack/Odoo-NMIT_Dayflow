import { useState, useEffect } from 'react';
import { Clock, Search, RefreshCw, ShieldAlert, Check, X } from 'lucide-react';
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

export default function AdminAttendance() {
  const [activeTab, setActiveTab] = useState('daily');
  const [attendance, setAttendance] = useState([]);
  const [regularizations, setRegularizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [selectedDate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'daily') {
        const res = await api.get(`/attendance?date=${selectedDate}`);
        setAttendance(res.data?.data || res.data || []);
      } else {
        const res = await api.get('/attendance/regularization');
        setRegularizations(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await api.patch(`/attendance/regularization/${id}/review`, { status });
      toast.success(`Request ${status} successfully`);
      fetchData();
    } catch (err) {
      toast.error('Failed to process request');
    }
  };

  const filteredAttendance = attendance.filter(item => {
    const empName = item.employee?.name || `${item.employee?.firstName || item.employee?.first_name || ''} ${item.employee?.lastName || item.employee?.last_name || ''}`;
    const empId = item.employee?.employeeId || item.employee?.employee_id || item.employeeId || '';
    return empName.toLowerCase().includes(search.toLowerCase()) || empId.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'present') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Present</span>;
    if (s === 'absent') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Absent</span>;
    if (s === 'late') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Late</span>;
    if (s === 'half_day') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">Half Day</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">{s}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Management</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Monitor daily check-ins, working hours, and attendance regularization requests.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" /> Daily Log
          </button>
          <button
            onClick={() => setActiveTab('regularization')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'regularization'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Regularizations
          </button>
        </div>
      </div>

      {activeTab === 'daily' ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input text-xs py-2 max-w-[180px]"
              />
              <button onClick={fetchData} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9 text-xs py-2"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Working Hours</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400">Loading attendance data...</td>
                  </tr>
                ) : filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400">No attendance records found for this date.</td>
                  </tr>
                ) : (
                  filteredAttendance.map((item, idx) => {
                    const empName = item.employee?.name || `${item.employee?.firstName || item.employee?.first_name || ''} ${item.employee?.lastName || item.employee?.last_name || ''}`.trim() || 'Employee';
                    const empId = item.employee?.employeeId || item.employee?.employee_id || item.employeeId || '—';
                    const checkInTime = fmtTime(item.checkIn || item.check_in);
                    const checkOutTime = fmtTime(item.checkOut || item.check_out);
                    const hrs = item.workingHours || item.working_hours ? `${item.workingHours || item.working_hours} hrs` : '—';

                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{empName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{empId}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{checkInTime}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{checkOutTime}</td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{hrs}</td>
                        <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Regularization tab */
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Requested Times</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400">Loading regularization requests...</td>
                  </tr>
                ) : regularizations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400">No pending regularization requests.</td>
                  </tr>
                ) : (
                  regularizations.map((req) => {
                    const empName = req.employee?.name || `${req.employee?.firstName || req.employee?.first_name || ''} ${req.employee?.lastName || req.employee?.last_name || ''}`.trim() || 'Employee';
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{empName}</td>
                        <td className="py-3 px-4 text-slate-600">{req.date}</td>
                        <td className="py-3 px-4 text-slate-800 font-semibold">
                          {fmtTime(req.requested_check_in)} - {fmtTime(req.requested_check_out)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{req.reason}</td>
                        <td className="py-3 px-4">{getStatusBadge(req.status)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReview(req.id, 'approved')}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'rejected')}
                              className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
