import { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(d);
  }
}

export default function EmployeeLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [form, setForm] = useState({ leaveType: 'paid', startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leaves', form);
      toast.success('Leave application submitted successfully');
      setShowApplyModal(false);
      setForm({ leaveType: 'paid', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'approved') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
    if (s === 'rejected') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Leave Applications</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Apply for leaves, track approval statuses, and check balance allowances.</p>
        </div>

        <button onClick={() => setShowApplyModal(true)} className="btn-primary py-2 px-4 text-xs shadow-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Apply Leave
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Application History</h2>
          <button onClick={fetchLeaves} className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">Loading leave requests...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">No leave applications submitted yet.</td>
                </tr>
              ) : (
                leaves.map((l, idx) => {
                  const lType = l.leaveType || l.leave_type || 'paid';
                  const startDate = fmtDate(l.startDate || l.start_date);
                  const endDate = fmtDate(l.endDate || l.end_date);
                  const days = l.totalDays || l.total_days || 1;

                  return (
                    <tr key={l._id || l.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 capitalize">{lType} Leave</td>
                      <td className="py-3 px-4 text-slate-600">{startDate}</td>
                      <td className="py-3 px-4 text-slate-600">{endDate}</td>
                      <td className="py-3 px-4 font-mono text-slate-800 font-bold">{days} days</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{l.reason || '—'}</td>
                      <td className="py-3 px-4">{getStatusBadge(l.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <Modal title="Apply for Leave" onClose={() => setShowApplyModal(false)}>
          <form onSubmit={handleApplySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Type</label>
              <select
                className="input text-xs"
                value={form.leaveType}
                onChange={e => setForm({...form, leaveType: e.target.value})}
              >
                <option value="paid">Paid Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  className="input text-xs"
                  value={form.startDate}
                  onChange={e => setForm({...form, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  className="input text-xs"
                  value={form.endDate}
                  onChange={e => setForm({...form, endDate: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
              <textarea
                required
                rows={3}
                className="input text-xs"
                value={form.reason}
                onChange={e => setForm({...form, reason: e.target.value})}
                placeholder="State your reason for leave..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowApplyModal(false)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary text-xs">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
