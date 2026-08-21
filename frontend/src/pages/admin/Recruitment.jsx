import { useState, useEffect } from 'react';
import { Briefcase, Plus, UserCheck, Star, FileText, Search } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

export default function Recruitment() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    applicant_name: '', email: '', phone: '', position: '', experience_years: 2, skills: '', cover_letter: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recruitment');
      setApplications(res.data.data || []);
    } catch (err) {
      console.error('Error fetching recruitment applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/recruitment', formData);
      toast.success('Applicant registered successfully');
      setModalOpen(false);
      setFormData({ applicant_name: '', email: '', phone: '', position: '', experience_years: 2, skills: '', cover_letter: '' });
      fetchApplications();
    } catch (err) {
      toast.error('Failed to add applicant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/recruitment/${id}`, { status });
      toast.success(`Application updated to ${status}`);
      fetchApplications();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Recruitment & Talent Pipeline</h1>
          <p className="text-sm text-gray-400">Track job applicants, experience ratings, and hiring status.</p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Applicant
        </button>
      </div>

      <div className="card space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-white/[0.02] text-gray-400 border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Match Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">Loading applicants...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">No job applicants found.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-4 font-medium text-white">
                      {app.applicant_name}
                      <span className="block text-xs text-gray-500">{app.email} • {app.phone || 'No phone'}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-medium">{app.position}</td>
                    <td className="py-3 px-4 text-gray-300">{app.experience_years} years</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-bold text-accent-400">
                        <Star className="w-4 h-4 fill-accent-400 text-accent-400" />
                        {app.score}%
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        app.status === 'hired' ? 'badge-success' :
                        app.status === 'shortlisted' ? 'badge-info' :
                        app.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                      } capitalize`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="input text-xs py-1 px-2 min-w-[110px]"
                      >
                        <option value="review">Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Job Applicant">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.applicant_name}
                  onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                  className="input text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input text-sm w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Position Applied For</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="input text-sm w-full"
                  placeholder="e.g. Senior React Developer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  required
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                  className="input text-sm w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Key Skills</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="input text-sm w-full"
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost text-sm">Cancel</button>
              <button disabled={submitting} type="submit" className="btn btn-primary text-sm">Save Applicant</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
