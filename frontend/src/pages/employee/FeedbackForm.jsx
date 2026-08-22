import { useState, useEffect } from 'react';
import { MessageSquareHeart, ShieldCheck, Send, Bot, FileText, CheckCircle2, Clock, Activity, HeartPulse } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import WellnessChatbot from '../../components/WellnessChatbot';

export default function FeedbackForm() {
  const [activeTab, setActiveTab] = useState('chatbot'); // 'chatbot', 'direct_form', 'history'
  const [formData, setFormData] = useState({
    category: 'general',
    message: '',
    sentiment: 'neutral',
  });
  const [submitting, setSubmitting] = useState(false);
  const [myFeedbackHistory, setMyFeedbackHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyHistory();
    }
  }, [activeTab]);

  const fetchMyHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/feedback');
      setMyFeedbackHistory(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/feedback', formData);
      toast.success('Your anonymous feedback has been submitted safely');
      setFormData({ category: 'general', message: '', sentiment: 'neutral' });
      setActiveTab('history');
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <MessageSquareHeart className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Employee Support & Stress Feedback Center</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Talk with our confidential AI wellness assistant, ask about workplace problems, evaluate stress levels, or send direct encrypted suggestions to HR.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-white">100% Cryptographically Hashed</p>
            <p className="text-slate-400 text-[11px]">Zero identity logs linked to submissions.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('chatbot')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'chatbot'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-500" />
          <span>MindCare AI Support Chatbot</span>
        </button>

        <button
          onClick={() => setActiveTab('direct_form')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'direct_form'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Direct Feedback Form</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>Submitted Logs & HR Status</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'chatbot' && (
        <div className="space-y-4">
          <WellnessChatbot fullPage={true} onSubmittedFeedback={fetchMyHistory} />
        </div>
      )}

      {activeTab === 'direct_form' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Direct Anonymous Submission</h2>
            <p className="text-xs text-slate-500">Fill out this quick form to send structured feedback directly to HR.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="general">General Suggestion</option>
                <option value="workload">Workload & High Stress</option>
                <option value="management">Management & Leadership</option>
                <option value="workplace">Workplace Environment</option>
                <option value="compensation">Compensation & Benefits</option>
                <option value="culture">Company Culture</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 shadow-2xs">Overall Tone / Sentiment</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'positive', label: 'Positive / Praise' },
                  { id: 'neutral', label: 'Neutral / Suggestion' },
                  { id: 'negative', label: 'Concern / Stress Issue' },
                ].map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setFormData({ ...formData, sentiment: s.id })}
                    className={`py-2 px-3 text-xs rounded-xl font-medium border transition-all ${
                      formData.sentiment === s.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Detailed Message</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="Describe your concern, workplace problem, or suggestions for improving employee well-being..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                disabled={submitting}
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-xs"
              >
                <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Anonymous Feedback'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Workplace Feedback & Action Tracker</h2>
              <p className="text-xs text-slate-500">Monitor status updates and HR actions taken on anonymous submissions.</p>
            </div>
            <button
              onClick={fetchMyHistory}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium"
            >
              Refresh Logs
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingHistory ? (
              <p className="text-xs text-slate-500">Loading history...</p>
            ) : myFeedbackHistory.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                No feedback records found yet.
              </div>
            ) : (
              myFeedbackHistory.map((item) => (
                <div key={item._id || item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      item.status === 'actioned' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'reviewed' || item.status === 'read' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Status: {item.status || 'Received'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {item.message || item.feedbackText}
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Date: {item.createdAt || item.created_at || 'Recent'}</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <ShieldCheck className="w-3 h-3" /> Anonymous Record
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
