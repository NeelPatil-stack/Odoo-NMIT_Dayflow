import { useState } from 'react';
import { Settings as SettingsIcon, Save, ShieldCheck, Clock, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: 'KaaryaSetu / Dayflow Technologies',
    supportEmail: 'hr@kaaryasetu.com',
    lateThreshold: '09:30',
    fullDayHours: 8,
    halfDayHours: 4,
    annualPaidLeaves: 18,
    annualSickLeaves: 12,
    annualCasualLeaves: 10,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('System settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">System & Policy Settings</h1>
        <p className="text-sm text-gray-400">Configure global working hours, leave policies, and organizational details.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6 max-w-3xl">
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-primary-400" /> Organization Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="input text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">HR Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="input text-sm w-full"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-400" /> Attendance & Shift Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Late Check-In Threshold</label>
              <input
                type="time"
                value={settings.lateThreshold}
                onChange={(e) => setSettings({ ...settings, lateThreshold: e.target.value })}
                className="input text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Full Day Working Hours</label>
              <input
                type="number"
                value={settings.fullDayHours}
                onChange={(e) => setSettings({ ...settings, fullDayHours: Number(e.target.value) })}
                className="input text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Half Day Working Hours</label>
              <input
                type="number"
                value={settings.halfDayHours}
                onChange={(e) => setSettings({ ...settings, halfDayHours: Number(e.target.value) })}
                className="input text-sm w-full"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-semibold text-white border-b border-white/5 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary-400" /> Annual Leave Allocation Policy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Paid Leave Days / Year</label>
              <input
                type="number"
                value={settings.annualPaidLeaves}
                onChange={(e) => setSettings({ ...settings, annualPaidLeaves: Number(e.target.value) })}
                className="input text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Sick Leave Days / Year</label>
              <input
                type="number"
                value={settings.annualSickLeaves}
                onChange={(e) => setSettings({ ...settings, annualSickLeaves: Number(e.target.value) })}
                className="input text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Casual Leave Days / Year</label>
              <input
                type="number"
                value={settings.annualCasualLeaves}
                onChange={(e) => setSettings({ ...settings, annualCasualLeaves: Number(e.target.value) })}
                className="input text-sm w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/5">
          <button type="submit" className="btn btn-primary">
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
