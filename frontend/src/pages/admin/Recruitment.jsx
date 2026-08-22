import { useState, useEffect } from 'react';
import { Plus, Star, Search, X, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

export default function Recruitment() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '', candidateEmail: '', candidatePhone: '', position: '', experienceYears: 2, notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recruitment');
      setApplications(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching recruitment applications:', err);
      toast.error('Failed to load recruitment data');
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
      setFormData({ candidateName: '', candidateEmail: '', candidatePhone: '', position: '', experienceYears: 2, notes: '' });
      fetchApplications();
    } catch {
      toast.error('Failed to add applicant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/recruitment/${id}`, { status });
      toast.success(`Application updated to ${status}`);
      fetchApplications();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = applications.filter(app => {
    const name = (app.candidateName || app.candidate_name || app.applicant_name || '').toLowerCase();
    const pos = (app.position || '').toLowerCase();
    const email = (app.candidateEmail || app.candidate_email || app.email || '').toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase()) || pos.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'hired' || s === 'offered') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">{s}</span>;
    if (s === 'rejected') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 capitalize">{s}</span>;
    if (s === 'interviewing' || s === 'shortlisted' || s === 'applied') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 capitalize">{s}</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 capitalize">{s || 'screening'}</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruitment & Talent Pipeline</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Track job applicants, interview stages, and hiring decisions.</p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary py-2 px-4 text-xs shadow-xs">
          <Plus className="w-4 h-4 mr-1.5" /> Add Applicant
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-xs py-2"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium overflow-x-auto">
            {['all', 'applied', 'screening', 'interviewing', 'offered', 'hired', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer text-[11px] ${
                  statusFilter === st ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4 text-right">Update Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">Loading applicants...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">No recruitment candidates found.</td>
                </tr>
              ) : (
                filtered.map((app, idx) => {
                  const name = app.candidateName || app.candidate_name || app.applicant_name || 'Candidate';
                  const email = app.candidateEmail || app.candidate_email || app.email || '—';
                  const phone = app.candidatePhone || app.candidate_phone || app.phone || '—';
                  const applied = app.appliedDate || app.applied_date || app.createdAt || 'Recent';

                  return (
                    <tr key={app._id || app.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{name}</p>
                        <p className="text-[10px] text-slate-400">{email}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{app.position || 'Software Developer'}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{phone}</td>
                      <td className="py-3 px-4 text-slate-500">{applied}</td>
                      <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={app.status || 'applied'}
                          onChange={(e) => handleStatusChange(app._id || app.id, e.target.value)}
                          className="bg-white border border-slate-200 rounded-md text-xs py-1 px-2 text-slate-700 font-medium focus:ring-1 focus:ring-slate-400 cursor-pointer"
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offered">Offered</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Candidate Modal */}
      {modalOpen && (
        <Modal title="Add Job Candidate" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Full Name</label>
              <input
                type="text"
                required
                value={formData.candidateName}
                onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                className="input text-xs"
                placeholder="e.g. Vikram Malhotra"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.candidateEmail}
                  onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                  className="input text-xs"
                  placeholder="vikram@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.candidatePhone}
                  onChange={(e) => setFormData({ ...formData, candidatePhone: e.target.value })}
                  className="input text-xs"
                  placeholder="9892011223"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Position Applied For</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="input text-xs"
                placeholder="Senior Software Developer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary text-xs">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Register Candidate'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
