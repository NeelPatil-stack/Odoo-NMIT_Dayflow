import { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Building, Briefcase, Lock, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EmployeeProfile() {
  const { user } = useAuth();
  
  // Instant Render: Initialize profile state immediately from authenticated user session context
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    emergency_contact: user?.emergency_contact || { name: '', relation: '', phone: '' },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/employees/me');
      const data = res.data?.data || res.data;
      if (data) {
        setProfile(data);
        setFormData({
          phone: data.phone || '',
          address: data.address || '',
          emergency_contact: data.emergency_contact || { name: '', relation: '', phone: '' },
        });
      }
    } catch (err) {
      console.error('Error fetching latest profile:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put('/employees/me', formData);
      toast.success('Profile updated successfully! 🎉');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const firstName = profile?.firstName || profile?.first_name || user?.firstName || '';
  const lastName = profile?.lastName || profile?.last_name || user?.lastName || '';
  const empName = `${firstName} ${lastName}`.trim() || 'Employee Profile';
  const roleName = profile?.designation?.title || profile?.designation || user?.role || 'Staff Member';
  const deptName = profile?.department?.name || profile?.department || 'General Department';
  const empId = profile?.employeeId || profile?.employee_id || user?.employeeId || 'EMP-1001';

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in font-sans">
      {/* Instant Render Profile Header */}
      <div className="card p-6 bg-gradient-to-r from-white via-[#F0F7FF] to-white border border-[#B7D5F2] shadow-soft">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-[#0B2D5C] text-white flex items-center justify-center text-2xl font-extrabold shadow-soft overflow-hidden">
              {profile?.profile_picture || profile?.avatar ? (
                <img src={profile.profile_picture || profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{(firstName[0] || 'E')}{(lastName[0] || '')}</span>
              )}
            </div>
          </div>

          <div className="text-center md:text-left space-y-1">
            <h1 className="text-2xl font-extrabold text-[#0B2D5C] tracking-tight">{empName}</h1>
            <p className="text-xs text-[#145DA0] font-bold">
              {roleName} • <span className="text-slate-600 font-medium">{deptName}</span>
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Employee ID: <span className="font-mono font-bold text-[#0B2D5C]">{empId}</span> | Status: <span className="text-[#22A06B] font-bold">Active</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'personal'
              ? 'bg-[#0B2D5C] text-white shadow-soft'
              : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B2D5C]'
          }`}
        >
          <User className="w-4 h-4" /> Personal & Contact Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#0B2D5C] text-white shadow-soft'
              : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B2D5C]'
          }`}
        >
          <Lock className="w-4 h-4" /> Password & Security
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'personal' ? (
        <form onSubmit={handleUpdateProfile} className="card p-6 space-y-5 shadow-soft border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Email Field: Strictly Unclickable & Read Only */}
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5 flex items-center justify-between">
                <span>Work Email Address</span>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Lock size={10} className="text-slate-400" /> Read Only
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  readOnly
                  tabIndex={-1}
                  value={profile?.email || user?.email || ''}
                  className="input text-xs w-full bg-slate-100/90 text-slate-500 font-mono font-medium border-slate-200 cursor-not-allowed select-none pointer-events-none pr-9"
                />
                <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Official work email cannot be changed by employees.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input text-xs w-full font-sans text-[#172033]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">Residential Address</label>
            <textarea
              placeholder="Enter your current residential address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input text-xs w-full h-20 font-sans text-[#172033]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-[#0B2D5C] uppercase tracking-wider">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patil"
                  value={formData.emergency_contact?.name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: { ...formData.emergency_contact, name: e.target.value }
                  })}
                  className="input text-xs w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relation</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Father"
                  value={formData.emergency_contact?.relation || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: { ...formData.emergency_contact, relation: e.target.value }
                  })}
                  className="input text-xs w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.emergency_contact?.phone || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: { ...formData.emergency_contact, phone: e.target.value }
                  })}
                  className="input text-xs w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button disabled={submitting} type="submit" className="btn-primary py-2.5 px-5 text-xs font-bold shadow-soft flex items-center gap-1.5">
              <Save className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleChangePassword} className="card p-6 space-y-4 max-w-md shadow-soft border-slate-200">
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">Current Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input text-xs w-full font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input text-xs w-full font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="input text-xs w-full font-mono"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button disabled={submitting} type="submit" className="btn-primary w-full py-2.5 text-xs font-bold shadow-soft">
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
