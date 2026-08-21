import { useState, useEffect, useCallback } from 'react';
import {
  Clock, LogIn, LogOut, Calendar, RefreshCw, Edit3,
  CheckCircle, XCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const calcHours = (inTime, outTime) => {
  if (!inTime || !outTime) return '—';
  const diff = (new Date(outTime) - new Date(inTime)) / 3600000;
  if (diff < 0) return '—';
  const h = Math.floor(diff);
  const m = Math.round((diff - h) * 60);
  return `${h}h ${m}m`;
};

const STATUS_CONFIG = {
  present:    { cls: 'badge-success', label: 'Present' },
  absent:     { cls: 'badge-danger',  label: 'Absent' },
  late:       { cls: 'badge-warning', label: 'Late' },
  half_day:   { cls: 'badge-info',    label: 'Half Day' },
  holiday:    { cls: 'badge-gray',    label: 'Holiday' },
  weekend:    { cls: 'badge-gray',    label: 'Weekend' },
  on_leave:   { cls: 'badge-info',    label: 'On Leave' },
};

const DAY_STATUS_COLOR = {
  present:  'bg-success-500/80',
  absent:   'bg-danger-500/80',
  late:     'bg-warning-500/80',
  half_day: 'bg-accent-400/80',
  holiday:  'bg-primary-600/50',
  weekend:  'bg-dark-700',
  on_leave: 'bg-accent-400/40',
};

// ── Today Card ────────────────────────────────────────────────────────────────
function TodayCard({ today, onCheckIn, onCheckOut, loading }) {
  const status = today?.status || 'absent';
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.absent;

  return (
    <div className="glass p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Today's Status</h2>
          <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}</p>
        </div>
        <span className={conf.cls}>{conf.label}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Check In',  value: fmtTime(today?.checkIn),  icon: LogIn,   color: 'text-success-500' },
          { label: 'Check Out', value: fmtTime(today?.checkOut), icon: LogOut,  color: 'text-danger-500' },
          { label: 'Working Hours', value: calcHours(today?.checkIn, today?.checkOut), icon: Clock, color: 'text-accent-400' },
          { label: 'Status',    value: conf.label,                icon: CheckCircle, color: 'text-primary-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-dark-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={color} />
              <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-lg font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-3">
        {!today?.checkIn && (
          <button className="btn-success" onClick={onCheckIn} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={16} />}
            Check In
          </button>
        )}
        {today?.checkIn && !today?.checkOut && (
          <button className="btn-danger" onClick={onCheckOut} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={16} />}
            Check Out
          </button>
        )}
        {today?.checkIn && today?.checkOut && (
          <div className="flex items-center gap-2 text-success-500 text-sm">
            <CheckCircle size={16} /> Session complete
          </div>
        )}
      </div>
    </div>
  );
}

// ── Calendar Grid ─────────────────────────────────────────────────────────────
function CalendarGrid({ records, month, year, onPrev, onNext }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const recordMap = {};
  records.forEach((r) => {
    const d = new Date(r.date).getDate();
    recordMap[d] = r.status;
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthName = new Date(year, month).toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Monthly Calendar</h2>
        <div className="flex items-center gap-2">
          <button className="btn-ghost btn-sm p-1.5" onClick={onPrev}><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium text-gray-200 w-36 text-center">{monthName}</span>
          <button className="btn-ghost btn-sm p-1.5" onClick={onNext}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const status = recordMap[day];
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          const dotColor = DAY_STATUS_COLOR[status] || 'bg-dark-700';
          return (
            <div key={day}
              className={`relative flex flex-col items-center py-2 rounded-lg text-xs font-medium
                ${isToday ? 'ring-2 ring-primary-500 bg-primary-600/10' : ''}
                ${status ? '' : 'text-gray-600'}`}>
              <span className={isToday ? 'text-primary-300 font-bold' : 'text-gray-300'}>{day}</span>
              {status && (
                <span className={`mt-1 w-1.5 h-1.5 rounded-full ${dotColor}`} title={status} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/[0.06]">
        {[
          { label: 'Present', color: 'bg-success-500' },
          { label: 'Absent', color: 'bg-danger-500' },
          { label: 'Late', color: 'bg-warning-500' },
          { label: 'Half Day', color: 'bg-accent-400' },
          { label: 'Leave', color: 'bg-accent-400/40' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Correction Modal ──────────────────────────────────────────────────────────
function CorrectionModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ date: '', requestedCheckIn: '', requestedCheckOut: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.requestedCheckIn || !form.requestedCheckOut || !form.reason.trim())
      return toast.error('Please fill all fields');
    setSubmitting(true);
    try {
      await api.post('/attendance/regularization', form);
      toast.success('Correction request submitted');
      onSuccess();
      onClose();
      setForm({ date: '', requestedCheckIn: '', requestedCheckOut: '', reason: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Attendance Correction" size="md"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            Submit Request
          </button>
        </>
      }>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="form-label">Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="form-input"
            max={new Date().toISOString().slice(0, 10)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Requested Check-In</label>
            <input type="time" name="requestedCheckIn" value={form.requestedCheckIn} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Requested Check-Out</label>
            <input type="time" name="requestedCheckOut" value={form.requestedCheckOut} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div>
          <label className="form-label">Reason</label>
          <textarea name="reason" value={form.reason} onChange={handleChange} rows={3}
            placeholder="Explain why this correction is needed..."
            className="form-input resize-none" />
        </div>
      </form>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Attendance() {
  const now = new Date();
  const [today, setToday] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [toggle, setToggle] = useState('daily');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, histRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance', { params: { month: viewMonth + 1, year: viewYear } }),
      ]);
      setToday(todayRes.data?.data || todayRes.data);
      setRecords(histRes.data?.data || histRes.data || []);
    } catch {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  }, [viewMonth, viewYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/checkin');
      toast.success('Checked in successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/checkout');
      toast.success('Checked out successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const displayedRecords = toggle === 'weekly'
    ? records.slice(-7)
    : records;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">Track your daily attendance and request corrections</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost btn-sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn-secondary" onClick={() => setCorrectionOpen(true)}>
            <Edit3 size={14} /> Request Correction
          </button>
        </div>
      </div>

      {/* Today card */}
      {loading ? (
        <div className="skeleton h-48 rounded-2xl" />
      ) : (
        <TodayCard today={today} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} loading={actionLoading} />
      )}

      {/* Calendar + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          {loading
            ? <div className="skeleton h-80 rounded-2xl" />
            : <CalendarGrid records={records} month={viewMonth} year={viewYear} onPrev={handlePrevMonth} onNext={handleNextMonth} />}
        </div>

        <div className="lg:col-span-3 glass p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Attendance History</h2>
            <div className="flex items-center bg-dark-900/60 rounded-xl p-0.5 gap-0.5">
              {['daily', 'weekly'].map((v) => (
                <button key={v} onClick={() => setToggle(v)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 capitalize
                    ${toggle === v ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="table-container">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
              </div>
            ) : displayedRecords.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Calendar size={36} className="mx-auto mb-2 opacity-40" />
                <p>No records for this period</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...displayedRecords].reverse().map((r) => {
                    const conf = STATUS_CONFIG[r.status] || STATUS_CONFIG.absent;
                    return (
                      <tr key={r._id || r.date}>
                        <td className="font-medium">{fmtDate(r.date)}</td>
                        <td>{fmtTime(r.checkIn)}</td>
                        <td>{fmtTime(r.checkOut)}</td>
                        <td>{calcHours(r.checkIn, r.checkOut)}</td>
                        <td><span className={conf.cls}>{conf.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <CorrectionModal
        isOpen={correctionOpen}
        onClose={() => setCorrectionOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
