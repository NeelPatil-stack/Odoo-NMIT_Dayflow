import { useState, useEffect } from 'react';
import { Plus, Trash2, CalendarDays, Sun, Sparkles, X, PartyPopper } from 'lucide-react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import EmptyState from '../../components/ui/EmptyState';

export default function Holidays() {
  const { t } = useLanguage();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', date: '', type: 'public', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/holidays');
      setHolidays(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load holiday records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/holidays', formData);
      toast.success('New holiday added successfully!');
      setModalOpen(false);
      setFormData({ name: '', date: '', type: 'public', description: '' });
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add holiday.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      toast.success('Holiday deleted.');
      fetchHolidays();
    } catch {
      toast.error('Failed to delete holiday.');
    }
  };

  const getMarkerBadge = (type) => {
    const t = String(type || '').toLowerCase();
    if (t === 'public' || t === 'national') return <span className="badge-primary">Public Holiday</span>;
    if (t === 'company') return <span className="badge-warning font-semibold">Company Holiday</span>;
    if (t === 'optional') return <span className="badge-info">Optional Holiday</span>;
    return <span className="badge-gray">Weekend</span>;
  };

  // Find next upcoming holiday
  const upcomingHolidays = holidays.filter(h => new Date(h.date) >= new Date());
  const nextHoliday = upcomingHolidays[0] || holidays[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Level 1: Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
            Holidays & Organization Calendar
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Manage public holidays, regional celebrations, and company Observances.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary py-2.5 px-4 text-xs font-bold shadow-soft flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Holiday
        </button>
      </div>

      {/* Level 2: NEXT HOLIDAY FOCAL HERO CARD (Section 20 requirement) */}
      {nextHoliday && (
        <div className="bg-[#0B2D5C] text-white rounded-[24px] p-6 shadow-[0_20px_40px_-10px_rgba(11,45,92,0.35)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59A23]/20 border border-[#F59A23]/40 text-xs font-bold text-[#F59A23]">
              <PartyPopper size={14} />
              <span>NEXT UPCOMING HOLIDAY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{nextHoliday.name}</h2>
            <p className="text-xs text-slate-300 font-medium">
              {new Date(nextHoliday.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              {nextHoliday.description ? ` · ${nextHoliday.description}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-20 h-20 rounded-[18px] bg-white/10 border border-white/20 backdrop-blur-md flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-extrabold text-[#F59A23] font-mono leading-none">{new Date(nextHoliday.date).getDate()}</span>
              <span className="text-[10px] text-white font-bold uppercase tracking-wider mt-1">{new Date(nextHoliday.date).toLocaleString('en-IN', { month: 'short' })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Level 3: UPCOMING HOLIDAY CARDS GRID */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Upcoming Observances
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {holidays.slice(0, 4).map((h, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-[16px] p-4 flex items-center gap-3 shadow-soft hover:shadow-card-hover transition-all">
              <div className="w-10 h-10 rounded-[12px] bg-[#FEF7E6] border border-[#FCE6B7] flex flex-col items-center justify-center shrink-0">
                <span className="text-[#F59A23] font-bold text-sm leading-none">{new Date(h.date).getDate()}</span>
                <span className="text-[#F59A23] text-[9px] uppercase font-bold">{new Date(h.date).toLocaleString('en-IN', { month: 'short' })}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#172033] truncate">{h.name}</p>
                <div className="mt-1">{getMarkerBadge(h.type)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level 4: FULL HOLIDAY TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-[20px] p-5 shadow-soft space-y-4">
        <div className="table-container border-none rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Holiday Name</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">Loading holiday schedule...</td>
                </tr>
              ) : holidays.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8">
                    <EmptyState
                      icon={CalendarDays}
                      title="No Holidays Added"
                      description="Click the button above to add holidays."
                    />
                  </td>
                </tr>
              ) : (
                holidays.map((h, idx) => (
                  <tr key={h._id || h.id || idx} className="hover:bg-[#F0F7FF]/50 transition-colors">
                    <td className="font-bold text-[#172033] text-xs">{h.name}</td>
                    <td className="text-slate-700 font-medium text-xs font-mono">
                      {new Date(h.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>{getMarkerBadge(h.type)}</td>
                    <td className="text-slate-500 text-xs max-w-xs truncate">{h.description || '—'}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(h._id || h.id)}
                        className="p-1.5 text-[#E5484D] hover:bg-[#FDE8E9] rounded-[8px] transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0B2D5C]">Add New Holiday</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Holiday Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input text-xs"
                  placeholder="e.g. Independence Day"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input text-xs font-semibold cursor-pointer"
                  >
                    <option value="public">Public Holiday</option>
                    <option value="company">Company Holiday</option>
                    <option value="optional">Optional Holiday</option>
                    <option value="weekend">Weekend</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input text-xs"
                  placeholder="Optional details..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs font-bold">
                  {submitting ? 'Adding...' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
