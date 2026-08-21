import { useState, useEffect } from 'react';
import { Clock, Search, RefreshCw, ShieldAlert, Check, X, Calendar } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/ui/EmptyState';

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
      toast.success(`Request ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      fetchData();
    } catch (err) {
      toast.error('Failed to review request.');
    }
  };

  const filteredAttendance = attendance.filter(item => {
    const empName = item.employee?.name || `${item.employee?.firstName || item.employee?.first_name || ''} ${item.employee?.lastName || item.employee?.last_name || ''}`;
    const empId = item.employee?.employeeId || item.employee?.employee_id || item.employeeId || '';
    return empName.toLowerCase().includes(search.toLowerCase()) || empId.toLowerCase().includes(search.toLowerCase());
  });

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'present') return <span className="badge-success">Present</span>;
    if (s === 'absent') return <span className="badge-danger font-semibold">Absent</span>;
    if (s === 'late') return <span className="badge-warning font-semibold">Late</span>;
    if (s === 'half_day') return <span className="badge-info font-semibold">Half Day</span>;
    return <span className="badge-gray">{s}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
            Attendance Management
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Monitor daily employee check-ins, working hours, and review regularization requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-[#0B2D5C] text-white shadow-soft'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B2D5C]'
            }`}
          >
            <Clock className="w-4 h-4" /> Daily Log
          </button>
          <button
            onClick={() => setActiveTab('regularization')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'regularization'
                ? 'bg-[#0B2D5C] text-white shadow-soft'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B2D5C]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Regularizations
          </button>
        </div>
      </div>

      {activeTab === 'daily' ? (
        <div className="card p-5 shadow-soft space-y-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input text-xs py-2 max-w-[180px]"
              />
              <button onClick={fetchData} className="btn-secondary btn-icon" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 text-xs py-2 font-sans"
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400 font-medium">Loading attendance data...</td>
                  </tr>
                ) : filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8">
                      <EmptyState
                        icon={Clock}
                        title="No Attendance Records"
                        description="No attendance records found for this date."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((item, idx) => {
                    const empName = item.employee?.name || `${item.employee?.firstName || item.employee?.first_name || ''} ${item.employee?.lastName || item.employee?.last_name || ''}`.trim() || 'Employee';
                    const empId = item.employee?.employeeId || item.employee?.employee_id || item.employeeId || '—';
                    const checkInTime = fmtTime(item.checkIn || item.check_in);
                    const checkOutTime = fmtTime(item.checkOut || item.check_out);
                    const hrs = item.workingHours || item.working_hours ? `${item.workingHours || item.working_hours} hrs` : '—';

                    return (
                      <tr key={item.id || idx} className="hover:bg-[#F0F7FF]/50 transition-colors">
                        <td>
                          <p className="font-bold text-[#172033] text-xs">{empName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{empId}</p>
                        </td>
                        <td className="font-bold text-[#0B2D5C] text-xs font-mono">{checkInTime}</td>
                        <td className="font-bold text-[#0B2D5C] text-xs font-mono">{checkOutTime}</td>
                        <td className="text-slate-600 text-xs font-mono font-bold">{hrs}</td>
                        <td>{getStatusBadge(item.status)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Regularization Tab */
        <div className="card p-5 shadow-soft space-y-4">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Requested Times</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400 font-medium">Loading requests...</td>
                  </tr>
                ) : regularizations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8">
                      <EmptyState
                        icon={ShieldAlert}
                        title="No Pending Requests"
                        description="No attendance regularization requests pending approval."
                      />
                    </td>
                  </tr>
                ) : (
                  regularizations.map((req) => {
                    const empName = req.employee?.name || `${req.employee?.firstName || req.employee?.first_name || ''} ${req.employee?.lastName || req.employee?.last_name || ''}`.trim() || 'Employee';
                    return (
                      <tr key={req.id} className="hover:bg-[#F0F7FF]/50 transition-colors">
                        <td className="font-bold text-[#172033] text-xs">{empName}</td>
                        <td className="text-slate-600 text-xs font-medium">{req.date}</td>
                        <td className="font-bold text-[#0B2D5C] text-xs font-mono">
                          {fmtTime(req.requested_check_in)} - {fmtTime(req.requested_check_out)}
                        </td>
                        <td className="text-slate-500 text-xs max-w-xs truncate">{req.reason}</td>
                        <td>{getStatusBadge(req.status)}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleReview(req.id, 'approved')}
                              className="p-1.5 bg-[#E8F6F0] text-[#22A06B] hover:bg-emerald-200 rounded-[8px] transition-colors cursor-pointer"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'rejected')}
                              className="p-1.5 bg-[#FDE8E9] text-[#E5484D] hover:bg-rose-200 rounded-[8px] transition-colors cursor-pointer"
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
