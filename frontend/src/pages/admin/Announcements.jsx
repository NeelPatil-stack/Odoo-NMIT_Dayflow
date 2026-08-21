import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, AlertCircle, Bell } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', priority: 'normal', expiry_date: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/announcements', formData);
      toast.success('Announcement published');
      setModalOpen(false);
      setFormData({ title: '', message: '', priority: 'normal', expiry_date: '' });
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Company Announcements</h1>
          <p className="text-sm text-gray-400">Broadcast important notifications and updates to all employees.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" /> New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-gray-400">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="col-span-2 card text-center py-12 text-gray-500">No announcements broadcasted yet.</div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="card relative space-y-3 border border-white/5">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`badge ${
                    item.priority === 'urgent' ? 'badge-danger' :
                    item.priority === 'important' ? 'badge-warning' : 'badge-info'
                  } uppercase text-[10px]`}>
                    {item.priority}
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-1">{item.title}</h3>
                </div>
                <button onClick={() => handleDelete(item.id)} className="btn btn-xs text-danger-400 hover:bg-danger-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.message}</p>

              <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-white/5">
                <span>Published: {item.publish_date}</span>
                {item.expiry_date && <span>Expires: {item.expiry_date}</span>}
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Announcement">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input text-sm w-full"
                placeholder="e.g. Annual Townhall Scheduled"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input text-sm w-full"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="input text-sm w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Message</label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input text-sm w-full h-24"
                placeholder="Write announcement message..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost text-sm">Cancel</button>
              <button disabled={submitting} type="submit" className="btn btn-primary text-sm">Publish</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
