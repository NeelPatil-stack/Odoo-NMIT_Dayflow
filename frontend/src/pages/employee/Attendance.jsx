import { useState, useEffect, useCallback } from 'react';
import {
  Clock, LogIn, LogOut, RefreshCw, CheckCircle2,
  Loader2, Check, ShieldAlert, ArrowRight, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import EmptyState from '../../components/ui/EmptyState';

const fmtTime = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return String(iso);
  }
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return String(iso);
  }
};

const calcHours = (inTime, outTime) => {
  if (!inTime) return '—';
  try {
    const end = outTime ? new Date(outTime) : new Date();
    const diff = (end - new Date(inTime)) / 3600000;
    if (diff < 0 || isNaN(diff)) return '—';
    const h = Math.floor(diff);
    const m = Math.round((diff - h) * 60);
    return `${h}h ${m}m`;
  } catch {
    return '—';
  }
};

function getStatusBadge(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'present') return <span className="badge-success">Present</span>;
  if (s === 'absent') return <span className="badge-danger font-semibold">Absent</span>;
  if (s === 'late') return <span className="badge-warning font-semibold">Late</span>;
  if (s === 'half_day') return <span className="badge-info font-semibold">Half Day</span>;
  return <span className="badge-gray">{s || '—'}</span>;
}

export default function EmployeeAttendance() {
  const { t } = useLanguage();
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [regModal, setRegModal] = useState(false);
  const [regDate, setRegDate] = useState('');
  const [regCheckIn, setRegCheckIn] = useState('');
  const [regCheckOut, setRegCheckOut] = useState('');
  const [regReason, setRegReason] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [nowTime, setNowTime] = useState(new Date());

  // Live clock timer
  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, hRes] = await Promise.allSettled([
        api.get('/attendance/today'),
        api.get('/attendance/my-history'),
      ]);
      if (tRes.status === 'fulfilled') setToday(tRes.value.data?.data || tRes.value.data);
      if (hRes.status === 'fulfilled') setHistory(hRes.value.data?.data || hRes.value.data || []);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/checkin');
      toast.success('Successfully checked in! 🎉');
      loadData();
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
      toast.success('Successfully checked out! 👋');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setRegSubmitting(true);
    try {
      await api.post('/attendance/regularization', {
        date: regDate,
        requested_check_in: regCheckIn ? `${regDate}T${regCheckIn}:00Z` : null,
        requested_check_out: regCheckOut ? `${regDate}T${regCheckOut}:00Z` : null,
        reason: regReason,
      });
      toast.success('Regularization request submitted');
      setRegModal(false);
      setRegReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit regularization');
    } finally {
      setRegSubmitting(false);
    }
  };

  const checkInVal = today?.checkIn || today?.check_in;
  const checkOutVal = today?.checkOut || today?.check_out;
  const isCheckedIn = !!checkInVal && !checkOutVal;
  const isCheckedOut = !!checkInVal && !!checkOutVal;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* ── Level 1: Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
            {t('My Attendance')}
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {t('Track your workday status, active hours, and attendance log.')}
          </p>
        </div>
        <button
          onClick={() => setRegModal(true)}
          className="btn-secondary py-2.5 px-4 text-xs font-bold shadow-xs hover:border-[#145DA0] transition-all flex items-center gap-1.5"
        >
          <ShieldAlert className="w-4 h-4 text-[#F59A23]" /> {t('Request Regularization')}
        </button>
      </div>

      {/* ── Level 2: DEEP NAVY ATTENDANCE HERO CARD (Option A Requirement) ── */}
      <div className="bg-[#0B2D5C] text-white rounded-[24px] p-6 sm:p-8 shadow-[0_20px_40px_-10px_rgba(11,45,92,0.35)] relative overflow-hidden">
        {/* Subtle Bridge Curve & Dotted Grid Background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <svg className="absolute -right-20 -bottom-20 w-96 h-96 opacity-15 pointer-events-none" viewBox="0 0 400 400" fill="none">
          <path d="M 50 350 Q 200 100 350 350" stroke="#F59A23" strokeWidth="4" />
          <path d="M 80 350 Q 200 150 320 350" stroke="#145DA0" strokeWidth="3" />
        </svg>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: State & Actions */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-3">
              <span className="text-[11px] font-bold text-[#F59A23] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/15">
                TODAY
              </span>
              <span className="text-xs font-semibold text-slate-300">
                {nowTime.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Live Clock Display */}
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
                {nowTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </p>
            </div>

            {/* Attendance States (Section 6 requirement) */}
            {!checkInVal && (
              <div className="space-y-3 pt-1">
                <h2 className="text-xl font-bold text-white">Ready to start your day?</h2>
                <p className="text-xs text-slate-300 font-medium">Check in now to record your morning shift start time.</p>
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="btn-accent bg-[#F59A23] hover:bg-[#E08512] text-white py-3 px-6 text-xs font-bold shadow-lg hover:-translate-y-0.5 active:scale-98 cursor-pointer flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                  <span>Check In</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {isCheckedIn && (
              <div className="space-y-3 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22A06B]/20 border border-[#22A06B]/40 text-xs font-bold text-[#22A06B]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22A06B] animate-ping" />
                  <span>● WORKING</span>
                </div>
                <h2 className="text-xl font-bold text-white">You're checked in</h2>
                <p className="text-xs text-slate-300 font-medium">
                  Checked in at <span className="font-mono text-white font-bold">{fmtTime(checkInVal)}</span> · Duration: <span className="font-mono text-[#F59A23] font-bold">{calcHours(checkInVal, checkOutVal)}</span>
                </p>
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  className="btn-danger bg-[#E5484D] hover:bg-rose-700 text-white py-3 px-6 text-xs font-bold shadow-lg hover:-translate-y-0.5 active:scale-98 cursor-pointer flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  <span>Check Out</span>
                </button>
              </div>
            )}

            {isCheckedOut && (
              <div className="space-y-2 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22A06B]/20 border border-[#22A06B]/40 text-xs font-bold text-[#22A06B]">
                  <CheckCircle2 size={15} />
                  <span>✓ DAY COMPLETED</span>
                </div>
                <h2 className="text-xl font-bold text-white">Great job today!</h2>
                <p className="text-xs text-slate-300 font-medium">
                  Total shift duration: <span className="font-mono text-white font-bold">{calcHours(checkInVal, checkOutVal)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Workday Progress Visual Arc & Graphic (Section 3 requirement) */}
          <div className="hidden lg:flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-[20px] p-6 text-center w-72 shrink-0">
            <div className="relative w-28 h-28 flex items-center justify-center mb-3">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#F59A23"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset={isCheckedOut ? "0" : isCheckedIn ? "120" : "251.2"}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Clock size={20} className="text-[#F59A23] mb-0.5" />
                <span className="text-xs font-bold text-white font-mono">{calcHours(checkInVal, checkOutVal)}</span>
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Workday Progress</p>
            <p className="text-[10px] text-slate-400 mt-1">Shift hours tracked in real time</p>
          </div>
        </div>

        {/* ── Section 8: WORKDAY TIMELINE ── */}
        <div className="mt-8 pt-6 border-t border-white/10 relative">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
            <span>Check In</span>
            <span>Now</span>
            <span>Check Out</span>
          </div>
          {/* Progress bar line */}
          <div className="w-full h-1.5 bg-white/10 rounded-full relative">
            <div
              className="h-full bg-gradient-to-r from-[#145DA0] via-[#F59A23] to-[#22A06B] rounded-full transition-all duration-500"
              style={{
                width: isCheckedOut ? '100%' : isCheckedIn ? '55%' : '0%',
              }}
            />
            {/* Timeline Dots */}
            <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#0B2D5C] ${checkInVal ? 'bg-[#22A06B]' : 'bg-white/30'}`} />
            <span className={`absolute left-1/2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#0B2D5C] ${isCheckedIn ? 'bg-[#F59A23] animate-ping' : isCheckedOut ? 'bg-[#22A06B]' : 'bg-white/30'}`} />
            <span className={`absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-[#0B2D5C] ${checkOutVal ? 'bg-[#22A06B]' : 'bg-white/30'}`} />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
            <span>{fmtTime(checkInVal)}</span>
            <span>{isCheckedIn ? 'In Progress' : '—'}</span>
            <span>{fmtTime(checkOutVal)}</span>
          </div>
        </div>
      </div>

      {/* ── Level 3: COMPACT HORIZONTAL SUMMARY STRIP (Section 7 requirement) ── */}
      <div className="bg-white border border-slate-200/90 rounded-[18px] p-4 shadow-soft">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 gap-4 md:gap-0">
          <div className="p-2 md:px-4 text-center md:text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CHECK IN</p>
            <p className="text-base font-extrabold text-[#0B2D5C] font-mono mt-0.5">{fmtTime(checkInVal)}</p>
          </div>
          <div className="p-2 md:px-4 text-center md:text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CHECK OUT</p>
            <p className="text-base font-extrabold text-[#0B2D5C] font-mono mt-0.5">{fmtTime(checkOutVal)}</p>
          </div>
          <div className="p-2 md:px-4 text-center md:text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WORKING HOURS</p>
            <p className="text-base font-extrabold text-[#F59A23] font-mono mt-0.5">{calcHours(checkInVal, checkOutVal)}</p>
          </div>
          <div className="p-2 md:px-4 text-center md:text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">STATUS</p>
            <div className="mt-1">{getStatusBadge(today?.status || (checkInVal ? 'present' : 'absent'))}</div>
          </div>
        </div>
      </div>

      {/* ── Level 4: ATTENDANCE HISTORY TABLE (Section 9 requirement) ── */}
      <div className="bg-white border border-slate-200/90 rounded-[20px] p-5 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-[#0B2D5C]">Attendance History</h2>
          <button onClick={loadData} className="btn-secondary btn-icon" title="Refresh history">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="table-container border-none rounded-none">
          <table className="data-table">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-400 font-medium">Loading history...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8">
                    <EmptyState
                      icon={Clock}
                      title="No Attendance History"
                      description="No past attendance records found."
                    />
                  </td>
                </tr>
              ) : (
                history.map((row, idx) => {
                  const checkInTime = fmtTime(row.checkIn || row.check_in);
                  const checkOutTime = fmtTime(row.checkOut || row.check_out);
                  const hrs = calcHours(row.checkIn || row.check_in, row.checkOut || row.check_out);

                  return (
                    <tr key={idx} className="hover:bg-[#F0F7FF]/50 transition-colors">
                      <td className="text-[#172033] font-bold text-xs">{fmtDate(row.date)}</td>
                      <td className="font-bold text-[#0B2D5C] text-xs font-mono">{checkInTime}</td>
                      <td className="font-bold text-[#0B2D5C] text-xs font-mono">{checkOutTime}</td>
                      <td className="text-slate-700 text-xs font-mono font-bold">{hrs}</td>
                      <td>{getStatusBadge(row.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regularization Modal */}
      {regModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0B2D5C]">Request Attendance Regularization</h3>
              <button onClick={() => setRegModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegSubmit} className="space-y-4">
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  required
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="input text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Requested Check In</label>
                  <input
                    type="time"
                    required
                    value={regCheckIn}
                    onChange={(e) => setRegCheckIn(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label">Requested Check Out</label>
                  <input
                    type="time"
                    required
                    value={regCheckOut}
                    onChange={(e) => setRegCheckOut(e.target.value)}
                    className="input text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Reason</label>
                <textarea
                  required
                  rows={3}
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="Explain why check in/out was missed..."
                  className="input text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setRegModal(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={regSubmitting} className="btn-primary text-xs font-bold">
                  {regSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
