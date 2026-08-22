import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Search, RefreshCw, Check, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(d);
  }
}

export default function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      toast.success(`Leave request ${status}`);
      fetchLeaves();
    } catch {
      toast.error('Failed to update leave request');
    }
  };

  const filteredLeaves = leaves.filter(l => {
    const empName = l.employee?.name || `${l.employee?.firstName || l.employee?.first_name || ''} ${l.employee?.lastName || l.employee?.last_name || ''}`;
    const empId = l.employee?.employeeId || l.employee?.employee_id || l.employeeId || '';
    const matchesSearch = empName.toLowerCase().includes(search.toLowerCase()) || empId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'approved') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
    if (s === 'rejected') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
    if (s === 'pending') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">{s}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Requests</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Review, approve, or reject employee leave applications.</p>
        </div>

        <button onClick={fetchLeaves} className="btn-secondary text-xs py-2 px-3">
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-xs py-2"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            {['all', 'pending', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                  statusFilter === st ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">Loading leave requests...</td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">No leave requests found.</td>
                </tr>
              ) : (
                filteredLeaves.map((l) => {
                  const empName = l.employee?.name || `${l.employee?.firstName || l.employee?.first_name || ''} ${l.employee?.lastName || l.employee?.last_name || ''}`.trim() || 'Employee';
                  const empId = l.employee?.employeeId || l.employee?.employee_id || l.employeeId || '—';
                  const lType = l.leaveType || l.leave_type || 'paid';
                  const startDate = fmtDate(l.startDate || l.start_date);
                  const endDate = fmtDate(l.endDate || l.end_date);
                  const days = l.totalDays || l.total_days || 1;

                  return (
                    <tr key={l._id || l.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{empName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{empId}</p>
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-700 font-medium">{lType} Leave</td>
                      <td className="py-3 px-4 text-slate-600">{startDate} – {endDate}</td>
                      <td className="py-3 px-4 font-mono text-slate-800 font-bold">{days} days</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{l.reason || '—'}</td>
                      <td className="py-3 px-4">{getStatusBadge(l.status)}</td>
                      <td className="py-3 px-4 text-right">
                        {l.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStatusUpdate(l._id || l.id, 'approved')}
                              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(l._id || l.id, 'rejected')}
                              className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md transition-colors"
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Decided</span>
                        )}
                      </td>
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
