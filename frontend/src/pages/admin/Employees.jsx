import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Eye, ChevronLeft, ChevronRight, X, Users, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

function getInitials(first, last) {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}

function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();
  if (s === 'active') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>;
  if (s === 'inactive' || s === 'terminated') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Inactive</span>;
  if (s === 'on_leave') return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">On Leave</span>;
  return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">{s}</span>;
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
      toast.error('Failed to load employees');
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
    return name.includes(q) || email.includes(q) || empId.includes(q) || dept.includes(q);
  });

  const totalPages = Math.ceil(filteredEmployees.length / LIMIT) || 1;
  const paginatedEmployees = filteredEmployees.slice((page - 1) * LIMIT, page * LIMIT);

  const handleAddSubmit = async (e) => {
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">Manage corporate workforce, roles, departments, and personnel details.</p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary py-2 px-4 text-xs shadow-xs">
          <Plus size={15} className="mr-1.5" /> Add Employee
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, department or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-9 text-xs py-2"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {filteredEmployees.length} employees</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Emp ID</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">Loading workforce records...</td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No employees found matching criteria.</td>
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
                    <tr key={emp._id || emp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {getInitials(firstName, lastName)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">{empName}</p>
                            <p className="text-[10px] text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 font-medium">{empId}</td>
                      <td className="py-3 px-4 text-slate-700">{dept}</td>
                      <td className="py-3 px-4 text-slate-600">{desig}</td>
                      <td className="py-3 px-4 text-slate-500">{joinDate}</td>
                      <td className="py-3 px-4"><StatusBadge status={emp.status} /></td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/employees/${emp._id || emp.id}`)}
                          className="p-1.5 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
                          title="View Profile"
                        >
                          <Eye size={14} />
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
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 border border-slate-200 rounded-md disabled:opacity-40 text-slate-600 hover:bg-slate-50"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 border border-slate-200 rounded-md disabled:opacity-40 text-slate-600 hover:bg-slate-50"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Add New Employee</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input required type="text" className="input text-xs" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input required type="text" className="input text-xs" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input required type="email" className="input text-xs" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input type="text" className="input text-xs" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Joining Date</label>
                  <input type="date" className="input text-xs" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary text-xs">
                  {formLoading ? <Loader2 size={14} className="animate-spin" /> : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
