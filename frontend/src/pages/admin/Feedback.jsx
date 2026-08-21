import { useState, useEffect } from 'react';
import { MessageSquare, Shield, CheckCircle, Clock, Tag } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

export default function Feedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [status, setStatus] = useState('reviewed');
  const [hrNote, setHrNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedback');
      setFeedback(res.data.data || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      await api.patch(`/feedback/${selectedItem.id}`, { status, hr_note: hrNote });
      toast.success('Feedback status updated');
      setSelectedItem(null);
      setHrNote('');
      fetchFeedback();
    } catch (err) {
      toast.error('Failed to update feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Anonymous Employee Feedback</h1>
        <p className="text-sm text-gray-400">Review confidential workplace feedback submitted by staff members.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-gray-400">Loading feedback...</p>
        ) : feedback.length === 0 ? (
          <div className="col-span-2 card text-center py-12 text-gray-500">No anonymous feedback submitted yet.</div>
        ) : (
          feedback.map((item) => (
            <div key={item.id} className="card space-y-3 border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary capitalize">{item.category}</span>
                  <span className={`badge ${
                    item.sentiment === 'positive' ? 'badge-success' :
                    item.sentiment === 'negative' ? 'badge-danger' : 'badge-gray'
                  } capitalize`}>
                    {item.sentiment}
                  </span>
                </div>
                <span className={`badge ${
                  item.status === 'actioned' ? 'badge-success' :
                  item.status === 'reviewed' ? 'badge-info' : 'badge-warning'
                }`}>
                  {item.status}
                </span>
              </div>

              <p className="text-sm text-gray-200">{item.message}</p>

              {item.hr_note && (
                <div className="p-2.5 bg-white/5 rounded-lg text-xs text-gray-300">
                  <span className="font-semibold text-primary-400 block mb-0.5">HR Note:</span>
                  {item.hr_note}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-white/5">
                <span>Submitted: {new Date(item.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => { setSelectedItem(item); setStatus(item.status); setHrNote(item.hr_note || ''); }}
                  className="btn btn-xs btn-ghost text-primary-400"
                >
                  Manage Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedItem && (
        <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Update Feedback Status">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input text-sm w-full"
              >
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="actioned">Actioned</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">HR Note / Action Taken</label>
              <textarea
                value={hrNote}
                onChange={(e) => setHrNote(e.target.value)}
                className="input text-sm w-full h-20"
                placeholder="Write internal HR note..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedItem(null)} className="btn btn-ghost text-sm">Cancel</button>
              <button disabled={submitting} onClick={handleUpdate} className="btn btn-primary text-sm">Save Changes</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
