import React, { useState, useEffect } from 'react';
import api, { STORAGE_BASE_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  User, Save, Upload, Lock, CheckCircle, AlertCircle,
  Mail, Phone, MapPin, Calendar, Building2, Briefcase, DollarSign, Badge as BadgeIcon,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

const READONLY_FIELDS_INFO = 'Employee ID, Department, Position, Salary, and Hire Date are managed by HR and cannot be modified.';

export const MyProfile = () => {
  const { employee, refreshProfile } = useAuth();
  const [emp, setEmp] = useState(employee);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Profile Form (only editable fields)
  const [profileForm, setProfileForm] = useState({
    phone: employee?.phone || '',
    address: employee?.address || '',
    gender: employee?.gender || 'Male',
    date_of_birth: employee?.date_of_birth || '',
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    employee?.profile_image ? `${STORAGE_BASE_URL}/${employee.profile_image}` : null
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/staff/profile');
        setEmp(res.data.employee);
        if (res.data.employee) {
          setProfileForm({
            phone: res.data.employee.phone || '',
            address: res.data.employee.address || '',
            gender: res.data.employee.gender || 'Male',
            date_of_birth: res.data.employee.date_of_birth || '',
          });
          if (res.data.employee.profile_image) {
            setAvatarPreview(`${STORAGE_BASE_URL}/${res.data.employee.profile_image}`);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/staff/profile', profileForm);
      setEmp(res.data.employee);
      await refreshProfile();
      showMsg('Profile updated successfully!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('profile_image', avatarFile);
      const res = await api.post('/staff/profile/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEmp(res.data.employee);
      await refreshProfile();
      showMsg('Profile photo updated!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to upload avatar', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      showMsg('New passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/staff/profile/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation,
      });
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      showMsg('Password changed successfully!');
    } catch (err) {
      const errors = err.response?.data?.errors;
      showMsg(
        errors?.current_password?.[0] || err.response?.data?.message || 'Failed to change password',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Notification */}
      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-medium animate-fadeIn ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-indigo-600 to-violet-600" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-10 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl ring-4 ring-white overflow-hidden shadow-lg bg-indigo-100 flex items-center justify-center shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-indigo-400" />
                )}
              </div>
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-extrabold text-slate-900">{emp?.full_name || 'Staff Member'}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-medium">{emp?.position}</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono text-xs text-indigo-600 font-bold">{emp?.employee_id}</span>
                <Badge variant={emp?.status === 'Active' ? 'success' : 'default'} size="sm">
                  {emp?.status || 'Active'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Read-Only Info Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-5">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Building2 className="w-3 h-3" /> Department</p>
              <p className="font-bold text-slate-800 mt-0.5">{emp?.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Position</p>
              <p className="font-bold text-slate-800 mt-0.5">{emp?.position || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Hire Date</p>
              <p className="font-bold text-slate-800 mt-0.5">{emp?.hire_date || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Basic Salary</p>
              <p className="font-black text-emerald-600 mt-0.5 text-sm">${Number(emp?.salary || 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Read-Only Notice */}
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-800 font-medium mb-4">
            🔒 {READONLY_FIELDS_INFO}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white border border-slate-200/80 rounded-2xl p-1.5 gap-1 shadow-xs">
        {[
          { key: 'profile', label: 'Edit Personal Info', icon: User },
          { key: 'avatar', label: 'Profile Photo', icon: Upload },
          { key: 'password', label: 'Change Password', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {/* Tab: Edit Personal Info */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Update Personal Information</h3>
          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input type="email" value={emp?.email || ''} disabled className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 cursor-not-allowed" />
                <p className="text-[10px] text-slate-400 mt-1">Contact HR to change your email</p>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input type="text" placeholder="+855 12 345 678" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select required value={profileForm.gender} onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                <input type="date" value={profileForm.date_of_birth} onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                <input type="text" placeholder="Street, City, Country" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white" />
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" icon={Save} loading={loading}>Save Profile Changes</Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Profile Photo */}
      {activeTab === 'avatar' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Update Profile Photo</h3>
          <div className="flex flex-col items-center gap-5">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-slate-300" />
              )}
            </div>
            <div className="text-center space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }
                }}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Accepted: JPG, PNG, WebP. Max 4MB.</p>
            </div>
            {avatarFile && (
              <Button icon={Upload} onClick={handleAvatarUpload} loading={loading}>
                Upload New Photo
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tab: Change Password */}
      {activeTab === 'password' && (
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Change Your Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs max-w-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password *</label>
              <input type="password" required value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-mono" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password (min 6 chars) *</label>
              <input type="password" required minLength={6} value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-mono" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
              <input type="password" required minLength={6} value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-mono" />
            </div>
            <div className="flex justify-start pt-2">
              <Button type="submit" icon={Lock} loading={loading}>Change Password</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
