import React, { useState, useEffect } from 'react';
import { Camera, Save, CheckCircle2, Clock, ShieldAlert, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { addNotification } from '../../../utils/localStorageHelper';

const FounderProfile: React.FC = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        name: user.fullName || user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || user.mobile || user.phoneNumber || prev.phone,
      }));
    }
  }, [user]);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const initial = (user?.fullName || user?.name || 'S').charAt(0).toUpperCase();

  const getStatusBadge = () => {
    const status = user?.status || user?.approvalStatus || 'active';
    if (status === 'active' || status === 'approved' || status === 'verified') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
          <CheckCircle2 size={14} className="text-emerald-600" /> {status === 'verified' ? 'Verified Account' : 'Active Account'}
        </span>
      );
    }
    if (status === 'pending' || status === 'in_review') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200 shadow-sm">
          <Clock size={14} className="text-amber-600" /> Pending Approval
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-200 shadow-sm">
        <ShieldAlert size={14} className="text-red-600" /> {status.toUpperCase()}
      </span>
    );
  };

  const handleSave = () => {
    try {
      const key = `ai_startup_builder_founder_profiles`;
      const stored = localStorage.getItem(key);
      let profiles: any[] = stored ? JSON.parse(stored) : [];
      const myId = user?.id || '';
      const updatedEntry = { ...form, id: myId, updatedAt: new Date().toISOString() };
      const idx = profiles.findIndex((p: any) => p.id === myId);
      if (idx >= 0) profiles[idx] = { ...profiles[idx], ...updatedEntry };
      else profiles.push(updatedEntry);
      localStorage.setItem(key, JSON.stringify(profiles));
      addNotification({
        id: `notification_${Date.now()}`,
        userId: 'admin',
        title: 'Profile Updated',
        message: `${form.name || 'A user'} updated their profile. Mobile Number: ${form.phone || '—'} | Email: ${form.email || '—'}`,
        type: 'profile_update',
        isRead: false,
        actionUrl: `/dashboard/admin/notifications`,
        createdAt: new Date().toISOString()
      });
      window.dispatchEvent(new Event('storage'));
      window.alert('Profile settings saved successfully! Your details are now visible to the Admin Dashboard.');
    } catch (e) {
      window.alert('Error saving profile settings.');
    }
  };

  return (
    <div className="animate-fade-in-up pb-10">
      <div className="pb-6 border-b border-gray-100 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          {getStatusBadge()}
        </div>
        <p className="text-gray-500 mt-1">Manage your public profile and account information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center h-fit">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#FBBF24] flex items-center justify-center text-white text-4xl font-black shadow-xl">
              {initial}
            </div>
            <button className="absolute bottom-0 right-0 w-9 h-9 bg-[#5B21B6] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#7C3AED] transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <p className="font-bold text-gray-900 text-lg">{form.name}</p>
          <p className="text-sm text-[#5B21B6] font-bold uppercase tracking-widest mt-1">User</p>

          <div className="w-full border-t border-gray-100 mt-6 pt-5 space-y-3.5 text-left text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium flex items-center gap-1.5"><Mail size={13} /> Email</span>
              <span className="font-bold text-gray-900 truncate max-w-[140px]">{form.email || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium flex items-center gap-1.5"><Phone size={13} /> Mobile Number</span>
              <span className="font-bold text-gray-900">{form.phone || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium flex items-center gap-1.5"><User size={13} /> Role</span>
              <span className="font-bold text-[#5B21B6] uppercase">User</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5 pb-4 border-b border-gray-100">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Mobile Number', key: 'phone', type: 'tel' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => update(f.key, e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B21B6]" />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
              <button 
                onClick={handleSave}
                className="flex items-center justify-center px-8 py-3.5 bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-bold rounded-xl shadow-lg hover:shadow-xl text-sm transition-all transform hover:-translate-y-0.5"
              >
                <Save size={18} className="mr-2" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderProfile;
