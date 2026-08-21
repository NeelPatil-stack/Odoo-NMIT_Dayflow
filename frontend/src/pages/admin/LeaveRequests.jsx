import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Search, RefreshCw, Check, X, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/ui/EmptyState';

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
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject' | null

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data?.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      toast.success(`Leave request ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setSelectedLeave(null);
      setModalAction(null);
      fetchLeaves();
    } catch {
      toast.error('Failed to update leave status.');
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
    if (s === 'approved') return <span className="badge-success">Approved</span>;
    if (s === 'rejected') return <span className="badge-danger font-semibold">Rejected</span>;
    if (s === 'pending') return <span className="badge-warning font-semibold">Pending</span>;
    if (s === 'cancelled') return <span className="badge-gray">Cancelled</span>;
    return <span className="badge-gray">{s}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
            Leave Requests Management
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Review, approve, or reject employee leave applications across departments.
          </p>
        </div>

        <button onClick={fetchLeaves} className="btn-secondary text-xs py-2.5 px-4 font-semibold">
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card p-5 space-y-4 shadow-soft">
        {/* Search & Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 text-xs py-2 font-sans"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1.5 rounded-[14px] text-xs font-semibold">
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-[10px] transition-all cursor-pointer ${
                  statusFilter === st.id ? 'bg-white text-[#0B2D5C] font-bold shadow-xs' : 'text-slate-600 hover:text-[#0B2D5C]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Date Duration</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">Loading leave requests...</td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8">
                    <EmptyState
                      icon={Calendar}
                      title="No Leave Requests Found"
                      description="No pending or matching leave applications found."
                    />
                  </td>
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
                    <tr key={l._id || l.id} className="hover:bg-[#F0F7FF]/50 transition-colors">
                      <td>
                        <p className="font-bold text-[#172033] text-xs">{empName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{empId}</p>
                      </td>
                      <td className="capitalize text-slate-700 font-semibold text-xs">{lType} Leave</td>
                      <td className="text-slate-600 text-xs font-medium">{startDate} – {endDate}</td>
                      <td className="font-mono text-[#0B2D5C] font-bold text-xs">{days} Days</td>
                      <td className="text-slate-500 text-xs max-w-xs truncate">{l.reason || '—'}</td>
                      <td>{getStatusBadge(l.status)}</td>
                      <td className="text-right">
                        {l.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setSelectedLeave(l); setModalAction('approve'); }}
                              className="p-2 bg-[#E8F6F0] text-[#22A06B] hover:bg-emerald-200 rounded-[10px] transition-colors cursor-pointer"
                              title="Approve"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              onClick={() => { setSelectedLeave(l); setModalAction('reject'); }}
                              className="p-2 bg-[#FDE8E9] text-[#E5484D] hover:bg-rose-200 rounded-[10px] transition-colors cursor-pointer"
                              title="Reject"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold">Decided</span>
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

      {/* Approval Modal */}
      {selectedLeave && modalAction && (
        <div className="modal-backdrop">
          <div className="modal max-w-md space-y-4 animate-modal-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0B2D5C]">
                Leave Request Decision
              </h3>
              <button onClick={() => { setSelectedLeave(null); setModalAction(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-[14px]">
              <p><strong>Employee:</strong> {selectedLeave.employee?.name || selectedLeave.employee?.firstName}</p>
              <p><strong>Leave Type:</strong> {selectedLeave.leaveType || 'Paid'} Leave</p>
              <p><strong>Dates:</strong> {fmtDate(selectedLeave.startDate)} – {fmtDate(selectedLeave.endDate)} ({selectedLeave.totalDays || 1} Days)</p>
              <p><strong>Reason:</strong> {selectedLeave.reason || '—'}</p>
            </div>

            <p className="text-xs font-semibold text-[#172033]">
              Are you sure you want to {modalAction === 'approve' ? 'approve' : 'reject'} this leave application?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => { setSelectedLeave(null); setModalAction(null); }}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedLeave._id || selectedLeave.id, modalAction === 'approve' ? 'approved' : 'rejected')}
                className={modalAction === 'approve' ? 'btn-success text-xs font-bold' : 'btn-danger text-xs font-bold'}
              >
                {modalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
