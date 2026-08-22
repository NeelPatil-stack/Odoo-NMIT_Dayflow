import { useState } from 'react';
import { MessageSquareHeart, ShieldCheck, Send } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    category: 'general',
    message: '',
    sentiment: 'neutral',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/feedback', formData);
      toast.success('Your anonymous feedback has been submitted safely');
      setFormData({ category: 'general', message: '', sentiment: 'neutral' });
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Anonymous Workplace Feedback</h1>
        <p className="text-sm text-gray-400">Share your honest feedback directly with HR. Your identity is strictly anonymous.</p>
      </div>

      <div className="p-4 bg-primary-600/10 border border-primary-500/20 rounded-xl flex items-start gap-3 text-sm">
        <ShieldCheck className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
        <p className="text-gray-300 text-xs">
          <strong className="text-white block font-medium mb-0.5">100% Confidential & Cryptographically Hashed</strong>
          No user credentials, employee IDs, or IP addresses are linked to this submission. HR receives only the category and message.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Feedback Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input text-sm w-full"
          >
            <option value="general">General</option>
            <option value="management">Management & Leadership</option>
            <option value="workplace">Workplace Environment</option>
            <option value="compensation">Compensation & Benefits</option>
            <option value="culture">Company Culture</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Overall Tone / Sentiment</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'positive', label: 'Positive / Praiseworthy' },
              { id: 'neutral', label: 'Neutral / Suggestion' },
              { id: 'negative', label: 'Concern / Issue' },
            ].map(s => (
              <button
                type="button"
                key={s.id}
                onClick={() => setFormData({ ...formData, sentiment: s.id })}
                className={`btn text-xs py-2 ${formData.sentiment === s.id ? 'btn-primary' : 'btn-ghost text-gray-400'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Your Detailed Feedback</label>
          <textarea
            required
            rows={5}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="input text-sm w-full"
            placeholder="Write your feedback, suggestions, or concerns here..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <button disabled={submitting} type="submit" className="btn btn-primary">
            <Send className="w-4 h-4 mr-2" /> {submitting ? 'Submitting...' : 'Submit Feedback Anonymously'}
          </button>
        </div>
      </form>
    </div>
  );
}
