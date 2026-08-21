import { useState, useEffect } from 'react';
import {
  Plus, Edit2, X, Loader2, Building2, Users, Hash,
  FileText, CheckCircle, XCircle, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const defaultForm = { name: '', code: '', description: '', status: 'active' };

function DeptCard({ dept, onEdit }) {
  const statusColor = dept.status === 'active' ? 'badge-success' : 'badge-gray';
  return (
    <div className="glass p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary-600/15 flex items-center justify-center flex-shrink-0">
          <Building2 size={20} className="text-primary-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className={statusColor}>{dept.status}</span>
          <button
            className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onEdit(dept)}
          >
            <Edit2 size={14} />
          </button>
        </div>
      </div>
      <h3 className="text-white font-semibold text-base mb-1">{dept.name}</h3>
      <div className="flex items-center gap-2 mb-3">
        <Hash size={12} className="text-gray-500" />
        <span className="font-mono text-xs text-gray-500">{dept.code || 'No code'}</span>
      </div>
      {dept.description && (
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{dept.description}</p>
      )}
      <div className="flex items-center gap-4 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users size={13} />
          <span>{dept.employeeCount || 0} employees</span>
        </div>
        {dept.head && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users size={13} />
            <span>Head: {dept.head.firstName} {dept.head.lastName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [formLoading, setFormLoading] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const openAdd = () => {
    setEditTarget(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (dept) => {
    setEditTarget(dept);
    setForm({
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
      status: dept.status || 'active',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editTarget) {
        await api.put(`/departments/${editTarget._id}`, form);
        toast.success('Department updated');
      } else {
        await api.post('/departments', form);
        toast.success('Department created');
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department');
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const filtered = departments.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.code?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = departments.filter(d => d.status === 'active').length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">{activeCount} active / {departments.length} total</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: departments.length, icon: Building2, color: 'text-primary-400', bg: 'bg-primary-600/10' },
          { label: 'Active', value: activeCount, icon: CheckCircle, color: 'text-success-500', bg: 'bg-success-700/10' },
          { label: 'Inactive', value: departments.length - activeCount, icon: XCircle, color: 'text-danger-500', bg: 'bg-danger-500/10' },
          { label: 'Total Employees', value: departments.reduce((a, d) => a + (d.employeeCount || 0), 0), icon: Users, color: 'text-accent-400', bg: 'bg-accent-500/10' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="form-input pl-9"
          placeholder="Search departments…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass py-20 text-center text-gray-500">
          <Building2 size={40} className="mx-auto mb-3 opacity-20" />
          <p>{search ? 'No departments match your search' : 'No departments yet'}</p>
          {!search && (
            <button className="btn-primary mt-4 btn-sm" onClick={openAdd}>
              <Plus size={14} /> Create First Department
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(dept => (
            <DeptCard key={dept._id} dept={dept} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">
                {editTarget ? 'Edit Department' : 'Add Department'}
              </h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Department Name *</label>
                <input name="name" className="form-input" required value={form.name} onChange={handleChange} placeholder="e.g. Engineering" />
              </div>
              <div>
                <label className="form-label">Department Code</label>
                <input name="code" className="form-input" value={form.code} onChange={handleChange} placeholder="e.g. ENG" />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input resize-none" rows={3} value={form.description} onChange={handleChange} placeholder="Brief description…" />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? <Loader2 size={15} className="animate-spin" /> : editTarget ? <Edit2 size={15} /> : <Plus size={15} />}
                  {editTarget ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
