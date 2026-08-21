import { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Building, Briefcase, Lock, Save, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    emergency_contact: { name: '', relation: '', phone: '' },
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
    setLoading(true);
    try {
      const res = await api.get('/employees/me');
      const data = res.data.data;
      setProfile(data);
      setFormData({
        phone: data.phone || '',
        address: data.address || '',
        emergency_contact: data.emergency_contact || { name: '', relation: '', phone: '' },
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put('/employees/me', formData);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update profile');
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
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading your profile...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* User Header */}
      <div className="card flex flex-col md:flex-row items-center gap-6 border border-white/5">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-glow-primary overflow-hidden">
            {profile?.profile_picture ? (
              <img src={profile.profile_picture} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{profile?.first_name?.[0]}{profile?.last_name?.[0]}</span>
            )}
          </div>
        </div>

        <div className="text-center md:text-left space-y-1">
          <h1 className="text-2xl font-display font-bold text-white">{profile?.first_name} {profile?.last_name}</h1>
          <p className="text-sm text-primary-400 font-medium">{profile?.designation?.title || 'Employee'} • {profile?.department?.name || 'General'}</p>
          <p className="text-xs text-gray-500">Employee ID: {profile?.employee_id} | Joined: {profile?.joining_date || 'N/A'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('personal')}
          className={`btn btn-sm ${activeTab === 'personal' ? 'btn-primary' : 'btn-ghost text-gray-400'}`}
        >
          <User className="w-4 h-4 mr-2" /> Personal & Contact
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`btn btn-sm ${activeTab === 'security' ? 'btn-primary' : 'btn-ghost text-gray-400'}`}
        >
          <Lock className="w-4 h-4 mr-2" /> Password & Security
        </button>
      </div>

      {activeTab === 'personal' ? (
        <form onSubmit={handleUpdateProfile} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email (Read Only)</label>
              <input type="text" disabled value={profile?.email || ''} className="input text-sm w-full bg-white/5 text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input text-sm w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input text-sm w-full h-20"
            />
          </div>

          <div className="pt-2 border-t border-white/5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Contact Person Name</label>
                <input
                  type="text"
                  value={formData.emergency_contact?.name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: { ...formData.emergency_contact, name: e.target.value }
                  })}
                  className="input text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Relation</label>
                <input
                  type="text"
                  value={formData.emergency_contact?.relation || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: { ...formData.emergency_contact, relation: e.target.value }
                  })}
                  className="input text-sm w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.emergency_contact?.phone || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: { ...formData.emergency_contact, phone: e.target.value }
                  })}
                  className="input text-sm w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button disabled={submitting} type="submit" className="btn btn-primary">
              <Save className="w-4 h-4 mr-2" /> Save Profile
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleChangePassword} className="card space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="input text-sm w-full"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button disabled={submitting} type="submit" className="btn btn-primary w-full">
              Update Password
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
