import { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, Edit3, Tag } from 'lucide-react';
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
      setHolidays(res.data.data || []);
    } catch (err) {
      console.error('Error fetching holidays:', err);
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
    } catch (err) {
      toast.error('Failed to delete holiday');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Holiday Calendar</h1>
          <p className="text-sm text-gray-400">Manage company and national holidays for leave calculation.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Holiday
        </button>
      </div>

      <div className="card space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-white/[0.02] text-gray-400 border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Holiday Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">Loading holidays...</td>
                </tr>
              ) : holidays.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">No holidays added yet.</td>
                </tr>
              ) : (
                holidays.map((h) => (
                  <tr key={h.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-4 font-medium text-white">{h.name}</td>
                    <td className="py-3 px-4 text-gray-300">{h.date}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-primary capitalize">{h.type}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{h.description || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleDelete(h.id)} className="btn btn-xs text-danger-400 hover:bg-danger-500/10">
                        <Trash2 className="w-4 h-4" />
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
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Holiday">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Holiday Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input text-sm w-full"
                placeholder="e.g. Independence Day"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input text-sm w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input text-sm w-full"
                >
                  <option value="national">National</option>
                  <option value="regional">Regional</option>
                  <option value="company">Company</option>
                  <option value="optional">Optional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input text-sm w-full h-16"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost text-sm">Cancel</button>
              <button disabled={submitting} type="submit" className="btn btn-primary text-sm">Save Holiday</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
