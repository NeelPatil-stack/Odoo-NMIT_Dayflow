import { useState, useEffect } from 'react';
import { Plus, Trash2, Megaphone, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'general' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/announcements', formData);
      toast.success('Announcement broadcasted successfully!');
      setModalOpen(false);
      setFormData({ title: '', content: '', priority: 'general' });
      fetchAnnouncements();
    } catch {
      toast.error('Failed to post announcement');
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
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">Company Announcements</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Broadcast important notifications and organizational updates to all employees.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary py-2.5 px-4 text-xs font-bold shadow-soft flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-slate-400 text-xs font-medium">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="col-span-2 py-8">
            <EmptyState icon={Megaphone} title="No Announcements" description="No company announcements broadcasted yet." />
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id || item._id} className="bg-white border border-slate-200/90 rounded-[18px] p-5 shadow-soft space-y-3 relative hover:border-[#145DA0] transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`badge ${
                    item.priority === 'urgent' ? 'badge-danger' :
                    item.priority === 'important' ? 'badge-warning' : 'badge-info'
                  } uppercase text-[10px] font-bold`}>
                    {item.priority || 'General'}
                  </span>
                  <h3 className="text-base font-extrabold text-[#0B2D5C] mt-1.5">{item.title}</h3>
                </div>
                <button onClick={() => handleDelete(item.id || item._id)} className="p-1.5 text-[#E5484D] hover:bg-[#FDE8E9] rounded-[8px] transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{item.content || item.message}</p>

              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-100">
                <span>Published: {new Date(item.createdAt || item.publish_date || Date.now()).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0B2D5C]">Post Announcement</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input text-xs"
                  placeholder="e.g. Townhall Meeting Schedule"
                />
              </div>

              <div>
                <label className="form-label">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input text-xs font-semibold cursor-pointer"
                >
                  <option value="general">General</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="form-label">Content</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input text-xs"
                  placeholder="Write the announcement details..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs font-bold">
                  {submitting ? 'Posting...' : 'Broadcast Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
