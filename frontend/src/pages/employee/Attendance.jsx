import { useState, useEffect, useCallback } from 'react';
import {
  Clock, LogIn, LogOut, RefreshCw,
  CheckCircle, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import api from '../../services/api';

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
  if (!inTime || !outTime) return '—';
  try {
    const diff = (new Date(outTime) - new Date(inTime)) / 3600000;
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
  if (s === 'present') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Present</span>;
  if (s === 'absent') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Absent</span>;
  if (s === 'late') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Late</span>;
  if (s === 'half_day') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">Half Day</span>;
  return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">{s || '—'}</span>;
}

function TodayCard({ today, onCheckIn, onCheckOut, loading }) {
  const checkInVal = today?.checkIn || today?.check_in;
  const checkOutVal = today?.checkOut || today?.check_out;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Today's Attendance Status</h2>
          <p className="text-xs text-slate-500 mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}</p>
        </div>
        {getStatusBadge(today?.status)}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Check In',  value: fmtTime(checkInVal),  icon: LogIn,   color: 'text-emerald-600' },
          { label: 'Check Out', value: fmtTime(checkOutVal), icon: LogOut,  color: 'text-rose-600' },
          { label: 'Working Hours', value: calcHours(checkInVal, checkOutVal), icon: Clock, color: 'text-sky-600' },
          { label: 'Status',    value: today?.status || 'absent', icon: CheckCircle, color: 'text-indigo-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon size={14} className={color} />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 capitalize">{value}</p>
          </div>
        ))}
      </div>

      <div className="pt-2 flex gap-3">
        {!checkInVal && (
          <button className="btn-primary bg-emerald-600 hover:bg-emerald-700 py-2 px-4 text-xs shadow-xs" onClick={onCheckIn} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <LogIn size={14} className="mr-1.5" />}
            Check In
          </button>
        )}
        {checkInVal && !checkOutVal && (
          <button className="btn-primary bg-rose-600 hover:bg-rose-700 py-2 px-4 text-xs shadow-xs" onClick={onCheckOut} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <LogOut size={14} className="mr-1.5" />}
            Check Out
          </button>
        )}
        {checkInVal && checkOutVal && (
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
            <CheckCircle size={15} /> Session complete for today
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeeAttendance() {
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
      toast.success('Checked in successfully!');
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
      toast.success('Checked out successfully!');
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Attendance Log</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Track daily check-ins, check-outs, and attendance history.</p>
        </div>
        <button onClick={() => setRegModal(true)} className="btn-secondary py-2 px-3 text-xs">
          Request Regularization
        </button>
      </div>

      {/* Today card */}
      <TodayCard
        today={today}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        loading={actionLoading}
      />

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Attendance History</h2>
          <button onClick={loadData} className="p-1.5 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Working Hours</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-400">Loading history...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-400">No past attendance records found.</td>
                </tr>
              ) : (
                history.map((row, idx) => {
                  const checkInTime = fmtTime(row.checkIn || row.check_in);
                  const checkOutTime = fmtTime(row.checkOut || row.check_out);
                  const hrs = calcHours(row.checkIn || row.check_in, row.checkOut || row.check_out);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-900 font-semibold">{fmtDate(row.date)}</td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">{checkInTime}</td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">{checkOutTime}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{hrs}</td>
                      <td className="py-3 px-4">{getStatusBadge(row.status)}</td>
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
        <Modal title="Request Attendance Regularization" onClose={() => setRegModal(false)}>
          <form onSubmit={handleRegSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Check In</label>
                <input
                  type="time"
                  required
                  value={regCheckIn}
                  onChange={(e) => setRegCheckIn(e.target.value)}
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Check Out</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
              <textarea
                required
                rows={3}
                value={regReason}
                onChange={(e) => setRegReason(e.target.value)}
                placeholder="Explain why check in/out was missed..."
                className="input text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setRegModal(false)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button type="submit" disabled={regSubmitting} className="btn-primary text-xs">
                {regSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
