import { useState, useEffect } from 'react';
import { MessageSquareHeart, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedback');
      setFeedback(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/feedback/${id}`, { status });
      toast.success('Feedback status updated');
      fetchFeedback();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">Anonymous Employee Feedback</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Review confidential workplace feedback submitted by staff members.</p>
        </div>
        <button onClick={fetchFeedback} className="btn-secondary text-xs py-2.5 px-4 font-semibold flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-slate-400 text-xs font-medium">Loading feedback...</p>
        ) : feedback.length === 0 ? (
          <div className="col-span-2 py-8">
            <EmptyState icon={MessageSquareHeart} title="No Feedback Submitted" description="No confidential feedback entries submitted yet." />
          </div>
        ) : (
          feedback.map((item) => (
            <div key={item.id || item._id} className="bg-white border border-slate-200/90 rounded-[18px] p-5 shadow-soft space-y-3 hover:border-[#145DA0] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary capitalize font-bold text-[10px]">{item.category || 'General'}</span>
                  <span className={`badge ${
                    item.sentiment === 'positive' ? 'badge-success' :
                    item.sentiment === 'negative' ? 'badge-danger' : 'badge-gray'
                  } capitalize font-bold text-[10px]`}>
                    {item.sentiment || 'neutral'}
                  </span>
                </div>
                <select
                  value={item.status || 'pending'}
                  onChange={(e) => handleStatusChange(item.id || item._id, e.target.value)}
                  className="bg-[#F8FAFC] border border-slate-200 rounded-[8px] text-[10px] py-1 px-2 text-[#0B2D5C] font-bold cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="actioned">Actioned</option>
                </select>
              </div>

              <p className="text-xs text-[#172033] leading-relaxed font-medium">{item.message || item.content}</p>

              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-100">
                <span>Submitted Anonymously</span>
                <span>{new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
