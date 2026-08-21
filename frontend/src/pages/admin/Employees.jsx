import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Eye, ChevronLeft, ChevronRight, X, Users, Loader2, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import EmptyState from '../../components/ui/EmptyState';

function getInitials(first, last) {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}

function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return <span className="badge-success">Active</span>;
  if (s === 'inactive' || s === 'terminated') return <span className="badge-danger font-semibold">Inactive</span>;
  if (s === 'on_leave') return <span className="badge-warning font-semibold">On Leave</span>;
  return <span className="badge-gray">{s || 'Active'}</span>;
}

const defaultForm = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', gender: 'Male', address: '',
  departmentId: '', designationId: '',
  employmentType: 'full_time', joiningDate: '',
};

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formLoading, setFormLoading] = useState(false);
  const LIMIT = 10;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      const data = res.data?.data || res.data || [];
      setEmployees(data);
    } catch {
      toast.error('Failed to load employee list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const filteredEmployees = employees.filter(emp => {
    const name = `${emp.firstName || emp.first_name || ''} ${emp.lastName || emp.last_name || ''}`.toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const empId = (emp.employeeId || emp.employee_id || '').toLowerCase();
    const dept = (emp.department?.name || emp.department || '').toLowerCase();
    const q = search.toLowerCase();

    const matchesQuery = name.includes(q) || email.includes(q) || empId.includes(q) || dept.includes(q);
    const matchesStatus = statusFilter === 'all' || (emp.status || '').toLowerCase() === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmployees.length / LIMIT) || 1;
  const paginatedEmployees = filteredEmployees.slice((page - 1) * LIMIT, page * LIMIT);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/employees', form);
      toast.success('New employee added successfully!');
      setShowAddModal(false);
      setForm(defaultForm);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add employee.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
            Employee Directory & Management
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Manage organization staff records, roles, departments, and user access.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary py-2.5 px-4 text-xs font-bold shadow-soft flex items-center gap-1.5">
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card p-5 space-y-4 shadow-soft">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, department, or ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input pl-10 text-xs py-2 font-sans"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-[12px] px-3 py-1.5">
              <Filter size={13} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-[#172033] font-semibold cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Total Employees: {filteredEmployees.length}
          </span>
        </div>

        {/* Table with Sticky Header */}
        <div className="table-container border-none rounded-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Emp ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">Loading employee list...</td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8">
                    <EmptyState
                      icon={Users}
                      title="No Employees Found"
                      description="No employees match your search query."
                    />
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map(emp => {
                  const firstName = emp.firstName || emp.first_name || '';
                  const lastName = emp.lastName || emp.last_name || '';
                  const empName = emp.name || `${firstName} ${lastName}`.trim() || 'Employee';
                  const empId = emp.employeeId || emp.employee_id || '—';
                  const dept = emp.department?.name || emp.department || '—';
                  const desig = emp.designation?.title || emp.designation || '—';
                  const joinDate = emp.joiningDate || emp.joining_date ? new Date(emp.joiningDate || emp.joining_date).toLocaleDateString('en-IN') : '—';

                  return (
                    <tr key={emp._id || emp.id} className="hover:bg-[#F0F7FF]/50 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0B2D5C] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {getInitials(firstName, lastName)}
                          </div>
                          <div>
                            <p className="font-bold text-[#172033] text-xs">{empName}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-slate-600 font-medium text-xs">{empId}</td>
                      <td><span className="badge-primary">{dept}</span></td>
                      <td className="text-slate-600 text-xs font-medium">{desig}</td>
                      <td className="text-slate-500 text-xs font-medium">{joinDate}</td>
                      <td><StatusBadge status={emp.status} /></td>
                      <td className="text-right">
                        <button
                          onClick={() => navigate(`/admin/employees/${emp._id || emp.id}`)}
                          className="btn-ghost btn-sm text-[#145DA0] font-semibold flex items-center justify-end ml-auto"
                          title="View Profile"
                        >
                          <Eye size={14} className="mr-1" /> View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary btn-sm disabled:opacity-40"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary btn-sm disabled:opacity-40"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#0B2D5C]">Add New Employee</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">First Name</label>
                  <input required type="text" className="input text-xs" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input required type="text" className="input text-xs" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="form-label">Work Email</label>
                <input required type="email" className="input text-xs" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="input text-xs" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">Joining Date</label>
                  <input type="date" className="input text-xs" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary text-xs font-bold">
                  {formLoading ? <Loader2 size={14} className="animate-spin" /> : 'Create Employee Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
