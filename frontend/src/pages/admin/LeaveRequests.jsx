import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, Search, Filter, ShieldCheck, User } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

export default function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data.data || []);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    if (!selectedLeave) return;
    setSubmitting(true);
    try {
      await api.patch(`/leaves/${selectedLeave.id}/review`, {
        status,
        adminComment,
      });
      toast.success(`Leave request ${status} successfully`);
      setSelectedLeave(null);
      setAdminComment('');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave status');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeaves = leaves.filter(l => {
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    const name = `${l.employee?.first_name || ''} ${l.employee?.last_name || ''}`.toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Leave Requests</h1>
          <p className="text-sm text-gray-400">Review employee leave submissions and track approvals.</p>
        </div>
      </div>

      <div className="card space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`btn btn-sm capitalize ${filterStatus === status ? 'btn-primary' : 'btn-ghost text-gray-400'}`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-sm py-2"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-white/[0.02] text-gray-400 border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">Loading leave requests...</td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">No leave requests found.</td>
                </tr>
              ) : (
                filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-4 font-medium text-white">
                      {l.employee?.first_name} {l.employee?.last_name}
                      <span className="block text-xs text-gray-500">{l.employee?.department?.name || 'General'}</span>
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-300">{l.leave_type} Leave</td>
                    <td className="py-3 px-4 text-gray-300 text-xs">
                      {l.start_date} → {l.end_date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{l.total_days}</td>
                    <td className="py-3 px-4 text-gray-400 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        l.status === 'approved' ? 'badge-success' :
                        l.status === 'rejected' ? 'badge-danger' :
                        l.status === 'pending' ? 'badge-warning' : 'badge-gray'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {l.status === 'pending' && (
                        <button onClick={() => setSelectedLeave(l)} className="btn btn-xs btn-primary">
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Review Modal */}
      {selectedLeave && (
        <Modal isOpen={!!selectedLeave} onClose={() => setSelectedLeave(null)} title="Review Leave Request">
          <div className="space-y-4">
            <div className="p-3 bg-white/5 rounded-xl text-sm space-y-1">
              <p className="text-gray-400">Employee: <span className="text-white font-medium">{selectedLeave.employee?.first_name} {selectedLeave.employee?.last_name}</span></p>
              <p className="text-gray-400">Type: <span className="text-white capitalize">{selectedLeave.leave_type} Leave</span></p>
              <p className="text-gray-400">Dates: <span className="text-white">{selectedLeave.start_date} to {selectedLeave.end_date} ({selectedLeave.total_days} days)</span></p>
              <p className="text-gray-400">Reason: <span className="text-white">{selectedLeave.reason}</span></p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Admin Comment</label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Remarks for the employee..."
                className="input text-sm w-full h-20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => handleReview('rejected')}
                className="btn btn-danger text-sm"
              >
                Reject
              </button>
              <button
                disabled={submitting}
                onClick={() => handleReview('approved')}
                className="btn btn-primary text-sm"
              >
                Approve
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
