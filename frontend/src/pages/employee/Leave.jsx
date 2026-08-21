import { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle, Calendar, Clock, AlertCircle, X, Upload,
  CheckCircle, XCircle, Loader2, RefreshCw, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';

// ── helpers ─────────────────────────────────────────────────────────────────
const diffDays = (start, end) => {
  if (!start || !end) return 0;
  const ms = new Date(end) - new Date(start);
  return ms < 0 ? 0 : Math.ceil(ms / 86400000) + 1;
};

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_BADGE = {
  pending:  'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-danger',
  cancelled:'badge-gray',
};

const LEAVE_TYPES = [
  { value: 'paid',     label: 'Paid Leave' },
  { value: 'sick',     label: 'Sick Leave' },
  { value: 'casual',   label: 'Casual Leave' },
  { value: 'unpaid',   label: 'Unpaid Leave' },
];

// ── Balance card ─────────────────────────────────────────────────────────────
function BalanceCard({ label, allocated, used, remaining, color, icon: Icon }) {
  const pct = allocated > 0 ? Math.round((used / allocated) * 100) : 0;
  return (
    <div className="glass p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl ${color.bg}`}>
          <Icon size={18} className={color.text} />
        </div>
        <span className={`badge ${color.badge}`}>{remaining} left</span>
      </div>
      <div>
        <p className="text-lg font-semibold text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{used} used of {allocated} days</p>
      </div>
      <div className="w-full bg-dark-700 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color.bar}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ── Apply Leave Modal ─────────────────────────────────────────────────────────
function ApplyLeaveModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    leaveType: 'paid', startDate: '', endDate: '', reason: '',
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const days = diffDays(form.startDate, form.endDate);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) return toast.error('Select start and end dates');
    if (days === 0) return toast.error('Invalid date range');
    if (!form.reason.trim()) return toast.error('Please provide a reason');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('document', file);
      await api.post('/leaves', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Leave applied successfully!');
      onSuccess();
      onClose();
      setForm({ leaveType: 'paid', startDate: '', endDate: '', reason: '' });
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply leave');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for Leave" size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Applying...</> : 'Apply Leave'}
          </button>
        </>
      }>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="form-label">Leave Type</label>
          <select name="leaveType" value={form.leaveType} onChange={handleChange} className="form-select">
            {LEAVE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Start Date</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange}
              className="form-input" min={new Date().toISOString().slice(0, 10)} />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input type="date" name="endDate" value={form.endDate} onChange={handleChange}
              className="form-input" min={form.startDate || new Date().toISOString().slice(0, 10)} />
          </div>
        </div>
        {days > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-600/10 border border-primary-500/20 rounded-xl text-sm text-primary-300">
            <Calendar size={14} />
            <span>{days} working day{days !== 1 ? 's' : ''}</span>
          </div>
        )}
        <div>
          <label className="form-label">Reason</label>
          <textarea name="reason" value={form.reason} onChange={handleChange} rows={3}
            placeholder="Brief description of your leave..."
            className="form-input resize-none" />
        </div>
        <div>
          <label className="form-label">Supporting Document (optional)</label>
          <label className="flex items-center gap-3 px-4 py-3 bg-dark-700/60 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
            <Upload size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">{file ? file.name : 'Click to upload (PDF, JPG, PNG)'}</span>
            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0] || null)} />
          </label>
        </div>
      </form>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Leave() {
  const [balances, setBalances] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [balRes, leavesRes] = await Promise.all([
        api.get('/leaves/balances'),
        api.get('/leaves'),
      ]);
      setBalances(balRes.data?.data || balRes.data);
      setLeaves(leavesRes.data?.data || leavesRes.data || []);
    } catch {
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return;
    setCancelling(id);
    try {
      await api.patch(`/leaves/${id}/cancel`);
      toast.success('Leave cancelled');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(null);
    }
  };

  const BALANCE_CARDS = [
    { key: 'paid',   label: 'Paid Leave',   icon: CheckCircle,
      color: { bg:'bg-success-700/20', text:'text-success-500', bar:'bg-success-500', badge:'badge-success' } },
    { key: 'sick',   label: 'Sick Leave',   icon: AlertCircle,
      color: { bg:'bg-accent-500/20',  text:'text-accent-400',  bar:'bg-accent-400',  badge:'badge-info' } },
    { key: 'casual', label: 'Casual Leave', icon: Calendar,
      color: { bg:'bg-warning-500/20', text:'text-warning-500', bar:'bg-warning-500', badge:'badge-warning' } },
    { key: 'unpaid', label: 'Unpaid Leave', icon: Clock,
      color: { bg:'bg-white/10',       text:'text-gray-400',    bar:'bg-gray-500',    badge:'badge-gray' } },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Track your leave balances and apply for time off</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost btn-sm" onClick={fetchData}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <PlusCircle size={16} /> Apply Leave
          </button>
        </div>
      </div>

      {/* Balance cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BALANCE_CARDS.map(({ key, label, icon, color }) => {
            const b = balances?.[key] || {};
            return (
              <BalanceCard key={key} label={label} icon={icon} color={color}
                allocated={b.allocated ?? 0} used={b.used ?? 0} remaining={b.remaining ?? 0} />
            );
          })}
        </div>
      )}

      {/* Leave History */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={18} className="text-primary-400" /> Leave History
          </h2>
        </div>
        <div className="table-container">
          {loading ? (
            <div className="space-y-3 py-4">
              {[1,2,3].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : leaves.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Calendar size={40} className="mx-auto mb-3 opacity-40" />
              <p>No leave records found.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id || leave.id}>
                    <td>
                      <span className="font-medium text-white capitalize">{leave.leaveType}</span>
                    </td>
                    <td>{fmt(leave.startDate)}</td>
                    <td>{fmt(leave.endDate)}</td>
                    <td className="font-medium">{leave.days ?? diffDays(leave.startDate, leave.endDate)}</td>
                    <td>
                      <span className="text-gray-400 truncate max-w-xs block" title={leave.reason}>
                        {leave.reason || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={STATUS_BADGE[leave.status] || 'badge-gray'}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'pending' ? (
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => handleCancel(leave._id || leave.id)}
                          disabled={cancelling === (leave._id || leave.id)}
                        >
                          {cancelling === (leave._id || leave.id)
                            ? <Loader2 size={12} className="animate-spin" />
                            : <XCircle size={12} />}
                          Cancel
                        </button>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ApplyLeaveModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchData} />
    </div>
  );
}
