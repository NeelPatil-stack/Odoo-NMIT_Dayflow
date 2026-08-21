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
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      {Icon && <Icon size={16} className="text-[#145DA0] mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-xs text-[#172033] font-bold">{value || '—'}</p>
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
      await api.put(`/employees/${id}`, personalForm);
      toast.success('Personal info updated');
      setEditingPersonal(false);
      fetchEmployee();
    } catch {
      toast.error('Failed to update personal info');
    } finally {
      setPersonalLoading(false);
    }
  };

  const handleSalarySave = async () => {
    setSalaryLoading(true);
    try {
      await api.put(`/payroll/salary/${id}`, {
        employeeId: id,
        ...salaryForm,
      });
      toast.success('Salary updated');
      setEditingSalary(false);
      fetchSalary();
    } catch {
      toast.error('Failed to save salary');
    } finally {
      setSalaryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#145DA0] animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-sm font-semibold">Employee not found.</p>
        <button onClick={() => navigate('/admin/employees')} className="btn-secondary mt-4 text-xs font-bold">
          Back to Employees
        </button>
      </div>
    );
  }

  const gross = (+salaryForm.basicSalary || 0) + (+salaryForm.hra || 0) + (+salaryForm.allowances || 0);
  const totalDed = (+salaryForm.deductions || 0) + (+salaryForm.taxDeductions || 0);
  const net = gross + (+salaryForm.bonus || 0) - totalDed;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Back button */}
      <button onClick={() => navigate('/admin/employees')} className="btn-secondary text-xs font-bold py-2 px-3 flex items-center gap-1.5 w-fit">
        <ArrowLeft size={14} /> Back to Employees
      </button>

      {/* Profile Header */}
      <div className="bg-white border border-slate-200/90 rounded-[24px] p-6 shadow-soft flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-16 h-16 rounded-full bg-[#0B2D5C] text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md">
          {getInitials(employee.firstName, employee.lastName)}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-[#0B2D5C] tracking-tight mb-1">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-slate-500 text-xs font-semibold mb-1">{employee.designation?.title || employee.designationId?.title || 'No Designation'}</p>
          <p className="text-slate-400 text-xs font-medium mb-3">{employee.department?.name || employee.departmentId?.name || 'No Department'}</p>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <span className="badge-success">{employee.status || 'Active'}</span>
            {employee.employeeId && (
              <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                {employee.employeeId}
              </span>
            )}
            <span className="badge-info capitalize">{employee.employmentType || 'Full-time'}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a href={`mailto:${employee.email}`} className="btn-secondary text-xs font-bold py-2 px-3">
            <Mail size={14} className="mr-1" /> Email
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-[16px] w-fit border border-slate-200/80">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#0B2D5C] text-white shadow-soft'
                  : 'text-slate-600 hover:text-[#0B2D5C] hover:bg-white'
              }`}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-200/90 rounded-[24px] p-6 shadow-soft animate-fade-in">

        {/* Personal Tab */}
        {activeTab === 'personal' && (
          <div>
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-[#0B2D5C]">Personal Information</h2>
              {!editingPersonal ? (
                <button className="btn-secondary text-xs font-bold py-1.5 px-3" onClick={() => setEditingPersonal(true)}>
                  <Edit2 size={14} className="mr-1" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className="btn-secondary text-xs" onClick={() => setEditingPersonal(false)}>
                    <X size={14} className="mr-1" /> Cancel
                  </button>
                  <button className="btn-primary text-xs font-bold" onClick={handlePersonalSave} disabled={personalLoading}>
                    {personalLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} className="mr-1" />}
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
                        className="input text-xs font-semibold cursor-pointer"
                        value={personalForm[field.name]}
                        onChange={e => setPersonalForm(p => ({ ...p, [field.name]: e.target.value }))}
                      >
                        <option value="">Select</option>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        className="input text-xs"
                        value={personalForm[field.name]}
                        onChange={e => setPersonalForm(p => ({ ...p, [field.name]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="form-label">Address</label>
                  <textarea
                    className="input text-xs resize-none"
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
            <h2 className="text-base font-extrabold text-[#0B2D5C] mb-5 border-b border-slate-100 pb-3">Job Information</h2>
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
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-[#0B2D5C]">Salary Structure</h2>
              {!editingSalary ? (
                <button className="btn-secondary text-xs font-bold py-1.5 px-3" onClick={() => setEditingSalary(true)}>
                  <Edit2 size={14} className="mr-1" /> {salary ? 'Edit Salary' : 'Set Salary'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button className="btn-secondary text-xs" onClick={() => setEditingSalary(false)}>
                    <X size={14} className="mr-1" /> Cancel
                  </button>
                  <button className="btn-primary text-xs font-bold" onClick={handleSalarySave} disabled={salaryLoading}>
                    {salaryLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} className="mr-1" />}
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
                      { label: 'Gross Salary', value: gross, color: 'text-[#145DA0]' },
                      { label: 'Net Salary', value: net, color: 'text-[#22A06B]' },
                      { label: 'Deductions', value: (+salary.deductions || 0) + (+salary.taxDeductions || 0), color: 'text-[#E5484D]' },
                      { label: 'Bonus', value: +salary.bonus || 0, color: 'text-[#F59A23]' },
                    ].map(card => (
                      <div key={card.label} className="bg-slate-50 border border-slate-200/80 rounded-[14px] p-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{card.label}</p>
                        <p className={`text-base font-extrabold font-mono mt-1 ${card.color}`}>
                          ₹{Number(card.value).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <InfoRow label="Basic Salary" value={`₹${Number(salary.basicSalary || 0).toLocaleString('en-IN')}`} />
                    <InfoRow label="HRA" value={`₹${Number(salary.hra || 0).toLocaleString('en-IN')}`} />
                    <InfoRow label="Allowances" value={`₹${Number(salary.allowances || 0).toLocaleString('en-IN')}`} />
                    <InfoRow label="Bonus" value={`₹${Number(salary.bonus || 0).toLocaleString('en-IN')}`} />
                    <InfoRow label="Deductions" value={`₹${Number(salary.deductions || 0).toLocaleString('en-IN')}`} />
                    <InfoRow label="Tax Deductions" value={`₹${Number(salary.taxDeductions || 0).toLocaleString('en-IN')}`} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                  No salary structure configured for this employee yet.
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
                      className="input text-xs font-mono"
                      value={salaryForm[field.name]}
                      onChange={e => setSalaryForm(s => ({ ...s, [field.name]: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-base font-extrabold text-[#0B2D5C] mb-5 border-b border-slate-100 pb-3">Documents</h2>
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              No employee documents uploaded yet.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
