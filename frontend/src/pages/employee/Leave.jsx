import { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw, X, Umbrella, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
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

export default function EmployeeLeave() {
  const { t } = useLanguage();
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState({ paid: 12, sick: 6, casual: 6, taken: 4 });
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [form, setForm] = useState({ leaveType: 'paid', startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lRes, bRes] = await Promise.allSettled([
        api.get('/leaves'),
        api.get('/leaves/balances'),
      ]);
      if (lRes.status === 'fulfilled') setLeaves(lRes.value.data?.data || lRes.value.data || []);
      if (bRes.status === 'fulfilled') {
        const bData = bRes.value.data?.data || bRes.value.data;
        if (bData) setBalances(bData);
      }
    } catch {
      toast.error('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leaves', form);
      toast.success('Leave application submitted successfully!');
      setShowApplyModal(false);
      setForm({ leaveType: 'paid', startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'approved') return <span className="badge-success">Approved</span>;
    if (s === 'rejected') return <span className="badge-danger font-semibold">Rejected</span>;
    if (s === 'pending') return <span className="badge-warning font-semibold">Pending</span>;
    return <span className="badge-gray">Cancelled</span>;
  };

  const totalAllowed = (balances?.paid || 12) + (balances?.sick || 6) + (balances?.casual || 6);
  const totalTaken = balances?.taken || 4;
  const totalRemaining = totalAllowed - totalTaken;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Level 1: Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
            My Leave & Time Off
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Track annual leave balance allowances, submit requests, and monitor approval status.
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="btn-primary py-2.5 px-4 text-xs font-bold shadow-soft flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Apply for Leave
        </button>
      </div>

      {/* Level 2: LEAVE BALANCE HERO SECTION (Section 16 requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Remaining Leave Ring / Panel */}
        <div className="bg-[#0B2D5C] text-white rounded-[24px] p-6 shadow-[0_20px_40px_-10px_rgba(11,45,92,0.35)] relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Umbrella size={18} className="text-[#F59A23]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">LEAVE ALLOWANCE</span>
            </div>
            <span className="text-[10px] font-bold text-[#F59A23] bg-[#F59A23]/20 px-2.5 py-0.5 rounded-full border border-[#F59A23]/40">
              Annual Policy
            </span>
          </div>

          <div>
            <p className="text-4xl font-extrabold text-white tracking-tight font-mono">
              {totalRemaining} <span className="text-lg font-normal text-slate-300">Days</span>
            </p>
            <p className="text-xs text-slate-300 font-medium mt-1">Total remaining paid & sick leaves for 2026</p>
          </div>

          <div className="pt-2">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#22A06B] via-[#F59A23] to-[#145DA0] rounded-full"
                style={{ width: `${Math.min(100, (totalTaken / totalAllowed) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-1.5 flex justify-between">
              <span>Used: {totalTaken} Days</span>
              <span>Total: {totalAllowed} Days</span>
            </p>
          </div>
        </div>

        {/* Leave Category Progress Bars */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-[24px] p-6 shadow-soft space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-[#0B2D5C]">Category Breakdown</h2>
            <span className="text-xs font-bold text-[#145DA0] bg-[#EFF6FF] px-3 py-1 rounded-full border border-[#BFDBFE]">
              Active Balance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Paid Leave Card */}
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[16px] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0B2D5C]">Paid Leave</span>
                <span className="text-xs font-mono font-bold text-[#145DA0]">{balances?.paid || 12} Days</span>
              </div>
              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-[#145DA0] w-[75%]" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Earned annual privilege leaves</p>
            </div>

            {/* Sick Leave Card */}
            <div className="bg-[#E8F6F0] border border-[#BCE8D5] rounded-[16px] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#22A06B]">Sick Leave</span>
                <span className="text-xs font-mono font-bold text-[#22A06B]">{balances?.sick || 6} Days</span>
              </div>
              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-[#22A06B] w-[80%]" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Medical & emergency time off</p>
            </div>

            {/* Casual Leave Card */}
            <div className="bg-[#FEF7E6] border border-[#FCE6B7] rounded-[16px] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F59A23]">Casual Leave</span>
                <span className="text-xs font-mono font-bold text-[#F59A23]">{balances?.casual || 6} Days</span>
              </div>
              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-[#F59A23] w-[60%]" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Short personal leave days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Level 4: RECENT LEAVE APPLICATIONS TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-[20px] p-5 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-[#0B2D5C]">Application History</h2>
          <button onClick={fetchData} className="btn-secondary btn-icon" title="Refresh records">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="table-container border-none rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">Loading applications...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8">
                    <EmptyState
                      icon={Calendar}
                      title="No Leave Applications"
                      description="You have not submitted any leave requests yet."
                    />
                  </td>
                </tr>
              ) : (
                leaves.map((l, idx) => {
                  const lType = l.leaveType || l.leave_type || 'paid';
                  const startDate = fmtDate(l.startDate || l.start_date);
                  const endDate = fmtDate(l.endDate || l.end_date);
                  const days = l.totalDays || l.total_days || 1;

                  return (
                    <tr key={l._id || l.id || idx} className="hover:bg-[#F0F7FF]/50 transition-colors">
                      <td className="font-bold text-[#172033] text-xs capitalize">{lType} Leave</td>
                      <td className="text-slate-600 text-xs font-medium">{startDate}</td>
                      <td className="text-slate-600 text-xs font-medium">{endDate}</td>
                      <td className="font-mono text-[#0B2D5C] font-bold text-xs">{days} Days</td>
                      <td className="text-slate-500 text-xs max-w-xs truncate">{l.reason || '—'}</td>
                      <td>{getStatusBadge(l.status)}</td>
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
        <div className="modal-backdrop">
          <div className="modal max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0B2D5C]">Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="form-label">Leave Type</label>
                <select
                  className="input text-xs font-semibold cursor-pointer"
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
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    required
                    className="input text-xs"
                    value={form.startDate}
                    onChange={e => setForm({...form, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">End Date</label>
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
                <label className="form-label">Reason</label>
                <textarea
                  required
                  rows={3}
                  className="input text-xs"
                  value={form.reason}
                  onChange={e => setForm({...form, reason: e.target.value})}
                  placeholder="State your reason for leave..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs font-bold">
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
