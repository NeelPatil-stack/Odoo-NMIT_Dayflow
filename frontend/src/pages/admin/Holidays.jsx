import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', date: '', type: 'national', description: '' });
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
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/holidays', formData);
      toast.success('Holiday added successfully');
      setModalOpen(false);
      setFormData({ name: '', date: '', type: 'national', description: '' });
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add holiday');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      toast.success('Holiday removed');
      fetchHolidays();
    } catch {
      toast.error('Failed to delete holiday');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Holiday Calendar</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Manage official company and national holidays for leave calculation.</p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary py-2 px-4 text-xs shadow-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Add Holiday
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Holiday Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">Loading holidays...</td>
                </tr>
              ) : holidays.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">No holidays added yet.</td>
                </tr>
              ) : (
                holidays.map((h, idx) => (
                  <tr key={h._id || h.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{h.name}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{h.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 capitalize">
                        {h.type || 'national'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{h.description || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(h._id || h.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal title="Add Holiday" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Holiday Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input text-xs"
                placeholder="e.g. Republic Day"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input text-xs"
                >
                  <option value="national">National</option>
                  <option value="regional">Regional</option>
                  <option value="company">Company</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input text-xs"
                placeholder="Optional notes..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary text-xs">
                {submitting ? 'Adding...' : 'Add Holiday'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
