import { useState } from 'react';
import {
  Settings as SettingsIcon, Save, ShieldCheck, Clock, Building, Users, Lock, Key, FileText, Check, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('permissions'); // 'general' | 'users' | 'permissions' | 'security' | 'password' | 'audit'

  const [settings, setSettings] = useState({
    companyName: 'Kaaryasetu Technologies Pvt Ltd',
    supportEmail: 'support@kaaryasetu.com',
    lateThreshold: '09:30',
    fullDayHours: 8,
    halfDayHours: 4,
    annualPaidLeaves: 18,
    annualSickLeaves: 12,
    annualCasualLeaves: 10,
  });

  const [matrix, setMatrix] = useState({
    Employees:   { view: true,  add: true,  edit: true,  delete: false, approve: true,  export: true },
    Attendance:  { view: true,  add: true,  edit: true,  delete: false, approve: true,  export: true },
    Leave:       { view: true,  add: true,  edit: true,  delete: true,  approve: true,  export: true },
    Payroll:     { view: true,  add: false, edit: false, delete: false, approve: true,  export: true },
    Recruitment: { view: true,  add: true,  edit: true,  delete: false, approve: false, export: false },
    Reports:     { view: true,  add: false, edit: false, delete: false, approve: false, export: true },
    Settings:    { view: true,  add: false, edit: true,  delete: false, approve: true,  export: false },
  });

  const togglePermission = (module, action) => {
    setMatrix(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
    toast.success(`Updated ${module} - ${action} permission.`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('System settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Building },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'permissions', label: 'Roles & Permissions Matrix', icon: ShieldCheck },
    { id: 'security', label: 'Security & Access Control', icon: Shield },
    { id: 'password', label: 'Password Policy', icon: Key },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in font-sans">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2D5C] tracking-tight">
          System & Policy Settings
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Configure organization rules, attendance policy parameters, and security role permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Tab Segmented Navigation */}
        <div className="bg-white border border-slate-200/90 rounded-[20px] p-3 space-y-1 shadow-soft h-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#E6F0FA] text-[#0B2D5C] font-semibold border-l-4 border-[#145DA0]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#0B2D5C]'
              }`}
            >
              <t.icon size={16} className={activeTab === t.id ? 'text-[#145DA0]' : 'text-slate-400'} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* PERMISSION MATRIX TABLE */}
          {activeTab === 'permissions' && (
            <div className="bg-white border border-slate-200/90 rounded-[20px] p-6 space-y-5 shadow-soft">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#0B2D5C]">
                    Role Permission Matrix
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Configure granular action capabilities (View, Add, Edit, Delete, Approve, Export) per module.
                  </p>
                </div>
                <span className="badge-primary">HR Role Policy</span>
              </div>

              <div className="table-container border-none rounded-none">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th className="text-center">View</th>
                      <th className="text-center">Add</th>
                      <th className="text-center">Edit</th>
                      <th className="text-center">Delete</th>
                      <th className="text-center">Approve</th>
                      <th className="text-center">Export</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(matrix).map((mod) => (
                      <tr key={mod} className="hover:bg-[#F0F7FF]/50 transition-colors">
                        <td className="font-bold text-[#172033] text-xs">{mod}</td>
                        {['view', 'add', 'edit', 'delete', 'approve', 'export'].map((act) => {
                          const isChecked = Boolean(matrix[mod][act]);
                          return (
                            <td key={act} className="text-center py-3">
                              <button
                                type="button"
                                onClick={() => togglePermission(mod, act)}
                                className={`w-6 h-6 rounded-[8px] inline-flex items-center justify-center transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-[#145DA0] text-white shadow-xs scale-105'
                                    : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                {isChecked && <Check size={14} className="stroke-[3]" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button onClick={handleSubmit} className="btn-primary text-xs font-bold shadow-soft flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> Save Permission Matrix
                </button>
              </div>
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-[20px] p-6 space-y-6 shadow-soft">
              <h2 className="text-base font-extrabold text-[#0B2D5C] border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#145DA0]" /> Organization Setup
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label">HR Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <h2 className="text-base font-extrabold text-[#0B2D5C] border-b border-slate-100 pb-3 flex items-center gap-2 pt-2">
                <Clock className="w-4 h-4 text-[#F59A23]" /> Attendance & Shift Rules
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Late Threshold Time</label>
                  <input
                    type="time"
                    value={settings.lateThreshold}
                    onChange={(e) => setSettings({ ...settings, lateThreshold: e.target.value })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label">Full Day Hours</label>
                  <input
                    type="number"
                    value={settings.fullDayHours}
                    onChange={(e) => setSettings({ ...settings, fullDayHours: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label">Half Day Hours</label>
                  <input
                    type="number"
                    value={settings.halfDayHours}
                    onChange={(e) => setSettings({ ...settings, halfDayHours: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button type="submit" className="btn-primary text-xs font-bold shadow-soft flex items-center gap-1.5">
                  <Save className="w-4 h-4" /> Save Settings
                </button>
              </div>
            </form>
          )}

          {/* Other Tabs */}
          {activeTab !== 'permissions' && activeTab !== 'general' && (
            <div className="bg-white border border-slate-200/90 rounded-[20px] p-8 text-center space-y-3 shadow-soft">
              <Shield className="w-12 h-12 text-[#145DA0] mx-auto opacity-80" />
              <h3 className="text-base font-extrabold text-[#0B2D5C]">
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Advanced security configurations and automated system policies are active for Kaaryasetu.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
