import { useState, useEffect } from 'react';
import { Plus, Search, X, Loader2, LayoutGrid, List, UserCheck, Briefcase } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import EmptyState from '../../components/ui/EmptyState';

const PIPELINE_STAGES = [
  { id: 'applied', label: 'Applied', color: 'border-l-4 border-[#3B82F6] bg-[#EFF6FF]/60' },
  { id: 'screening', label: 'Screening', color: 'border-l-4 border-[#145DA0] bg-[#E6F0FA]/60' },
  { id: 'interview', label: 'Interview', color: 'border-l-4 border-[#F59A23] bg-[#FEF7E6]/60' },
  { id: 'selected', label: 'Selected', color: 'border-l-4 border-[#22A06B] bg-[#E8F6F0]/60' },
  { id: 'rejected', label: 'Rejected', color: 'border-l-4 border-[#E5484D] bg-[#FDE8E9]/60' },
  { id: 'on_hold', label: 'On Hold', color: 'border-l-4 border-slate-400 bg-slate-100/60' },
];

export default function Recruitment() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
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
      toast.error('Failed to load recruitment pipeline');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/recruitment', formData);
      toast.success('Candidate registered successfully!');
      setModalOpen(false);
      setFormData({ candidateName: '', candidateEmail: '', candidatePhone: '', position: '', experienceYears: 2, notes: '' });
      fetchApplications();
    } catch {
      toast.error('Failed to register candidate.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/recruitment/${id}`, { status });
      toast.success(`Candidate stage updated to ${status}`);
      fetchApplications();
    } catch {
      toast.error('Failed to update stage.');
    }
  };

  const filtered = applications.filter(app => {
    const name = (app.candidateName || app.candidate_name || app.applicant_name || '').toLowerCase();
    const pos = (app.position || '').toLowerCase();
    const email = (app.candidateEmail || app.candidate_email || app.email || '').toLowerCase();
    return name.includes(search.toLowerCase()) || pos.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
  });

  const getStageBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'selected' || s === 'hired') return <span className="badge-success">Selected</span>;
    if (s === 'rejected') return <span className="badge-danger font-semibold">Rejected</span>;
    if (s === 'interview' || s === 'interviewing') return <span className="badge-warning font-semibold">Interview</span>;
    if (s === 'on_hold') return <span className="badge-gray">On Hold</span>;
    return <span className="badge-primary">Applied</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
            Recruitment & Talent Pipeline
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Track candidate applications, interview stages, and hiring decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-[12px] border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-[#0B2D5C] font-bold shadow-xs' : 'text-slate-500 hover:text-[#0B2D5C]'
              }`}
            >
              <LayoutGrid size={14} /> Pipeline
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#0B2D5C] font-bold shadow-xs' : 'text-slate-500 hover:text-[#0B2D5C]'
              }`}
            >
              <List size={14} /> Directory View
            </button>
          </div>

          <button onClick={() => setModalOpen(true)} className="btn-primary py-2.5 px-4 text-xs font-bold shadow-soft flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Applicant
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card p-4 shadow-soft">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by candidate, position or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-xs py-2 font-sans"
          />
        </div>
      </div>

      {/* Pipeline Stage Columns */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 min-w-[1100px]">
            {PIPELINE_STAGES.map((stage) => {
              const stageCandidates = filtered.filter(a => {
                const s = String(a.status || 'applied').toLowerCase();
                if (stage.id === 'interview') return s === 'interview' || s === 'interviewing';
                if (stage.id === 'selected') return s === 'selected' || s === 'hired';
                return s === stage.id;
              });

              return (
                <div key={stage.id} className="bg-[#F8FAFC] border border-slate-200/90 rounded-[18px] p-3 space-y-3 shadow-xs min-h-[420px] flex flex-col">
                  {/* Stage Header Accent */}
                  <div className={`p-2.5 rounded-[12px] ${stage.color} flex items-center justify-between`}>
                    <span className="text-xs font-bold text-[#172033] truncate">{stage.label}</span>
                    <span className="w-5 h-5 rounded-full bg-white text-[#0B2D5C] text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Candidate Cards */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto no-scrollbar">
                    {stageCandidates.map((c) => (
                      <div
                        key={c._id || c.id}
                        className="bg-white border border-slate-200/90 rounded-[14px] p-3.5 shadow-xs space-y-2 hover:border-[#145DA0] hover:shadow-soft transition-all"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-[#172033]">{c.candidateName || c.candidate_name}</p>
                          <span className="text-[9px] font-semibold text-slate-400 font-mono">
                            {c.experienceYears ?? 2} yrs
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#145DA0]">{c.position || 'Software Engineer'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{c.candidateEmail || c.email}</p>

                        {/* Move Stage Selector */}
                        <div className="pt-2 border-t border-slate-100">
                          <select
                            value={c.status || 'applied'}
                            onChange={(e) => handleStatusChange(c._id || c.id, e.target.value)}
                            className="w-full bg-[#F7F9FC] border border-slate-200 rounded-[8px] text-[10px] py-1 px-1.5 text-slate-700 font-semibold cursor-pointer"
                          >
                            <option value="applied">Move to Applied</option>
                            <option value="screening">Move to Screening</option>
                            <option value="interview">Move to Interview</option>
                            <option value="selected">Move to Selected</option>
                            <option value="rejected">Move to Rejected</option>
                            <option value="on_hold">Move to On Hold</option>
                          </select>
                        </div>
                      </div>
                    ))}

                    {stageCandidates.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-[12px]">
                        No Candidates
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View Option */
        <div className="card p-5 shadow-soft">
          <div className="table-container border-none rounded-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Contact</th>
                  <th>Applied Date</th>
                  <th>Stage</th>
                  <th className="text-right">Change Stage</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app._id || app.id} className="hover:bg-[#F0F7FF]/50 transition-colors">
                    <td>
                      <p className="font-bold text-[#172033] text-xs">{app.candidateName || app.candidate_name}</p>
                      <p className="text-[10px] text-slate-400">{app.candidateEmail || app.email}</p>
                    </td>
                    <td className="font-bold text-xs text-[#145DA0]">{app.position || 'Developer'}</td>
                    <td className="text-slate-600 text-xs font-mono">{app.candidatePhone || app.phone || '—'}</td>
                    <td className="text-slate-500 text-xs">Recent</td>
                    <td>{getStageBadge(app.status)}</td>
                    <td className="text-right">
                      <select
                        value={app.status || 'applied'}
                        onChange={(e) => handleStatusChange(app._id || app.id, e.target.value)}
                        className="bg-white border border-slate-200 rounded-[8px] text-xs py-1 px-2 text-slate-700 font-semibold cursor-pointer"
                      >
                        <option value="applied">Applied</option>
                        <option value="screening">Screening</option>
                        <option value="interview">Interview</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0B2D5C]">Add New Candidate</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.candidateName}
                  onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                  className="input text-xs"
                  placeholder="e.g. Rahul Patil"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.candidateEmail}
                    onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                    className="input text-xs"
                    placeholder="candidate@example.com"
                  />
                </div>
                <div>
                  <label className="form-label">Phone</label>
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
                <label className="form-label">Position Applied For</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="input text-xs"
                  placeholder="Senior Software Developer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs font-bold">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Register Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
