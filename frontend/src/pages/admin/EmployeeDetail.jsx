import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Save, X, Loader2, User, Briefcase,
  FileText, DollarSign, Mail, Phone, Calendar, MapPin,
  Building2, Award, Clock, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'job', label: 'Job', icon: Briefcase },
  { id: 'salary', label: 'Salary', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: FileText },
];

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
      {Icon && <Icon size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm text-gray-100 font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}

function getInitials(first, last) {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}

const defaultSalaryForm = {
  basicSalary: '', hra: '', allowances: '', bonus: '', deductions: '', taxDeductions: '',
};

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  // Personal edit state
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({});
  const [personalLoading, setPersonalLoading] = useState(false);

  // Salary edit state
  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState(defaultSalaryForm);
  const [salaryLoading, setSalaryLoading] = useState(false);

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      const emp = res.data?.data || res.data;
      setEmployee(emp);
      setPersonalForm({
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        email: emp.email || '',
        phone: emp.phone || '',
        dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.slice(0, 10) : '',
        gender: emp.gender || '',
        address: emp.address || '',
      });
    } catch {
      toast.error('Failed to load employee');
    }
  };

  const fetchSalary = async () => {
    try {
      const res = await api.get(`/payroll/salary/${id}`);
      const s = res.data?.data || res.data;
      setSalary(s);
      setSalaryForm({
        basicSalary: s?.basicSalary || '',
        hra: s?.hra || '',
        allowances: s?.allowances || '',
        bonus: s?.bonus || '',
        deductions: s?.deductions || '',
        taxDeductions: s?.taxDeductions || '',
      });
    } catch {
      // salary may not exist yet
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchEmployee(), fetchSalary()]);
      setLoading(false);
    };
    load();
  }, [id]);

  const handlePersonalSave = async () => {
    setPersonalLoading(true);
    try {
      const res = await api.put(`/employees/${id}`, personalForm);
      setEmployee(res.data?.data || res.data);
      setEditingPersonal(false);
      toast.success('Personal info updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setPersonalLoading(false);
    }
  };

  const handleSalarySave = async () => {
    setSalaryLoading(true);
    try {
      const payload = { ...salaryForm, employeeId: id };
      const res = await api.post('/payroll/salary', payload);
      setSalary(res.data?.data || res.data);
      setEditingSalary(false);
      toast.success('Salary structure saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save salary');
    } finally {
      setSalaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="skeleton w-8 h-8 rounded-xl" />
          <div className="skeleton h-8 w-48 rounded-xl" />
        </div>
        <div className="skeleton h-40 rounded-2xl mb-6" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 text-center text-gray-500 py-32">
        <User size={48} className="mx-auto mb-4 opacity-20" />
        <p>Employee not found</p>
        <button className="btn-secondary mt-4" onClick={() => navigate('/admin/employees')}>
          <ArrowLeft size={16} /> Back to Employees
        </button>
      </div>
    );
  }

  const statusClass = { active: 'badge-success', inactive: 'badge-danger', on_leave: 'badge-warning' };

  const gross = salary
    ? (+salary.basicSalary || 0) + (+salary.hra || 0) + (+salary.allowances || 0) + (+salary.bonus || 0)
    : 0;
  const net = salary
    ? gross - (+salary.deductions || 0) - (+salary.taxDeductions || 0)
    : 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Back */}
      <button className="btn-ghost text-sm" onClick={() => navigate('/admin/employees')}>
        <ArrowLeft size={16} /> Back to Employees
      </button>

      {/* Profile Header */}
      <div className="glass p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="avatar avatar-xl avatar-gradient flex-shrink-0">
          {getInitials(employee.firstName, employee.lastName)}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-display font-bold text-white mb-1">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-gray-400 text-sm mb-1">{employee.designation?.title || employee.designationId?.title || 'No Designation'}</p>
          <p className="text-gray-500 text-xs mb-3">{employee.department?.name || employee.departmentId?.name || 'No Department'}</p>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <span className={statusClass[employee.status] || 'badge-gray'}>{employee.status}</span>
            {employee.employeeId && (
              <span className="font-mono text-xs text-gray-500 bg-dark-700/60 px-2 py-1 rounded-lg">
                {employee.employeeId}
              </span>
            )}
            <span className="badge-info">{employee.employmentType}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a href={`mailto:${employee.email}`} className="btn-secondary btn-sm">
            <Mail size={14} /> Email
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-900/60 p-1 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-glow-primary'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="glass p-6 animate-fade-in">

        {/* Personal Tab */}
        {activeTab === 'personal' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Personal Information</h2>
              {!editingPersonal ? (
                <button className="btn-secondary btn-sm" onClick={() => setEditingPersonal(true)}>
                  <Edit2 size={14} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className="btn-ghost btn-sm" onClick={() => setEditingPersonal(false)}>
                    <X size={14} /> Cancel
                  </button>
                  <button className="btn-primary btn-sm" onClick={handlePersonalSave} disabled={personalLoading}>
                    {personalLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                  </button>
                </div>
              )}
            </div>
            {!editingPersonal ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoRow icon={User} label="First Name" value={employee.firstName} />
                <InfoRow icon={User} label="Last Name" value={employee.lastName} />
                <InfoRow icon={Mail} label="Email" value={employee.email} />
                <InfoRow icon={Phone} label="Phone" value={employee.phone} />
                <InfoRow icon={Calendar} label="Date of Birth" value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('en-IN') : null} />
                <InfoRow icon={User} label="Gender" value={employee.gender} />
                <div className="md:col-span-2">
                  <InfoRow icon={MapPin} label="Address" value={employee.address} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'firstName', label: 'First Name', type: 'text' },
                  { name: 'lastName', label: 'Last Name', type: 'text' },
                  { name: 'email', label: 'Email', type: 'email' },
                  { name: 'phone', label: 'Phone', type: 'tel' },
                  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
                  { name: 'gender', label: 'Gender', type: 'select', options: ['male', 'female', 'other'] },
                ].map(field => (
                  <div key={field.name}>
                    <label className="form-label">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        className="form-select"
                        value={personalForm[field.name]}
                        onChange={e => setPersonalForm(p => ({ ...p, [field.name]: e.target.value }))}
                      >
                        <option value="">Select</option>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        className="form-input"
                        value={personalForm[field.name]}
                        onChange={e => setPersonalForm(p => ({ ...p, [field.name]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-input resize-none"
                    rows={2}
                    value={personalForm.address}
                    onChange={e => setPersonalForm(p => ({ ...p, address: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Job Tab */}
        {activeTab === 'job' && (
          <div>
            <h2 className="text-base font-semibold text-white mb-5">Job Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoRow icon={Building2} label="Department" value={employee.department?.name || employee.departmentId?.name} />
              <InfoRow icon={Award} label="Designation" value={employee.designation?.title || employee.designationId?.title} />
              <InfoRow icon={Calendar} label="Joining Date" value={employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-IN') : null} />
              <InfoRow icon={Clock} label="Employment Type" value={employee.employmentType} />
              <InfoRow icon={Users} label="Manager" value={employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : null} />
              <InfoRow icon={User} label="Employee ID" value={employee.employeeId} />
            </div>
          </div>
        )}

        {/* Salary Tab */}
        {activeTab === 'salary' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Salary Structure</h2>
              {!editingSalary ? (
                <button className="btn-secondary btn-sm" onClick={() => setEditingSalary(true)}>
                  <Edit2 size={14} /> {salary ? 'Edit Salary' : 'Set Salary'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className="btn-ghost btn-sm" onClick={() => setEditingSalary(false)}>
                    <X size={14} /> Cancel
                  </button>
                  <button className="btn-primary btn-sm" onClick={handleSalarySave} disabled={salaryLoading}>
                    {salaryLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                  </button>
                </div>
              )}
            </div>

            {!editingSalary ? (
              salary ? (
                <div className="space-y-4">
                  {/* Summary cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                      { label: 'Gross Salary', value: gross, color: 'text-primary-400' },
                      { label: 'Net Salary', value: net, color: 'text-success-500' },
                      { label: 'Deductions', value: (+salary.deductions || 0) + (+salary.taxDeductions || 0), color: 'text-danger-500' },
                      { label: 'Bonus', value: +salary.bonus || 0, color: 'text-warning-500' },
                    ].map(card => (
                      <div key={card.label} className="glass-sm p-3">
                        <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                        <p className={`text-lg font-bold ${card.color}`}>
                          ₹{card.value.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <InfoRow icon={DollarSign} label="Basic Salary" value={`₹${(+salary.basicSalary || 0).toLocaleString('en-IN')}`} />
                    <InfoRow icon={DollarSign} label="HRA" value={`₹${(+salary.hra || 0).toLocaleString('en-IN')}`} />
                    <InfoRow icon={DollarSign} label="Allowances" value={`₹${(+salary.allowances || 0).toLocaleString('en-IN')}`} />
                    <InfoRow icon={DollarSign} label="Bonus" value={`₹${(+salary.bonus || 0).toLocaleString('en-IN')}`} />
                    <InfoRow icon={DollarSign} label="Deductions" value={`₹${(+salary.deductions || 0).toLocaleString('en-IN')}`} />
                    <InfoRow icon={DollarSign} label="Tax Deductions" value={`₹${(+salary.taxDeductions || 0).toLocaleString('en-IN')}`} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign size={40} className="mx-auto mb-3 opacity-20" />
                  <p>No salary structure defined</p>
                  <button className="btn-primary mt-4 btn-sm" onClick={() => setEditingSalary(true)}>
                    <Plus size={14} /> Set Salary
                  </button>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'basicSalary', label: 'Basic Salary (₹)' },
                  { name: 'hra', label: 'HRA (₹)' },
                  { name: 'allowances', label: 'Allowances (₹)' },
                  { name: 'bonus', label: 'Bonus (₹)' },
                  { name: 'deductions', label: 'Deductions (₹)' },
                  { name: 'taxDeductions', label: 'Tax Deductions (₹)' },
                ].map(field => (
                  <div key={field.name}>
                    <label className="form-label">{field.label}</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={salaryForm[field.name]}
                      onChange={e => setSalaryForm(p => ({ ...p, [field.name]: e.target.value }))}
                    />
                  </div>
                ))}
                {/* Live preview */}
                <div className="md:col-span-2 glass-sm p-4 rounded-xl mt-2">
                  <p className="text-xs text-gray-500 mb-2">Preview</p>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-gray-500">Gross</p>
                      <p className="text-primary-400 font-bold">
                        ₹{(
                          (+salaryForm.basicSalary || 0) +
                          (+salaryForm.hra || 0) +
                          (+salaryForm.allowances || 0) +
                          (+salaryForm.bonus || 0)
                        ).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Net</p>
                      <p className="text-success-500 font-bold">
                        ₹{(
                          (+salaryForm.basicSalary || 0) +
                          (+salaryForm.hra || 0) +
                          (+salaryForm.allowances || 0) +
                          (+salaryForm.bonus || 0) -
                          (+salaryForm.deductions || 0) -
                          (+salaryForm.taxDeductions || 0)
                        ).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-base font-semibold text-white mb-5">Documents</h2>
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center">
              <FileText size={40} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 font-medium mb-1">No documents uploaded</p>
              <p className="text-gray-600 text-sm mb-4">Upload ID proof, contracts, certificates, etc.</p>
              <button className="btn-secondary btn-sm">
                <Plus size={14} /> Upload Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
