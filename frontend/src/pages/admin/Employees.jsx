import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, Eye, Edit2, UserX, UserCheck,
  ChevronLeft, ChevronRight, X, Users, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'intern'];

function getInitials(first, last) {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}

function StatusBadge({ status }) {
  const map = {
    active: 'badge-success',
    inactive: 'badge-danger',
    on_leave: 'badge-warning',
  };
  return <span className={map[status] || 'badge-gray'}>{status?.replace('_', ' ')}</span>;
}

const defaultForm = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', gender: '', address: '',
  departmentId: '', designationId: '',
  employmentType: 'full-time', joiningDate: '',
};

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formLoading, setFormLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterDept) params.department = filterDept;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/employees', { params });
      const d = res.data?.data || res.data;
      setEmployees(d.employees || d.data || (Array.isArray(d) ? d : []));
      setTotal(d.total || 0);
      setTotalPages(Math.ceil((d.total || 0) / LIMIT) || 1);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterDept, filterStatus]);

  const fetchMeta = async () => {
    try {
      const [dRes, desRes] = await Promise.all([api.get('/departments'), api.get('/designations')]);
      setDepartments(dRes.data?.data || dRes.data || []);
      setDesignations(desRes.data?.data || desRes.data || []);
    } catch { /* non-fatal */ }
  };

  useEffect(() => { fetchMeta(); }, []);
  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filterDept, filterStatus]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/employees', form);
      toast.success('Employee created successfully');
      setShowAddModal(false);
      setForm(defaultForm);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    setStatusLoading(true);
    const newStatus = statusTarget.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/employees/${statusTarget._id}/status`, { status: newStatus });
      toast.success(`Employee ${newStatus === 'active' ? 'reactivated' : 'deactivated'}`);
      setShowStatusModal(false);
      setStatusTarget(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleFormChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const paginationItems = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('ellipsis-' + p);
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{total} total employees</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="glass p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="form-input pl-9"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <select className="form-select pl-8 min-w-[150px]" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <select className="form-select min-w-[130px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j}><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-md avatar-gradient flex-shrink-0">
                          {getInitials(emp.firstName, emp.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-gray-400">{emp.employeeId || '—'}</td>
                    <td>{emp.department?.name || emp.departmentId?.name || '—'}</td>
                    <td>{emp.designation?.title || emp.designationId?.title || '—'}</td>
                    <td>{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td><StatusBadge status={emp.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="btn-icon" title="View" onClick={() => navigate(`/admin/employees/${emp._id}`)}>
                          <Eye size={15} />
                        </button>
                        <button className="btn-icon" title="Edit" onClick={() => navigate(`/admin/employees/${emp._id}`)}>
                          <Edit2 size={15} />
                        </button>
                        <button
                          className={`btn-icon ${emp.status === 'active' ? 'text-danger-500 hover:text-danger-400' : 'text-success-500 hover:text-success-400'}`}
                          title={emp.status === 'active' ? 'Deactivate' : 'Reactivate'}
                          onClick={() => { setStatusTarget(emp); setShowStatusModal(true); }}
                        >
                          {emp.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button className="btn-icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={16} />
              </button>
              {paginationItems.map((p) =>
                typeof p === 'string' ? (
                  <span key={p} className="text-gray-500 px-1">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                  >{p}</button>
                )
              )}
              <button className="btn-icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">Add New Employee</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name *</label>
                  <input name="firstName" className="form-input" required value={form.firstName} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="form-label">Last Name *</label>
                  <input name="lastName" className="form-input" required value={form.lastName} onChange={handleFormChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Email *</label>
                  <input name="email" type="email" className="form-input" required value={form.email} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input name="phone" className="form-input" value={form.phone} onChange={handleFormChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Date of Birth</label>
                  <input name="dateOfBirth" type="date" className="form-input" value={form.dateOfBirth} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-select" value={form.gender} onChange={handleFormChange}>
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map(g => <option key={g} value={g.toLowerCase()}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Address</label>
                <textarea name="address" className="form-input resize-none" rows={2} value={form.address} onChange={handleFormChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Department *</label>
                  <select name="departmentId" className="form-select" required value={form.departmentId} onChange={handleFormChange}>
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Designation *</label>
                  <select name="designationId" className="form-select" required value={form.designationId} onChange={handleFormChange}>
                    <option value="">Select designation</option>
                    {designations.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Employment Type *</label>
                  <select name="employmentType" className="form-select" required value={form.employmentType} onChange={handleFormChange}>
                    {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Joining Date *</label>
                  <input name="joiningDate" type="date" className="form-input" required value={form.joiningDate} onChange={handleFormChange} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && statusTarget && (
        <div className="modal-backdrop" onClick={() => setShowStatusModal(false)}>
          <div className="modal max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${statusTarget.status === 'active' ? 'bg-danger-500/15' : 'bg-success-500/15'}`}>
                {statusTarget.status === 'active'
                  ? <UserX size={24} className="text-danger-500" />
                  : <UserCheck size={24} className="text-success-500" />}
              </div>
              <h3 className="text-lg font-semibold text-white text-center mb-2">
                {statusTarget.status === 'active' ? 'Deactivate Employee' : 'Reactivate Employee'}
              </h3>
              <p className="text-sm text-gray-400 text-center mb-6">
                Are you sure you want to {statusTarget.status === 'active' ? 'deactivate' : 'reactivate'}{' '}
                <span className="text-white font-medium">{statusTarget.firstName} {statusTarget.lastName}</span>?
              </p>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={() => setShowStatusModal(false)}>Cancel</button>
                <button
                  className={statusTarget.status === 'active' ? 'btn-danger flex-1' : 'btn-success flex-1'}
                  onClick={handleStatusChange}
                  disabled={statusLoading}
                >
                  {statusLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                  {statusTarget.status === 'active' ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
