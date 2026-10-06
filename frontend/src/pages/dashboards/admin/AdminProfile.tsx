import React, { useState, useEffect } from 'react';
import { Camera, Save, CheckCircle2, Mail, Phone, User, ShieldCheck, Key, Lock, Check } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_URL } from '../../../config/api';

const TOKEN_KEY = 'ai_startup_builder_jwt';

const AdminProfile: React.FC = () => {
  const { user, login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || user.mobile || user.phoneNumber || '',
      }));
    }
  }, [user]);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          fullName: form.name,
          mobile: form.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to update profile');

      setMessage({ type: 'success', text: 'Admin profile updated successfully!' });
      setIsEditing(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  const initial = (user?.fullName || user?.name || 'Admin').charAt(0).toUpperCase();

  return (
    <div className="animate-fade-in-up pb-12 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Profile & Security</h1>
        <p className="text-gray-500 mt-1">Manage your administrative details, contact info, and system security.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl font-medium text-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-gray-100 pb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#FBBF24] text-white flex items-center justify-center text-3xl font-black shadow-xl ring-4 ring-purple-50">
              {initial}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-[#5B21B6] hover:bg-[#7C3AED] text-white rounded-full shadow-lg transition-transform transform group-hover:scale-110">
              <Camera size={14} />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h2 className="text-2xl font-extrabold text-gray-900">{user?.fullName || user?.name || 'System Admin'}</h2>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-black border border-purple-200 shadow-sm">
                <ShieldCheck size={14} className="text-[#5B21B6]" /> Super Admin
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400">System Administrator & Platform Overseer</p>
          </div>
        </div>

        {/* Profile Info Form */}
        <form onSubmit={handleSaveProfile} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  disabled={!isEditing}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5B21B6] disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role Permissions</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value="Full Administrative Access"
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl text-sm transition-colors shadow-md"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center gap-2"
                >
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
